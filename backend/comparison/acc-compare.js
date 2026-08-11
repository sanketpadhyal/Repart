const express = require('express');
const router = express.Router();

const comparisonCache = new Map();
const CACHE_TTL = 30 * 60 * 1000;


const CHARS_PER_LINE = {
  JavaScript: 45, TypeScript: 48, Python: 42, Java: 52, 'C++': 40,
  C: 38, Go: 44, Rust: 46, Ruby: 38, PHP: 50, Swift: 44, Kotlin: 48,
  HTML: 60, CSS: 40, Shell: 35, Dockerfile: 30, Vue: 55, default: 45
};

function bytesToLOC(bytes, lang) {
  const cpl = CHARS_PER_LINE[lang] || CHARS_PER_LINE.default;
  return Math.round(bytes / cpl);
}

function formatLOC(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}


async function fetchRepoLOC(repoFullName, headers) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}/languages`, { headers });
    if (!res.ok) return 0;
    const langs = await res.json();
    return Object.entries(langs).reduce((sum, [lang, bytes]) => sum + bytesToLOC(bytes, lang), 0);
  } catch {
    return 0;
  }
}

async function fetchDeepUserData(username, reqHeaderToken) {
  const cacheKey = `user_hyper_${username.toLowerCase()}`;
  const cached = comparisonCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const headers = { 'User-Agent': 'Repart-App' };
  if (reqHeaderToken) {
    headers['Authorization'] = reqHeaderToken;
  }

  const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${username}" was not found.`);
    }
    if (userRes.status === 403) {
      throw new Error(`GitHub API rate limit reached. Please try again in a few minutes or log in with GitHub.`);
    }
    throw new Error(`GitHub user "${username}" could not be fetched (${userRes.status}).`);
  }
  const user = await userRes.json();

  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers });
  const repos = reposRes.ok ? await reposRes.json() : [];

  let totalStars = 0;
  let totalForks = 0;
  let originalReposCount = 0;
  let hasTypeScript = false;
  let hasDocumentation = false;
  let hasLicense = false;
  let recentPushesCount = 0;
  const langCounts = {};

  const nowMs = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  const repoList = Array.isArray(repos) ? repos : [];

  repoList.forEach((r) => {
    totalStars += r.stargazers_count || 0;
    totalForks += r.forks_count || 0;

    if (!r.fork) {
      originalReposCount++;
    }

    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      if (r.language === 'TypeScript') hasTypeScript = true;
    }

    if (r.description || r.has_pages) {
      hasDocumentation = true;
    }

    if (r.license) {
      hasLicense = true;
    }

    if (r.pushed_at && nowMs - new Date(r.pushed_at).getTime() < ninetyDaysMs) {
      recentPushesCount++;
    }
  });

  const topLanguages = Object.entries(langCounts).
  sort((a, b) => b[1] - a[1]).
  slice(0, 5).
  map(([lang, count]) => ({ lang, count }));

  const publicRepos = user.public_repos || 0;
  const followers = user.followers || 0;
  const totalRepos = repoList.length || publicRepos;


  const hasNoActivity = publicRepos === 0 && totalStars === 0;

  let powerScore = 0;
  let codeQualityScore = 0;
  let architectureScore = 0;
  let securityScore = 0;
  let velocityScore = 0;
  let engineeringScore = 0;

  if (!hasNoActivity) {
    const avgStarsPerRepo = (totalStars / Math.max(1, totalRepos)).toFixed(1);

    const rawPower = followers * 0.3 + totalStars * 2.5 + totalForks * 3.5 + publicRepos * 1.2;
    powerScore = Math.min(99, Math.max(1, Math.round(Math.log10(rawPower + 1) * 22 + (totalStars > 0 ? 10 : 0))));

    let qualityPoints = 0;
    if (totalRepos > 0) qualityPoints += 20;
    if (hasTypeScript) qualityPoints += 20;
    if (topLanguages.length >= 3) qualityPoints += 15;
    if (Number(avgStarsPerRepo) >= 1.0) qualityPoints += 15;
    if (totalRepos > 0 && originalReposCount / totalRepos >= 0.7) qualityPoints += 10;
    if (hasDocumentation) qualityPoints += 5;
    codeQualityScore = Math.min(99, Math.max(1, qualityPoints));

    let stackPoints = 0;
    if (totalRepos > 0) stackPoints += 10;
    if (hasTypeScript) stackPoints += 25;
    if (topLanguages.some((l) => ['TypeScript', 'Go', 'Rust', 'Python'].includes(l.lang))) stackPoints += 20;
    if (topLanguages.length >= 4) stackPoints += 15;
    if (publicRepos >= 10) stackPoints += 9;
    architectureScore = Math.min(99, Math.max(1, stackPoints));

    let securityPoints = 0;
    if (totalRepos > 0) securityPoints += 20;
    if (hasLicense) securityPoints += 20;
    if (hasDocumentation) securityPoints += 15;
    if (hasTypeScript) securityPoints += 14;
    securityScore = Math.min(99, Math.max(1, securityPoints));

    let velocityPoints = 0;
    if (recentPushesCount >= 5) velocityPoints += 35;else
    if (recentPushesCount >= 1) velocityPoints += 20;
    if (publicRepos >= 15) velocityPoints += 20;
    if (user.updated_at && nowMs - new Date(user.updated_at).getTime() < ninetyDaysMs) velocityPoints += 14;
    velocityScore = Math.min(99, Math.max(velocityPoints > 0 ? 1 : 0, velocityPoints));

    engineeringScore = Math.min(99, Math.max(1, Math.round(
      codeQualityScore * 0.4 + architectureScore * 0.4 + securityScore * 0.2
    )));
  }


  let totalLOC = 0;
  if (!hasNoActivity) {
    const originalRepos = repoList.filter((r) => !r.fork).slice(0, 10);
    const locResults = await Promise.all(
      originalRepos.map((r) => fetchRepoLOC(r.full_name, headers))
    );
    totalLOC = locResults.reduce((sum, loc) => sum + loc, 0);
  }

  const resultData = {
    login: user.login,
    name: user.name || user.login,
    avatar_url: user.avatar_url,
    bio: user.bio || 'GitHub Developer',
    location: user.location || 'Global',
    html_url: user.html_url,
    created_at: user.created_at,
    followers,
    following: user.following || 0,
    public_repos: publicRepos,
    total_stars: totalStars,
    total_forks: totalForks,
    top_languages: topLanguages,
    primary_language: topLanguages[0]?.lang || (hasNoActivity ? 'N/A' : 'JavaScript'),
    power_score: powerScore,
    code_quality_score: codeQualityScore,
    architecture_score: architectureScore,
    security_score: securityScore,
    velocity_score: velocityScore,
    engineering_score: engineeringScore,
    has_no_activity: hasNoActivity,
    total_loc: totalLOC,
    formatted_loc: hasNoActivity ? '0' : formatLOC(totalLOC),
    quality_breakdown: {
      type_safety: hasNoActivity ? 'No Data' : hasTypeScript ? 'High (TypeScript)' : 'Standard (JavaScript)',
      originality: hasNoActivity ? 'No Repos' : `${originalReposCount}/${totalRepos} Original Repos`,
      avg_stars: hasNoActivity ? 'No Data' : `${(totalStars / Math.max(1, totalRepos)).toFixed(1)} Stars/Repo`,
      tech_diversity: hasNoActivity ? 'No Data' : `${topLanguages.length} Languages`,
      docs_hygiene: hasNoActivity ? 'No Data' : hasDocumentation ? 'High Quality' : 'Standard',
      active_velocity: hasNoActivity ? 'No Activity' : `${recentPushesCount} Recent Active Repos`
    }
  };

  comparisonCache.set(cacheKey, { ts: Date.now(), data: resultData });
  return resultData;
}

router.get('/', async (req, res) => {
  try {
    const user1Param = (req.query.user1 || '').trim();
    const user2Param = (req.query.user2 || '').trim();

    if (!user1Param || !user2Param) {
      return res.status(400).json({ error: 'Please provide both user1 and user2 query parameters.' });
    }

    const reqToken = req.headers['authorization'];

    const [u1, u2] = await Promise.all([
    fetchDeepUserData(user1Param, reqToken),
    fetchDeepUserData(user2Param, reqToken)]
    );

    let winner = null;
    if (u1.power_score > u2.power_score) winner = u1.login;else
    if (u2.power_score > u1.power_score) winner = u2.login;else
    winner = 'Tie';

    let workWinner = null;
    if (u1.engineering_score > u2.engineering_score) workWinner = u1.login;else
    if (u2.engineering_score > u1.engineering_score) workWinner = u2.login;else
    workWinner = 'Tie';

    const categoryWinners = {
      power: u1.power_score > u2.power_score ? u1.login : u2.power_score > u1.power_score ? u2.login : 'Tie',
      work: workWinner,
      quality: u1.code_quality_score > u2.code_quality_score ? u1.login : u2.code_quality_score > u1.code_quality_score ? u2.login : 'Tie',
      architecture: u1.architecture_score > u2.architecture_score ? u1.login : u2.architecture_score > u1.architecture_score ? u2.login : 'Tie',
      security: u1.security_score > u2.security_score ? u1.login : u2.security_score > u1.security_score ? u2.login : 'Tie',
      velocity: u1.velocity_score > u2.velocity_score ? u1.login : u2.velocity_score > u1.velocity_score ? u2.login : 'Tie',
      stars: u1.total_stars > u2.total_stars ? u1.login : u2.total_stars > u1.total_stars ? u2.login : 'Tie',
      followers: u1.followers > u2.followers ? u1.login : u2.followers > u1.followers ? u2.login : 'Tie',
      repos: u1.public_repos > u2.public_repos ? u1.login : u2.public_repos > u1.public_repos ? u2.login : 'Tie',
      forks: u1.total_forks > u2.total_forks ? u1.login : u2.total_forks > u1.total_forks ? u2.login : 'Tie'
    };

    res.json({
      user1: u1,
      user2: u2,
      winner,
      work_winner: workWinner,
      category_winners: categoryWinners,
      watermark: '⚡ Repart Hyper-Level Engineering Audit Engine v3.0',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in hyper account comparison endpoint:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate hyper developer comparison.' });
  }
});

module.exports = router;