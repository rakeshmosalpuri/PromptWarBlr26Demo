// Firebase / Firestore Integration
// Google Services Priority 1: Real-time incident sync across Citizen & Operator views

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase project config — loaded from environment variables (never hardcode keys)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Graceful init: only bootstrap Firebase if config is present
const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let app, db, auth;

if (isFirebaseConfigured) {
  app  = initializeApp(firebaseConfig);
  db   = getFirestore(app);
  auth = getAuth(app);
  console.log('[Firebase] Connected to project:', firebaseConfig.projectId);
} else {
  console.warn('[Firebase] No config found. Running in offline/mock mode.');
}

export { db, auth, isFirebaseConfigured };

// ─── Incident CRUD ────────────────────────────────────────────────

/**
 * Write a new parsed incident to Firestore.
 * Called by geminiService after parsing citizen input.
 */
export const writeIncident = async (incidentData) => {
  if (!isFirebaseConfigured) return null;
  try {
    const ref = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      createdAt: serverTimestamp(),
    });
    console.log('[Firestore] Incident written:', ref.id);
    return ref.id;
  } catch (err) {
    console.error('[Firestore] Write failed:', err);
    return null;
  }
};

/**
 * Update incident status (approve / hold).
 * Called by Operator Dashboard action buttons.
 */
export const updateIncidentStatus = async (firestoreId, newStatus) => {
  if (!isFirebaseConfigured || !firestoreId) return;
  try {
    await updateDoc(doc(db, 'incidents', firestoreId), { status: newStatus });
  } catch (err) {
    console.error('[Firestore] Update failed:', err);
  }
};

/**
 * Subscribe to the live incidents collection.
 * Returns an unsubscribe function — call it on component unmount.
 */
export const subscribeToIncidents = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
    callback(incidents);
  });
};

// ─── Auth (Operator only) ─────────────────────────────────────────

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) return null;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error('[Auth] Sign-in failed:', err);
    return null;
  }
};

export const signOutUser = () => {
  if (!isFirebaseConfigured) return;
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (!isFirebaseConfigured) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
};
