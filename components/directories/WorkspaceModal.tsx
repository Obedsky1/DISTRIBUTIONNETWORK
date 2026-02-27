'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Save, Clock, Type, Image as ImageIcon, Activity } from 'lucide-react';
import { DirectorySubmission, SubmissionVersion, ActivityLog, SubmissionStatus } from '@/types/distribution';

interface WorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: DirectorySubmission | null;
    userId: string;
}

export function WorkspaceModal({ isOpen, onClose, submission, userId }: WorkspaceModalProps) {
    const [activeTab, setActiveTab] = useState<'submission' | 'copy' | 'assets' | 'activity'>('submission');

    // Form States
    const [status, setStatus] = useState<SubmissionStatus>('not_started');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Data States
    const [versions, setVersions] = useState<SubmissionVersion[]>([]);
    const [activity, setActivity] = useState<ActivityLog[]>([]);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        if (isOpen && submission) {
            setStatus(submission.status);
            setUrl(submission.submission_url || '');
            setNotes(submission.notes || '');

            // Fetch versions
            fetch(`/api/submissions/${submission.id}/versions`)
                .then(r => r.json())
                .then(data => {
                    const v = data.versions || [];
                    setVersions(v);
                    if (v.length > 0) {
                        setTitle(v[0].title);
                        setDescription(v[0].description);
                    } else {
                        setTitle('');
                        setDescription('');
                    }
                });

            // Fetch activity
            fetch(`/api/projects/${submission.project_id}/activity`)
                .then(r => r.json())
                .then(data => setActivity(data.activity || []));
        }
    }, [isOpen, submission]);

    if (!isOpen || !submission) return null;

    const saveSubmissionInfo = async () => {
        await fetch(`/api/submissions/${submission.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, submission_url: url, notes, user_id: userId })
        });
        // Optionally refresh activity log here
    };

    const saveNewVersion = async () => {
        const res = await fetch(`/api/submissions/${submission.id}/versions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, user_id: userId, project_id: submission.project_id, directory_name: submission.directory_name })
        });
        if (res.ok) {
            const data = await res.json();
            setVersions([data.version, ...versions]);
        }
    };

    const generateCopy = async () => {
        setLoadingAI(true);
        try {
            const res = await fetch('/api/ai/generate-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    directory_name: submission.directory_name,
                    project_id: submission.project_id,
                    user_id: userId,
                    submission_id: submission.id
                })
            });
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title);
                setDescription(data.description);
                // Also fetch the newly created version to update the list
                const vRes = await fetch(`/api/submissions/${submission.id}/versions`);
                const vData = await vRes.json();
                setVersions(vData.versions || []);
            }
        } finally {
            setLoadingAI(false);
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
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50"
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
                                    className="w-full h-32 bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 resize-none placeholder-white/20"
                                    placeholder="Add any specific requirements, login details, or context here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <button onClick={saveSubmissionInfo} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-xl transition-all w-full justify-center">
                                <Save className="w-4 h-4" /> Save Details
                            </button>
                        </div>
                    )}

                    {activeTab === 'copy' && (
                        <div className="space-y-6 flex flex-col h-full">
                            <div className="flex justify-between items-center bg-[#1a1a24] p-3 rounded-xl border border-white/10">
                                <span className="text-sm font-medium">Versioned Copy Editor</span>
                                <button
                                    onClick={generateCopy}
                                    disabled={loadingAI}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-violet-600/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
                                >
                                    {loadingAI ? 'Generating...' : <>✨ Generate AI Copy</>}
                                </button>
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
                                        className="w-full flex-1 min-h-[200px] bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
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
                        </div>
                    )}

                    {activeTab === 'assets' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                            <ImageIcon className="w-12 h-12 text-white/20" />
                            <div>
                                <p className="font-semibold text-white/80">Asset Vault Integration Coming Soon</p>
                                <p className="text-sm text-white/40 mt-1">Manage logos, screenshots, and decks for this project.</p>
                            </div>
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
            className={`flex items-center gap-1.5 px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${active ? 'border-violet-500 text-violet-300' : 'border-transparent text-white/40 hover:text-white/80'
                }`}
        >
            {icon} {label}
        </button>
    )
}

function formatAction(action: string) {
    return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
