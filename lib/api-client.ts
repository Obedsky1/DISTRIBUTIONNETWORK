import { auth } from './firebase/config';

export async function authorizedFetch(url: string, options: RequestInit = {}) {
    const user = auth.currentUser;
    if (!user) {
        // Fallback to normal fetch if no user, but the backend will likely reject it for protected routes
        return fetch(url, options);
    }

    try {
        const token = await user.getIdToken();
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${token}`);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('[API Client] Failed to get ID token:', error);
        return fetch(url, options);
    }
}
