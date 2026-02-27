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

/**
 * Generic function to get a document by ID
 */
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as T;
        }
        return null;
    } catch (error) {
        console.error(`Error getting document from ${collectionName}:`, error);
        throw error;
    }
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
        console.error(`Error querying documents from ${collectionName}:`, error);
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
    } catch (error) {
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
