const express = require('express');
const router = express.Router();

function parseGitHubUrl(url) {
  const m = url.replace(/\.git$/, '').match(/github\.com[/:]([^/]+)\/([^/]+)/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

function buildGitHubHeaders(token) {
  const headers = { 'User-Agent': 'Repart-App/1.0', Accept: 'application/vnd.github+json' };
  if (token) headers['Authorization'] = `token ${token}`;
  return headers;
}

async function ghFetch(path, token) {
  const res = await fetch(`https://api.github.com${path}`, { headers: buildGitHubHeaders(token) });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

async function ghFileContent(owner, repo, filePath, token) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, { headers: buildGitHubHeaders(token) });
    if (!res.ok) return null;
    const data = await res.json();
    return data.encoding === 'base64' ? Buffer.from(data.content, 'base64').toString('utf-8') : null;
  } catch { return null; }
}

function sendEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function sendStep(res, step, label, progress, extra = {}) {
  sendEvent(res, { step, label, progress, ...extra });
}

function detectStack(tree) {
  const paths = tree.map(f => f.path.toLowerCase());
  const has = (...names) => names.some(n => paths.some(p => p.includes(n)));
  const stack = [];

  if (has('next.config')) stack.push({ name: 'Next.js', icon: '▲', color: '#000000', purpose: 'Full-stack React framework', configFile: 'next.config.js' });
  else if (has('vite.config')) stack.push({ name: 'Vite', icon: '⚡', color: '#646cff', purpose: 'Build tool and dev server', configFile: 'vite.config.js' });
  else if (has('react')) stack.push({ name: 'React', icon: '⚛', color: '#61dafb', purpose: 'UI component library', configFile: '' });

  if (has('tailwind.config')) stack.push({ name: 'Tailwind CSS', icon: '🌊', color: '#06b6d4', purpose: 'Utility-first CSS framework', configFile: 'tailwind.config.js' });
  if (has('tsconfig.json')) stack.push({ name: 'TypeScript', icon: 'TS', color: '#3178c6', purpose: 'Typed superset of JavaScript', configFile: 'tsconfig.json' });
  if (has('package.json')) stack.push({ name: 'Node.js', icon: '🟢', color: '#339933', purpose: 'JavaScript runtime', configFile: 'package.json' });
  if (has('requirements.txt') || has('django') || has('flask') || has('fastapi')) stack.push({ name: 'Python', icon: '🐍', color: '#3776ab', purpose: 'Backend language', configFile: 'requirements.txt' });
  if (has('go.mod')) stack.push({ name: 'Go', icon: '🐹', color: '#00add8', purpose: 'Systems language backend', configFile: 'go.mod' });
  if (has('cargo.toml')) stack.push({ name: 'Rust', icon: '🦀', color: '#ce422b', purpose: 'Systems language', configFile: 'Cargo.toml' });
  if (has('pubspec.yaml')) stack.push({ name: 'Flutter', icon: '💙', color: '#54c5f8', purpose: 'Cross-platform UI framework', configFile: 'pubspec.yaml' });
  if (has('docker')) stack.push({ name: 'Docker', icon: '🐳', color: '#2496ed', purpose: 'Container platform', configFile: 'Dockerfile' });
  if (has('.github/workflows')) stack.push({ name: 'GitHub Actions', icon: '⚙️', color: '#2088ff', purpose: 'CI/CD automation', configFile: '.github/workflows/' });
  if (has('prisma')) stack.push({ name: 'Prisma', icon: '◈', color: '#5a67d8', purpose: 'Database ORM', configFile: 'prisma/schema.prisma' });
  if (has('supabase')) stack.push({ name: 'Supabase', icon: '⚡', color: '#3ecf8e', purpose: 'Backend-as-a-service', configFile: '' });
  if (has('firebase')) stack.push({ name: 'Firebase', icon: '🔥', color: '#ffca28', purpose: 'Backend-as-a-service', configFile: 'firebase.json' });
  if (has('mongodb') || has('mongoose')) stack.push({ name: 'MongoDB', icon: '🍃', color: '#47a248', purpose: 'Document database', configFile: '' });
  if (has('postgres') || has('pg')) stack.push({ name: 'PostgreSQL', icon: '🐘', color: '#336791', purpose: 'Relational database', configFile: '' });
  if (has('redis')) stack.push({ name: 'Redis', icon: '🔴', color: '#dc382d', purpose: 'In-memory cache/store', configFile: '' });
  if (has('jest.config') || has('vitest')) stack.push({ name: 'Testing', icon: '✅', color: '#c21325', purpose: 'Test framework', configFile: 'jest.config.js' });
  if (has('eslint')) stack.push({ name: 'ESLint', icon: '🔍', color: '#4b32c3', purpose: 'Code linting', configFile: '.eslintrc' });

  return stack;
}

function detectRoutes(tree) {
  const files = tree.filter(f => f.type === 'blob');
  const routes = [];

  files.filter(f => f.path.startsWith('app/') && /page\.(tsx|jsx|js)$/.test(f.path)).forEach(f => {
    const route = ('/' + f.path.replace(/^app\//, '').replace(/\/page\.(tsx|jsx|js)$/, '').replace(/\[([^\]]+)\]/g, ':$1')).replace(/\/$/, '') || '/';
    routes.push({ path: route, file: f.path, type: 'Next.js App Router', method: 'GET' });
  });

  files.filter(f => f.path.startsWith('pages/') && !/(^pages\/_app|^pages\/_document)/.test(f.path) && !f.path.includes('api/')).forEach(f => {
    const route = ('/' + f.path.replace(/^pages\//, '').replace(/\.(tsx|jsx|js|ts)$/, '').replace(/\/index$/, '').replace(/\[([^\]]+)\]/g, ':$1')).replace(/\/$/, '') || '/';
    routes.push({ path: route, file: f.path, type: 'Next.js Pages', method: 'GET' });
  });

  files.filter(f => /\/(pages|app)\/api\//.test(f.path)).forEach(f => {
    const route = '/api/' + f.path.replace(/^(pages|app)\/api\//, '').replace(/\.(tsx|jsx|js|ts)$/, '').replace(/\[([^\]]+)\]/g, ':$1');
    routes.push({ path: route, file: f.path, type: 'API Route', method: 'ANY' });
  });

  if (routes.length === 0) {
    files.filter(f => /(\/pages\/|\/routes\/|\/views\/)/.test(f.path) && /\.(tsx|jsx|js|ts)$/.test(f.path)).forEach(f => {
      const name = f.path.split('/').pop().replace(/\.(tsx|jsx|js|ts)$/, '');
      if (name && !name.startsWith('_') && !name.startsWith('index')) {
        routes.push({ path: '/' + name.toLowerCase(), file: f.path, type: 'Page Component', method: 'GET' });
      }
    });
  }

  return routes.slice(0, 40);
}

function parseDependencies(content, type) {
  const deps = { prod: [], dev: [] };
  if (!content) return deps;

  if (type === 'package.json') {
    try {
      const json = JSON.parse(content);
      deps.prod = Object.entries(json.dependencies || {}).map(([name, version]) => ({ name, version }));
      deps.dev = Object.entries(json.devDependencies || {}).map(([name, version]) => ({ name, version }));
    } catch {}
    return deps;
  }
  if (type === 'requirements.txt') {
    content.split('\n').filter(l => l.trim() && !l.startsWith('#')).forEach(l => {
      const [name, ...rest] = l.split(/[>=<]/);
      deps.prod.push({ name: name.trim(), version: rest.join('') || '*' });
    });
    return deps;
  }
  if (type === 'go.mod') {
    content.split('\n').filter(l => l.trim() && !l.startsWith('module') && !l.startsWith('go ') && !l.startsWith('require')).forEach(l => {
      const parts = l.trim().split(/\s+/);
      if (parts.length >= 2) deps.prod.push({ name: parts[0], version: parts[1] });
    });
    return deps;
  }
  if (type === 'pubspec.yaml') {
    let inDeps = false;
    content.split('\n').forEach(l => {
      if (l.startsWith('dependencies:')) { inDeps = true; return; }
      if (l.startsWith('dev_dependencies:')) { inDeps = false; return; }
      if (inDeps && /^\s+\w/.test(l)) {
        const [name, version] = l.trim().split(':');
        deps.prod.push({ name: name.trim(), version: (version || '').trim() || '*' });
      }
    });
    return deps;
  }
  return deps;
}

function buildDisplayTree(tree) {
  const root = { children: {} };
  tree.filter(f => f.type === 'blob' || f.type === 'tree').forEach(f => {
    const parts = f.path.split('/');
    let node = root;
    parts.forEach((part, i) => {
      if (!node.children[part]) node.children[part] = { name: part, children: {}, type: i === parts.length - 1 ? f.type : 'tree', size: f.size || 0 };
      node = node.children[part];
    });
  });
  function toArray(node) {
    return Object.values(node.children)
      .sort((a, b) => a.type !== b.type ? (a.type === 'tree' ? -1 : 1) : a.name.localeCompare(b.name))
      .map(child => ({ name: child.name, type: child.type, size: child.size, children: child.type === 'tree' ? toArray(child) : undefined }));
  }
  return toArray(root);
}

function analyzeArchitecture(tree, stack) {
  const paths = tree.map(f => f.path.toLowerCase());
  const has = (...names) => names.some(n => paths.some(p => p.includes(n)));
  const nodes = [];

  const hasFrontend = has('components/', 'pages/', 'app/', 'views/', 'src/');
  const hasBackend = has('server', 'api/', 'routes/', 'controllers/', 'services/');
  const hasDB = has('prisma', 'models/', 'schema', 'migrations/', 'database/');
  const hasAuth = has('auth/', 'middleware/auth', 'guards/', 'passport', 'jwt');
  const hasDocker = has('dockerfile', 'docker-compose');
  const hasTests = has('__tests__', 'spec/', '.test.', '.spec.');

  if (hasFrontend) nodes.push({ id: 'frontend', label: 'Frontend', type: 'frontend', description: 'User interface layer', files: tree.filter(f => /(components|pages|app|views)\//.test(f.path)).map(f => f.path).slice(0, 5) });
  if (hasBackend) nodes.push({ id: 'backend', label: 'Backend', type: 'backend', description: 'API and business logic layer', files: tree.filter(f => /(routes|controllers|services|api)\//.test(f.path)).map(f => f.path).slice(0, 5) });
  if (hasDB) nodes.push({ id: 'database', label: 'Database', type: 'database', description: 'Data persistence layer', files: tree.filter(f => /(prisma|models|schema|migrations)\//.test(f.path)).map(f => f.path).slice(0, 5) });
  if (hasAuth) nodes.push({ id: 'auth', label: 'Authentication', type: 'auth', description: 'Identity and access control', files: tree.filter(f => /auth\//.test(f.path)).map(f => f.path).slice(0, 5) });
  if (hasDocker) nodes.push({ id: 'infra', label: 'Infrastructure', type: 'infra', description: 'Containerization and deployment', files: tree.filter(f => /dockerfile|docker-compose/.test(f.path.toLowerCase())).map(f => f.path).slice(0, 5) });
  if (hasTests) nodes.push({ id: 'testing', label: 'Testing', type: 'testing', description: 'Automated test suite', files: tree.filter(f => /(__tests__|\.test\.|\.spec\.)/.test(f.path)).map(f => f.path).slice(0, 5) });

  return nodes;
}

function analyzeSecuritySignals(tree, deps) {
  const paths = tree.map(f => f.path);
  const signals = [];
  const criticalLeaks = [];
  let score = 100;

  const exposedEnvFiles = paths.filter(p => /(^|\/)\.env(\.(local|prod|production|staging|dev))?$/i.test(p) && !p.includes('.example') && !p.includes('.template'));
  const exposedKeyFiles = paths.filter(p => /(id_rsa|id_ed25519|credentials\.json|serviceAccountKey\.json|\.pem|\.pfx|\.keystore)$/i.test(p));

  if (exposedEnvFiles.length > 0) {
    exposedEnvFiles.forEach(f => {
      criticalLeaks.push({
        file: f,
        leakType: 'Exposed Environment File',
        severity: 'critical',
        recommendation: 'Add .env to .gitignore and purge from git history immediately.'
      });
    });
    signals.push({
      severity: 'critical',
      title: 'Environment secret file committed',
      explanation: `Exposed environment file(s) detected: ${exposedEnvFiles.join(', ')}. This can expose database passwords, API tokens, and JWT secrets publicly.`,
      recommendation: 'Add .env to .gitignore and rotate any exposed keys.'
    });
    score -= 35;
  }

  if (exposedKeyFiles.length > 0) {
    exposedKeyFiles.forEach(f => {
      criticalLeaks.push({
        file: f,
        leakType: 'Private RSA/SSL Key File',
        severity: 'critical',
        recommendation: 'Revoke key pair immediately and remove private key file from repository.'
      });
    });
    signals.push({
      severity: 'critical',
      title: 'Private key file committed',
      explanation: `Private encryption or SSL key file(s) detected: ${exposedKeyFiles.join(', ')}.`,
      recommendation: 'Revoke and regenerate certificate key pairs.'
    });
    score -= 40;
  }

  const hasEnvExample = paths.some(p => /\.env\.example/i.test(p));
  const hasAuth = paths.some(p => /auth|jwt|oauth|passport/i.test(p));
  const hasHelmet = deps.prod.some(d => d.name === 'helmet');
  const hasRateLimit = deps.prod.some(d => /rate.?limit/i.test(d.name));
  const hasDotenvInProd = deps.prod.some(d => d.name === 'dotenv');
  const hasCors = deps.prod.some(d => d.name === 'cors');
  const hasGithubActions = paths.some(p => p.startsWith('.github/workflows'));

  if (!hasEnvExample) {
    signals.push({
      severity: 'warning',
      title: 'Missing .env.example template',
      explanation: 'No .env.example file found to guide new developers on required environment variables.',
      recommendation: 'Create a .env.example with placeholder values for setup.'
    });
    score -= 5;
  }

  if (!hasAuth) {
    signals.push({
      severity: 'info',
      title: 'No explicit auth layer detected',
      explanation: 'No standard auth directory or middleware (jwt, oauth, passport) detected.',
      recommendation: 'Verify protected endpoints enforce token authorization.'
    });
    score -= 5;
  }

  if (!hasHelmet && deps.prod.some(d => d.name === 'express')) {
    signals.push({
      severity: 'warning',
      title: 'HTTP Security Headers missing (Helmet)',
      explanation: 'Helmet sets essential security headers (X-Frame-Options, CSP, HSTS) automatically.',
      recommendation: 'Install helmet: npm install helmet and use app.use(helmet()).'
    });
    score -= 10;
  }

  if (!hasRateLimit && deps.prod.some(d => d.name === 'express')) {
    signals.push({
      severity: 'warning',
      title: 'No rate limiting middleware detected',
      explanation: 'Without rate limiting, public API routes are vulnerable to brute force and DDoS attacks.',
      recommendation: 'Add express-rate-limit to public endpoint routes.'
    });
    score -= 10;
  }

  if (hasCors) {
    signals.push({
      severity: 'info',
      title: 'CORS Middleware configured',
      explanation: 'CORS middleware detected. Ensure production origins are explicitly whitelisted, avoiding wildcard (*).',
      recommendation: 'Restrict origin URLs in production environment.'
    });
  }

  if (hasDotenvInProd) {
    signals.push({
      severity: 'info',
      title: 'dotenv in production dependencies',
      explanation: 'dotenv package is listed under production dependencies instead of devDependencies.',
      recommendation: 'Move dotenv to devDependencies.'
    });
    score -= 3;
  }

  if (hasGithubActions) {
    signals.push({
      severity: 'info',
      title: 'GitHub Actions CI/CD active',
      explanation: 'Automated workflow pipelines detected under .github/workflows/.',
      recommendation: 'Store all API tokens and keys in GitHub Repository Secrets.'
    });
  }

  return { score: Math.max(0, score), signals, criticalLeaks };
}

function analyzePerformance(tree) {
  const files = tree.filter(f => f.type === 'blob' && f.size > 0);
  const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 10).map(f => ({ path: f.path, size: f.size, ext: f.path.includes('.') ? f.path.split('.').pop() : '' }));
  const hasLazyRoutes = tree.some(f => /lazy|dynamic|import\(/.test(f.path.toLowerCase()));
  const totalSize = files.reduce((a, b) => a + (b.size || 0), 0);
  const avgSize = files.length > 0 ? Math.round(totalSize / files.length) : 0;

  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(f.path));
  const totalImageSize = imageFiles.reduce((a, b) => a + (b.size || 0), 0);

  return { largest, hasLazyRoutes, totalSize, avgSize, imageFiles: imageFiles.length, totalImageSize, fileCount: files.length };
}

function analyzeCodeHealth(tree) {
  const files = tree.filter(f => f.type === 'blob');
  const byExt = (ext) => files.filter(f => f.path.endsWith(ext)).length;
  const matching = (pattern) => files.filter(f => pattern.test(f.path)).length;

  return {
    totalFiles: files.length,
    totalDirs: tree.filter(f => f.type === 'tree').length,
    components: matching(/\/(components?|ui|widgets)\//i),
    hooks: matching(/use[A-Z][a-zA-Z]+\.(ts|tsx|js|jsx)$/),
    tests: matching(/\.(test|spec)\.(ts|tsx|js|jsx)$/),
    tsFiles: byExt('.ts') + byExt('.tsx'),
    jsFiles: byExt('.js') + byExt('.jsx'),
    cssFiles: byExt('.css') + byExt('.scss') + byExt('.sass'),
    configFiles: matching(/\.(config|rc)\.(js|ts|json|yaml|yml)$/),
    hasTests: matching(/\.(test|spec)\.(ts|tsx|js|jsx)$/) > 0,
    hasLinting: files.some(f => /\.eslintrc|\.prettierrc/.test(f.path)),
    hasTypeScript: byExt('.ts') + byExt('.tsx') > 0,
    hasDocumentation: files.some(f => /readme|contributing|changelog/i.test(f.path)),
  };
}

router.get('/scan', async (req, res) => {
  const { repo: repoUrl } = req.query;
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.replace(/^(token|Bearer)\s+/i, '') : null;

  if (!repoUrl) return res.status(400).json({ error: 'Missing repo parameter' });
  const parsed = parseGitHubUrl(decodeURIComponent(repoUrl));
  if (!parsed) return res.status(400).json({ error: 'Invalid GitHub repository URL' });

  const { owner, repo } = parsed;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const report = {};

  try {
    sendStep(res, 1, 'Fetching repository metadata', 5);
    const meta = await ghFetch(`/repos/${owner}/${repo}`, token);
    report.meta = {
      name: meta.name, full_name: meta.full_name, description: meta.description || '',
      owner: { login: meta.owner.login, avatar_url: meta.owner.avatar_url, html_url: meta.owner.html_url },
      stars: meta.stargazers_count, forks: meta.forks_count, watchers: meta.watchers_count,
      open_issues: meta.open_issues_count, private: meta.private, visibility: meta.visibility,
      default_branch: meta.default_branch, created_at: meta.created_at, updated_at: meta.updated_at,
      pushed_at: meta.pushed_at, size_kb: meta.size, homepage: meta.homepage || '',
      topics: meta.topics || [], license: meta.license?.name || null, html_url: meta.html_url,
    };
    sendStep(res, 1, 'Repository metadata fetched', 10, { done: true });

    sendStep(res, 2, 'Reading file tree', 15);
    let fileTree = [];
    try {
      const treeData = await ghFetch(`/repos/${owner}/${repo}/git/trees/${meta.default_branch}?recursive=1`, token);
      fileTree = treeData.tree || [];
      report.tree = buildDisplayTree(fileTree);
      report.metrics = {
        total_files: fileTree.filter(f => f.type === 'blob').length,
        total_dirs: fileTree.filter(f => f.type === 'tree').length,
        total_size_kb: Math.round(fileTree.filter(f => f.size).reduce((a, b) => a + (b.size || 0), 0) / 1024),
        truncated: treeData.truncated || false,
      };
    } catch { report.tree = []; report.metrics = { total_files: 0, total_dirs: 0, total_size_kb: 0, truncated: false }; }
    sendStep(res, 2, `File tree read (${report.metrics.total_files} files)`, 22, { done: true });

    sendStep(res, 3, 'Analyzing language breakdown', 25);
    try {
      const langs = await ghFetch(`/repos/${owner}/${repo}/languages`, token);
      const total = Object.values(langs).reduce((a, b) => a + b, 0);
      report.languages = Object.entries(langs).map(([name, bytes]) => ({ name, bytes, percent: Math.round((bytes / total) * 1000) / 10 })).sort((a, b) => b.bytes - a.bytes);
    } catch { report.languages = []; }
    sendStep(res, 3, `Languages analyzed (${report.languages.length} found)`, 32, { done: true });

    sendStep(res, 4, 'Fetching contributors', 35);
    try {
      const contribs = await ghFetch(`/repos/${owner}/${repo}/contributors?per_page=8`, token);
      report.contributors = contribs.map(c => ({ login: c.login, avatar_url: c.avatar_url, html_url: c.html_url, contributions: c.contributions }));
    } catch { report.contributors = []; }
    sendStep(res, 4, `Contributors fetched (${report.contributors.length})`, 42, { done: true });

    sendStep(res, 5, 'Scanning dependencies', 45);
    report.dependencies = { prod: [], dev: [], type: null };
    for (const { path, type } of [{ path: 'package.json', type: 'package.json' }, { path: 'requirements.txt', type: 'requirements.txt' }, { path: 'go.mod', type: 'go.mod' }, { path: 'pubspec.yaml', type: 'pubspec.yaml' }]) {
      const content = await ghFileContent(owner, repo, path, token);
      if (content) { report.dependencies = { ...parseDependencies(content, type), type }; break; }
    }
    sendStep(res, 5, `Dependencies found (${report.dependencies.prod.length + report.dependencies.dev.length})`, 52, { done: true });

    sendStep(res, 6, 'Reading README', 55);
    report.readme = null;
    for (const p of ['README.md', 'readme.md', 'Readme.md', 'README.mdx']) {
      const content = await ghFileContent(owner, repo, p, token);
      if (content) { report.readme = content; break; }
    }
    sendStep(res, 6, report.readme ? 'README loaded' : 'No README found', 62, { done: true });

    sendStep(res, 7, 'Detecting tech stack and architecture', 65);
    report.stack = detectStack(fileTree);
    report.architecture = analyzeArchitecture(fileTree, report.stack);
    report.routes = detectRoutes(fileTree);
    sendStep(res, 7, `Stack detected (${report.stack.length} technologies)`, 72, { done: true });

    sendStep(res, 8, 'Running security audit', 75);
    report.security = analyzeSecuritySignals(fileTree, report.dependencies);
    sendStep(res, 8, `Security audit complete (score: ${report.security.score}/100)`, 82, { done: true });

    sendStep(res, 9, 'Analyzing performance and code health', 85);
    report.performance = analyzePerformance(fileTree);
    report.codeHealth = analyzeCodeHealth(fileTree);
    const extCounts = {};
    fileTree.filter(f => f.type === 'blob').forEach(f => {
      const ext = f.path.includes('.') ? '.' + f.path.split('.').pop().toLowerCase() : 'no-ext';
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    });
    report.ext_breakdown = Object.entries(extCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([ext, count]) => ({ ext, count }));
    sendStep(res, 9, 'Analysis complete', 92, { done: true });

    sendStep(res, 10, 'Compiling full report', 96);
    await new Promise(r => setTimeout(r, 200));
    sendStep(res, 10, 'Report ready', 100, { done: true });

    sendEvent(res, { step: 'DONE', report });
    res.end();

  } catch (err) {
    sendEvent(res, { step: 'ERROR', error: 'Scan failed. Check the repository URL and permissions.' });
    res.end();
  }
});

module.exports = router;
