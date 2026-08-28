import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PublishPostView } from './components/PublishPostView';
import { DashboardView } from './components/DashboardView';
import { ManagePostsView } from './components/ManagePostsView';
import { ChurchProfileView } from './components/ChurchProfileView';
import { PrayersManagementView } from './components/PrayersManagementView';
import { AppSimulatorModal } from './components/AppSimulatorModal';
import { MemberAppView } from './components/MemberAppView';
import { PortalAccessSelector } from './components/PortalAccessSelector';
import { INITIAL_POSTS, INITIAL_CHURCH_PROFILE } from './data/initialPosts';
import { INITIAL_PRAYER_REQUESTS } from './data/initialPrayerRequests';
import { NavTab, ChurchPost, ChurchProfile, AppPortal, PrayerRequest, ChurchNotification } from './types';
import {
  saveChurchToFirestore,
  getChurchFromFirestore,
  savePostToFirestore,
  deletePostFromFirestore,
  getPostsFromFirestore,
  savePrayerToFirestore,
  deletePrayerFromFirestore,
  getPrayersFromFirestore,
  saveNotificationToFirestore,
  playNotificationChime,
  triggerNativeNotification,
} from './lib/firestoreService';
import { CheckCircle2, X, Smartphone, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function App() {
  // Active Portal: 'portal-selector' | 'admin-panel' | 'member-app'
  const [currentPortal, setCurrentPortal] = useState<AppPortal>(() => {
    try {
      const saved = localStorage.getItem('igreja_active_portal');
      return (saved as AppPortal) || 'portal-selector';
    } catch {
      return 'portal-selector';
    }
  });

  // Navigation inside Admin Panel: default to 'publicar'
  const [currentTab, setCurrentTab] = useState<NavTab>('publicar');

  // Stored Posts (Live from Firestore & cache)
  const [posts, setPosts] = useState<ChurchPost[]>(() => {
    try {
      const saved = localStorage.getItem('igreja_portal_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  // Stored Church Profile (Live from Firestore & cache)
  const [churchProfile, setChurchProfile] = useState<ChurchProfile>(() => {
    try {
      const saved = localStorage.getItem('igreja_portal_profile');
      return saved ? JSON.parse(saved) : INITIAL_CHURCH_PROFILE;
    } catch {
      return INITIAL_CHURCH_PROFILE;
    }
  });

  // Stored Prayer Requests (Live from Firestore & cache)
  const [prayers, setPrayers] = useState<PrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem('igreja_prayer_requests');
      return saved ? JSON.parse(saved) : INITIAL_PRAYER_REQUESTS;
    } catch {
      return INITIAL_PRAYER_REQUESTS;
    }
  });

  // Member App Liked Posts
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('igreja_member_likes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAppSimulatorOpen, setIsAppSimulatorOpen] = useState(false);
  const [simulatorPreviewPost, setSimulatorPreviewPost] = useState<Partial<ChurchPost> | null>(null);
  const [globalToast, setGlobalToast] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);

  // Load live Firestore data when churchId changes or on portal switch
  useEffect(() => {
    const fetchFirestoreData = async () => {
      const churchId = churchProfile.idRegistro;
      if (!churchId) {
        setPosts([]);
        setPrayers([]);
        return;
      }

      setIsLoadingFirestore(true);
      try {
        const [cloudPosts, cloudChurch, cloudPrayers] = await Promise.all([
          getPostsFromFirestore(churchId),
          getChurchFromFirestore(churchId),
          getPrayersFromFirestore(churchId),
        ]);

        setPosts(cloudPosts || []);
        try {
          localStorage.setItem('igreja_portal_posts', JSON.stringify(cloudPosts || []));
        } catch {}

        if (cloudChurch) {
          setChurchProfile(cloudChurch);
          try {
            localStorage.setItem('igreja_portal_profile', JSON.stringify(cloudChurch));
          } catch {}
        }

        setPrayers(cloudPrayers || []);
        try {
          localStorage.setItem('igreja_prayer_requests', JSON.stringify(cloudPrayers || []));
        } catch {}
      } catch (err) {
        console.warn('Firestore live fetch fallback to local storage cache:', err);
      } finally {
        setIsLoadingFirestore(false);
      }
    };

    fetchFirestoreData();
  }, [churchProfile.idRegistro, currentPortal]);

  // Sync state with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('igreja_active_portal', currentPortal);
    } catch {}
  }, [currentPortal]);

  useEffect(() => {
    try {
      localStorage.setItem('igreja_portal_posts', JSON.stringify(posts));
    } catch (e) {
      console.error('Falha ao salvar postagens:', e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('igreja_portal_profile', JSON.stringify(churchProfile));
    } catch (e) {
      console.error('Falha ao salvar perfil:', e);
    }
  }, [churchProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('igreja_prayer_requests', JSON.stringify(prayers));
    } catch (e) {
      console.error('Falha ao salvar orações:', e);
    }
  }, [prayers]);

  useEffect(() => {
    try {
      localStorage.setItem('igreja_member_likes', JSON.stringify(likedPosts));
    } catch {}
  }, [likedPosts]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setGlobalToast({ text, type });
    setTimeout(() => setGlobalToast(null), 4000);
  };

  // Prayer handlers for leadership
  const handlePrayForRequest = async (prayerId: string) => {
    let updatedItem: PrayerRequest | null = null;
    setPrayers((prev) =>
      prev.map((pr) => {
        if (pr.id === prayerId) {
          const wasOrado = pr.orado;
          updatedItem = {
            ...pr,
            orado: true,
            status: pr.status === 'atendido' ? 'atendido' : 'em_oracao',
            intercessores: (pr.intercessores || 0) + 1,
          };
          return updatedItem;
        }
        return pr;
      })
    );

    showToast('Oração pastoral registrada com sucesso! Intercedendo pelo irmão(ã).', 'success');

    if (updatedItem) {
      try {
        await savePrayerToFirestore(updatedItem);
      } catch (err) {
        console.error('Erro ao salvar oração:', err);
      }
    }
  };

  const handleDeletePrayer = async (prayerId: string) => {
    setPrayers((prev) => prev.filter((pr) => pr.id !== prayerId));
    showToast('Pedido de oração removido.', 'info');

    try {
      await deletePrayerFromFirestore(prayerId);
    } catch (err) {
      console.error('Erro ao remover oração do Firestore:', err);
    }
  };

  const handleRespondPrayer = async (
    prayerId: string,
    resposta: string,
    novoStatus?: 'pendente' | 'em_oracao' | 'atendido'
  ) => {
    let updatedItem: PrayerRequest | null = null;
    const dataHora = new Date().toLocaleDateString('pt-BR');

    setPrayers((prev) =>
      prev.map((pr) => {
        if (pr.id === prayerId) {
          updatedItem = {
            ...pr,
            respostaPastoral: resposta,
            dataResposta: dataHora,
            status: novoStatus || pr.status || 'em_oracao',
            orado: true,
          };
          return updatedItem;
        }
        return pr;
      })
    );

    showToast('Acompanhamento pastoral registrado com sucesso!', 'success');

    if (updatedItem) {
      try {
        await savePrayerToFirestore(updatedItem);
      } catch (err) {
        console.error('Erro ao salvar resposta pastoral:', err);
      }
    }
  };

  const handleAddNewPrayerAdmin = async (
    newPrayerData: Omit<PrayerRequest, 'id' | 'createdAt' | 'intercessores'>
  ) => {
    const newReq: PrayerRequest = {
      ...newPrayerData,
      id: `pr-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      intercessores: 1,
      orado: true,
      status: newPrayerData.status || 'em_oracao',
    };

    setPrayers((prev) => [newReq, ...prev]);
    showToast('Novo pedido de oração cadastrado no mural da igreja!', 'success');

    try {
      await savePrayerToFirestore(newReq);
    } catch (err) {
      console.error('Erro ao salvar oração:', err);
    }
  };

  // Handler for publishing a new post
  const handlePublishPost = async (
    newPostData: Omit<ChurchPost, 'id' | 'createdAt' | 'visualizacoes' | 'likes'>,
    options?: { sendPushNotification: boolean }
  ) => {
    const newPost: ChurchPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      visualizacoes: 1,
      likes: 0,
    };

    // Update locally first for instant UI response
    setPosts((prev) => [newPost, ...prev]);

    const shouldSendPush = options?.sendPushNotification ?? true;

    showToast(
      `${newPost.tipo === 'evento' ? 'Evento' : 'Notícia'} "${newPost.titulo}" publicado com sucesso!${
        shouldSendPush ? ' 🔔 Alerta push enviado aos membros.' : ''
      }`,
      'success'
    );
    setCurrentTab('postagens');

    // Async persist to Firestore
    try {
      await savePostToFirestore(newPost);

      // Create Push Notification in Firestore if enabled
      if (shouldSendPush) {
        const notifTitle =
          newPost.tipo === 'evento'
            ? `📅 Novo Evento: ${newPost.titulo}`
            : `📢 Nova Notícia: ${newPost.titulo}`;

        const notifBody =
          newPost.tipo === 'evento' && newPost.dataEvento
            ? `${newPost.conteudo.slice(0, 110)}... Data: ${new Date(newPost.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} às ${newPost.horarioEvento || '19:30'}`
            : `${newPost.conteudo.slice(0, 130)}...`;

        const newNotification: ChurchNotification = {
          id: `notif-${Date.now()}`,
          igrejaId: newPost.igrejaId || churchProfile.idRegistro || '',
          titulo: notifTitle,
          mensagem: notifBody,
          tipo: newPost.tipo,
          postId: newPost.id,
          imagemCapa: newPost.imagemCapa,
          createdAt: new Date().toISOString(),
          autor: newPost.autor,
          dataEvento: newPost.dataEvento,
          horarioEvento: newPost.horarioEvento,
          localEvento: newPost.localEvento,
          lida: false,
        };

        await saveNotificationToFirestore(newNotification);
        playNotificationChime();
        triggerNativeNotification(notifTitle, notifBody, newPost.imagemCapa);
      }
    } catch (err) {
      console.error('Erro ao sincronizar publicação ou notificação com Firestore:', err);
    }
  };

  // Toggle Highlight in carousel
  const handleToggleHighlight = async (postId: string) => {
    let updatedPost: ChurchPost | null = null;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextState = !p.destaqueCarrossel;
          updatedPost = { ...p, destaqueCarrossel: nextState };
          showToast(
            nextState
              ? `"${p.titulo}" foi adicionado aos banners de destaque do App.`
              : `"${p.titulo}" foi removido dos destaques do carrossel.`,
            'info'
          );
          return updatedPost;
        }
        return p;
      })
    );

    if (updatedPost) {
      try {
        await savePostToFirestore(updatedPost);
      } catch (err) {
        console.error('Erro ao atualizar destaque no Firestore:', err);
      }
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Publicação removida com sucesso.', 'info');

    try {
      await deletePostFromFirestore(postId);
    } catch (err) {
      console.error('Erro ao excluir do Firestore:', err);
    }
  };

  // Save Church Profile
  const handleSaveProfile = async (updated: ChurchProfile) => {
    setChurchProfile(updated);
    showToast('Perfil institucional da igreja salvo com sucesso!', 'success');

    try {
      await saveChurchToFirestore(updated);
    } catch (err) {
      console.error('Erro ao sincronizar perfil da igreja com Firestore:', err);
    }
  };

  // Like a post from Member view
  const handleLikePost = (postId: string) => {
    const isCurrentlyLiked = !!likedPosts[postId];
    const nextLiked = !isCurrentlyLiked;

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: nextLiked,
    }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedLikes = Math.max(0, (p.likes || 0) + (nextLiked ? 1 : -1));
          const postWithLike = { ...p, likes: updatedLikes };
          savePostToFirestore(postWithLike).catch(() => {});
          return postWithLike;
        }
        return p;
      })
    );
  };

  // Open simulator with preview
  const handleOpenSimulatorWithPreview = (tempPost?: Partial<ChurchPost>) => {
    setSimulatorPreviewPost(tempPost || null);
    setIsAppSimulatorOpen(true);
  };

  // Handlers para carregar congregação específica ao entrar
  const handleSelectMemberPortal = async (selectedChurchId?: string) => {
    const targetId =
      selectedChurchId ||
      localStorage.getItem('igreja_member_access_code') ||
      churchProfile.idRegistro ||
      '';

    if (targetId) {
      setIsLoadingFirestore(true);
      try {
        const [cloudChurch, cloudPosts, cloudPrayers] = await Promise.all([
          getChurchFromFirestore(targetId),
          getPostsFromFirestore(targetId),
          getPrayersFromFirestore(targetId),
        ]);

        if (cloudChurch) {
          setChurchProfile(cloudChurch);
          try {
            localStorage.setItem('igreja_portal_profile', JSON.stringify(cloudChurch));
          } catch {}
        }

        setPosts(cloudPosts || []);
        try {
          localStorage.setItem('igreja_portal_posts', JSON.stringify(cloudPosts || []));
        } catch {}

        setPrayers(cloudPrayers || []);
        try {
          localStorage.setItem('igreja_prayer_requests', JSON.stringify(cloudPrayers || []));
        } catch {}
      } catch (err) {
        console.warn('Erro ao carregar congregação:', err);
      } finally {
        setIsLoadingFirestore(false);
      }
    } else {
      setPosts([]);
      setPrayers([]);
    }

    setCurrentPortal('member-app');
  };

  const handleSelectAdminPortal = async (selectedChurchId?: string) => {
    const targetId = selectedChurchId || churchProfile.idRegistro || '';

    if (targetId) {
      setIsLoadingFirestore(true);
      try {
        const [cloudChurch, cloudPosts, cloudPrayers] = await Promise.all([
          getChurchFromFirestore(targetId),
          getPostsFromFirestore(targetId),
          getPrayersFromFirestore(targetId),
        ]);

        if (cloudChurch) {
          setChurchProfile(cloudChurch);
          try {
            localStorage.setItem('igreja_portal_profile', JSON.stringify(cloudChurch));
          } catch {}
        }

        setPosts(cloudPosts || []);
        try {
          localStorage.setItem('igreja_portal_posts', JSON.stringify(cloudPosts || []));
        } catch {}

        setPrayers(cloudPrayers || []);
        try {
          localStorage.setItem('igreja_prayer_requests', JSON.stringify(cloudPrayers || []));
        } catch {}
      } catch (err) {
        console.warn('Erro ao carregar dados do admin:', err);
      } finally {
        setIsLoadingFirestore(false);
      }
    } else {
      setPosts([]);
      setPrayers([]);
    }

    setCurrentPortal('admin-panel');
  };

  // RENDER PORTAL SELETOR
  if (currentPortal === 'portal-selector') {
    return (
      <PortalAccessSelector
        churchProfile={churchProfile}
        onSelectAdmin={handleSelectAdminPortal}
        onSelectMember={handleSelectMemberPortal}
        onRegisterChurch={(newProf) => {
          setChurchProfile(newProf);
          setPosts([]);
          setPrayers([]);
          try {
            localStorage.setItem('igreja_profile_data', JSON.stringify(newProf));
            localStorage.setItem('igreja_portal_profile', JSON.stringify(newProf));
            localStorage.setItem('igreja_portal_posts', JSON.stringify([]));
            localStorage.setItem('igreja_prayer_requests', JSON.stringify([]));
          } catch {}
        }}
      />
    );
  }

  // RENDER PAINEL 2: APLICATIVO DA IGREJA (VISÃO DO MEMBRO)
  if (currentPortal === 'member-app') {
    return (
      <MemberAppView
        posts={posts}
        churchProfile={churchProfile}
        onSwitchPortal={() => setCurrentPortal('portal-selector')}
        onLikePost={handleLikePost}
        likedPosts={likedPosts}
      />
    );
  }

  // RENDER PAINEL 1: PAINEL ADMINISTRATIVO (LIDERANÇA)
  return (
    <div className="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* 1. BARRA LATERAL DE NAVEGAÇÃO (SIDEBAR) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(t) => setCurrentTab(t)}
        churchProfile={churchProfile}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={() => setIsLogoutModalOpen(true)}
        onSwitchToMember={() => setCurrentPortal('member-app')}
        postCount={posts.length}
        prayerCount={prayers.length}
      />

      {/* 2. CONTEÚDO PRINCIPAL DA PÁGINA */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {/* Barra Superior */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAppSimulator={() => handleOpenSimulatorWithPreview()}
          onNewPostClick={() => setCurrentTab('publicar')}
          onSwitchToMember={() => setCurrentPortal('member-app')}
          churchProfile={churchProfile}
          onLogout={() => setIsLogoutModalOpen(true)}
        />

        {/* Global Toast Alert */}
        {globalToast && (
          <div className="px-6 pt-4">
            <div className="max-w-4xl mx-auto p-3.5 bg-indigo-900 text-white rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{globalToast.text}</span>
              </div>
              <button
                onClick={() => setGlobalToast(null)}
                className="text-indigo-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Views Router */}
        <div className="flex-1 pb-12">
          {currentTab === 'publicar' && (
            <PublishPostView
              churchProfile={churchProfile}
              onPublish={handlePublishPost}
              onCancel={() => setCurrentTab('postagens')}
              onPreviewInApp={(temp) => handleOpenSimulatorWithPreview(temp)}
            />
          )}

          {currentTab === 'resumo' && (
            <DashboardView
              posts={posts}
              churchProfile={churchProfile}
              prayers={prayers}
              onNavigateToPublish={() => setCurrentTab('publicar')}
              onNavigateToManage={() => setCurrentTab('postagens')}
              onNavigateToPrayers={() => setCurrentTab('oracao')}
              onToggleHighlight={handleToggleHighlight}
              onOpenAppSimulator={() => handleOpenSimulatorWithPreview()}
            />
          )}

          {currentTab === 'postagens' && (
            <ManagePostsView
              posts={posts}
              onToggleHighlight={handleToggleHighlight}
              onDeletePost={handleDeletePost}
              onNavigateToPublish={() => setCurrentTab('publicar')}
              onPreviewInApp={(p) => handleOpenSimulatorWithPreview(p)}
            />
          )}

          {currentTab === 'oracao' && (
            <PrayersManagementView
              prayers={prayers}
              churchProfile={churchProfile}
              onPrayForRequest={handlePrayForRequest}
              onDeletePrayer={handleDeletePrayer}
              onRespondPrayer={handleRespondPrayer}
              onAddNewPrayer={handleAddNewPrayerAdmin}
            />
          )}

          {currentTab === 'perfil' && (
            <ChurchProfileView
              profile={churchProfile}
              onSaveProfile={handleSaveProfile}
            />
          )}
        </div>
      </main>

      {/* Simulador Interativo do App dos Irmãos */}
      <AppSimulatorModal
        isOpen={isAppSimulatorOpen}
        onClose={() => {
          setIsAppSimulatorOpen(false);
          setSimulatorPreviewPost(null);
        }}
        posts={posts}
        churchProfile={churchProfile}
        previewPost={simulatorPreviewPost}
      />

      {/* Modal de Logout / Trocar de Portal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-indigo-900">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
                ✝️
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-800">Trocar de Ambiente?</h3>
                <p className="text-xs text-gray-500">{churchProfile.pastorPrincipal}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Você pode voltar à seleção de portais para acessar o aplicativo do membro ou desconectar do painel da <strong>{churchProfile.nome}</strong>.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition cursor-pointer"
              >
                Permanecer
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  setCurrentPortal('portal-selector');
                }}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Ir para Seleção de Portais
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
