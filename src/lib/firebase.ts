import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MemoryItem, PromptWave } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the dedicated databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const MEMORIES_COLLECTION = 'memories';
const PROMPTS_COLLECTION = 'prompts';

/**
 * Real-time listener for all shared living memories.
 */
export function subscribeToMemories(
  onUpdate: (memories: MemoryItem[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, MEMORIES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: MemoryItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            type: data.type || 'polaroid',
            title: data.title || '',
            content: data.content || '',
            author: data.author || 'Anonymous',
            authorRelation: data.authorRelation,
            authorAvatar: data.authorAvatar,
            date: data.date,
            location: data.location,
            mediaUrl: data.mediaUrl,
            audioUrl: data.audioUrl,
            audioDuration: data.audioDuration,
            tags: Array.isArray(data.tags) ? data.tags : ['#CivilMonkey'],
            promptId: data.promptId,
            position: data.position || { x: 500, y: 500, rotation: 0 },
            colorTheme: data.colorTheme,
            likes: typeof data.likes === 'number' ? data.likes : 1,
            reactions: Array.isArray(data.reactions) ? data.reactions : [{ emoji: '❤️', count: 1 }],
            createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
            isFavorite: !!data.isFavorite,
          });
        });
        
        // Sort newest first by creation or id
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore memories subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Failed to setup memories subscription:', err);
    return () => {};
  }
}

/**
 * Real-time listener for collective prompt waves.
 */
export function subscribeToPrompts(
  onUpdate: (prompts: PromptWave[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, PROMPTS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: PromptWave[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            question: data.question || '',
            description: data.description,
            creator: data.creator || 'Community',
            tag: data.tag || '#CivilMonkey',
            iconName: data.iconName,
            color: data.color || '#f59e0b',
            createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
            responsesCount: typeof data.responsesCount === 'number' ? data.responsesCount : 0,
          });
        });
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore prompts subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Failed to setup prompts subscription:', err);
    return () => {};
  }
}

/**
 * Saves a new memory to Cloud Firestore.
 */
export async function saveMemoryToCloud(memory: MemoryItem): Promise<void> {
  try {
    const docRef = doc(db, MEMORIES_COLLECTION, memory.id);
    await setDoc(docRef, {
      ...memory,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error saving memory to Firestore:', err);
    throw err;
  }
}

/**
 * Updates memory coordinates on canvas drag.
 */
export async function updateMemoryPositionInCloud(id: string, position: { x: number; y: number }): Promise<void> {
  try {
    const docRef = doc(db, MEMORIES_COLLECTION, id);
    await updateDoc(docRef, {
      'position.x': position.x,
      'position.y': position.y,
    });
  } catch (err) {
    console.error('Error updating position in Firestore:', err);
  }
}

/**
 * Updates reactions or likes in Firestore.
 */
export async function updateMemoryReactionsInCloud(
  id: string, 
  reactions: MemoryItem['reactions'],
  likes: number
): Promise<void> {
  try {
    const docRef = doc(db, MEMORIES_COLLECTION, id);
    await updateDoc(docRef, {
      reactions,
      likes,
    });
  } catch (err) {
    console.error('Error updating reactions in Firestore:', err);
  }
}

/**
 * Saves a new collective prompt wave to Cloud Firestore.
 */
export async function savePromptToCloud(prompt: PromptWave): Promise<void> {
  try {
    const docRef = doc(db, PROMPTS_COLLECTION, prompt.id);
    await setDoc(docRef, {
      ...prompt,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error saving prompt to Firestore:', err);
    throw err;
  }
}
