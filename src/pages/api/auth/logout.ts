import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
    cookies.delete('user', {
        httpOnly: true,
        secure: import.meta.env.PROD,
    });
    
    return redirect('/');
};