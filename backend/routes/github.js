const express = require('express');
const router = express.Router();

function buildHeaders(authHeader) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    Accept: 'application/vnd.github+json'
  };
  if (authHeader) headers['Authorization'] = authHeader;
  return headers;
}

function normaliseRepo(r) {
  return {
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description || '',
    language: r.language || '',
    stargazers_count: r.stargazers_count || 0,
    forks_count: r.forks_count || 0,
    html_url: r.html_url,
    private: r.private || false,
    visibility: r.visibility || (r.private ? 'private' : 'public'),
    updated_at: r.updated_at || '',
    pushed_at: r.pushed_at || '',
    topics: r.topics || [],
    size: r.size || 0,
    license: r.license || null,
    open_issues_count: r.open_issues_count || 0,
    archived: r.archived || false
  };
}

router.get('/user-full/:username', async (req, res) => {
  const { username } = req.params;
  const authHeader = req.headers['authorization'];
  const reqHeaders = buildHeaders(authHeader);

  try {
    let userData = null;
    let reposData = [];
    let pageHtml = null;

    try {
      const userRes = await fetch(`https://api.github.com/users/${username}`, { headers: reqHeaders });
      if (userRes.ok) userData = await userRes.json();
    } catch {}

    try {
      pageHtml = await fetch(`https://github.com/${username}`, { headers: reqHeaders }).then(r => r.ok ? r.text() : null);
      if (pageHtml) {
        const pinnedBlocks = [...pageHtml.matchAll(/<li[^>]*class="[^"]*pinned-item-list-item[^"]*"[\s\S]*?<\/li>/gi)];
        if (pinnedBlocks.length > 0) {
          reposData = pinnedBlocks.map((b, idx) => {
            const block = b[0];
            const nameMatch    = block.match(/href="\/[^/]+\/([^"/]+)"/);
            const descMatch    = block.match(/class="[^"]*pinned-item-desc[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/p>/);
            const langMatch    = block.match(/itemprop="programmingLanguage"[^>]*>\s*([^<\n]+)/);
            const starMatch    = block.match(/stargazers"[^>]*>\s*[\s\S]*?([\d,]+)\s*<\/a>/i);
            const forkMatch    = block.match(/members"[^>]*>\s*[\s\S]*?([\d,]+)\s*<\/a>/i);
            const timeMatch    = block.match(/<relative-time[^>]+datetime="([^"]+)"/);
            const topicMatches = [...block.matchAll(/href="\/topics\/([^"]+)"/g)];
            const repoName = nameMatch ? nameMatch[1].trim() : `repo-${idx}`;
            return {
              id: idx + 1,
              name: repoName,
              full_name: `${username}/${repoName}`,
              description: descMatch ? descMatch[1].trim().replace(/\s+/g, ' ').replace(/&amp;/g, '&') : '',
              language: langMatch ? langMatch[1].trim() : '',
              stargazers_count: starMatch ? parseInt(starMatch[1].replace(/,/g, '')) : 0,
              forks_count: forkMatch ? parseInt(forkMatch[1].replace(/,/g, '')) : 0,
              html_url: `https://github.com/${username}/${repoName}`,
              private: false,
              is_pinned: true,
              pushed_at: timeMatch ? timeMatch[1] : '',
              topics: topicMatches.map(m => m[1])
            };
          });
        }

        if (!userData) {
          const followersMatch  = pageHtml.match(/([\d,]+)\s+followers/i);
          const followingMatch  = pageHtml.match(/([\d,]+)\s+following/i);
          const repoCountMatch  = pageHtml.match(/([\d,]+)\s+repositories/i);
          userData = {
            login: username,
            name: username,
            avatar_url: `https://github.com/${username}.png`,
            bio: '',
            followers:    followersMatch  ? parseInt(followersMatch[1].replace(/,/g, ''))  : 0,
            following:    followingMatch  ? parseInt(followingMatch[1].replace(/,/g, ''))  : 0,
            public_repos: repoCountMatch  ? parseInt(repoCountMatch[1].replace(/,/g, '')) : 0
          };
        }
      }
    } catch {}

    let allReposData = [];
    try {
      const endpoint = authHeader
        ? 'https://api.github.com/user/repos?per_page=100&type=all&sort=updated'
        : `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
      const allReposRes = await fetch(endpoint, { headers: reqHeaders });
      if (allReposRes.ok) {
        const reposJson = await allReposRes.json();
        if (Array.isArray(reposJson) && reposJson.length > 0) {
          allReposData = reposJson.map(normaliseRepo);
        }
      }
    } catch {}

    if (allReposData.length === 0) {
      for (let page = 1; page <= 4; page++) {
        try {
          const pageRes = await fetch(`https://github.com/${username}?tab=repositories&page=${page}`, { headers: reqHeaders });
          if (!pageRes.ok) break;
          const html = await pageRes.text();
          const blocks = [...html.matchAll(/<li[^"]*class="[^"]*col-12[^"]*"[\s\S]*?<\/li>/g)];
          if (blocks.length === 0) break;
          for (const b of blocks) {
            const block = b[0];
            const nameMatch    = block.match(/itemprop="name codeRepository"[^>]*>\s*([^<\n]+)/) || block.match(/href="\/[^/]+\/([^"/]+)"/);
            const descMatch    = block.match(/itemprop="description"[^>]*>\s*([\s\S]*?)\s*<\/p>/);
            const langMatch    = block.match(/itemprop="programmingLanguage"[^>]*>\s*([^<\n]+)/);
            const starMatch    = block.match(/href="\/[^/]+\/[^/]+\/stargazers"[^>]*>\s*([\d,]+)/);
            const forkMatch    = block.match(/href="\/[^/]+\/[^/]+\/network\/members"[^>]*>\s*([\d,]+)/);
            const timeMatch    = block.match(/<relative-time[^>]+datetime="([^"]+)"/);
            const topicMatches = [...block.matchAll(/href="\/topics\/([^"]+)"/g)];
            if (nameMatch) {
              const repoName = nameMatch[1].trim();
              allReposData.push({
                id: allReposData.length + 1,
                name: repoName,
                full_name: `${username}/${repoName}`,
                description: descMatch ? descMatch[1].trim().replace(/\s+/g, ' ').replace(/&amp;/g, '&') : '',
                language: langMatch ? langMatch[1].trim() : '',
                stargazers_count: starMatch ? parseInt(starMatch[1].replace(/,/g, '')) : 0,
                forks_count: forkMatch ? parseInt(forkMatch[1].replace(/,/g, '')) : 0,
                html_url: `https://github.com/${username}/${repoName}`,
                private: false,
                pushed_at: timeMatch ? timeMatch[1] : '',
                topics: topicMatches.map(m => m[1])
              });
            }
          }
        } catch {
          break;
        }
      }
    }

    if (allReposData.length > 0 && reposData.length > 0) {
      const repoMap = Object.fromEntries(allReposData.map(r => [r.name.toLowerCase(), r]));
      reposData = reposData.map(pinned => {
        const real = repoMap[pinned.name.toLowerCase()];
        return real ? {
          ...pinned,
          language: real.language || pinned.language,
          stargazers_count: real.stargazers_count,
          forks_count: real.forks_count,
          private: real.private || false,
          description: pinned.description || real.description || ''
        } : pinned;
      });
    }

    let longestStreak = 0;
    let currentStreak = 0;
    let totalCommits = 0;

    if (pageHtml) {
      const totalMatch = pageHtml.match(/([\d,]+)\s+contributions\s+in\s+(?:the\s+last\s+year|\d{4})/i);
      if (totalMatch) {
        totalCommits = parseInt(totalMatch[1].replace(/,/g, ''), 10);
      }
    }

    try {
      const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`).then(r => r.ok ? r.json() : null);
      if (contribRes && Array.isArray(contribRes.contributions)) {
        const contribs = contribRes.contributions;
        let computedTotal = 0;
        let temp = 0;
        for (const c of contribs) {
          computedTotal += c.count;
          if (c.count > 0) { temp++; if (temp > longestStreak) longestStreak = temp; }
          else { temp = 0; }
        }
        for (let i = contribs.length - 1; i >= 0; i--) {
          if (contribs[i].count > 0) currentStreak++;
          else if (i === contribs.length - 1) continue;
          else break;
        }
        if (!totalCommits || totalCommits === 0) {
          totalCommits = computedTotal;
        }
      }
    } catch {}

    const targetRepos = allReposData.length > 0 ? allReposData : reposData;
    let totalKb = 0;
    const langCounts = {};

    targetRepos.forEach(r => {
      totalKb += (r.size && r.size > 0 ? r.size : 0);
      const lang = r.language && r.language.trim();
      if (lang) {
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      }
    });

    const rawLOC = Math.round(totalKb * 30);
    const formattedLOC = rawLOC >= 1000000
      ? `${(rawLOC / 1000000).toFixed(1)}M LOC`
      : rawLOC >= 1000
        ? `${Math.round(rawLOC / 1000)}k LOC`
        : `${rawLOC} LOC`;

    const total = targetRepos.length || 1;
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const reposWithLicense    = targetRepos.filter(r => r.license && r.license.key && r.license.key !== 'other').length;
    const reposWithDesc       = targetRepos.filter(r => r.description && r.description.length > 5).length;
    const reposWithTopics     = targetRepos.filter(r => r.topics && r.topics.length > 0).length;
    const reposRecentlyPushed = targetRepos.filter(r => r.pushed_at && new Date(r.pushed_at) > oneYearAgo).length;
    const totalOpenIssues     = targetRepos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0);
    const issuesPenalty       = Math.min(15, Math.round((totalOpenIssues / total) * 1.5));

    const securityScore = Math.min(100, Math.max(0, Math.round(
      (reposWithLicense    / total) * 40 +
      (reposWithDesc       / total) * 25 +
      (reposWithTopics     / total) * 20 +
      (reposRecentlyPushed / total) * 15 -
      issuesPenalty
    )));
    const securityGrade = securityScore >= 85 ? 'A+' : securityScore >= 70 ? 'A' : securityScore >= 55 ? 'B+' : securityScore >= 40 ? 'B' : 'C';

    const TEST_CULTURE_LANGS   = ['TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C#', 'Kotlin', 'Swift', 'Ruby', 'C++'];
    const reposWithTestLang    = targetRepos.filter(r => TEST_CULTURE_LANGS.includes(r.language)).length;
    const TEST_KEYWORDS        = /test|spec|jest|pytest|mocha|cypress|vitest|junit|rspec/i;
    const reposWithTestKeyword = targetRepos.filter(r =>
      TEST_KEYWORDS.test(r.name) || TEST_KEYWORDS.test(r.description)
    ).length;
    const testCoverageRatio = Math.min(100, Math.max(0, Math.round(
      (reposWithTestLang    / total) * 55 +
      (reposWithTestKeyword / total) * 35 +
      (reposRecentlyPushed  / total) * 10
    )));

    const totalLangRepos = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    const LANG_COLORS = {
      TypeScript: '#3178c6',
      JavaScript: '#f1e05a',
      Python: '#3572A5',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Go: '#00ADD8',
      Rust: '#dea584',
      Java: '#b07219',
      'C++': '#f34b7d',
      PHP: '#4F5D95',
      Shell: '#89e051',
      Other: '#8c6b22'
    };

    const languages = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalLangRepos) * 100),
        color: LANG_COLORS[name] || '#8c6b22'
      }))
      .sort((a, b) => b.count - a.count);

    const topLang = languages[0]?.name || 'Web';
    let archetype = 'Full-Stack Software Engineer';
    if (topLang === 'TypeScript' || topLang === 'JavaScript') {
      archetype = languages.some(l => ['Python', 'Go', 'Java', 'Rust'].includes(l.name))
        ? 'Full-Stack System Architect'
        : 'Frontend & Web Applications Architect';
    } else if (['Python', 'Go', 'Java', 'C++', 'Rust'].includes(topLang)) {
      archetype = 'Backend Performance Engineer';
    }

    const portfolioAnalytics = {
      totalLOC: rawLOC,
      formattedLOC,
      securityScore,
      securityGrade,
      testCoverageRatio,
      languages,
      archetype,
      analyzedReposCount: targetRepos.length
    };

    const weeklyVelocity = Math.max(1, Math.round(totalCommits / 52));

    res.json({
      user: userData,
      repos: reposData.length > 0 ? reposData : allReposData.slice(0, 6),
      allRepos: allReposData.length > 0 ? allReposData : reposData,
      activity: { longestStreak, currentStreak, totalCommits, weeklyVelocity },
      portfolioAnalytics
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

module.exports = router;
