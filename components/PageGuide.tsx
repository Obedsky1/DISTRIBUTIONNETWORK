'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface PageGuideProps {
    title: string;
    steps: { title: string; description: string }[];
}

export function PageGuide({ title, steps }: PageGuideProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-110 transition-all z-40 group flex items-center justify-center"
                aria-label="How it works"
                title="Page Guide"
            >
                <HelpCircle size={24} className="group-hover:rotate-12 transition-transform" />
            </button>

            {/* Slide-over Guide */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 300, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.95 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-[#0a0a0f] border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10 rounded-full" />

                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0a0a0f] py-2 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <HelpCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {title}
                                        </h2>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Quick Guide</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={index}
                                        className="relative pl-6 group/step"
                                    >
                                        {/* Step indicator */}
                                        <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-indigo-500 group-hover/step:scale-150 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        {index !== steps.length - 1 && (
                                            <div className="absolute left-[3px] top-4 w-[2px] h-[calc(100%+8px)] bg-white/10 -z-10 group-hover/step:bg-indigo-500/30 transition-colors" />
                                        )}

                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                                            <h3 className="font-semibold text-white/90 mb-1.5 flex items-center gap-2">
                                                <span className="text-indigo-400 text-xs font-bold tracking-wider">0{index + 1}</span>
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-white/60 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <p className="text-sm text-indigo-300/80 flex items-start gap-2">
                                    <span className="text-xl leading-none">💡</span>
                                    Tip: You can always access this guide later by clicking the help icon in the bottom corner.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
