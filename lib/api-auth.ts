import { adminAuth } from './firebase/admin';

export async function getAuthUserId(req: Request): Promise<string | null> {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token || !adminAuth) {
            return null;
        }

        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error('[API Auth] Token verification failed:', error);
        return null;
    }
}

/**
 * Validates that the authenticated user is the one they claim to be in the request.
 * Useful for preventing BOLA/IDOR.
 */
export async function validateOwnership(req: Request, targetUserId: string): Promise<boolean> {
    const authenticatedUid = await getAuthUserId(req);
    return authenticatedUid === targetUserId;
}

/**
 * Simple check for any authenticated user.
 */
export async function isAuthenticated(req: Request): Promise<boolean> {
    const uid = await getAuthUserId(req);
    return !!uid;
}
