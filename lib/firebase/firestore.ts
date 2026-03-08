import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
    serverTimestamp,
    Timestamp,
    WhereFilterOp,
} from 'firebase/firestore';
import { db } from './config';

// ─── Request-scoped cache (resets per request in a typical Next.js server context) ───
// Note: In long-running processes (like dev server), this might persist.
// In a serverless environment (Lambda/Vercel), it resets per invocation.
const queryCache = new Map<string, Promise<any>>();

/**
 * Standardized Firestore error handler
 */
function handleFirestoreError(error: any, operation: string, fallback: any = null) {
    if (error.code === 'resource-exhausted' || error.code === 8 || error.message?.includes('Quota')) {
        console.warn(`[Firestore Quota Exceeded] ${operation}. Returning fallback.`);
        return fallback;
    }
    console.error(`[Firestore Error] ${operation}:`, error);
    throw error;
}

/**
 * Execute a query with caching/deduplication
 */
async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = queryCache.get(key);
    if (cached) return cached;

    const promise = fetcher();
    queryCache.set(key, promise);

    try {
        return await promise;
    } catch (error) {
        queryCache.delete(key);
        throw error;
    }
}

/**
 * Generic function to get a document by ID
 */
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const cacheKey = `getDoc:${collectionName}:${docId}`;
    return withCache(cacheKey, async () => {
        try {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as T;
            }
            return null;
        } catch (error) {
            return handleFirestoreError(error, `getDocument(${collectionName}, ${docId})`);
        }
    });
}

/**
 * Generic function to create or update a document
 */
export async function setDocument<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    merge = true
): Promise<void> {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge });
    } catch (error: any) {
        if (error.code === 'resource-exhausted' || error.code === 8) {
            console.warn(`Firestore Quota Exceeded during setDocument in ${collectionName}.`);
        }
        console.error(`Error setting document in ${collectionName}:`, error);
        throw error;
    }
}

/**
 * Generic function to update a document
 */
export async function updateDocument<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>
): Promise<void> {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } catch (error: any) {
        if (error.code === 'resource-exhausted' || error.code === 8) {
            console.warn(`Firestore Quota Exceeded during updateDocument in ${collectionName}.`);
        }
        console.error(`Error updating document in ${collectionName}:`, error);
        throw error;
    }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
    } catch (error: any) {
        if (error.code === 'resource-exhausted' || error.code === 8) {
            console.warn(`Firestore Quota Exceeded during deleteDocument from ${collectionName}.`);
        }
        console.error(`Error deleting document from ${collectionName}:`, error);
        throw error;
    }
}

/**
 * Query documents with filters
 */
export async function queryDocuments<T>(
    collectionName: string,
    filters: { field: string; operator: WhereFilterOp; value: any }[] = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number,
    startAfterDoc?: DocumentSnapshot
): Promise<T[]> {
    const cacheKey = `query:${collectionName}:${JSON.stringify(filters)}:${orderByField}:${orderDirection}:${limitCount}`;
    return withCache(cacheKey, async () => {
        try {
            let q = query(collection(db, collectionName));

            // Apply filters
            filters.forEach((filter) => {
                q = query(q, where(filter.field, filter.operator, filter.value));
            });

            // Apply ordering
            if (orderByField) {
                q = query(q, orderBy(orderByField, orderDirection));
            }

            // Apply limit
            if (limitCount) {
                q = query(q, limit(limitCount));
            }

            // Apply pagination
            if (startAfterDoc) {
                q = query(q, startAfter(startAfterDoc));
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) =>
                convertTimestamps({ id: doc.id, ...doc.data() })
            ) as T[];
        } catch (error) {
            return handleFirestoreError(error, `queryDocuments(${collectionName})`, []);
        }
    });
}

/**
 * Get multiple documents by their IDs in a single query (batch fetch)
 */
export async function getDocumentsByIds<T>(collectionName: string, ids: string[]): Promise<T[]> {
    if (!ids || ids.length === 0) return [];

    // Firestore 'in' query supports up to 10 elements per query (or 30 in some versions, but 10 is safest)
    const CHUNK_SIZE = 10;
    const results: T[] = [];

    try {
        for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
            const chunk = ids.slice(i, i + CHUNK_SIZE);
            const q = query(collection(db, collectionName), where('__name__', 'in', chunk));
            const snapshot = await getDocs(q);
            snapshot.docs.forEach(doc => {
                results.push(convertTimestamps({ id: doc.id, ...doc.data() }) as T);
            });
        }
        return results;
    } catch (error: any) {
        if (error.code === 'resource-exhausted' || error.code === 8) {
            console.warn(`Firestore Quota Exceeded during getDocumentsByIds from ${collectionName}.`);
        }
        console.error(`Error batch fetching documents from ${collectionName}:`, error);
        throw error;
    }
}

/**
 * Get all documents from a collection
 */
export async function getAllDocuments<T>(collectionName: string): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map((doc) =>
            convertTimestamps({ id: doc.id, ...doc.data() })
        ) as T[];
    } catch (error: any) {
        if (error.code === 'resource-exhausted' || error.code === 8) {
            console.warn(`Firestore Quota Exceeded during getAllDocuments from ${collectionName}.`);
        }
        console.error(`Error getting all documents from ${collectionName}:`, error);
        throw error;
    }
}

/**
 * Convert Firestore Timestamps to JavaScript Dates
 */
function convertTimestamps(data: any): any {
    if (!data) return data;

    const converted: any = {};
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            converted[key] = data[key].toDate();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            converted[key] = convertTimestamps(data[key]);
        } else {
            converted[key] = data[key];
        }
    }
    return converted;
}

/**
 * Batch create/update documents
 */
export async function batchSetDocuments<T>(
    collectionName: string,
    documents: { id: string; data: Partial<T> }[]
): Promise<void> {
    try {
        const promises = documents.map(({ id, data }) =>
            setDocument(collectionName, id, data)
        );
        await Promise.all(promises);
    } catch (error) {
        console.error(`Error batch setting documents in ${collectionName}:`, error);
        throw error;
    }
}
