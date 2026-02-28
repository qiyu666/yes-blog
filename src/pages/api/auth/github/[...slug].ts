import type { APIRoute } from 'astro';

const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.SITE + '/api/auth/github/callback';

export const GET: APIRoute = async ({ params, request, cookies, redirect }) => {
    const { slug } = params;
    
    if (slug?.[0] === 'callback') {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        
        if (!code) {
            return new Response('Missing code', { status: 400 });
        }
        
        // Exchange code for token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
            }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            return new Response('Error getting token: ' + tokenData.error, { status: 400 });
        }
        
        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        });
        
        const userData = await userResponse.json();
        
        // Set user session
        cookies.set('user', JSON.stringify({
            id: userData.id,
            name: userData.name,
            login: userData.login,
            avatar: userData.avatar_url,
        }), {
            httpOnly: true,
            secure: import.meta.env.PROD,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        
        return redirect('/');
    }
    
    // Redirect to GitHub login
    const githubLoginUrl = new URL('https://github.com/login/oauth/authorize');
    githubLoginUrl.searchParams.set('client_id', GITHUB_CLIENT_ID!);
    githubLoginUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    githubLoginUrl.searchParams.set('scope', 'user');
    
    return redirect(githubLoginUrl.toString());
};