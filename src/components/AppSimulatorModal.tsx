import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  Bell,
  Home,
  BookOpen,
  CalendarDays,
  User,
  Star,
  Church,
  Copy,
  Check,
} from 'lucide-react';
import { ChurchPost, ChurchProfile } from '../types';

interface AppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: ChurchPost[];
  churchProfile: ChurchProfile;
  previewPost?: Partial<ChurchPost> | null;
}

export const AppSimulatorModal: React.FC<AppSimulatorModalProps> = ({
  isOpen,
  onClose,
  posts,
  churchProfile,
  previewPost,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedPost, setSelectedPost] = useState<ChurchPost | null>(null);
  const [activeBottomNav, setActiveBottomNav] = useState<'inicio' | 'eventos' | 'biblia' | 'igreja'>('inicio');
  const [copiedPix, setCopiedPix] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Merge posts with preview post if available
  const allPosts = previewPost && previewPost.titulo
    ? [
        {
          id: 'temp-preview',
          tipo: previewPost.tipo || 'noticia',
          titulo: previewPost.titulo,
          conteudo: previewPost.conteudo || '',
          dataEvento: previewPost.dataEvento,
          horarioEvento: previewPost.horarioEvento,
          localEvento: previewPost.localEvento,
          imagemCapa: previewPost.imagemCapa || 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
          destaqueCarrossel: Boolean(previewPost.destaqueCarrossel),
          igrejaId: churchProfile.idRegistro || '',
          autor: churchProfile.pastorPrincipal || 'Administrador',
          autorCargo: churchProfile.cargo || 'Administrador',
          createdAt: 'Hoje (Prévia)',
          visualizacoes: 1,
          likes: 0,
          status: 'publicado' as const,
          categoria: previewPost.categoria || 'Geral',
        },
        ...posts.filter((p) => p.id !== 'temp-preview'),
      ]
    : posts;

  const carouselPosts = allPosts.filter((p) => p.destaqueCarrossel);
  const regularNews = allPosts.filter((p) => p.tipo === 'noticia');
  const eventList = allPosts.filter((p) => p.tipo === 'evento');

  const currentSlidePost = carouselPosts[activeSlide % Math.max(1, carouselPosts.length)] || allPosts[0];

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselPosts.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + carouselPosts.length) % carouselPosts.length);
  };

  const handleToggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(churchProfile.chavePix);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative flex flex-col items-center my-auto">
        {/* Top Floating Close Button */}
        <div className="w-full max-w-md flex justify-between items-center mb-3 text-white">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Simulador do Aplicativo dos Membros
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smartphone Frame */}
        <div className="w-[340px] sm:w-[370px] h-[680px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
          {/* Top Notch Speaker */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-40 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full bg-gray-50 rounded-[34px] flex flex-col overflow-hidden text-gray-800 relative">
            {/* App Header */}
            <div className="pt-7 px-4 pb-3 bg-indigo-900 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-white text-indigo-900 rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                  ✝️
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight truncate w-36">
                    {churchProfile.nome}
                  </h4>
                  <span className="text-[9px] text-indigo-300">Aplicativo Oficial</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-indigo-200 hover:text-white">
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Screen Body */}
            <div className="flex-1 overflow-y-auto pb-16 scrollbar-thin">
              {activeBottomNav === 'inicio' && (
                <div className="space-y-4 p-3.5">
                  {/* Carousel Banner Rotativo */}
                  {carouselPosts.length > 0 ? (
                    <div className="relative rounded-2xl overflow-hidden shadow-md bg-gray-900 group">
                      <img
                        src={currentSlidePost.imagemCapa}
                        alt={currentSlidePost.titulo}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3.5 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-yellow-500 text-slate-950 font-bold text-[9px] rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Star className="w-2.5 h-2.5 fill-slate-950" /> Em Destaque
                          </span>
                          <span className="text-[10px] text-white/80 font-mono">
                            {(activeSlide % carouselPosts.length) + 1}/{carouselPosts.length}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-indigo-300 font-semibold uppercase">
                            {currentSlidePost.categoria || 'Destaque'}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2 mt-0.5">
                            {currentSlidePost.titulo}
                          </h3>
                        </div>
                      </div>

                      {/* Carousel controls */}
                      {carouselPosts.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevSlide}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 bg-black/40 text-white rounded-full hover:bg-black/70 transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextSlide}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-black/40 text-white rounded-full hover:bg-black/70 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}

                  {/* Próximos Cultos & Eventos Agenda Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Próximos Eventos
                      </h4>
                      <button
                        onClick={() => setActiveBottomNav('eventos')}
                        className="text-[10px] font-semibold text-indigo-600"
                      >
                        Ver todos
                      </button>
                    </div>

                    <div className="space-y-2">
                      {eventList.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedPost(ev)}
                          className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between cursor-pointer hover:border-indigo-400 transition"
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                              <span className="text-[8px] font-bold uppercase">
                                {ev.dataEvento ? new Date(ev.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }) : 'CULTO'}
                              </span>
                              <span className="text-xs font-black">
                                {ev.dataEvento ? new Date(ev.dataEvento + 'T00:00:00').getDate() : '20'}
                              </span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-gray-800 truncate">
                                {ev.titulo}
                              </p>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-indigo-500" /> {ev.horarioEvento || '19:30'} • {ev.localEvento || 'Templo'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feed de Notícias & Comunicações */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 mb-2">
                      Notícias &amp; Comunicados
                    </h4>

                    <div className="space-y-3">
                      {allPosts.map((post) => {
                        const isLiked = likedPosts[post.id];
                        return (
                          <div
                            key={post.id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs"
                          >
                            <img
                              src={post.imagemCapa}
                              alt=""
                              className="w-full h-28 object-cover cursor-pointer"
                              onClick={() => setSelectedPost(post)}
                            />
                            <div className="p-3">
                              <div className="flex items-center justify-between text-[9px] text-gray-400 mb-1">
                                <span className="text-indigo-600 font-semibold uppercase">
                                  {post.categoria || (post.tipo === 'evento' ? 'Evento' : 'Notícia')}
                                </span>
                                <span>{post.createdAt}</span>
                              </div>
                              <h5
                                onClick={() => setSelectedPost(post)}
                                className="font-bold text-xs text-gray-800 line-clamp-2 leading-tight cursor-pointer hover:text-indigo-600"
                              >
                                {post.titulo}
                              </h5>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                {post.conteudo}
                              </p>

                              {/* Interações */}
                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                                <span className="text-[9px] text-gray-400">
                                  {post.autor}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleToggleLike(post.id)}
                                    className={`flex items-center gap-1 text-[10px] ${
                                      isLiked ? 'text-red-500 font-bold' : 'text-gray-400'
                                    }`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                                    <span>{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeBottomNav === 'eventos' && (
                <div className="p-3.5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-800">
                    Agenda Oficial de Cultos e Eventos
                  </h4>
                  {eventList.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedPost(ev)}
                      className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2 cursor-pointer hover:border-indigo-400 transition"
                    >
                      <img
                        src={ev.imagemCapa}
                        alt=""
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <h5 className="font-bold text-xs text-gray-800 leading-tight">
                        {ev.titulo}
                      </h5>
                      <div className="text-[10px] text-indigo-700 font-medium space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          <span>
                            {ev.dataEvento ? new Date(ev.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data a confirmar'} às {ev.horarioEvento}
                          </span>
                        </div>
                        {ev.localEvento && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>{ev.localEvento}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeBottomNav === 'igreja' && (
                <div className="p-3.5 space-y-4">
                  {/* Church Header Card */}
                  <div className="bg-indigo-900 text-white p-4 rounded-2xl text-center space-y-2 shadow-sm">
                    <div className="w-12 h-12 bg-white text-indigo-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                      ✝️
                    </div>
                    <h4 className="font-bold text-sm">{churchProfile.nome}</h4>
                    <p className="text-[11px] text-indigo-200 leading-tight">
                      {churchProfile.endereco} • {churchProfile.cidade}/{churchProfile.estado}
                    </p>
                  </div>

                  {/* Horários dos Cultos */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                    <h5 className="font-bold text-xs text-gray-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" /> Horários dos Cultos
                    </h5>
                    <div className="divide-y divide-gray-100">
                      {churchProfile.horariosCultos.map((h, i) => (
                        <div key={i} className="py-1.5 flex justify-between text-[11px]">
                          <span className="font-semibold text-gray-700">{h.titulo}</span>
                          <span className="text-indigo-600 font-mono">
                            {h.dia} {h.horario}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dízimos e Ofertas PIX */}
                  <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                    <h5 className="font-bold text-xs text-emerald-900">
                      Dízimos e Ofertas (PIX)
                    </h5>
                    <p className="text-[10px] text-emerald-700">
                      Contribua com a obra do Senhor através da nossa chave PIX oficial:
                    </p>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-300">
                      <span className="text-[10px] font-mono text-gray-700 truncate pr-2">
                        {churchProfile.chavePix}
                      </span>
                      <button
                        onClick={handleCopyPix}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Mobile Tab Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-200 px-3 py-2 flex justify-around items-center z-30">
              <button
                onClick={() => setActiveBottomNav('inicio')}
                className={`flex flex-col items-center text-[9px] font-medium transition ${
                  activeBottomNav === 'inicio' ? 'text-indigo-700' : 'text-gray-400'
                }`}
              >
                <Home className="w-4 h-4 mb-0.5" />
                <span>Início</span>
              </button>

              <button
                onClick={() => setActiveBottomNav('eventos')}
                className={`flex flex-col items-center text-[9px] font-medium transition ${
                  activeBottomNav === 'eventos' ? 'text-indigo-700' : 'text-gray-400'
                }`}
              >
                <CalendarDays className="w-4 h-4 mb-0.5" />
                <span>Eventos</span>
              </button>

              <button
                onClick={() => setActiveBottomNav('igreja')}
                className={`flex flex-col items-center text-[9px] font-medium transition ${
                  activeBottomNav === 'igreja' ? 'text-indigo-700' : 'text-gray-400'
                }`}
              >
                <Church className="w-4 h-4 mb-0.5" />
                <span>A Igreja</span>
              </button>
            </div>
          </div>
        </div>

        {/* Post Detail Drawer inside simulator */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
              <div className="relative rounded-xl overflow-hidden h-44">
                <img
                  src={selectedPost.imagemCapa}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase">
                {selectedPost.categoria || selectedPost.tipo}
              </span>

              <h3 className="font-bold text-sm text-gray-800 leading-snug">
                {selectedPost.titulo}
              </h3>

              {selectedPost.tipo === 'evento' && selectedPost.dataEvento && (
                <div className="p-2.5 bg-indigo-50 rounded-lg text-xs text-indigo-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {new Date(selectedPost.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} • {selectedPost.horarioEvento}
                    </span>
                  </div>
                  {selectedPost.localEvento && (
                    <div className="flex items-center gap-1.5 text-indigo-700 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{selectedPost.localEvento}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {selectedPost.conteudo}
              </p>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                <span>Por: {selectedPost.autor}</span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
