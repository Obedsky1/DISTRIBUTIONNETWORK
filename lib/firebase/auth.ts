import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously as firebaseSignInAnonymously,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update profile
        await updateProfile(firebaseUser, { displayName });

        // Create user document in Firestore
        const newUser: Omit<User, 'id'> = {
            email: firebaseUser.email!,
            displayName,
            photoURL: firebaseUser.photoURL || undefined,
            interests: [],
            interestEmbedding: [],
            joinedCommunities: [],
            savedCommunities: [],
            submittedCommunities: [],
            isPremium: false,
            preferences: {
                platforms: [],
                activityLevel: 'any',
                categories: [],
                notificationSettings: {
                    newRecommendations: true,
                    communityUpdates: true,
                },
            },
            stats: {
                totalInteractions: 0,
                communitiesJoined: 0,
                contentGenerated: 0,
            },
            createdAt: new Date(),
            lastActive: new Date(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...newUser,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
        });

        return { id: firebaseUser.uid, ...newUser };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign up');
    }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update last active
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastActive: serverTimestamp(),
        });

        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
            throw new Error('User data not found');
        }

        const userData = userDoc.data();
        return {
            id: firebaseUser.uid,
            ...userData,
            createdAt: userData.createdAt?.toDate() || new Date(),
            lastActive: userData.lastActive?.toDate() || new Date(),
            premiumExpiresAt: userData.premiumExpiresAt?.toDate(),
        } as User;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in');
    }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

        // Check if user exists
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (!userDoc.exists()) {
            // Create new user
            const newUser: Omit<User, 'id'> = {
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL || undefined,
                interests: [],
                interestEmbedding: [],
                joinedCommunities: [],
                savedCommunities: [],
                submittedCommunities: [],
                isPremium: false,
                preferences: {
                    platforms: [],
                    activityLevel: 'any',
                    categories: [],
                    notificationSettings: {
                        newRecommendations: true,
                        communityUpdates: true,
                    },
                },
                stats: {
                    totalInteractions: 0,
                    communitiesJoined: 0,
                    contentGenerated: 0,
                },
                createdAt: new Date(),
                lastActive: new Date(),
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...newUser,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp(),
            });

            return { id: firebaseUser.uid, ...newUser };
        } else {
            // Update last active
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
                lastActive: serverTimestamp(),
            });

            const userData = userDoc.data();
            return {
                id: firebaseUser.uid,
                ...userData,
                createdAt: userData.createdAt?.toDate() || new Date(),
                lastActive: userData.lastActive?.toDate() || new Date(),
                premiumExpiresAt: userData.premiumExpiresAt?.toDate(),
            } as User;
        }
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in with Google');
    }
}

/**
 * Sign in anonymously
 */
export async function signInAnonymously(): Promise<FirebaseUser> {
    try {
        const result = await firebaseSignInAnonymously(auth);
        return result.user;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in anonymously');
    }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign out');
    }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}
