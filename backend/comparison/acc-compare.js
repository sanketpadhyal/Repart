const express = require('express');
const router = express.Router();

const comparisonCache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

async function fetchDeepUserData(username, reqHeaderToken) {
  const cacheKey = `user_hyper_${username.toLowerCase()}`;
  const cached = comparisonCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts < CACHE_TTL)) {
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

  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
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

  if (Array.isArray(repos)) {
    repos.forEach(r => {
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

      if (r.pushed_at && (nowMs - new Date(r.pushed_at).getTime() < ninetyDaysMs)) {
        recentPushesCount++;
      }
    });
  }

  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ lang, count }));

  const totalRepos = repos.length || user.public_repos || 1;
  const avgStarsPerRepo = (totalStars / Math.max(1, totalRepos)).toFixed(1);
  const followers = user.followers || 0;
  const publicRepos = user.public_repos || 0;

  const rawPower = (followers * 0.3) + (totalStars * 2.5) + (totalForks * 3.5) + (publicRepos * 1.2);
  const powerScore = Math.min(99, Math.max(18, Math.round(Math.log10(rawPower + 1) * 22 + (totalStars > 0 ? 10 : 0))));

  let qualityPoints = 40;
  if (hasTypeScript) qualityPoints += 20;
  if (topLanguages.length >= 3) qualityPoints += 15;
  if (Number(avgStarsPerRepo) >= 1.0) qualityPoints += 15;
  if (originalReposCount / totalRepos >= 0.7) qualityPoints += 10;
  if (hasDocumentation) qualityPoints += 5;
  const codeQualityScore = Math.min(99, Math.max(25, qualityPoints));

  let stackPoints = 35;
  if (hasTypeScript) stackPoints += 25;
  if (topLanguages.some(l => ['TypeScript', 'Go', 'Rust', 'Python'].includes(l.lang))) stackPoints += 20;
  if (topLanguages.length >= 4) stackPoints += 15;
  if (publicRepos >= 10) stackPoints += 9;
  const architectureScore = Math.min(99, Math.max(30, stackPoints));

  let securityPoints = 50;
  if (hasLicense) securityPoints += 20;
  if (hasDocumentation) securityPoints += 15;
  if (hasTypeScript) securityPoints += 14;
  const securityScore = Math.min(99, Math.max(35, securityPoints));

  let velocityPoints = 30;
  if (recentPushesCount >= 5) velocityPoints += 35;
  else if (recentPushesCount >= 1) velocityPoints += 20;
  if (publicRepos >= 15) velocityPoints += 20;
  if (user.updated_at && (nowMs - new Date(user.updated_at).getTime() < ninetyDaysMs)) velocityPoints += 14;
  const velocityScore = Math.min(99, Math.max(20, velocityPoints));

  const engineeringScore = Math.min(99, Math.max(20, Math.round(
    (codeQualityScore * 0.4) + (architectureScore * 0.4) + (securityScore * 0.2)
  )));

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
    primary_language: topLanguages[0]?.lang || 'JavaScript',
    power_score: powerScore,
    code_quality_score: codeQualityScore,
    architecture_score: architectureScore,
    security_score: securityScore,
    velocity_score: velocityScore,
    engineering_score: engineeringScore,
    quality_breakdown: {
      type_safety: hasTypeScript ? 'High (TypeScript)' : 'Standard (JavaScript)',
      originality: `${originalReposCount}/${totalRepos} Original Repos`,
      avg_stars: `${avgStarsPerRepo} Stars/Repo`,
      tech_diversity: `${topLanguages.length} Languages`,
      docs_hygiene: hasDocumentation ? 'High Quality' : 'Standard',
      active_velocity: `${recentPushesCount} Recent Active Repos`
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
      fetchDeepUserData(user2Param, reqToken)
    ]);

    let winner = null;
    if (u1.power_score > u2.power_score) winner = u1.login;
    else if (u2.power_score > u1.power_score) winner = u2.login;
    else winner = 'Tie';

    let workWinner = null;
    if (u1.engineering_score > u2.engineering_score) workWinner = u1.login;
    else if (u2.engineering_score > u1.engineering_score) workWinner = u2.login;
    else workWinner = 'Tie';

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
