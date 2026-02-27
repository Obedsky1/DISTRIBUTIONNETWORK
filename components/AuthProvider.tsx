'use client';

import { useEffect } from 'react';
import { onAuthChange } from '@/lib/firebase/auth';
import { getDocument } from '@/lib/firebase/firestore';
import { useAuthStore } from '@/lib/store/auth-store';
import { User as AppUser } from '@/types';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setFirebaseUser, setUser, setLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const userData = await getDocument<AppUser>('users', firebaseUser.uid);
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user data in AuthProvider:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [setFirebaseUser, setUser, setLoading]);

    return <>{children}</>;
}
