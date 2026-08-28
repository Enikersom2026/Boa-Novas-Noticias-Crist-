import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChurchProfile, MemberAccount, ChurchPost, PrayerRequest, ChurchNotification } from '../types';

const CHURCHES_COLLECTION = 'churches';
const MEMBERS_COLLECTION = 'members';
const POSTS_COLLECTION = 'posts';
const PRAYERS_COLLECTION = 'prayers';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Salva ou atualiza os dados da igreja no Firestore
 */
export async function saveChurchToFirestore(churchData: ChurchProfile): Promise<string> {
  try {
    const docId = churchData.idRegistro || '1042';
    const churchRef = doc(db, CHURCHES_COLLECTION, docId);
    
    await setDoc(
      churchRef,
      {
        ...churchData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return docId;
  } catch (error) {
    console.error('Erro ao salvar igreja no Firestore:', error);
    throw error;
  }
}

/**
 * Busca uma igreja pelo ID ou ID de Registro
 */
export async function getChurchFromFirestore(churchId: string): Promise<ChurchProfile | null> {
  try {
    const cleanId = churchId.trim();
    if (!cleanId) return null;

    // 1. Tenta buscar direto pelo document ID
    const churchRef = doc(db, CHURCHES_COLLECTION, cleanId);
    const snap = await getDoc(churchRef);
    if (snap.exists()) {
      return snap.data() as ChurchProfile;
    }

    // 2. Tenta buscar por idRegistro
    const q = query(
      collection(db, CHURCHES_COLLECTION),
      where('idRegistro', '==', cleanId),
      limit(1)
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as ChurchProfile;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar igreja no Firestore:', error);
    return null;
  }
}

/**
 * Busca conta do membro pelo e-mail
 */
export async function findMemberByEmail(email: string): Promise<MemberAccount | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return null;

    const q = query(
      collection(db, MEMBERS_COLLECTION),
      where('email', '==', cleanEmail),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as MemberAccount;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar membro por e-mail no Firestore:', error);
    return null;
  }
}

/**
 * Lista todas as igrejas cadastradas
 */
export async function listChurchesFromFirestore(): Promise<ChurchProfile[]> {
  try {
    const q = query(collection(db, CHURCHES_COLLECTION), limit(50));
    const snap = await getDocs(q);
    const list: ChurchProfile[] = [];
    snap.forEach((d) => {
      list.push(d.data() as ChurchProfile);
    });
    return list;
  } catch (error) {
    console.error('Erro ao listar igrejas do Firestore:', error);
    return [];
  }
}

/**
 * Salva o cadastro de um membro no Firestore
 */
export async function saveMemberToFirestore(memberData: MemberAccount): Promise<string> {
  try {
    const membersRef = collection(db, MEMBERS_COLLECTION);
    const docRef = await addDoc(membersRef, {
      ...memberData,
      createdAt: memberData.createdAt || new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar membro no Firestore:', error);
    throw error;
  }
}

/**
 * Salva ou atualiza um post/evento no Firestore
 */
export async function savePostToFirestore(post: ChurchPost): Promise<string> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, post.id);
    await setDoc(postRef, post, { merge: true });
    return post.id;
  } catch (error) {
    console.error('Erro ao salvar post no Firestore:', error);
    throw error;
  }
}

/**
 * Exclui um post/evento no Firestore
 */
export async function deletePostFromFirestore(postId: string): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Erro ao deletar post no Firestore:', error);
    throw error;
  }
}

/**
 * Busca os posts de uma igreja
 */
export async function getPostsFromFirestore(churchId: string): Promise<ChurchPost[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('igrejaId', '==', churchId)
    );
    const snap = await getDocs(q);
    const posts: ChurchPost[] = [];
    snap.forEach((d) => {
      posts.push(d.data() as ChurchPost);
    });
    return posts;
  } catch (error) {
    console.error('Erro ao buscar posts no Firestore:', error);
    return [];
  }
}

/**
 * Salva um pedido de oração no Firestore
 */
export async function savePrayerToFirestore(prayer: PrayerRequest): Promise<string> {
  try {
    const prayerRef = doc(db, PRAYERS_COLLECTION, prayer.id);
    await setDoc(prayerRef, prayer, { merge: true });
    return prayer.id;
  } catch (error) {
    console.error('Erro ao salvar oração no Firestore:', error);
    throw error;
  }
}

/**
 * Exclui um pedido de oração no Firestore
 */
export async function deletePrayerFromFirestore(prayerId: string): Promise<void> {
  try {
    const prayerRef = doc(db, PRAYERS_COLLECTION, prayerId);
    await deleteDoc(prayerRef);
  } catch (error) {
    console.error('Erro ao excluir oração no Firestore:', error);
    throw error;
  }
}

/**
 * Busca os pedidos de oração
 */
export async function getPrayersFromFirestore(churchId?: string): Promise<PrayerRequest[]> {
  try {
    let q;
    if (churchId) {
      q = query(
        collection(db, PRAYERS_COLLECTION),
        where('igrejaId', '==', churchId),
        limit(100)
      );
    } else {
      q = query(collection(db, PRAYERS_COLLECTION), limit(100));
    }
    const snap = await getDocs(q);
    const list: PrayerRequest[] = [];
    snap.forEach((d) => {
      list.push(d.data() as PrayerRequest);
    });

    return list;
  } catch (error) {
    console.error('Erro ao buscar pedidos de oração no Firestore:', error);
    return [];
  }
}

/**
  * Salva uma notificação push no Firestore
  */
export async function saveNotificationToFirestore(
  notification: ChurchNotification
): Promise<string> {
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
    await setDoc(notifRef, {
      ...notification,
      createdAtIso: new Date().toISOString(),
    }, { merge: true });
    return notification.id;
  } catch (error) {
    console.error('Erro ao salvar notificação no Firestore:', error);
    throw error;
  }
}

/**
  * Busca notificações de uma igreja
  */
export async function getNotificationsFromFirestore(
  churchId?: string
): Promise<ChurchNotification[]> {
  try {
    if (!churchId) return [];
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('igrejaId', '==', churchId),
      limit(50)
    );
    const snap = await getDocs(q);
    const list: ChurchNotification[] = [];
    snap.forEach((d) => {
      list.push(d.data() as ChurchNotification);
    });

    // Ordenar por data mais recente
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.error('Erro ao buscar notificações no Firestore:', error);
    return [];
  }
}

/**
  * Listener em tempo real para notificações de uma congregação
  */
export function listenToNotifications(
  churchId: string,
  callback: (notifications: ChurchNotification[]) => void
): Unsubscribe {
  if (!churchId) {
    return () => {};
  }

  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('igrejaId', '==', churchId),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: ChurchNotification[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ChurchNotification);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (err) => {
        console.warn('Erro no listener de notificações:', err);
      }
    );
  } catch (err) {
    console.warn('Erro ao inicializar listener de notificações:', err);
    return () => {};
  }
}

/**
  * Exclui uma notificação
  */
export async function deleteNotificationFromFirestore(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await deleteDoc(notifRef);
  } catch (error) {
    console.error('Erro ao excluir notificação no Firestore:', error);
    throw error;
  }
}

/**
  * Toca um som suave de notificação usando Web Audio API
  */
export function playNotificationChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Nota 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Nota 2: B5 (987.77Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.62);
  } catch {
    // Audio Context not supported or blocked by browser policy
  }
}

/**
  * Solicita permissão para notificações nativas do navegador
  */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Erro ao solicitar permissão de notificação:', err);
    return 'denied';
  }
}

/**
  * Dispara notificação nativa do navegador
  */
export function triggerNativeNotification(
  title: string,
  body: string,
  icon?: string,
  onClick?: () => void
): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notif = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      silent: false,
    });

    if (onClick) {
      notif.onclick = () => {
        window.focus();
        onClick();
        notif.close();
      };
    }
    return true;
  } catch (err) {
    console.warn('Erro ao exibir notificação nativa:', err);
    return false;
  }
}


