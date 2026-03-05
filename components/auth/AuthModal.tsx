'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { signIn, signUp, signInWithGoogle } from '@/lib/firebase/auth';

export default function AuthModal() {
    const { authModalOpen, closeAuthModal } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationSent, setVerificationSent] = useState(false);

    if (!authModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signIn(email, password);
                closeAuthModal();
            } else {
                if (!name) throw new Error("Name is required");
                await signUp(email, password, name);
                setVerificationSent(true);
            }
        } catch (err: any) {
            if (err.message?.includes('auth/operation-not-allowed')) {
                setError('Authentication method is currently disabled. Please contact support.');
            } else {
                setError(err.message || 'Authentication failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            closeAuthModal();
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop with enhanced blur */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeAuthModal}
                    className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
                />

                {/* Modal with premium glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-gray-900/90 border border-white/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] backdrop-blur-xl"
                >
                    {/* Dynamic Background Glows */}
                    <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-violet-600/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-blue-600/20 blur-[100px] rounded-full" />

                    <button
                        onClick={closeAuthModal}
                        className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all z-20 group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="px-10 pt-12 pb-10 relative z-10">
                        {/* Logo/Icon section */}
                        <div className="flex justify-center mb-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-2xl border border-white/20">
                                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-white/50 text-sm max-w-[280px] mx-auto leading-relaxed">
                                {isLogin
                                    ? 'Sign in to access your stored product assets and workspaces'
                                    : 'Join us to securely save and manage your product assets'}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Social Providers */}
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={handleGoogleSignIn}
                                    type="button"
                                    disabled={loading}
                                    className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-white text-gray-900 text-sm font-bold transition-all hover:bg-gray-100 active:scale-[0.98] shadow-lg shadow-white/10 disabled:opacity-50"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>

                            <div className="relative flex items-center gap-4">
                                <div className="h-px w-full bg-white/10" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white/20 whitespace-nowrap">Or sign in with email</span>
                                <div className="h-px w-full bg-white/10" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Full Name"
                                                required={!isLogin}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-950/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isLogin ? 'Sign In' : 'Create Account'}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/5 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm font-semibold text-white/40 hover:text-white transition-colors group"
                            >
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span className="text-violet-400 group-hover:text-violet-300 ml-1 underline underline-offset-4 decoration-violet-500/30">
                                    {isLogin ? 'Join now' : 'Sign in'}
                                </span>
                            </button>
                        </div>

                        {verificationSent && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-30 bg-gray-950 flex flex-col items-center justify-center p-10 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/20">
                                    <Mail className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">Check your email</h3>
                                <p className="text-white/50 text-sm leading-relaxed mb-8">
                                    We've sent a verification link to <span className="text-white font-bold">{email}</span>. Please verify your email to continue.
                                </p>
                                <button
                                    onClick={closeAuthModal}
                                    className="w-full py-4 rounded-2xl bg-white text-gray-900 font-bold text-sm shadow-xl transition-all active:scale-95"
                                >
                                    Got it
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
