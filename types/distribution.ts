export type GoalType = 'beta_users' | 'backlinks' | 'traffic' | 'investors';

export interface LaunchProject {
    id: string; // uuid
    user_id: string;
    name: string;
    goal_type: GoalType;
    created_at: Date;
    updated_at: Date;
}

export type SubmissionStatus = 'not_started' | 'submitted' | 'approved' | 'rejected' | 'live' | 'follow_up';

export interface DirectorySubmission {
    id: string; // uuid
    project_id: string;
    directory_id: string; // The URL or Name of the directory, since there isn't a strict DB ID for directories
    directory_name: string; // For easy referencing
    directory_url: string; // For easy referencing
    status: SubmissionStatus;
    submission_url?: string;
    submission_date?: Date;
    approval_date?: Date;
    notes?: string;
    rejection_reason?: string;
    created_at: Date;
    updated_at: Date;
}

export interface SubmissionVersion {
    id: string; // uuid
    submission_id: string;
    title: string;
    description: string;
    version_number: number;
    performance_score?: number;
    created_at: Date;
}

export type AssetType = 'logo' | 'screenshot' | 'deck' | 'tagline' | 'bio';

export interface ProjectAsset {
    id: string; // uuid
    project_id: string;
    type: AssetType;
    file_url: string;
    created_at: Date;
}

export interface ActivityLog {
    id: string; // uuid
    project_id: string;
    user_id: string;
    action_type: string;
    metadata?: any;
    created_at: Date;
}
