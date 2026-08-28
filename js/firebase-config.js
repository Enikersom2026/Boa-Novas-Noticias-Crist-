// js/firebase-config.js
// Inicialização do Firebase SDK v10+ via CDN ES Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração do projeto Firebase (carregada dinamicamente via window ou ambiente)
const runtimeConfig = (typeof window !== 'undefined' && (window.__FIREBASE_CONFIG__ || window.FIREBASE_CONFIG)) || {};

export const firebaseConfig = {
  apiKey: runtimeConfig.apiKey || "",
  authDomain: runtimeConfig.authDomain || "boas-novas-app-98892.firebaseapp.com",
  projectId: runtimeConfig.projectId || "boas-novas-app-98892",
  storageBucket: runtimeConfig.storageBucket || "boas-novas-app-98892.firebasestorage.app",
  messagingSenderId: runtimeConfig.messagingSenderId || "584345895636",
  appId: runtimeConfig.appId || "1:584345895636:web:c02a6c4783095a751e3141"
};

export const FIRESTORE_DATABASE_ID = runtimeConfig.firestoreDatabaseId || "ai-studio-boasnovasapp-1e18ad7d-79ac-4d0b-8501-c11040abfdcd";

// Inicialização das instâncias
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

// Exportações utilitárias do Firestore & Auth para uso em outros módulos
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
};
