import React from 'react';
import {
  FileText,
  Calendar,
  Star,
  Eye,
  TrendingUp,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { ChurchPost, ChurchProfile, PrayerRequest } from '../types';

interface DashboardViewProps {
  posts: ChurchPost[];
  churchProfile: ChurchProfile;
  prayers?: PrayerRequest[];
  onNavigateToPublish: () => void;
  onNavigateToManage: () => void;
  onNavigateToPrayers?: () => void;
  onToggleHighlight: (postId: string) => void;
  onOpenAppSimulator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  posts,
  churchProfile,
  prayers = [],
  onNavigateToPublish,
  onNavigateToManage,
  onNavigateToPrayers,
  onToggleHighlight,
  onOpenAppSimulator,
}) => {
  const totalPosts = posts.length;
  const totalEventos = posts.filter((p) => p.tipo === 'evento').length;
  const totalNoticias = posts.filter((p) => p.tipo === 'noticia').length;
  const destaquesCount = posts.filter((p) => p.destaqueCarrossel).length;
  const totalViews = posts.reduce((acc, p) => acc + (p.visualizacoes || 0), 0);
  const pendingPrayers = prayers.filter((pr) => !pr.status || pr.status === 'pendente').length;

  const carouselPosts = posts.filter((p) => p.destaqueCarrossel);
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-700/60 border border-indigo-500/40 text-indigo-200 text-xs font-mono">
            <span>ID #{churchProfile.idRegistro}</span>
            <span>•</span>
            <span>{churchProfile.nome}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Paz do Senhor, {churchProfile.pastorPrincipal}!
          </h2>
          <p className="text-sm text-indigo-200 max-w-xl">
            Seu portal está integrado em tempo real com o aplicativo dos irmãos. Crie novas notícias, anuncie cultos, receba pedidos de oração e gerencie os banners de destaque.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          {onNavigateToPrayers && (
            <button
              onClick={onNavigateToPrayers}
              className="px-3.5 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer border border-indigo-500/50"
            >
              <HeartHandshake className="w-4 h-4 text-indigo-200" />
              <span>Pedidos de Oração ({prayers.length})</span>
            </button>
          )}
          <button
            onClick={onNavigateToPublish}
            className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-900 font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Publicar Notícia / Evento</span>
          </button>
          <button
            onClick={onOpenAppSimulator}
            className="px-3.5 py-2.5 bg-indigo-800/80 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-lg border border-indigo-600 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Ver App dos Irmãos</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Publicações */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total de Publicações
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalPosts}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {totalNoticias} notícias • {totalEventos} eventos
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Eventos Agendados */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Eventos / Cultos
            </p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{totalEventos}</h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> No calendário oficial
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Destaques no Carrossel */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              No Carrossel Principal
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{destaquesCount}</h3>
            <p className="text-[11px] text-amber-700 mt-0.5">Banners rotativos ativos</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
        </div>

        {/* Total de Visualizações */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Visualizações no App
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalViews.toLocaleString('pt-BR')}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Engajamento da igreja
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Destaques do Carrossel Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="font-bold text-gray-800 text-base">
              Banners Ativos no Carrossel Principal do App
            </h3>
          </div>
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {carouselPosts.length} postagens em rotação
          </span>
        </div>

        {carouselPosts.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Nenhum banner destacado no carrossel</p>
            <p className="text-xs text-gray-400 mt-1">
              Ative a opção "Destacar no Carrossel Principal" ao criar ou editar uma postagem.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carouselPosts.map((post) => (
              <div
                key={post.id}
                className="group border border-gray-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 overflow-hidden bg-gray-100">
                    <img
                      src={post.imagemCapa}
                      alt={post.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] uppercase font-bold tracking-wider backdrop-blur-xs">
                      {post.tipo === 'evento' ? '📅 Evento' : '📰 Notícia'}
                    </span>
                    <button
                      onClick={() => onToggleHighlight(post.id)}
                      className="absolute top-2 right-2 p-1.5 bg-amber-400 text-white rounded-full shadow-sm hover:bg-amber-500 transition cursor-pointer"
                      title="Remover do Carrossel"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight">
                      {post.titulo}
                    </h4>
                    {post.tipo === 'evento' && post.dataEvento && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 mt-2 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(post.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} • {post.horarioEvento}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                      {post.conteudo}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{post.visualizacoes} visualizações</span>
                  <span className="text-indigo-600 font-medium">{post.categoria}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Posts Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Últimas Publicações</h3>
            <p className="text-xs text-gray-500">Postagens mais recentes adicionadas ao portal</p>
          </div>
          <button
            onClick={onNavigateToManage}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition cursor-pointer"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Publicação</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data / Programação</th>
                <th className="px-4 py-3">Carrossel</th>
                <th className="px-4 py-3">Visualizações</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    <p className="font-medium text-sm text-gray-600">Nenhuma notícia ou evento publicado ainda.</p>
                    <p className="text-xs text-gray-400 mt-1">Clique em "Publicar Notícia / Evento" para criar a primeira publicação da sua igreja.</p>
                  </td>
                </tr>
              ) : (
                recentPosts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.imagemCapa}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                        />
                        <div className="max-w-xs">
                          <p className="font-semibold text-gray-800 truncate">{p.titulo}</p>
                          <p className="text-gray-400 text-[11px] truncate">{p.categoria}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          p.tipo === 'evento'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {p.tipo === 'evento' ? 'Evento' : 'Notícia'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-gray-600">
                      {p.tipo === 'evento' && p.dataEvento ? (
                        <span>
                          {new Date(p.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} às {p.horarioEvento}
                        </span>
                      ) : (
                        <span>Criado em {new Date(p.createdAt + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onToggleHighlight(p.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          p.destaqueCarrossel
                            ? 'bg-yellow-50 border-yellow-300 text-yellow-600'
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-yellow-600'
                        }`}
                        title={p.destaqueCarrossel ? 'Remover do carrossel' : 'Destacar no carrossel'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            p.destaqueCarrossel ? 'fill-yellow-500' : ''
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-gray-700 font-mono">
                      {p.visualizacoes} views
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={onNavigateToManage}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 font-medium rounded transition"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
