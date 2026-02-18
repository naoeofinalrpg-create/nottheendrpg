import { db, isFirebaseConfigured } from '../firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { localStorageService } from './localStorageService'

const COLLECTION = 'sheets'

// Use localStorage if Firebase is not configured
const USE_FIREBASE = isFirebaseConfigured

export async function sheetExists(playerName) {
  if (!USE_FIREBASE) {
    return localStorageService.getSheet(playerName) !== null
  }
  const docRef = doc(db, COLLECTION, playerName.toLowerCase())
  const snap = await getDoc(docRef)
  return snap.exists()
}

export async function getAllSheetNames() {
  const sheets = await getAllSheets()
  return sheets.map(s => s.playerName).filter(Boolean)
}

export async function getSheet(playerName) {
  if (!USE_FIREBASE) {
    return localStorageService.getSheet(playerName)
  }
  const docRef = doc(db, COLLECTION, playerName.toLowerCase())
  const snap = await getDoc(docRef)
  return snap.exists() ? snap.data() : null
}

export async function getAllSheets() {
  if (!USE_FIREBASE) {
    return localStorageService.getAllSheets()
  }
  const q = query(collection(db, COLLECTION), orderBy('playerName'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveSheet(playerName, data) {
  if (!USE_FIREBASE) {
    return localStorageService.saveSheet(playerName, data)
  }
  const docRef = doc(db, COLLECTION, playerName.toLowerCase())
  await setDoc(docRef, { ...data, playerName, updatedAt: Date.now() })
}

export function subscribeToSheets(callback) {
  if (!USE_FIREBASE) {
    return localStorageService.subscribeToSheets(callback)
  }
  const q = query(collection(db, COLLECTION), orderBy('playerName'))
  return onSnapshot(q, (snap) => {
    const sheets = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(sheets)
  })
}

export function subscribeToSheet(playerName, callback) {
  if (!USE_FIREBASE) {
    return localStorageService.subscribeToSheet(playerName, callback)
  }
  const docRef = doc(db, COLLECTION, playerName.toLowerCase())
  return onSnapshot(docRef, (snap) => {
    callback(snap.exists() ? snap.data() : null)
  })
}
