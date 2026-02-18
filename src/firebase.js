import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "PLACEHOLDER",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "PLACEHOLDER",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "PLACEHOLDER",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "PLACEHOLDER",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "PLACEHOLDER",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "PLACEHOLDER",
}

// Check if Firebase is properly configured (not using placeholders)
export const isFirebaseConfigured = firebaseConfig.apiKey !== "PLACEHOLDER"

// Only initialize Firebase if properly configured
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const db = isFirebaseConfigured ? getFirestore(app) : null

export default app
