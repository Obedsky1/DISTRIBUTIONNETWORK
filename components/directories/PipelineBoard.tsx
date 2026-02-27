'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DirectorySubmission } from '@/types/distribution';

const COLUMNS = [
    { id: 'not_started', title: 'Not Started' },
    { id: 'submitted', title: 'Submitted' },
    { id: 'approved', title: 'Approved' },
    { id: 'live', title: 'Live' },
    { id: 'rejected', title: 'Rejected' },
    { id: 'follow_up', title: 'Follow Up' }
];

interface PipelineBoardProps {
    submissions: DirectorySubmission[];
    onDragEnd: (result: DropResult) => void;
    onOpenWorkspace: (submission: DirectorySubmission) => void;
}

export function PipelineBoard({ submissions, onDragEnd, onOpenWorkspace }: PipelineBoardProps) {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
                {COLUMNS.map(col => {
                    const colSubmissions = submissions.filter(s => s.status === col.id);
                    return (
                        <Droppable key={col.id} droppableId={col.id}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex-shrink-0 w-80 bg-white/5 rounded-2xl border border-white/10 flex flex-col h-full max-h-[700px]"
                                >
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                        <h3 className="font-bold text-sm text-white/90">{col.title}</h3>
                                        <span className="text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                                            {colSubmissions.length}
                                        </span>
                                    </div>
                                    <div className="p-3 flex-1 overflow-y-auto space-y-3">
                                        {colSubmissions.map((sub, index) => (
                                            <Draggable key={sub.id} draggableId={sub.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p-4 rounded-xl border transition-all ${snapshot.isDragging ? 'bg-violet-900/40 border-violet-500/50 scale-[1.02] shadow-xl' : 'bg-[#1a1a24] border-white/10 hover:border-white/20 hover:bg-[#1a1a24]/80'
                                                            }`}
                                                    >
                                                        <h4 className="font-bold text-sm text-white mb-2">{sub.directory_name}</h4>
                                                        <div className="text-xs text-white/40 mb-3 flex items-center justify-between">
                                                            <span>{new Date(sub.updated_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => onOpenWorkspace(sub)}
                                                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-white/80 transition-colors"
                                                        >
                                                            Open Workspace
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
