const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: Supabase URL or Anon Key is missing from .env!");
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

router.get('/github', async (req, res) => {
  try {
    let frontendBase = process.env.FRONTEND_URL;
    if (!frontendBase) {
      const referer = req.headers.referer || req.headers.origin;
      if (referer) {
        try {
          frontendBase = new URL(referer).origin;
        } catch {}
      }
    }
    if (!frontendBase) {
      frontendBase = ''; // Your Frontend Origin Here (e.g., 'https://yourfrontend.com')
    }

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${frontendBase}/login/callback`,
          scopes: 'repo read:user user:email'
        },
      });

      if (!error && data?.url) {
        return res.redirect(data.url);
      }
      if (error) {
        console.error("Supabase OAuth error:", error);
      }
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (clientId) {
      const redirectUri = encodeURIComponent(`${frontendBase}/login/callback`);
      return res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo%20read:user%20user:email`);
    }

    res.status(500).json({ error: 'Supabase URL / Anon Key or GITHUB_CLIENT_ID missing in backend environment variables' });
  } catch (err) {
    console.error("Fatal /auth/github exception:", err);
    res.status(500).json({ error: 'Failed to initialize GitHub authentication' });
  }
});

router.post('/callback', async (req, res) => {
  const { supabase_access_token, provider_token } = req.body;

  if (!supabase_access_token) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(supabase_access_token);

    if (error || !user) {
      console.error("Supabase user verification failed:", error);
      return res.status(401).json({ error: 'Invalid or expired Supabase token' });
    }

    const githubUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username || 'github_user';
    let fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'GitHub User';
    let avatarUrl = user.user_metadata?.avatar_url || '';
    let followersCount = 0;
    let followingCount = 0;
    let publicReposCount = 0;
    let totalPrivateReposCount = 0;
    let bio = '';

    const reqHeaders = { 'User-Agent': 'Repart-App' };
    if (provider_token) {
      reqHeaders['Authorization'] = `token ${provider_token}`;
    }

    try {
      const ghEndpoint = provider_token ? 'https://api.github.com/user' : `https://api.github.com/users/${githubUsername}`;
      const ghRes = await fetch(ghEndpoint, { headers: reqHeaders });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        followersCount = ghData.followers ?? 0;
        followingCount = ghData.following ?? 0;
        publicReposCount = ghData.public_repos ?? 0;
        totalPrivateReposCount = ghData.total_private_repos || ghData.owned_private_repos || 0;
        if (ghData.avatar_url) avatarUrl = ghData.avatar_url;
        if (ghData.name) fullName = ghData.name;
        if (ghData.bio) bio = ghData.bio;
      }
    } catch (ghErr) {
      console.warn("Could not fetch live GitHub stats:", ghErr.message);
    }

    const profileData = {
      id: user.id,
      github_username: githubUsername,
      name: fullName,
      avatar_url: avatarUrl,
      email: user.email || user.user_metadata?.email || '',
      followers: followersCount,
      following: followingCount,
      public_repos: publicReposCount,
      total_private_repos: totalPrivateReposCount,
      bio: bio,
      provider_token: provider_token || null,
      updated_at: new Date().toISOString()
    };

    const userSupabase = createClient(
      process.env.SUPABASE_URL || supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || supabaseKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${supabase_access_token}`
          }
        }
      }
    );

    try {
      const { data: dbData, error: profileError } = await userSupabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        console.error("Supabase Profiles Upsert Error:", profileError);
      } else {
        console.log("Successfully saved profile to Supabase database for user:", githubUsername);
      }
    } catch (upsertErr) {
      console.error("Upsert exception:", upsertErr.message);
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        github_username: profileData.github_username
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({ token, user: profileData });
  } catch (err) {
    console.error("Callback verification error:", err);
    res.status(500).json({ error: 'Internal server error during auth' });
  }
});

module.exports = router;
