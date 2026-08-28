import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase do projeto oficial 'boas-novas-app-98892'
export const firebaseConfig = {
  apiKey: "AIzaSyA2EnnKHSVxq1o2HjDMNLqgZKqEnITgTro",
  authDomain: "boas-novas-app-98892.firebaseapp.com",
  projectId: "boas-novas-app-98892",
  storageBucket: "boas-novas-app-98892.firebasestorage.app",
  messagingSenderId: "584345895636",
  appId: "1:584345895636:web:c02a6c4783095a751e3141",
};

export const FIRESTORE_DATABASE_ID = "ai-studio-boasnovasapp-1e18ad7d-79ac-4d0b-8501-c11040abfdcd";

// Inicialização segura do Firebase (evita múltiplas instâncias)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicialização do Firestore com o databaseId configurado
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

// Inicialização do Auth
export const auth = getAuth(app);
