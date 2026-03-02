import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadAsset = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};

export const deleteAsset = async (path: string): Promise<void> => {
    const storageRef = ref(storage, path);
    return deleteObject(storageRef);
};
