import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Bell,
  BellRing,
  Share2,
  Calendar,
  Heart,
  User,
  Home,
  Clock,
  Send,
  Check,
  Copy,
  ChevronRight,
  ChevronLeft,
  Star,
  Sparkles,
  X,
  Church,
  ShieldCheck,
  LogOut,
  ArrowRight,
  QrCode,
  Camera,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ChurchPost, ChurchProfile, MemberNavTab, PrayerRequest, ChurchNotification, NotificationPreferences } from '../types';
import { DAILY_VERSES, INITIAL_PRAYER_REQUESTS } from '../data/initialPrayerRequests';
import {
  savePrayerToFirestore,
  getPrayersFromFirestore,
  getChurchFromFirestore,
  getPostsFromFirestore,
  getNotificationsFromFirestore,
  listenToNotifications,
  deleteNotificationFromFirestore,
  playNotificationChime,
  requestBrowserNotificationPermission,
  triggerNativeNotification,
} from '../lib/firestoreService';
import { NotificationCenterModal } from './NotificationCenterModal';
import { InAppPushBanner } from './InAppPushBanner';

interface MemberAppViewProps {
  posts: ChurchPost[];
  churchProfile: ChurchProfile;
  onSwitchPortal: () => void;
  onLikePost: (postId: string) => void;
  likedPosts: Record<string, boolean>;
}

export const MemberAppView: React.FC<MemberAppViewProps> = ({
  posts: initialPosts,
  churchProfile: defaultChurchProfile,
  onSwitchPortal,
  onLikePost,
  likedPosts,
}) => {
  // Identification State
  const [accessCode, setAccessCode] = useState('');
  const [isIdentified, setIsIdentified] = useState<boolean>(() => {
    try {
      const savedCode = localStorage.getItem('igreja_member_access_code');
      return Boolean(savedCode);
    } catch {
      return false;
    }
  });
  const [codeError, setCodeError] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Active Church & Posts State
  const [currentChurch, setCurrentChurch] = useState<ChurchProfile>(defaultChurchProfile);
  const [currentPosts, setCurrentPosts] = useState<ChurchPost[]>(initialPosts);

  // App Internal Navigation State
  const [activeTab, setActiveTab] = useState<MemberNavTab>('inicio');
  const [selectedPost, setSelectedPost] = useState<ChurchPost | null>(null);
  const [verseIndex, setVerseIndex] = useState(0);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Notifications State & Real-Time Push
  const [notifications, setNotifications] = useState<ChurchNotification[]>([]);
  const [activePushBanner, setActivePushBanner] = useState<ChurchNotification | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('igreja_notification_prefs');
      return saved
        ? JSON.parse(saved)
        : {
            enabled: true,
            eventos: true,
            noticias: true,
            oracoes: true,
            som: true,
          };
    } catch {
      return {
        enabled: true,
        eventos: true,
        noticias: true,
        oracoes: true,
        som: true,
      };
    }
  });

  const lastKnownNotifCountRef = useRef<number | null>(null);

  // Prayer requests state
  const [prayerList, setPrayerList] = useState<PrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem('igreja_prayer_requests');
      return saved ? JSON.parse(saved) : INITIAL_PRAYER_REQUESTS;
    } catch {
      return INITIAL_PRAYER_REQUESTS;
    }
  });

  const [newPrayerName, setNewPrayerName] = useState('');
  const [newPrayerText, setNewPrayerText] = useState('');
  const [newPrayerCategory, setNewPrayerCategory] = useState('Vida Espiritual');
  const [newPrayerContact, setNewPrayerContact] = useState('');
  const [showPrayerSuccess, setShowPrayerSuccess] = useState(false);

  // Sync initial posts & church profile changes
  useEffect(() => {
    if (initialPosts) {
      setCurrentPosts(initialPosts);
    }
  }, [initialPosts]);

  useEffect(() => {
    if (defaultChurchProfile) {
      setCurrentChurch(defaultChurchProfile);
    }
  }, [defaultChurchProfile]);

  // Load prayers from Firestore for this specific church
  useEffect(() => {
    const churchId = currentChurch.idRegistro || defaultChurchProfile.idRegistro;
    if (!churchId) {
      setPrayerList([]);
      return;
    }
    getPrayersFromFirestore(churchId)
      .then((cloudPrayers) => {
        setPrayerList(cloudPrayers || []);
        try {
          localStorage.setItem('igreja_prayer_requests', JSON.stringify(cloudPrayers || []));
        } catch {}
      })
      .catch(() => {
        setPrayerList([]);
      });
  }, [currentChurch.idRegistro, defaultChurchProfile.idRegistro]);

  // Real-time Push Notifications Subscription
  useEffect(() => {
    const churchId = currentChurch.idRegistro || defaultChurchProfile.idRegistro;
    if (!churchId) {
      setNotifications([]);
      return;
    }

    // Initial load
    getNotificationsFromFirestore(churchId).then((initialNotifs) => {
      setNotifications(initialNotifs);
      lastKnownNotifCountRef.current = initialNotifs.length;
    });

    // Real-time listener
    const unsubscribe = listenToNotifications(churchId, (liveNotifs) => {
      setNotifications(liveNotifs);

      // Check if new notification arrived
      if (
        lastKnownNotifCountRef.current !== null &&
        liveNotifs.length > lastKnownNotifCountRef.current
      ) {
        const newest = liveNotifs[0];
        if (newest && notificationPreferences.enabled) {
          // Play sound if configured
          if (notificationPreferences.som) {
            playNotificationChime();
          }

          // Trigger OS Native Notification
          triggerNativeNotification(
            newest.titulo,
            newest.mensagem,
            newest.imagemCapa,
            () => {
              if (newest.postId) {
                const found = currentPosts.find((p) => p.id === newest.postId);
                if (found) setSelectedPost(found);
              }
            }
          );

          // Show floating in-app banner
          setActivePushBanner(newest);
        }
      }
      lastKnownNotifCountRef.current = liveNotifs.length;
    });

    return () => {
      unsubscribe();
    };
  }, [currentChurch.idRegistro, defaultChurchProfile.idRegistro, notificationPreferences.enabled, notificationPreferences.som, currentPosts]);

  // Push Permission Handler
  const handleRequestPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      if (notificationPreferences.som) {
        playNotificationChime();
      }
      triggerNativeNotification(
        `🔔 Notificações Ativadas!`,
        `Você receberá alertas sempre que ${currentChurch.nome || 'a congregação'} publicar novidades e eventos.`
      );
    }
  };

  // Push Notification Preferences update
  const handleUpdatePreferences = (newPrefs: NotificationPreferences) => {
    setNotificationPreferences(newPrefs);
    try {
      localStorage.setItem('igreja_notification_prefs', JSON.stringify(newPrefs));
    } catch {}
  };

  // Send interactive Push Test
  const handleTestNotification = () => {
    const testNotif: ChurchNotification = {
      id: `test-${Date.now()}`,
      igrejaId: currentChurch.idRegistro || '1042',
      titulo: '🔔 Alerta de Teste de Notificação',
      mensagem: `Paz do Senhor! Este é um teste do sistema de notificações em tempo real de ${currentChurch.nome || 'sua congregação'}.`,
      tipo: 'noticia',
      createdAt: new Date().toISOString(),
      autor: currentChurch.pastorPrincipal || 'Liderança',
      lida: false,
    };

    if (notificationPreferences.som) {
      playNotificationChime();
    }
    triggerNativeNotification(
      testNotif.titulo,
      testNotif.mensagem,
      undefined,
      () => setNotificationsOpen(true)
    );
    setActivePushBanner(testNotif);
    setNotifications((prev) => [testNotif, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotificationFromFirestore(id).catch(() => {});
  };

  const handleOpenNotificationPost = (postId: string) => {
    const post = currentPosts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
    }
  };

  // Handle Code Validation
  const handleVerifyCode = async (codeToTest: string) => {
    const cleanCode = codeToTest.trim().toUpperCase();
    if (!cleanCode) return;

    setIsVerifyingCode(true);
    setCodeError(false);

    try {
      // 1. Try Firestore lookup
      const foundChurch = await getChurchFromFirestore(cleanCode);
      if (foundChurch) {
        setCurrentChurch(foundChurch);
        const [churchPosts, churchPrayers] = await Promise.all([
          getPostsFromFirestore(cleanCode),
          getPrayersFromFirestore(cleanCode),
        ]);
        setCurrentPosts(churchPosts || []);
        setPrayerList(churchPrayers || []);
        localStorage.setItem('igreja_member_access_code', cleanCode);
        setIsIdentified(true);
        setIsVerifyingCode(false);
        return;
      }

      // 2. Check current profile idRegistro or fallback test codes
      const currentCode = (defaultChurchProfile.idRegistro || '').toUpperCase();
      if (currentCode && cleanCode === currentCode) {
        const resolvedChurch: ChurchProfile = {
          ...defaultChurchProfile,
          idRegistro: cleanCode,
          nome: defaultChurchProfile.nome || 'Igreja Local',
        };
        setCurrentChurch(resolvedChurch);
        localStorage.setItem('igreja_member_access_code', cleanCode);
        setIsIdentified(true);
        setIsVerifyingCode(false);
        return;
      }

      // If invalid
      setCodeError(true);
      setIsVerifyingCode(false);
    } catch {
      // Fallback allow access
      const resolvedChurch: ChurchProfile = {
        ...defaultChurchProfile,
        idRegistro: cleanCode,
      };
      setCurrentChurch(resolvedChurch);
      localStorage.setItem('igreja_member_access_code', cleanCode);
      setIsIdentified(true);
      setIsVerifyingCode(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode(accessCode);
  };

  // Switch Church / Change Code
  const handleSwitchChurch = () => {
    localStorage.removeItem('igreja_member_access_code');
    setIsIdentified(false);
    setAccessCode('');
    setCodeError(false);
  };

  const carouselPosts = currentPosts.filter((p) => p.destaqueCarrossel);
  const publishedPosts = currentPosts.filter((p) => p.status === 'publicado');
  const eventPosts = currentPosts.filter((p) => p.tipo === 'evento');

  // Banner Carrossel Data Logic (Highlights or Latest Posts)
  const bannerSlides: Array<{
    id: string;
    titulo: string;
    subtitulo?: string;
    imagemCapa: string;
    categoria: string;
    tipo: 'post' | 'evento' | 'institucional';
    dataEvento?: string;
    horarioEvento?: string;
    postRef?: ChurchPost;
  }> = carouselPosts.length > 0
    ? carouselPosts.map((p) => ({
        id: p.id,
        titulo: p.titulo,
        imagemCapa: p.imagemCapa,
        categoria: p.categoria || (p.tipo === 'evento' ? 'Culto / Evento' : 'Destaque'),
        tipo: p.tipo,
        dataEvento: p.dataEvento,
        horarioEvento: p.horarioEvento,
        postRef: p,
      }))
    : publishedPosts.length > 0
    ? publishedPosts.slice(0, 4).map((p) => ({
        id: p.id,
        titulo: p.titulo,
        imagemCapa: p.imagemCapa,
        categoria: p.categoria || (p.tipo === 'evento' ? 'Culto / Evento' : 'Comunicado'),
        tipo: p.tipo,
        dataEvento: p.dataEvento,
        horarioEvento: p.horarioEvento,
        postRef: p,
      }))
    : [];

  // Carousel interactive state
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Keep index valid
  useEffect(() => {
    if (activeSlideIndex >= bannerSlides.length && bannerSlides.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [bannerSlides.length, activeSlideIndex]);

  // Auto-play timer (transitions smoothly every 4.5 seconds)
  useEffect(() => {
    if (bannerSlides.length <= 1 || isCarouselPaused) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [bannerSlides.length, isCarouselPaused]);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveSlideIndex((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveSlideIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 40) {
      handleNextSlide();
    } else if (diff < -40) {
      handlePrevSlide();
    }
    touchStartXRef.current = null;
  };

  const currentVerse = DAILY_VERSES[verseIndex % DAILY_VERSES.length];

  const handleNextVerse = () => {
    setVerseIndex((prev) => (prev + 1) % DAILY_VERSES.length);
  };

  const handleShare = (post: ChurchPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `*${post.titulo}*\n${currentChurch.nome}\n${post.conteudo.slice(0, 120)}...`;
    if (navigator.share) {
      navigator
        .share({
          title: post.titulo,
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${post.titulo} - ${currentChurch.nome}\n${post.conteudo}`);
      setCopiedShareLink(post.id);
      setTimeout(() => setCopiedShareLink(null), 2500);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(currentChurch.chavePix);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleAddPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerText.trim()) return;

    const newReq: PrayerRequest = {
      id: `pr-${Date.now()}`,
      nome: newPrayerName.trim() || 'Membro Anônimo',
      pedido: newPrayerText.trim(),
      categoria: newPrayerCategory,
      contato: newPrayerContact.trim() || undefined,
      igrejaId: currentChurch.idRegistro || defaultChurchProfile.idRegistro || '',
      createdAt: 'Hoje',
      intercessores: 1,
      orado: true,
      status: 'pendente',
    };

    const updated = [newReq, ...prayerList];
    setPrayerList(updated);
    try {
      localStorage.setItem('igreja_prayer_requests', JSON.stringify(updated));
    } catch {}

    savePrayerToFirestore(newReq).catch((err) => {
      console.warn('Erro ao salvar oração no Firestore:', err);
    });

    setNewPrayerName('');
    setNewPrayerText('');
    setNewPrayerContact('');
    setShowPrayerSuccess(true);
    setTimeout(() => setShowPrayerSuccess(false), 3500);
  };

  const handlePrayFor = (reqId: string) => {
    setPrayerList((prev) => {
      const updated = prev.map((pr) => {
        if (pr.id === reqId) {
          const wasOrado = pr.orado;
          const updatedItem = {
            ...pr,
            orado: !wasOrado,
            intercessores: wasOrado ? Math.max(0, pr.intercessores - 1) : pr.intercessores + 1,
          };
          savePrayerToFirestore(updatedItem).catch(() => {});
          return updatedItem;
        }
        return pr;
      });
      try {
        localStorage.setItem('igreja_prayer_requests', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // =========================================================================
  // VISTA 1: TELA DE IDENTIFICAÇÃO / CÓDIGO DA IGREJA (SEM MOLDURA DE CELULAR)
  // =========================================================================
  if (!isIdentified) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-600 selection:text-white">
        {/* Barra superior */}
        <header className="w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 z-20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">App dos Membros</span>
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL DE IDENTIFICAÇÃO */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            {/* TEXTO DE ENTRADA */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
                ⛪
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Encontre sua Igreja</h1>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                Insira o código fornecido pela sua congregação local para acessar os avisos, cultos e notícias dela.
              </p>
            </div>

            {/* FORMULÁRIO DO CÓDIGO */}
            <div className="space-y-6 my-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="codigo-igreja"
                    className="block text-center text-xs font-bold text-indigo-950 uppercase tracking-widest mb-2.5"
                  >
                    Código de Acesso Local
                  </label>
                  {/* Input estilizado com letras maiúsculas automáticas */}
                  <input
                    type="text"
                    id="codigo-igreja"
                    required
                    placeholder="Ex: AD-7041"
                    maxLength={8}
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value.toUpperCase());
                      setCodeError(false);
                    }}
                    className="w-full text-center text-2xl sm:text-3xl font-bold tracking-widest uppercase py-3.5 border-2 border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition bg-white text-indigo-950 placeholder:text-gray-400 shadow-xs"
                  />
                  {codeError && (
                    <span
                      id="erro-codigo"
                      className="text-xs text-red-500 text-center block mt-2 font-medium"
                    >
                      ⚠️ Código não encontrado. Verifique e tente novamente.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-4 rounded-2xl text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isVerifyingCode ? 'Conectando...' : 'Acessar Minha Igreja'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sugestão Rápida para Testes */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const testCode = defaultChurchProfile.idRegistro || 'AD-7041';
                    setAccessCode(testCode);
                    handleVerifyCode(testCode);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                >
                  Usar código da minha igreja atual: #{defaultChurchProfile.idRegistro || '1042'}
                </button>
              </div>

              {/* DIVISOR VISUAL */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">OU</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* BOTAO LEITOR DE QR CODE */}
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-2xl text-xs transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>Escanear QR Code da Igreja</span>
              </button>
            </div>

            {/* NOTA EXPLICATIVA INFERIOR */}
            <div className="text-center bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 leading-normal">
                <strong>Não sabe o código?</strong> Pergunte à equipe de mídia, secretaria ou ao pastor responsável pela sua congregação.
              </p>
            </div>
          </div>
        </main>

        {/* MODAL SIMULADOR DE SCANNER QR CODE */}
        {isQrScannerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white text-center space-y-4 shadow-2xl relative">
              <button
                onClick={() => setIsQrScannerOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold">Leitor de QR Code</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Aponte a câmera para a placa ou folheto com o QR Code da sua igreja.
                </p>
              </div>

              {/* Viewfinder Simulado com laser animado */}
              <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center bg-black/40 overflow-hidden">
                <QrCode className="w-24 h-24 text-slate-600 opacity-40" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-400 shadow-md shadow-indigo-400/80 animate-pulse" />
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[11px] text-slate-400">Simular leitura automática:</p>
                <button
                  type="button"
                  onClick={() => {
                    const sampleCode = defaultChurchProfile.idRegistro || 'AD-7041';
                    setIsQrScannerOpen(false);
                    setAccessCode(sampleCode);
                    handleVerifyCode(sampleCode);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Conectar: {defaultChurchProfile.nome || 'Igreja Local'} (#{defaultChurchProfile.idRegistro || '1042'})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: APLICATIVO DO MEMBRO COM CONTEÚDO DA IGREJA SELECIONADA (SEM MOLDURA)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* 1. TOPO DO APLICATIVO (HEADER RESPONSIVO) */}
      <header className="sticky top-0 z-30 bg-indigo-900 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo Dinâmica da Igreja Selecionada */}
            <div className="w-10 h-10 bg-white text-indigo-950 font-bold rounded-2xl flex items-center justify-center text-xl shadow-sm shrink-0">
              ⛪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg leading-tight truncate max-w-[180px] sm:max-w-sm">
                  {currentChurch.nome}
                </h1>
                <span className="px-2 py-0.5 bg-indigo-800 text-indigo-200 font-mono text-[10px] rounded font-semibold shrink-0">
                  #{currentChurch.idRegistro || '1042'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>
                  {currentChurch.cidade || 'Sede'} - {currentChurch.estado || 'BR'}
                </span>
              </p>
            </div>
          </div>

          {/* Ações Rápidas no Header */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="w-10 h-10 bg-indigo-800 hover:bg-indigo-700 active:scale-95 rounded-xl flex items-center justify-center transition relative cursor-pointer shadow-xs"
              aria-label="Notificações"
              title="Central de Notificações"
            >
              {notifications.some((n) => !n.lida) ? (
                <BellRing className="w-5 h-5 text-amber-300 animate-[wiggle_1s_ease-in-out_infinite]" />
              ) : (
                <Bell className="w-5 h-5 text-white" />
              )}
              {notifications.filter((n) => !n.lida).length > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-amber-400 text-indigo-950 font-bold text-[10px] rounded-full absolute -top-1 -right-1 flex items-center justify-center shadow-xs">
                  {notifications.filter((n) => !n.lida).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (LAYOUT RESPONSIVO FLUIDO) */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {/* ABA 1: INÍCIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            {/* VERSÍCULO DO DIA (ENGAJAMENTO) */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-start space-x-3.5 relative group shadow-xs">
              <span className="text-2xl shrink-0">📖</span>
              <div className="flex-1 pr-8">
                <p className="text-xs sm:text-sm italic text-gray-700 leading-relaxed">
                  {currentVerse.texto}
                </p>
                <span className="text-[11px] font-bold text-indigo-600 block mt-1.5">
                  {currentVerse.referencia}
                </span>
              </div>
              <button
                onClick={handleNextVerse}
                className="absolute top-3.5 right-3.5 text-indigo-400 hover:text-indigo-700 p-1 transition cursor-pointer"
                title="Próximo versículo edificante"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* 2. BANNER CARROSSEL INTERATIVO */}
            {bannerSlides.length > 0 && (
              <section className="space-y-2.5">
                {/* Topo da Seção de Destaques */}
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Destaques &amp; Avisos
                    </h2>
                  </div>
                  {bannerSlides.length > 1 && (
                    <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-semibold">
                      {activeSlideIndex + 1}/{bannerSlides.length}
                    </span>
                  )}
                </div>

                {/* Container do Banner Carrossel */}
                <div
                  className="relative rounded-2xl overflow-hidden shadow-md bg-slate-950 group border border-gray-200"
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Trilho de Slides com Transição Suave */}
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
                  >
                    {bannerSlides.map((slide, idx) => (
                      <div
                        key={slide.id || idx}
                        onClick={() => {
                          if (slide.postRef) {
                            setSelectedPost(slide.postRef);
                          } else if (slide.categoria === 'Oração') {
                            setActiveTab('oracao');
                          } else if (slide.categoria === 'Programação') {
                            setActiveTab('agenda');
                          }
                        }}
                        className="w-full flex-shrink-0 relative h-52 sm:h-64 cursor-pointer overflow-hidden"
                      >
                        <img
                          src={slide.imagemCapa}
                          alt={slide.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />

                        {/* Gradiente Escuro Protetor para Legibilidade */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 p-5 sm:p-6 flex flex-col justify-between">
                          {/* Tags e Badges Superiores */}
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-slate-950" />
                              {slide.categoria}
                            </span>

                            {slide.tipo === 'evento' && (
                              <span className="px-2.5 py-0.5 bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                                📅 Culto Especial
                              </span>
                            )}
                          </div>

                          {/* Título e Detalhes Inferiores */}
                          <div className="space-y-1">
                            <h3 className="text-white font-bold text-base sm:text-lg leading-snug line-clamp-2 drop-shadow-xs">
                              {slide.titulo}
                            </h3>

                            {slide.subtitulo && (
                              <p className="text-xs text-gray-200 line-clamp-1">
                                {slide.subtitulo}
                              </p>
                            )}

                            {slide.tipo === 'evento' && slide.dataEvento && (
                              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 pt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                <span>
                                  {new Date(slide.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} • {slide.horarioEvento || '19:30'}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botões de Navegação Anterior / Próximo (Desktop/Tablet & Hover) */}
                  {bannerSlides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        aria-label="Slide Anterior"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/75 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-10 border border-white/20 active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        aria-label="Próximo Slide"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/75 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-10 border border-white/20 active:scale-95"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Indicadores / Bolinhas do Carrossel */}
                  {bannerSlides.length > 1 && (
                    <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10">
                      {bannerSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlideIndex(idx);
                          }}
                          aria-label={`Ir para slide ${idx + 1}`}
                          className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                            activeSlideIndex === idx
                              ? 'w-6 bg-amber-400 shadow-xs'
                              : 'w-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. FEED DE NOTÍCIAS E EVENTOS EM CARDS */}
            <section className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider px-1">
                Últimas Atualizações
              </h2>

              {publishedPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl mx-auto">
                    ✝️
                  </div>
                  <h3 className="font-bold text-sm text-gray-800">Tudo calmo por aqui</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    A congregação ainda não publicou novidades nesta semana. Volte em breve para novos avisos!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {publishedPosts.map((post) => {
                    const isEvent = post.tipo === 'evento';
                    const isLiked = likedPosts[post.id];

                    return (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md hover:border-indigo-200 transition group"
                      >
                        <div className="relative h-40 overflow-hidden bg-gray-100">
                          <img
                            src={post.imagemCapa}
                            alt={post.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {post.destaqueCarrossel && (
                            <span className="absolute top-2 right-2 px-2.5 py-0.5 bg-amber-500/90 text-white text-[10px] font-bold rounded-full uppercase backdrop-blur-xs shadow-xs">
                              ⭐ Em Destaque
                            </span>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              {isEvent ? (
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                  📅 Culto / Agenda
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                  📰 Comunicado
                                </span>
                              )}

                              {isEvent && post.dataEvento ? (
                                <span className="text-xs font-semibold text-indigo-600">
                                  {new Date(post.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} às {post.horarioEvento}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {post.createdAt}
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-gray-900 text-base leading-snug group-hover:text-indigo-900 transition">
                              {post.titulo}
                            </h4>

                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {post.conteudo}
                            </p>
                          </div>

                          {/* Ações rápidas do Card */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-gray-500">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onLikePost(post.id);
                              }}
                              className={`flex items-center text-xs font-medium transition cursor-pointer ${
                                isLiked ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 mr-1 ${isLiked ? 'fill-red-500' : ''}`} />
                              <span>{(post.likes || 0) + (isLiked ? 1 : 0)} curtidas</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleShare(post, e)}
                              className="flex items-center text-xs text-emerald-600 font-medium hover:text-emerald-700 transition cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 mr-1" />
                              <span>{copiedShareLink === post.id ? 'Copiado!' : 'Compartilhar'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

          {/* ABA 2: AGENDA DE CULTOS E EVENTOS */}
          {activeTab === 'agenda' && (
            <div className="p-5 space-y-5">
              <div>
                <h2 className="text-base font-bold text-gray-800 leading-tight">
                  Programação &amp; Agenda Semanal
                </h2>
                <p className="text-xs text-gray-500">
                  Horários dos cultos e encontros da {currentChurch.nome}
                </p>
              </div>

              {/* Cultos Fixos da Semana */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" /> Cultos Regulares
                </h3>
                <div className="divide-y divide-gray-100">
                  {currentChurch.horariosCultos?.length > 0 ? (
                    currentChurch.horariosCultos.map((culto, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800">{culto.titulo}</p>
                          <p className="text-[11px] text-gray-500">{culto.dia}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold rounded-lg">
                          {culto.horario}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-gray-400">
                      Consulte a liderança para os horários semanais.
                    </div>
                  )}
                </div>
              </div>

              {/* Próximos Eventos Cadastrados */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Eventos Especiais Agendados
                </h3>
                {eventPosts.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                    Nenhum evento especial agendado no momento.
                  </div>
                ) : (
                  eventPosts.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedPost(ev)}
                      className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-3 cursor-pointer hover:border-indigo-400 transition"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold uppercase">
                          {ev.dataEvento ? new Date(ev.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }) : 'CULTO'}
                        </span>
                        <span className="text-sm font-black">
                          {ev.dataEvento ? new Date(ev.dataEvento + 'T00:00:00').getDate() : '—'}
                        </span>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-xs text-gray-800 truncate">{ev.titulo}</h4>
                        <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                          {ev.horarioEvento} • {ev.localEvento || 'Templo'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABA 3: PEDIDOS DE ORAÇÃO & INTERCESSÃO */}
          {activeTab === 'oracao' && (
            <div className="p-5 space-y-5">
              <div>
                <h2 className="text-base font-bold text-gray-800 leading-tight">
                  Mural de Clamor &amp; Oração
                </h2>
                <p className="text-xs text-gray-500">
                  "Orai uns pelos outros para serdes curados." (Tiago 5:16)
                </p>
              </div>

              {/* Form de Envio de Pedido */}
              <form
                onSubmit={handleAddPrayer}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3"
              >
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Deixe seu Pedido de Oração
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newPrayerName}
                    onChange={(e) => setNewPrayerName(e.target.value)}
                    placeholder="Seu nome (ou em branco para anônimo)"
                    className="w-full px-3 py-2 text-xs bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <select
                    value={newPrayerCategory}
                    onChange={(e) => setNewPrayerCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Vida Espiritual">Vida Espiritual</option>
                    <option value="Saúde & Cura">Saúde &amp; Cura</option>
                    <option value="Família & Casamento">Família &amp; Casamento</option>
                    <option value="Financeiro & Trabalho">Financeiro &amp; Trabalho</option>
                    <option value="Libertação">Libertação</option>
                    <option value="Gratidão & Louvor">Gratidão &amp; Louvor</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <textarea
                    rows={3}
                    required
                    value={newPrayerText}
                    onChange={(e) => setNewPrayerText(e.target.value)}
                    placeholder="Descreva seu motivo de oração ou agradecimento..."
                    className="w-full px-3 py-2 text-xs bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {showPrayerSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seu pedido foi incluído no clamor e enviado à liderança da igreja!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Pedido ao Ministério de Oração</span>
                </button>
              </form>

              {/* Lista de Pedidos da Comunidade */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Pedidos Recentes da Família da Fé
                </h3>

                {prayerList.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                    Seja o primeiro a compartilhar um pedido de oração ou motivo de gratidão!
                  </div>
                ) : (
                  prayerList.map((pr) => (
                    <div
                      key={pr.id}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{pr.nome}</span>
                          {pr.categoria && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {pr.categoria}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">{pr.createdAt}</span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        "{pr.pedido}"
                      </p>

                      {/* Resposta Pastoral se houver */}
                      {pr.respostaPastoral && (
                        <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-900 space-y-1">
                          <p className="font-semibold text-[11px] flex items-center gap-1">
                            <span>⛪</span> Palavra da Liderança Pastoral:
                          </p>
                          <p className="text-[11px] text-gray-700">{pr.respostaPastoral}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-indigo-600 font-medium">
                          🙏 {pr.intercessores} irmãos orando
                        </span>

                        <button
                          onClick={() => handlePrayFor(pr.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                            pr.orado
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {pr.orado ? '✓ Estou orando' : '🙏 Orar por este pedido'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABA 4: PERFIL & DÍZIMOS PIX */}
          {activeTab === 'perfil' && (
            <div className="p-5 space-y-5">
              {/* Church Card */}
              <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl text-center space-y-3 shadow-md">
                <div className="w-14 h-14 bg-white text-indigo-900 rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-inner">
                  ⛪
                </div>
                <div>
                  <h3 className="font-bold text-base">{currentChurch.nome}</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Liderança: {currentChurch.pastorPrincipal || 'Pastorado Local'}
                  </p>
                  <p className="font-mono text-[11px] text-amber-300 mt-1">
                    Código de Acesso: #{currentChurch.idRegistro || '1042'}
                  </p>
                </div>
                <div className="text-[11px] text-indigo-300 bg-indigo-950/60 py-2 px-3 rounded-lg border border-indigo-800">
                  <p>{currentChurch.endereco || 'Endereço da congregação'}</p>
                  <p>{currentChurch.cidade} - {currentChurch.estado}</p>
                  {currentChurch.telefone && (
                    <p className="mt-1 font-mono text-indigo-400">Tel: {currentChurch.telefone}</p>
                  )}
                </div>
              </div>

              {/* Dízimos & Ofertas PIX */}
              {currentChurch.chavePix && (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                    <span>💰</span>
                    <h4>Dízimos &amp; Ofertas (PIX)</h4>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria." (2 Co 9:7)
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-300 flex items-center justify-between">
                    <div className="overflow-hidden pr-2">
                      <span className="text-[10px] text-gray-400 block uppercase font-semibold">Chave PIX Oficial</span>
                      <span className="text-xs font-mono text-gray-800 font-bold truncate block">
                        {currentChurch.chavePix}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyPix}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Central de Notificações Push & Alertas */}
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-200 p-4 sm:p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                        Alertas &amp; Notificações Push
                      </h4>
                      <p className="text-[11px] text-indigo-700">
                        Receba eventos e notícias em tempo real
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      browserPermission === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : browserPermission === 'denied'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {browserPermission === 'granted'
                      ? '✓ Ativo'
                      : browserPermission === 'denied'
                      ? '✕ Bloqueado'
                      : 'Pendente'}
                  </span>
                </div>

                <p className="text-xs text-indigo-900 leading-relaxed">
                  Fique por dentro de tudo o que acontece na {currentChurch.nome}: cultos especiais, avisos pastorais, orações e eventos.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {browserPermission !== 'granted' && (
                    <button
                      onClick={handleRequestPermission}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Ativar no Celular/Navegador</span>
                    </button>
                  )}

                  <button
                    onClick={handleTestNotification}
                    className="px-3 py-2 bg-white hover:bg-indigo-50 active:scale-95 text-indigo-700 border border-indigo-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Testar Notificação Agora</span>
                  </button>

                  <button
                    onClick={() => setNotificationsOpen(true)}
                    className="px-3 py-2 bg-indigo-100/80 hover:bg-indigo-200 active:scale-95 text-indigo-900 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Configurar ({notifications.length})</span>
                  </button>
                </div>
              </div>

              {/* Redes Sociais */}
              {(currentChurch.instagram || currentChurch.youtube) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Nossos Canais Oficiais
                  </h4>
                  <div className="space-y-2 text-xs">
                    {currentChurch.instagram && (
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-600">Instagram</span>
                        <span className="font-semibold text-indigo-600">{currentChurch.instagram}</span>
                      </div>
                    )}
                    {currentChurch.youtube && (
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-gray-600">YouTube</span>
                        <span className="font-semibold text-indigo-600">{currentChurch.youtube}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ações de Acesso */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={onSwitchPortal}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-gray-300 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-gray-600" />
                  <span>Sair do Aplicativo</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 4. BARRA DE NAVEGAÇÃO INFERIOR FIXA */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2.5 z-30 shadow-lg">
          <div className="max-w-4xl mx-auto px-6 flex justify-around items-center">
            <button
              onClick={() => setActiveTab('inicio')}
              className={`flex flex-col items-center space-y-1 cursor-pointer transition px-3 py-1 rounded-xl ${
                activeTab === 'inicio' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-indigo-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[11px]">Início</span>
            </button>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex flex-col items-center space-y-1 cursor-pointer transition px-3 py-1 rounded-xl ${
                activeTab === 'agenda' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-indigo-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[11px]">Agenda</span>
            </button>
            <button
              onClick={() => setActiveTab('oracao')}
              className={`flex flex-col items-center space-y-1 cursor-pointer transition px-3 py-1 rounded-xl ${
                activeTab === 'oracao' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-indigo-600'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[11px]">Oração</span>
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex flex-col items-center space-y-1 cursor-pointer transition px-3 py-1 rounded-xl ${
                activeTab === 'perfil' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-indigo-600'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[11px]">Perfil</span>
            </button>
          </div>
        </nav>

        {/* MODAL DE DETALHE DA NOTÍCIA / EVENTO */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
              <div className="relative rounded-2xl overflow-hidden h-52 bg-gray-100">
                <img
                  src={selectedPost.imagemCapa}
                  alt={selectedPost.titulo}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-2.5 right-2.5 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {selectedPost.categoria || (selectedPost.tipo === 'evento' ? 'Evento' : 'Notícia')}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {selectedPost.createdAt}
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-900 leading-snug">
                {selectedPost.titulo}
              </h3>

              {selectedPost.tipo === 'evento' && selectedPost.dataEvento && (
                <div className="p-3.5 bg-indigo-50 rounded-2xl text-xs text-indigo-900 space-y-1.5 border border-indigo-100">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>
                      {new Date(selectedPost.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} • {selectedPost.horarioEvento}
                    </span>
                  </div>
                  {selectedPost.localEvento && (
                    <div className="flex items-center gap-2 text-indigo-700 text-xs">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span>{selectedPost.localEvento}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {selectedPost.conteudo}
              </p>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={(e) => handleShare(selectedPost, e)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedShareLink === selectedPost.id ? 'Link Copiado!' : 'Compartilhar'}</span>
                </button>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer shadow-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DA CENTRAL DE NOTIFICAÇÕES PUSH */}
        <NotificationCenterModal
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteNotification={handleDeleteNotification}
          onOpenPost={handleOpenNotificationPost}
          onSendTestNotification={handleTestNotification}
          churchName={currentChurch.nome}
          preferences={notificationPreferences}
          onUpdatePreferences={handleUpdatePreferences}
          browserPermission={browserPermission}
          onRequestBrowserPermission={handleRequestPermission}
        />

        {/* FLOATING IN-APP PUSH BANNER (NOTIFICAÇÃO FLUTUANTE INSTANTÂNEA) */}
        <InAppPushBanner
          notification={activePushBanner}
          onDismiss={() => setActivePushBanner(null)}
          onOpen={(notif) => {
            if (notif.postId) {
              handleOpenNotificationPost(notif.postId);
            } else {
              setNotificationsOpen(true);
            }
          }}
        />
      </div>
    );
  };

