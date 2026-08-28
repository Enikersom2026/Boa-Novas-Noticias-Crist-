import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';

// Configuração do Firebase carregada via variáveis de ambiente com fallback para o arquivo de configuração do applet
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (appletConfig as { apiKey?: string })?.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (appletConfig as { authDomain?: string })?.authDomain || 'boas-novas-app-98892.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (appletConfig as { projectId?: string })?.projectId || 'boas-novas-app-98892',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (appletConfig as { storageBucket?: string })?.storageBucket || 'boas-novas-app-98892.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (appletConfig as { messagingSenderId?: string })?.messagingSenderId || '584345895636',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (appletConfig as { appId?: string })?.appId || '1:584345895636:web:c02a6c4783095a751e3141',
};

export const FIRESTORE_DATABASE_ID =
  import.meta.env.VITE_FIRESTORE_DATABASE_ID ||
  (appletConfig as { firestoreDatabaseId?: string })?.firestoreDatabaseId ||
  'ai-studio-boasnovasapp-1e18ad7d-79ac-4d0b-8501-c11040abfdcd';

// Inicialização segura do Firebase (evita múltiplas instâncias)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicialização do Firestore com o databaseId configurado
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

// Inicialização do Auth
export const auth = getAuth(app);
