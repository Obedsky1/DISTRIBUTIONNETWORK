'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import FadeTransition from '@/components/FadeTransition';
import { setDocument } from '@/lib/firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/lib/store/auth-store';
import { Loader2 } from 'lucide-react';

// User types/roles
const USER_TYPES = [
    { id: 'saas-founder', name: 'SaaS Founder', icon: '🚀', description: 'Building and growing a software product' },
    { id: 'indie-hacker', name: 'Indie Hacker', icon: '💻', description: 'Solo building and bootstrapping' },
    { id: 'freelancer', name: 'Freelancer', icon: '✨', description: 'Looking for clients and projects' },
    { id: 'agency', name: 'Agency Owner', icon: '🏢', description: 'Finding clients for your team' },
    { id: 'content-creator', name: 'Content Creator', icon: '🎬', description: 'Building an audience and brand' },
    { id: 'recruiter', name: 'Recruiter/Hiring', icon: '👥', description: 'Finding talented people to hire' },
];

// Goals - what they want to achieve
const GOALS = [
    { id: 'find-clients', name: 'Find Clients', icon: '💰', description: 'Land more customers and projects' },
    { id: 'build-audience', name: 'Build Audience', icon: '📢', description: 'Grow followers and community' },
    { id: 'hire-talent', name: 'Hire Talent', icon: '🎯', description: 'Find developers, designers, marketers' },
    { id: 'distribute-product', name: 'Distribute Product', icon: '🛍️', description: 'Get visibility for your SaaS/project' },
    { id: 'network', name: 'Network & Connect', icon: '🤝', description: 'Meet like-minded builders' },
    { id: 'learn-grow', name: 'Learn & Grow', icon: '📚', description: 'Skill up from community knowledge' },
];

const PLATFORMS = [
    { id: 'discord', name: 'Discord', icon: '💬', description: 'Real-time chat communities' },
    { id: 'reddit', name: 'Reddit', icon: '🔴', description: 'Forum-style discussions' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', description: 'Messaging groups' },
    { id: 'slack', name: 'Slack', icon: '💼', description: 'Professional workspaces' },
    { id: 'twitter', name: 'X / Twitter', icon: '🐦', description: 'Public conversations' },
    { id: 'other', name: 'Other', icon: '🌐', description: 'Forums, websites, etc.' },
];

const INDUSTRIES = [
    'SaaS & Software', 'E-commerce', 'Marketing', 'Design & Creative',
    'Web Development', 'Mobile Apps', 'AI & Machine Learning', 'Finance & Fintech',
    'Health & Wellness', 'Education', 'Real Estate', 'Crypto & Web3'
];

export default function OnboardingPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        userType: '',
        goals: [] as string[],
        platforms: [] as string[],
        industries: [] as string[],
    });

    const totalSteps = 4;

    const toggleGoal = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal]
        }));
    };

    const togglePlatform = (platform: string) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
        }));
    };

    const toggleIndustry = (industry: string) => {
        setFormData(prev => ({
            ...prev,
            industries: prev.industries.includes(industry)
                ? prev.industries.filter(i => i !== industry)
                : [...prev.industries, industry]
        }));
    };

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // Save data and redirect to communities list
            setSaving(true);
            try {
                let userId = user?.id;

                if (!userId) {
                    userId = localStorage.getItem('growthhub_user_id') || uuidv4();
                    localStorage.setItem('growthhub_user_id', userId);
                }

                await setDocument('user_preferences', userId, {
                    ...formData,
                    completed_at: new Date()
                });
                console.log('Onboarding complete and saved to database.', formData);
                router.push('/discover'); // Redirect to communities list
            } catch (error) {
                console.error('Failed to save to database', error);
                alert('Save failed. But continuing to discover...');
                router.push('/discover');
            } finally {
                setSaving(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.push('/');
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.userType !== '';
            case 2:
                return formData.goals.length > 0;
            case 3:
                return formData.platforms.length > 0;
            case 4:
                return formData.industries.length > 0;
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <FadeTransition>
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-4 md:mb-8 fade-in-down px-2">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full glass mb-2 md:mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                            <span className="text-xs sm:text-sm text-white/80">Find Your Growth Communities</span>
                        </div>
                        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1">
                            Let's Match You
                        </h1>
                        <p className="text-xs sm:text-base text-white/60">
                            Help us find the best communities for your goals
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {[...Array(totalSteps)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 flex-1 mx-1 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-primary-500' : 'bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-center text-sm text-white/60">
                            Step {step} of {totalSteps}
                        </p>
                    </div>

                    {/* Form content */}
                    <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 mb-4 sm:mb-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">What best describes you?</h2>
                                    <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6">Select your primary role</p>
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                        {USER_TYPES.map((type) => (
                                            <motion.button
                                                key={type.id}
                                                onClick={() => setFormData(prev => ({ ...prev, userType: type.id }))}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-5 rounded-xl text-left transition-all ${formData.userType === type.id
                                                    ? 'bg-primary-500/30 border-2 border-primary-500'
                                                    : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <span className="text-2xl md:text-3xl">{type.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm md:text-base">{type.name}</div>
                                                        <div className="text-[11px] md:text-sm text-white/60">{type.description}</div>
                                                    </div>
                                                    {formData.userType === type.id && (
                                                        <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">What do you want to achieve?</h2>
                                    <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6">Select all that apply</p>
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                        {GOALS.map((goal) => (
                                            <motion.button
                                                key={goal.id}
                                                onClick={() => toggleGoal(goal.id)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-5 rounded-xl text-left transition-all ${formData.goals.includes(goal.id)
                                                    ? 'bg-primary-500/30 border-2 border-primary-500'
                                                    : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <span className="text-2xl md:text-3xl">{goal.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm md:text-base">{goal.name}</div>
                                                        <div className="text-[11px] md:text-sm text-white/60">{goal.description}</div>
                                                    </div>
                                                    {formData.goals.includes(goal.id) && (
                                                        <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Which platforms do you prefer?</h2>
                                    <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6">We'll prioritize these platforms</p>
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                        {PLATFORMS.map((platform) => (
                                            <motion.button
                                                key={platform.id}
                                                onClick={() => togglePlatform(platform.id)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-5 rounded-xl text-left transition-all ${formData.platforms.includes(platform.id)
                                                    ? 'bg-primary-500/30 border-2 border-primary-500'
                                                    : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <span className="text-2xl md:text-3xl">{platform.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm md:text-base">{platform.name}</div>
                                                        <div className="text-[11px] md:text-sm text-white/60">{platform.description}</div>
                                                    </div>
                                                    {formData.platforms.includes(platform.id) && (
                                                        <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">What industries are you in?</h2>
                                    <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6">Select all relevant industries</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {INDUSTRIES.map((industry) => (
                                            <motion.button
                                                key={industry}
                                                onClick={() => toggleIndustry(industry)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 rounded-xl text-left transition-all ${formData.industries.includes(industry)
                                                    ? 'bg-primary-500/30 border-2 border-primary-500'
                                                    : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm">{industry}</span>
                                                    {formData.industries.includes(industry) && (
                                                        <Check className="w-5 h-5 text-primary-400" />
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-3 sm:gap-4">
                        <motion.button
                            onClick={handleBack}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full glass hover:bg-white/10 transition-all text-sm sm:text-base touch-target"
                        >
                            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </motion.button>

                        <motion.button
                            onClick={handleNext}
                            disabled={!canProceed() || saving}
                            whileHover={canProceed() ? { scale: 1.05 } : {}}
                            whileTap={canProceed() ? { scale: 0.95 } : {}}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold transition-all text-sm sm:text-base touch-target ${canProceed()
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/50'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                                }`}
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {step === totalSteps ? 'Find Communities' : 'Continue'}
                                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </FadeTransition>
        </div>
    );
}
