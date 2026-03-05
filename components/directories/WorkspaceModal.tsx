'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Save, Clock, Type, Image as ImageIcon, Activity, Loader2, Globe, Search, Check, Copy, Sparkles } from 'lucide-react';
import { DirectorySubmission, SubmissionVersion, ActivityLog, SubmissionStatus, ProjectAsset } from '@/types/distribution';
import { updateDocument, setDocument, queryDocuments, deleteDocument } from '@/lib/firebase/firestore';
import { uploadAsset } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';

import { useAuthStore } from '@/lib/store/auth-store';

interface WorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: DirectorySubmission | null;
    userId: string;
}

export function WorkspaceModal({ isOpen, onClose, submission, userId }: WorkspaceModalProps) {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'submission' | 'copy' | 'assets' | 'activity'>('submission');

    // Form States
    const [status, setStatus] = useState<SubmissionStatus>('not_started');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Tracking
    const [liveUrl, setLiveUrl] = useState('');
    const [targetDomain, setTargetDomain] = useState('');
    const [backlinkStatus, setBacklinkStatus] = useState<'found' | 'not_found' | 'checking' | 'error' | undefined>();
    const [backlinkRel, setBacklinkRel] = useState<string | null>(null);
    const [backlinkAnchor, setBacklinkAnchor] = useState<string | null>(null);

    // Data States
    const [versions, setVersions] = useState<SubmissionVersion[]>([]);
    const [assets, setAssets] = useState<ProjectAsset[]>([]);
    const [activity, setActivity] = useState<ActivityLog[]>([]);
    const [uploadingAsset, setUploadingAsset] = useState(false);

    useEffect(() => {
        if (isOpen && submission) {
            setStatus(submission.status);
            setUrl(submission.submission_url || '');
            setNotes(submission.notes || '');

            setLiveUrl(submission.live_url || '');
            setTargetDomain(submission.target_domain || '');
            setBacklinkStatus(submission.backlink_status);
            setBacklinkRel(submission.backlink_rel || null);
            setBacklinkAnchor(submission.backlink_anchor || null);

            // Fetch versions - sort client-side to avoid composite index requirement
            queryDocuments<SubmissionVersion>('submission_versions', [
                { field: 'submission_id', operator: '==', value: submission.id }
            ]).then(v => {
                const sorted = (v || []).sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setVersions(sorted);
                if (sorted.length > 0) {
                    setTitle(sorted[0].title);
                    setDescription(sorted[0].description);
                } else {
                    setTitle('');
                    setDescription('');
                }
            });

            // Fetch activity from client-side firestore
            queryDocuments<ActivityLog>('activity_logs', [
                { field: 'project_id', operator: '==', value: submission.project_id }
            ], 'created_at', 'desc').then(logs => {
                setActivity(logs || []);
            });

            // Fetch assets
            queryDocuments<ProjectAsset>('project_assets', [
                { field: 'project_id', operator: '==', value: submission.project_id }
            ], 'created_at', 'desc').then(a => {
                setAssets(a || []);
            });
        }
    }, [isOpen, submission]);

    if (!isOpen || !submission) return null;

    const saveSubmissionInfo = async () => {
        try {
            await updateDocument('directory_submissions', submission.id, {
                status,
                submission_url: url,
                live_url: liveUrl,
                target_domain: targetDomain,
                backlink_status: backlinkStatus,
                backlink_rel: backlinkRel,
                backlink_anchor: backlinkAnchor,
                notes,
                updated_at: new Date()
            });

            // Add activity log
            const logId = `log_${uuidv4()}`;
            const log: ActivityLog = {
                id: logId,
                project_id: submission.project_id,
                user_id: userId,
                action_type: 'status_updated',
                metadata: { directory_name: submission.directory_name, status },
                created_at: new Date()
            };
            await setDocument('activity_logs', logId, log);
            setActivity(prev => [log, ...prev]);
            alert('Settings saved!');
        } catch (err) {
            console.error('Failed to save submission info:', err);
            alert('Failed to save settings. Check your console.');
        }
    };


    const saveNewVersion = async () => {
        try {
            const nextVersion = versions.length + 1;
            const versionId = `ver_${uuidv4()}`;
            const newVersion: SubmissionVersion = {
                id: versionId,
                submission_id: submission.id,
                version_number: nextVersion,
                title,
                description,
                created_at: new Date()
            };

            await setDocument('submission_versions', versionId, newVersion);
            setVersions([newVersion, ...versions]);
            alert('New version saved!');
        } catch (err) {
            console.error('Failed to save version:', err);
            alert('Failed to save version.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !submission) return;

        setUploadingAsset(true);
        try {
            const fileName = `${userId}/${submission.project_id}/${file.name}`;
            const downloadUrl = await uploadAsset(file, fileName);

            const assetId = `asset_${uuidv4()}`;
            const newAsset: ProjectAsset = {
                id: assetId,
                project_id: submission.project_id,
                type: 'screenshot', // Default or detect
                file_url: downloadUrl,
                created_at: new Date()
            };

            await setDocument('project_assets', assetId, newAsset);
            setAssets([newAsset, ...assets]);

            // Log activity
            const logId = `log_${uuidv4()}`;
            await setDocument('activity_logs', logId, {
                id: logId,
                project_id: submission.project_id,
                user_id: userId,
                action_type: 'asset_uploaded',
                metadata: { file_name: file.name },
                created_at: new Date()
            });
        } catch (err) {
            console.error('Failed to upload asset:', err);
            alert('Upload failed.');
        } finally {
            setUploadingAsset(false);
        }
    };

    const removeAsset = async (asset: ProjectAsset) => {
        try {
            await deleteDocument('project_assets', asset.id);
            setAssets(assets.filter(a => a.id !== asset.id));
        } catch (err) {
            console.error('Failed to remove asset:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl h-full bg-[#0d0d14] border-l border-white/10 shadow-2xl flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{submission.directory_name}</h2>
                        <a href={submission.directory_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline mt-1">
                            Visit Directory <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-5 border-b border-white/10 pt-2 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <TabBtn active={activeTab === 'submission'} onClick={() => setActiveTab('submission')} icon={<Clock className="w-3.5 h-3.5" />} label="Status" />
                    <TabBtn active={activeTab === 'copy'} onClick={() => setActiveTab('copy')} icon={<Type className="w-3.5 h-3.5" />} label="Copy" />
                    <TabBtn active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} icon={<ImageIcon className="w-3.5 h-3.5" />} label="Assets" />
                    <TabBtn active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<Activity className="w-3.5 h-3.5" />} label="Activity" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 text-white/80">
                    {activeTab === 'submission' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Status</label>
                                <select
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
                                >
                                    <option value="not_started">Not Started</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="live">Live</option>
                                    <option value="follow_up">Follow Up</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Submission URL</label>
                                <input
                                    type="url"
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20"
                                    placeholder="https://"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Internal Notes</label>
                                <textarea
                                    className="w-full h-32 bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 resize-none placeholder-white/20"
                                    placeholder="Add any specific requirements, login details, or context here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Guidance to Backlink Tracker */}
                            {liveUrl && (
                                <div className="pt-4 border-t border-white/10 mt-6">
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-snug">Track this backlink!</p>
                                            <p className="text-xs text-white/50 mt-1 mb-2">Monitor visibility, DoFollow/NoFollow type, and SEO health centrally.</p>
                                            <a
                                                href="/backlinks"
                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                                            >
                                                Go to Backlink Tracker <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={saveSubmissionInfo} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all w-full justify-center">
                                <Save className="w-4 h-4" /> Save Details
                            </button>
                        </div>
                    )}

                    {activeTab === 'copy' && (
                        <div className="space-y-6 flex flex-col h-full bg-[#0d0d14]">
                            <div className="flex justify-between items-center bg-[#1a1a24] p-3 rounded-xl border border-white/10">
                                <span className="text-sm font-medium">Versioned Copy Editor</span>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Title / Tagline</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Description / Pitch</label>
                                    <textarea
                                        className="w-full flex-1 min-h-[200px] bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={saveNewVersion} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-xl transition-all border border-white/10">
                                    <Save className="w-4 h-4" /> Save New Version
                                </button>
                            </div>

                            {versions.length > 0 && (
                                <div className="mt-4">
                                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Version History</label>
                                    <div className="space-y-2">
                                        {versions.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => { setTitle(v.title); setDescription(v.description); }}
                                                className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex justify-between items-center"
                                            >
                                                <span className="text-sm font-medium">Version {v.version_number}</span>
                                                <span className="text-xs text-white/40">{new Date(v.created_at).toLocaleDateString()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Startup Profile Reference Section */}
                            {user?.startup && (
                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        <h3 className="text-sm font-bold text-white">Startup Profile Reference</h3>
                                    </div>
                                    <p className="text-xs text-white/40 mb-4">Quickly copy your core profile data for this directory.</p>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'Startup Name', value: user.startup.name, id: 'st-name' },
                                            { label: 'Tagline', value: user.startup.tagline, id: 'st-tagline' },
                                            { label: 'Short Pitch', value: user.startup.shortDescription, id: 'st-short' },
                                            { label: 'Full Description', value: user.startup.description, id: 'st-desc' },
                                            { label: 'Website URL', value: user.startup.websiteUrl, id: 'st-url' },
                                        ].map((item) => item.value && (
                                            <div key={item.id} className="group bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{item.label}</span>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(item.value || ''); alert(`${item.label} copied!`); }}
                                                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-white/80 line-clamp-2">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assets' && (
                        <div className="space-y-6">
                            <div className="bg-[#1a1a24] p-5 rounded-2xl border border-white/10 text-center relative overflow-hidden group">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={handleFileUpload}
                                    disabled={uploadingAsset}
                                    accept="image/*"
                                />
                                {uploadingAsset ? (
                                    <div className="flex flex-col items-center gap-2 py-4">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        <p className="text-sm text-white/40 font-medium">Uploading to vault...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">Add Brand Asset</p>
                                        <p className="text-xs text-white/30">Drop or click to upload logo, screenshot or pitch deck image</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {user?.startup?.logoUrl && (
                                    <div className="group relative aspect-video bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center p-4">
                                        <img src={user.startup.logoUrl} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" alt="Primary Logo" title="Primary Logo" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <span className="text-xs font-bold text-white mb-1">Primary Logo</span>
                                            <div className="flex gap-2">
                                                <a href={user.startup.logoUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => { navigator.clipboard.writeText(user.startup?.logoUrl || ''); alert('Logo URL Copied!'); }} className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {user?.startup?.bannerUrl && (
                                    <div className="group relative aspect-video bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                                        <img src={user.startup.bannerUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Hero Banner" title="Hero Banner" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <span className="text-xs font-bold text-white mb-1">Hero Banner</span>
                                            <div className="flex gap-2">
                                                <a href={user.startup.bannerUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => { navigator.clipboard.writeText(user.startup?.bannerUrl || ''); alert('Banner URL Copied!'); }} className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {Array.isArray(user?.startup?.otherAssets) && user?.startup?.otherAssets.map((assetUrl, idx) => (
                                    <div key={`profile-asset-${idx}`} className="group relative aspect-video bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                                        <img src={assetUrl} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={`Product Asset ${idx}`} title={`Product Asset ${idx}`} />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <span className="text-[10px] font-bold text-white/60 mb-1 uppercase">Product Asset</span>
                                            <div className="flex gap-2">
                                                <a href={assetUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => { navigator.clipboard.writeText(assetUrl || ''); alert('Asset URL Copied!'); }} className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {assets.map(asset => (
                                    <div key={asset.id} className="group relative aspect-video bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                        <img src={asset.file_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Project asset" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <span className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider">Submission Asset</span>
                                            <div className="flex gap-2">
                                                <a href={asset.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => { navigator.clipboard.writeText(asset.file_url || ''); alert('Asset URL Copied!'); }} className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => removeAsset(asset)} className="p-2 bg-red-500/20 backdrop-blur-md rounded-lg text-red-300 hover:bg-red-500/30">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {assets.length === 0 && !uploadingAsset && (!user?.startup?.logoUrl && !user?.startup?.bannerUrl && (!user?.startup?.otherAssets || user?.startup?.otherAssets.length === 0)) && (
                                <div className="py-12 text-center text-white/20">
                                    <p className="text-xs tracking-widest uppercase font-bold mb-1">Vault Empty</p>
                                    <p className="text-xs">Upload your marketing materials here.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            {activity.filter(a => a.metadata?.directory_name === submission.directory_name || !a.metadata?.directory_name).map(log => (
                                <div key={log.id} className="flex gap-3">
                                    <div className="flex flex-col items-center mt-1">
                                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                                        <div className="w-px h-full bg-white/10 my-1"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-sm font-medium text-white/90">{formatAction(log.action_type)}</p>
                                        <p className="text-xs text-white/40 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            {activity.length === 0 && <p className="text-sm text-white/40 text-center py-10">No activity logged yet.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${active ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-white/40 hover:text-white/80'
                }`}
        >
            {icon} {label}
        </button>
    )
}

function formatAction(action: string) {
    return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
