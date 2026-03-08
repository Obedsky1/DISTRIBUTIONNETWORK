import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config'; // Adjust the import path for your Firebase config

export interface BacklinkData {
    id: string;
    campaignId: string;
    submissionId: string;
    liveUrl: string;
    targetDomain: string;
    anchorText: string | null;
    relType: string | null;
    linkFound: boolean;
    httpStatus: number;
    firstChecked: any; // Timestamp
    lastChecked: any; // Timestamp
    isLost: boolean;
}

export function useBacklinkStatus(submissionId: string) {
    const [backlink, setBacklink] = useState<BacklinkData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!submissionId) {
            setLoading(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const backlinkRef = doc(db, 'backlinks', submissionId);
                const docSnap = await getDoc(backlinkRef);

                if (docSnap.exists()) {
                    setBacklink({ id: docSnap.id, ...docSnap.data() } as BacklinkData);
                } else {
                    setBacklink(null);
                }
            } catch (err: any) {
                console.error("Error fetching backlink status:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [submissionId]);

    const statusDisplay = () => {
        if (loading) return "Checking...";
        if (!backlink) return "Not Checked";
        if (backlink.isLost) return "Lost";
        if (backlink.linkFound) return "Live";
        return "Not Found";
    };

    return { backlink, loading, error, statusDisplay: statusDisplay() };
}
