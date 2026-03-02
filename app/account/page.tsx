'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings, LogOut, ExternalLink, User,
    Mail, Grid, Navigation2, Target, Home, Edit3, Loader2, Check
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { updateDocument } from '@/lib/firebase/firestore';
import { signOut } from '@/lib/firebase/auth';
import { PageGuide } from '@/components/PageGuide';

export default function AccountPage() {
    const { user, loading, openAuthModal } = useAuthStore();
    const router = useRouter();

    const [randomAvatar, setRandomAvatar] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Pick a random avatar from public/profilepic/Number=1.png ... Number=32.png
        const num = Math.floor(Math.random() * 32) + 1;
        setRandomAvatar(`/profilepic/Number=${num}.png`);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
            openAuthModal();
        } else if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user, loading, router, openAuthModal]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            await updateDocument('users', user.id, {
                displayName
            });

            useAuthStore.setState({
                user: { ...user, displayName }
            });

            setIsEditing(false);
            setSuccessMessage('Profile updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const shortcuts = [
        {
            title: 'Startup Profile',
            description: 'Manage your assets and pipeline',
            icon: Edit3,
            href: '/profile',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            title: 'Discover Channels',
            description: 'Find 500+ communities & directories',
            icon: Grid,
            href: '/discover',
            color: 'from-emerald-500 to-teal-600'
        },
        {
            title: 'Campaigns',
            description: 'Distribute growth marketing campaigns',
            icon: Target,
            href: '/campaign',
            color: 'from-purple-500 to-fuchsia-600'
        },
        {
            title: 'Home / Landing',
            description: 'Go back to main landing page',
            icon: Home,
            href: '/',
            color: 'from-orange-500 to-red-600'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-8 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                            <Settings className="w-8 h-8 text-indigo-500" />
                            Account Settings
                        </h1>
                        <p className="text-white/60 text-sm">Manage your personal profile and access quick shortcuts.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Profile Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-[#13141c] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] -z-10 rounded-full" />

                            <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden mb-4 bg-white/5 relative group">
                                {randomAvatar ? (
                                    <img src={randomAvatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-white/30" />
                                    </div>
                                )}
                            </div>

                            {!isEditing ? (
                                <>
                                    <h2 className="text-xl font-bold truncate w-full">{user.displayName || 'Anonymous User'}</h2>
                                    <p className="text-sm text-white/50 truncate w-full mb-6 flex items-center justify-center gap-1">
                                        <Mail className="w-3 h-3" /> {user.email}
                                    </p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all border border-white/10"
                                    >
                                        Edit Profile
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="w-full flex flex-col gap-3">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Display Name"
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all text-center"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-1 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                        >
                                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {successMessage && (
                                <div className="mt-4 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1 bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20">
                                    <Check className="w-3 h-3" /> {successMessage}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-sm transition-all group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Sign Out
                        </button>
                    </div>

                    {/* RIGHT COLUMN: Shortcuts & Other Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#13141c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Navigation2 className="w-5 h-5 text-indigo-400" />
                                Quick Shortcuts
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {shortcuts.map((shortcut, idx) => (
                                    <div key={idx} onClick={() => router.push(shortcut.href)} className="cursor-pointer group bg-white/5 hover:bg-white/10 rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 border border-white/5 hover:border-white/10 flex flex-col gap-3">
                                        <div className="flex items-start justify-between">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center shadow-lg`}>
                                                <shortcut.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm mb-1 group-hover:text-indigo-300 transition-colors">{shortcut.title}</h3>
                                            <p className="text-xs text-white/50">{shortcut.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#13141c] border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm mb-1">Need help or support?</h3>
                                <p className="text-xs text-white/50">Contact us at support@distrohub.example or read our documentation.</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 whitespace-nowrap">
                                Get Support
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <PageGuide
                title="Account Settings"
                steps={[
                    { title: 'Profile Settings', description: 'Update your display name or sign out of your account from here.' },
                    { title: 'Quick Shortcuts', description: 'Quickly navigate to the most important parts of the app without going through the sidebar.' },
                ]}
            />
        </div>
    );
}
