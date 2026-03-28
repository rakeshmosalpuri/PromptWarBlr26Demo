import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import config from './config';

let app, db, auth;

if (config.firebase.isConfigured) {
  try {
    app  = initializeApp(config.firebase);
    db   = getFirestore(app);
    auth = getAuth(app);
    console.log('[Firebase ✓] Connected to project:', config.firebase.projectId);
  } catch (err) {
    console.error('[Firebase ✗] Initialization failed:', err.message);
  }
} else {
  const missingKeys = [
    ['VITE_FIREBASE_API_KEY',            config.firebase.apiKey],
    ['VITE_FIREBASE_AUTH_DOMAIN',        config.firebase.authDomain],
    ['VITE_FIREBASE_PROJECT_ID',         config.firebase.projectId],
    ['VITE_FIREBASE_STORAGE_BUCKET',     config.firebase.storageBucket],
    ['VITE_FIREBASE_MESSAGING_SENDER_ID',config.firebase.messagingSenderId],
    ['VITE_FIREBASE_APP_ID',             config.firebase.appId],
  ].filter(([, v]) => !v).map(([k]) => k);

  if (missingKeys.length) {
    console.warn('[Firebase] Missing config keys — running in offline mode:', missingKeys.join(', '));
    console.warn('[Firebase] Add these to your .env and restart the dev server.');
    console.warn('[Firebase] Get config at: https://console.firebase.google.com');
  }
}

export const isFirebaseConfigured = config.firebase.isConfigured;
export { db, auth };

// ─── Incident CRUD ────────────────────────────────────────────────
export const writeIncident = async (incidentData) => {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const ref = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error('[Firestore ✗] Write failed:', err.message);
    return null;
  }
};

export const updateIncidentStatus = async (firestoreId, newStatus) => {
  if (!isFirebaseConfigured || !db || !firestoreId) return;
  try {
    await updateDoc(doc(db, 'incidents', firestoreId), { status: newStatus });
  } catch (err) {
    console.error('[Firestore ✗] Update failed:', err.message);
  }
};

export const subscribeToIncidents = (callback) => {
  if (!isFirebaseConfigured || !db) return () => {};
  const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() })));
  }, (err) => {
    console.error('[Firestore ✗] Snapshot listener failed:', err.message);
  });
};

// ─── Auth ─────────────────────────────────────────────────────────
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth) return null;
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return result.user;
  } catch (err) {
    console.error('[Auth ✗] Sign-in failed:', err.message);
    return null;
  }
};

export const signOutUser = () => {
  if (!isFirebaseConfigured || !auth) return;
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (!isFirebaseConfigured || !auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
};
