// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – firebase-functions is installed in the Cloud Functions package, not the Next.js root
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// @ts-ignore – resolved at deploy time inside the cloud-functions package
import { checkBacklink } from "../../lib/backlinkChecker"; // Ensure path is correct for your exact build setup

// Ensure admin app is initialized in your index.ts entrypoint
// if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

/**
 * Trigger: Fires when a directory submission is updated and a 'liveUrl' is added or modified.
 * Validates the backlink immediately in the background and stores the result in the 'backlinks' collection.
 */
export const onSubmissionLiveLinkAdded = functions.firestore
    .document("directory_submissions/{submissionId}")
    .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
        const submissionId = context.params.submissionId;
        const afterData = change.after.data();
        const beforeData = change.before.data();

        // Check if document was deleted
        if (!afterData) return null;

        const liveUrl = afterData.submission_url || afterData.liveUrl; // Adjust field names to match your schema
        const beforeLiveUrl = beforeData ? (beforeData.submission_url || beforeData.liveUrl) : null;

        // Run if liveUrl is added or changed
        if (!liveUrl || liveUrl === beforeLiveUrl) {
            return null; // Stop execution if no live link change
        }

        try {
            // Retrieve project metadata to get the target domain to check against
            const projectId = afterData.project_id;
            // Fetch targetDomain (User's URL). You may need to fetch the project/user document or pass it down.
            // Assuming we fetch from 'users' collections based on project_id/user_id depending on your schema.
            // Example:
            // Fetch submission doc if needed for additional metadata
            void db.collection("directory_submissions").doc(submissionId).get();
            // Alternatively, pull the expected domain from the afterData if it stores the target domain
            const targetDomain = afterData.targetDomain || "your-domain-fallback.com";

            // Execute backlink check utility
            const result = await checkBacklink(liveUrl, targetDomain);

            // Backlink Document Reference
            const backlinkRef = db.collection("backlinks").doc(submissionId);
            const backlinkDoc = await backlinkRef.get();

            let isLost = false;

            if (backlinkDoc.exists) {
                const prevData = backlinkDoc.data();
                // Determine if a previously live link was lost
                if (prevData?.linkFound === true && !result.found) {
                    isLost = true;
                }
            }

            // Write or Update the backlink document for this submission
            await backlinkRef.set({
                campaignId: afterData.campaignId || projectId, // Link back to campaign or project
                submissionId: submissionId,
                liveUrl: liveUrl,
                targetDomain: targetDomain,
                anchorText: result.anchor,
                relType: result.rel,
                linkFound: result.found,
                httpStatus: result.status,
                firstChecked: backlinkDoc.exists ? (backlinkDoc.data()?.firstChecked || admin.firestore.FieldValue.serverTimestamp()) : admin.firestore.FieldValue.serverTimestamp(),
                lastChecked: admin.firestore.FieldValue.serverTimestamp(),
                isLost: isLost
            }, { merge: true });

            console.log(`Backlink check completed for ${submissionId}. Found: ${result.found}`);

            return null;

        } catch (error) {
            console.error("Error processing backlink trigger", error);
            return null; // Do not crash the function
        }
    });

/**
 * Scheduled Function: Runs weekly to recheck all stored backlinks.
 * Uses batching to prevent exceeding Firebase memory limits and quotas.
 */
export const weeklyBacklinkMonitor = functions.pubsub
    .schedule("0 0 * * 0") // Runs every Sunday at midnight
    .timeZone("UTC")
    .onRun(async (_context: functions.EventContext) => {
        const backlinksRef = db.collection("backlinks");

        try {
            // Fetch backlinks. We can process them in batches for large collections using limit/offset.
            const querySnapshot = await backlinksRef.get();

            if (querySnapshot.empty) {
                console.log("No backlinks to check.");
                return null;
            }

            // Using batch writes (max 500 per batch per Firestore rules)
            let batch = db.batch();
            let operationsCount = 0;
            let batchPromises: Promise<any>[] = [];

            // Execute concurrent checks (but limit concurrency)
            // It's recommended to chunk requests to avoid overwhelming target servers or triggering rate limits
            const docs = querySnapshot.docs;
            const CHUNK_SIZE = 5; // e.g., check 5 URLs at a time

            for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
                const chunk = docs.slice(i, i + CHUNK_SIZE);

                // Run chunk validations concurrently
                const checkPromises = chunk.map(async (docSnap) => {
                    const data = docSnap.data();
                    const liveUrl = data.liveUrl;
                    const targetDomain = data.targetDomain;

                    if (!liveUrl || !targetDomain) return;

                    const result = await checkBacklink(liveUrl, targetDomain);

                    let isLost = data.isLost || false;
                    // If it was found before and is missing now
                    if (data.linkFound === true && !result.found) {
                        isLost = true;
                    }

                    const updateData = {
                        linkFound: result.found,
                        anchorText: result.anchor,
                        relType: result.rel,
                        httpStatus: result.status,
                        lastChecked: admin.firestore.FieldValue.serverTimestamp(),
                        isLost: isLost
                    };

                    batch.update(docSnap.ref, updateData);
                    operationsCount++;

                    // Commit batch if limit reached
                    if (operationsCount >= 450) {
                        batchPromises.push(batch.commit());
                        batch = db.batch(); // Start a new batch
                        operationsCount = 0;
                    }
                });

                await Promise.all(checkPromises);

                // Add a slight delay between chunks to be polite & avoid aggressive rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Commit final remaining updates
            if (operationsCount > 0) {
                batchPromises.push(batch.commit());
            }

            await Promise.all(batchPromises);

            console.log(`Weekly backlink check finished. Checked ${docs.length} URLs.`);
            return null;

        } catch (error) {
            console.error("Scheduled backlink monitor failed:", error);
            return null;
        }
    });
