import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User as AppUser } from '@/types';

interface AuthState {
    firebaseUser: FirebaseUser | null;
    user: AppUser | null;
    loading: boolean;
    authModalOpen: boolean;
    setFirebaseUser: (user: FirebaseUser | null) => void;
    setUser: (user: AppUser | null) => void;
    setLoading: (loading: boolean) => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    firebaseUser: null,
    user: null,
    loading: true,
    authModalOpen: false,
    setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    openAuthModal: () => set({ authModalOpen: true }),
    closeAuthModal: () => set({ authModalOpen: false }),
}));
