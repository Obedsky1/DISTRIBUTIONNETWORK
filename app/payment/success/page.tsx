'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, setUser } = useAuthStore();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            const transaction_id = searchParams.get('transaction_id');
            const tx_ref = searchParams.get('tx_ref');
            const urlStatus = searchParams.get('status');

            if (urlStatus === 'cancelled') {
                router.push('/pricing?canceled=true');
                return;
            }

            if (!transaction_id) {
                // Not a flutterwave redirect, just go back to root or dashboard
                router.push('/dashboard');
                return;
            }

            try {
                const response = await fetch('/api/flutterwave/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transaction_id, tx_ref })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Verification failed');
                }

                // If successful, update the local user store so they don't have to refresh
                if (user) {
                    setUser({
                        ...user,
                        isPremium: true,
                        // Update other fields as needed based on data.planId
                    });
                }

                setStatus('success');
            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setErrorMsg(err.message || 'Payment verification failed. Please contact support.');
            }
        };

        verifyPayment();
    }, [searchParams, router, user, setUser]);

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-[#13141c] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10 rounded-full" />

                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verifying Payment</h2>
                        <p className="text-white/60 text-sm">Please wait while we confirm your transaction securely...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                        <p className="text-white/60 text-sm mb-4">Your account has been upgraded. You now have access to premium features.</p>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/25"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-2 shadow-lg shadow-red-500/20">
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verification Error</h2>
                        <p className="text-red-400/80 text-sm mb-4">{errorMsg}</p>

                        <button
                            onClick={() => router.push('/pricing')}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
                        >
                            Return to Pricing
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
