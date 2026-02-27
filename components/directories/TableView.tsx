'use client';

import React from 'react';
import { DirectorySubmission } from '@/types/distribution';

interface TableViewProps {
    submissions: DirectorySubmission[];
    onOpenWorkspace: (submission: DirectorySubmission) => void;
}

export function TableView({ submissions, onOpenWorkspace }: TableViewProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/70">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white/50 border-b border-white/10">
                        <tr>
                            <th className="px-4 py-3">Directory</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Submission URL</th>
                            <th className="px-4 py-3">Last Updated</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-white/40">No submissions yet. Add one from the Grid View.</td>
                            </tr>
                        ) : submissions.map(sub => (
                            <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-medium text-white/90">{sub.directory_name}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-semibold border border-white/5 uppercase tracking-wide">
                                        {sub.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {sub.submission_url ? (
                                        <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link</a>
                                    ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-white/50">{new Date(sub.updated_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => onOpenWorkspace(sub)}
                                        className="text-white/60 hover:text-white hover:underline text-xs font-semibold"
                                    >
                                        Workspace
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
