'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, User, Globe, Briefcase, FileText, ImageIcon,
    LogOut, Trash2, ExternalLink, Sparkles, Copy, Check,
    UploadCloud, X, Loader2, Link as LinkIcon, Image as ImageIcon2, Settings
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { updateDocument, queryDocuments, deleteDocument } from '@/lib/firebase/firestore';
import { signOut } from '@/lib/firebase/auth';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PageGuide } from '@/components/PageGuide';

export default function ProfilePage() {
    const { user, loading, openAuthModal } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<'copy' | 'assets' | 'pipeline'>('copy');
    const [showCopyCenter, setShowCopyCenter] = useState(false);
    const [pipelineItems, setPipelineItems] = useState<any[]>([]);
    const [loadingPipeline, setLoadingPipeline] = useState(false);

    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        shortDescription: '',
        description: '',
        websiteUrl: '',
        logoUrl: '',
        bannerUrl: '',
        industry: '',
        keywords: '',
        otherAssets: [] as string[]
    });

    const [uploadingImage, setUploadingImage] = useState<string | null>(null);

    const fileInputRefs = {
        logoUrl: useRef<HTMLInputElement>(null),
        bannerUrl: useRef<HTMLInputElement>(null),
        otherAssets: useRef<HTMLInputElement>(null),
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
            openAuthModal();
        } else if (user?.startup) {
            setFormData({
                name: user.startup.name || '',
                tagline: user.startup.tagline || '',
                shortDescription: user.startup.shortDescription || '',
                description: user.startup.description || '',
                websiteUrl: user.startup.websiteUrl || '',
                logoUrl: user.startup.logoUrl || '',
                bannerUrl: user.startup.bannerUrl || '',
                industry: user.startup.industry || '',
                keywords: user.startup.keywords || '',
                otherAssets: Array.isArray(user.startup.otherAssets) ? user.startup.otherAssets : []
            });
        }

        // Handle tab deep-linking
        const tab = searchParams.get('tab');
        if (tab === 'pipeline' || tab === 'copy' || tab === 'assets') {
            setActiveTab(tab as any);
        }
    }, [user, loading, router, openAuthModal, searchParams]);

    useEffect(() => {
        if (activeTab === 'pipeline' && user) {
            const fetchPipeline = async () => {
                setLoadingPipeline(true);
                try {
                    const projectId = `default_project_${user.id}`;
                    const [dirSubs, commSubs] = await Promise.all([
                        queryDocuments<any>('directory_submissions', [{ field: 'project_id', operator: '==', value: projectId }]),
                        queryDocuments<any>('community_submissions', [{ field: 'project_id', operator: '==', value: projectId }])
                    ]);

                    const all = [
                        ...(dirSubs || []).map(s => ({ ...s, kind: 'directory' as const })),
                        ...(commSubs || []).map(s => ({ ...s, kind: 'community' as const })),
                        ...(user.distroPipeline || []).map(s => ({ ...s, isLegacy: true }))
                    ].sort((a, b) => {
                        const timeA = a.created_at?.seconds || 0;
                        const timeB = b.created_at?.seconds || 0;
                        return timeB - timeA;
                    });

                    setPipelineItems(all);
                } catch (err) {
                    console.error('Error fetching pipeline:', err);
                } finally {
                    setLoadingPipeline(false);
                }
            };
            fetchPipeline();
        }
    }, [activeTab, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            await updateDocument('users', user.id, {
                startup: formData
            });

            useAuthStore.setState({
                user: {
                    ...user,
                    startup: formData
                }
            });

            setSuccessMessage('Assets saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save assets');
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async (text: string, id: string) => {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [id]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logoUrl' | 'bannerUrl' | 'otherAssets') => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingImage(fieldName);
        setError('');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const uploadRef = ref(storage, `users/${user.id}/assets/${fileName}`);

            await uploadBytes(uploadRef, file);
            const downloadUrl = await getDownloadURL(uploadRef);

            if (fieldName === 'otherAssets') {
                const newAssets = [...formData.otherAssets, downloadUrl];
                setFormData(prev => ({ ...prev, otherAssets: newAssets }));
                // Auto-save immediately for new array items to avoid losing progress easily
                await updateDocument('users', user.id, { startup: { ...formData, otherAssets: newAssets } });
                useAuthStore.setState({ user: { ...user, startup: { ...formData, otherAssets: newAssets } } });
                setSuccessMessage('Image uploaded and saved!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setFormData(prev => ({ ...prev, [fieldName]: downloadUrl }));
            }
        } catch (err: any) {
            console.error(err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(null);
        }
    };

    const removeAsset = async (index: number) => {
        const newAssets = [...formData.otherAssets];
        newAssets.splice(index, 1);
        setFormData(prev => ({ ...prev, otherAssets: newAssets }));
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

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-8 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Startup Setup</h1>
                        <p className="text-white/60 text-sm">Manage your copy and brand assets for faster distribution.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/account')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-all"
                        >
                            <Settings className="w-4 h-4" />
                            Account Settings
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                    {[
                        { id: 'copy', label: 'Copy Editor', icon: FileText },
                        { id: 'assets', label: 'Brand Assets', icon: ImageIcon2 },
                        { id: 'pipeline', label: 'Distro Pipeline', icon: Sparkles }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-[#13141c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10 rounded-full" />

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                            <X className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    {/* COPY EDITOR TAB */}
                    {activeTab === 'copy' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Versioned Copy Editor</h2>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Quickly copy for submissions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs shadow-lg transition-all"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    Save Changes
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Name and URL grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="flex items-center justify-between text-xs font-semibold text-white/50 mb-2">
                                            <span>STARTUP NAME</span>
                                            <button onClick={() => handleCopy(formData.name, 'name')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {copiedStates['name'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {copiedStates['name'] ? 'Copied' : 'Copy'}
                                            </button>
                                        </label>
                                        <input
                                            type="text" name="name" value={formData.name} onChange={handleChange} placeholder="DistroHub"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label className="flex items-center justify-between text-xs font-semibold text-white/50 mb-2">
                                            <span>WEBSITE URL</span>
                                            <button onClick={() => handleCopy(formData.websiteUrl, 'url')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {copiedStates['url'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {copiedStates['url'] ? 'Copied' : 'Copy'}
                                            </button>
                                        </label>
                                        <input
                                            type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="flex items-center justify-between text-xs font-semibold text-white/50 mb-2">
                                        <span>TITLE / TAGLINE</span>
                                        <button onClick={() => handleCopy(formData.tagline, 'tagline')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedStates['tagline'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedStates['tagline'] ? 'Copied' : 'Copy'}
                                        </button>
                                    </label>
                                    <input
                                        type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="The ultimate distribution pipeline for builders"
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="flex items-center justify-between text-xs font-semibold text-white/50 mb-2">
                                        <span>SHORT DESCRIPTION (PITCH)</span>
                                        <button onClick={() => handleCopy(formData.shortDescription, 'shortDescription')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedStates['shortDescription'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedStates['shortDescription'] ? 'Copied' : 'Copy'}
                                        </button>
                                    </label>
                                    <textarea
                                        name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} placeholder="A one sentence pitch describing what you do..."
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all resize-none"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="flex items-center justify-between text-xs font-semibold text-white/50 mb-2">
                                        <span>FULL DESCRIPTION</span>
                                        <button onClick={() => handleCopy(formData.description, 'description')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedStates['description'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedStates['description'] ? 'Copied' : 'Copy'}
                                        </button>
                                    </label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="The detailed description used for directories and deep dives..."
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="flex items-center justify-between text-xs font-semibold text-white/50 mb-2">
                                            <span>INDUSTRY</span>
                                            <button onClick={() => handleCopy(formData.industry, 'industry')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {copiedStates['industry'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </label>
                                        <input
                                            type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. SaaS, Fintech, AI tools..."
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label className="flex items-center justify-between text-xs font-semibold text-white/50 mb-2">
                                            <span>KEYWORDS (comma separated)</span>
                                            <button onClick={() => handleCopy(formData.keywords, 'keywords')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {copiedStates['keywords'] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </label>
                                        <input
                                            type="text" name="keywords" value={formData.keywords} onChange={handleChange} placeholder="marketing, startup, tools..."
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ASSETS TAB */}
                    {activeTab === 'assets' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <ImageIcon2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Brand Assets</h2>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Upload and copy image URLs</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    Save Changes
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* LOGO UPLOAD */}
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 text-center group relative overflow-hidden">
                                    <h3 className="text-sm font-bold text-white/80 w-full text-left">Primary Logo</h3>
                                    {formData.logoUrl ? (
                                        <div className="relative w-24 h-24 rounded-2xl bg-white/10 p-2 flex items-center justify-center">
                                            <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-[#0a0a0f] border border-white/5 flex items-center justify-center">
                                            <ImageIcon2 className="w-8 h-8 text-white/20" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 w-full mt-2">
                                        <input
                                            type="file" accept="image/*" className="hidden" ref={fileInputRefs.logoUrl}
                                            onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                        />
                                        <button
                                            onClick={() => fileInputRefs.logoUrl.current?.click()}
                                            disabled={uploadingImage === 'logoUrl'}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                                        >
                                            {uploadingImage === 'logoUrl' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                                            Upload
                                        </button>
                                        <button
                                            onClick={() => handleCopy(formData.logoUrl, 'logoCopy')}
                                            disabled={!formData.logoUrl}
                                            className="px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all disabled:opacity-30 flex items-center gap-1"
                                        >
                                            {copiedStates['logoCopy'] ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* BANNER UPLOAD */}
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 text-center group relative overflow-hidden">
                                    <h3 className="text-sm font-bold text-white/80 w-full text-left">Hero Banner</h3>
                                    {formData.bannerUrl ? (
                                        <div className="relative w-full h-24 rounded-xl bg-white/10 overflow-hidden flex items-center justify-center">
                                            <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-24 rounded-xl bg-[#0a0a0f] border border-white/5 flex items-center justify-center">
                                            <ImageIcon2 className="w-8 h-8 text-white/20" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 w-full mt-2">
                                        <input
                                            type="file" accept="image/*" className="hidden" ref={fileInputRefs.bannerUrl}
                                            onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                                        />
                                        <button
                                            onClick={() => fileInputRefs.bannerUrl.current?.click()}
                                            disabled={uploadingImage === 'bannerUrl'}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                                        >
                                            {uploadingImage === 'bannerUrl' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                                            Upload
                                        </button>
                                        <button
                                            onClick={() => handleCopy(formData.bannerUrl, 'bannerCopy')}
                                            disabled={!formData.bannerUrl}
                                            className="px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all disabled:opacity-30 flex items-center gap-1"
                                        >
                                            {copiedStates['bannerCopy'] ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* OTHER ASSETS */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white/80">Other Product Assets</h3>
                                    <input
                                        type="file" accept="image/*" className="hidden" ref={fileInputRefs.otherAssets}
                                        onChange={(e) => handleFileUpload(e, 'otherAssets')}
                                    />
                                    <button
                                        onClick={() => fileInputRefs.otherAssets.current?.click()}
                                        disabled={uploadingImage === 'otherAssets'}
                                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                                    >
                                        {uploadingImage === 'otherAssets' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                                        Upload Image
                                    </button>
                                </div>

                                {!formData.otherAssets || !Array.isArray(formData.otherAssets) || formData.otherAssets.length === 0 ? (
                                    <div className="text-center py-8 rounded-2xl bg-white/5 border border-white/5 border-dashed">
                                        <p className="text-white/30 text-xs">No extra assets uploaded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {formData.otherAssets.map((assetUrl, idx) => (
                                            <div key={idx} className="relative group rounded-xl bg-white/5 overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
                                                <img src={assetUrl} alt={`Asset ${idx}`} className="max-w-full max-h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                                    <button
                                                        onClick={() => handleCopy(assetUrl, `asset${idx}`)}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold w-3/4 flex items-center justify-center gap-1"
                                                    >
                                                        {copiedStates[`asset${idx}`] ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                                        Copy URL
                                                    </button>
                                                    <button
                                                        onClick={() => removeAsset(idx)}
                                                        className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold w-3/4 flex items-center justify-center gap-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PIPELINE TAB */}
                    {activeTab === 'pipeline' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Distribution Pipeline</h2>
                                    <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Channels you've queued</p>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        onClick={() => setShowCopyCenter(!showCopyCenter)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showCopyCenter
                                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        {showCopyCenter ? 'Hide Copy Center' : 'Quick Copy Material'}
                                    </button>
                                </div>
                            </div>

                            <div className={`grid grid-cols-1 ${showCopyCenter ? 'lg:grid-cols-2' : ''} gap-8 transition-all duration-500`}>
                                {/* PIPELINE LIST */}
                                <div className="space-y-6">
                                    {loadingPipeline ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                            <p className="text-white/30 text-xs">Loading target channels...</p>
                                        </div>
                                    ) : pipelineItems.length === 0 ? (
                                        <div className="text-center py-16 px-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                <Sparkles className="w-8 h-8 text-white/20" />
                                            </div>
                                            <p className="text-white/60 text-sm mb-6">Your pipeline is empty.</p>
                                            <button
                                                onClick={() => router.push('/discover')}
                                                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                                            >
                                                Discover Channels
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {pipelineItems.map((item) => {
                                                const isDir = item.kind === 'directory';
                                                return (
                                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isDir ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                                                                    {isDir ? 'Directory' : 'Community'}
                                                                </span>
                                                                <h3 className="text-sm font-bold text-white truncate">{item.directory_name || item.name}</h3>
                                                            </div>
                                                            <p className="text-xs text-white/40">{item.status || item.category || 'Planned'}</p>
                                                        </div>

                                                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                            <a
                                                                href={item.directory_url || item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-indigo-600 text-white text-xs font-semibold transition-all"
                                                            >
                                                                Open <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                            <button
                                                                onClick={async () => {
                                                                    if (item.isLegacy) {
                                                                        // Legacy item removal
                                                                        const newLegacy = user.distroPipeline!.filter(p => p.id !== item.id);
                                                                        await updateDocument('users', user.id, { distroPipeline: newLegacy });
                                                                        useAuthStore.setState({ user: { ...user, distroPipeline: newLegacy } });
                                                                        setPipelineItems(prev => prev.filter(p => p.id !== item.id));
                                                                    } else {
                                                                        const collection = isDir ? 'directory_submissions' : 'community_submissions';
                                                                        await deleteDocument(collection, item.id);
                                                                        setPipelineItems(prev => prev.filter(p => p.id !== item.id));
                                                                    }
                                                                }}
                                                                className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                                                                title="Remove from pipeline"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* QUICK COPY SIDE PANEL */}
                                {showCopyCenter && (
                                    <div className="space-y-6 lg:border-l lg:border-white/10 lg:pl-8 animate-in slide-in-from-right-4 duration-500">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Copy Center</h3>
                                        </div>

                                        <div className="space-y-5">
                                            {[
                                                { label: 'Tagline', value: formData.tagline, id: 'q-tag' },
                                                { label: 'Short Pitch', value: formData.shortDescription, id: 'q-pitch' },
                                                { label: 'Long Description', value: formData.description, id: 'q-desc' },
                                                { label: 'Keywords', value: formData.keywords, id: 'q-keys' },
                                                { label: 'Website', value: formData.websiteUrl, id: 'q-url' },
                                            ].map((f) => (
                                                <div key={f.id} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{f.label}</span>
                                                        <button
                                                            onClick={() => handleCopy(f.value, f.id)}
                                                            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                                                        >
                                                            {copiedStates[f.id] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                            <span className="text-[10px] font-bold">{copiedStates[f.id] ? 'COPIED' : 'COPY'}</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">{f.value || <span className="italic text-white/20">No content set...</span>}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                            <p className="text-[10px] text-indigo-300/60 leading-relaxed italic">
                                                💡 Tip: Keep this side panel open while submitting your startup to directories for a much faster workflow.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <PageGuide
                title="Startup Setup"
                steps={[
                    { title: 'Copy Editor', description: 'Centralize all your startup information (name, taglines, descriptions, keywords). You can easily copy and paste this into directories when submitting.' },
                    { title: 'Brand Assets', description: 'Upload your primary logo, hero banner, and other product assets. Click the link icon to copy the direct URL of the image for distribution.' },
                    { title: 'Distro Pipeline', description: 'View and manage all the communities, groups, and directories you have saved from the Discover page. Use this list as a tracker for your launch.' },
                ]}
            />
        </div>
    );
}
