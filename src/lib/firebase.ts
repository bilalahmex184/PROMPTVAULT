import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PromptItem, RoleItem } from '../types';
import { DEFAULT_PROMPTS, DEFAULT_ROLES } from '../data/initialData';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  },
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Collection References
const PROMPTS_COLLECTION = 'prompts';
const ROLES_COLLECTION = 'roles';

// Subscribe to Realtime Prompts
export function subscribeToPrompts(
  onUpdate: (prompts: PromptItem[]) => void,
  onError?: (err: Error) => void
) {
  const promptsRef = collection(db, PROMPTS_COLLECTION);
  return onSnapshot(
    promptsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default prompts if collection is empty
        await seedDefaultData();
        return;
      }
      const prompts: PromptItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || '',
          body: data.body || '',
          role_id: data.role_id || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          is_favorite: !!data.is_favorite,
          usage_count: data.usage_count || 0,
          version_history: Array.isArray(data.version_history) ? data.version_history : [],
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
      });
      onUpdate(prompts);
    },
    (error) => {
      console.error('Firestore prompts snapshot error:', error);
      if (onError) onError(error);
    }
  );
}

// Subscribe to Realtime Roles
export function subscribeToRoles(
  onUpdate: (roles: RoleItem[]) => void,
  onError?: (err: Error) => void
) {
  const rolesRef = collection(db, ROLES_COLLECTION);
  return onSnapshot(
    rolesRef,
    async (snapshot) => {
      if (snapshot.empty) {
        await seedDefaultRoles();
        return;
      }
      const roles: RoleItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          description: data.description || '',
          color_accent: data.color_accent || '#6366F1',
          icon: data.icon || 'Folder',
          sort_order: data.sort_order || 1,
        };
      });
      // Sort roles by sort_order
      roles.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      onUpdate(roles);
    },
    (error) => {
      console.error('Firestore roles snapshot error:', error);
      if (onError) onError(error);
    }
  );
}

// Seed Initial Data to Firestore if Empty
export async function seedDefaultData() {
  try {
    const batch = writeBatch(db);
    for (const prompt of DEFAULT_PROMPTS) {
      const promptRef = doc(db, PROMPTS_COLLECTION, prompt.id);
      batch.set(promptRef, prompt);
    }
    await batch.commit();
    console.log('Seeded initial prompts to Firestore');
  } catch (err) {
    console.error('Error seeding default prompts:', err);
  }
}

export async function seedDefaultRoles() {
  try {
    const batch = writeBatch(db);
    for (const role of DEFAULT_ROLES) {
      const roleRef = doc(db, ROLES_COLLECTION, role.id);
      batch.set(roleRef, role);
    }
    await batch.commit();
    console.log('Seeded initial roles to Firestore');
  } catch (err) {
    console.error('Error seeding default roles:', err);
  }
}

// Firestore Mutations for Prompts
export async function savePromptToFirestore(prompt: PromptItem): Promise<void> {
  const promptRef = doc(db, PROMPTS_COLLECTION, prompt.id);
  await setDoc(promptRef, prompt, { merge: true });
}

export async function deletePromptFromFirestore(promptId: string): Promise<void> {
  const promptRef = doc(db, PROMPTS_COLLECTION, promptId);
  await deleteDoc(promptRef);
}

// Firestore Mutations for Roles
export async function saveRoleToFirestore(role: RoleItem): Promise<void> {
  const roleRef = doc(db, ROLES_COLLECTION, role.id);
  await setDoc(roleRef, role, { merge: true });
}

export async function deleteRoleFromFirestore(roleId: string): Promise<void> {
  const roleRef = doc(db, ROLES_COLLECTION, roleId);
  await deleteDoc(roleRef);
}

// Batch Save All (for Import / Reset functionality)
export async function replaceAllPromptsAndRolesInFirestore(
  prompts: PromptItem[],
  roles: RoleItem[]
): Promise<void> {
  const batch = writeBatch(db);

  // Get current documents to delete existing
  const currentPrompts = await getDocs(collection(db, PROMPTS_COLLECTION));
  currentPrompts.forEach((d) => batch.delete(d.ref));

  const currentRoles = await getDocs(collection(db, ROLES_COLLECTION));
  currentRoles.forEach((d) => batch.delete(d.ref));

  // Write new prompts
  for (const prompt of prompts) {
    const pRef = doc(db, PROMPTS_COLLECTION, prompt.id);
    batch.set(pRef, prompt);
  }

  // Write new roles
  for (const role of roles) {
    const rRef = doc(db, ROLES_COLLECTION, role.id);
    batch.set(rRef, role);
  }

  await batch.commit();
}
