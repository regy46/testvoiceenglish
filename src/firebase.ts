import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { VoiceNoteItem } from './types';

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use configured firestoreDatabaseId if provided
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = firestoreDbId && firestoreDbId !== '(default)'
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

const COLLECTION_NAME = 'voice_notes';

/**
 * Real-time listener for voice notes collection
 */
export function subscribeToVoiceNotes(callback: (notes: VoiceNoteItem[]) => void) {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: VoiceNoteItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            namaLengkap: data.namaLengkap || '',
            kelas: data.kelas || '',
            kategori: data.kategori || undefined,
            audioUrl: data.audioUrl || '',
            duration: typeof data.duration === 'number' ? data.duration : 0,
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status || 'unread',
            catatanAdmin: data.catatanAdmin || undefined,
            starred: Boolean(data.starred),
          };
        });
        callback(items);
      },
      (error) => {
        console.warn('Firestore real-time listener note:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize Firestore listener:', err);
    return () => {};
  }
}

/**
 * Add a new voice note document to Firestore with safety timeout
 */
export async function addVoiceNoteToFirestore(item: Omit<VoiceNoteItem, 'id'>): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Koneksi Firestore timeout')), 6000)
  );

  const writeOperation = async (): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      namaLengkap: item.namaLengkap,
      kelas: item.kelas,
      kategori: item.kategori || null,
      audioUrl: item.audioUrl,
      duration: item.duration,
      createdAt: item.createdAt,
      status: item.status || 'unread',
      catatanAdmin: item.catatanAdmin || null,
      starred: Boolean(item.starred),
    });
    return docRef.id;
  };

  return await Promise.race([writeOperation(), timeoutPromise]);
}

/**
 * Update an existing voice note in Firestore
 */
export async function updateVoiceNoteInFirestore(id: string, updates: Partial<VoiceNoteItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanUpdates: Record<string, any> = {};
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.catatanAdmin !== undefined) cleanUpdates.catatanAdmin = updates.catatanAdmin;
    if (updates.starred !== undefined) cleanUpdates.starred = updates.starred;
    if (updates.namaLengkap !== undefined) cleanUpdates.namaLengkap = updates.namaLengkap;
    if (updates.kelas !== undefined) cleanUpdates.kelas = updates.kelas;

    await updateDoc(docRef, cleanUpdates);
  } catch (err) {
    console.error('Failed to update voice note in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a voice note from Firestore
 */
export async function deleteVoiceNoteFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete voice note in Firestore:', err);
    throw err;
  }
}

/**
 * Bulk delete voice notes from Firestore
 */
export async function bulkDeleteVoiceNotesInFirestore(ids: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to bulk delete in Firestore:', err);
    throw err;
  }
}

/**
 * Bulk update status in Firestore
 */
export async function bulkUpdateStatusInFirestore(ids: string[], status: VoiceNoteItem['status']): Promise<void> {
  try {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.update(docRef, { status });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to bulk update in Firestore:', err);
    throw err;
  }
}
