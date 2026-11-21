// The Glade — Firebase sign-in and storage.
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut as fbSignOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Offline cache: the app keeps working without signal and syncs later.
const fs = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

let uid = null;
let onError = () => {};
export function setErrorHandler(fn) { onError = fn; }

const userDoc = () => doc(fs, 'users', uid);
const itemsCol = () => collection(fs, 'users', uid, 'items');
const logCol = () => collection(fs, 'users', uid, 'log');

export function onUser(cb) { return onAuthStateChanged(auth, cb); }

export async function signIn() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(e.code)) {
      await signInWithRedirect(auth, provider);
    } else {
      throw e;
    }
  }
}

export function signOut() { return fbSignOut(auth); }

export async function loadAll(userId) {
  uid = userId;
  const [itemsSnap, logSnap, userSnap] = await Promise.all([getDocs(itemsCol()), getDocs(logCol()), getDoc(userDoc())]);
  const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const log = logSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.at || 0) - (b.at || 0));
  const stored = userSnap.exists() ? (userSnap.data().settings || {}) : {};
  // Defaults for anyone who hasn't changed them yet; everything they change is saved here and loaded on any device.
  const settings = { seasonMode: 'seasons', soundOn: true, clearingDay: 0, clearingClosedWeek: null, seeded: false, ...stored };
  return { items, log, settings };
}

export function saveSettings(patch) {
  setDoc(userDoc(), { settings: patch }, { merge: true }).catch(onError);
}

// Writes return immediately (they're cached locally and synced in the background).
export function addItem(data) {
  const ref = doc(itemsCol());
  setDoc(ref, data).catch(onError);
  return { id: ref.id, ...data };
}

export function updateItem(id, patch) {
  updateDoc(doc(itemsCol(), id), patch).catch(onError);
}

export function deleteItem(id) {
  deleteDoc(doc(itemsCol(), id)).catch(onError);
}

export function addLog(entry) {
  const ref = doc(logCol());
  setDoc(ref, entry).catch(onError);
  return { id: ref.id, ...entry };
}

export function deleteLog(id) {
  deleteDoc(doc(logCol(), id)).catch(onError);
}

export async function seed(list) {
  const batch = writeBatch(fs);
  const out = list.map(data => {
    const ref = doc(itemsCol());
    batch.set(ref, data);
    return { id: ref.id, ...data };
  });
  await batch.commit();
  return out;
}
