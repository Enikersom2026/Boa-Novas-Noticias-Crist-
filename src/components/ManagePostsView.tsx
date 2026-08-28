import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  Trash2,
  Eye,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ChurchPost, PostType } from '../types';

interface ManagePostsViewProps {
  posts: ChurchPost[];
  onToggleHighlight: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onNavigateToPublish: () => void;
  onPreviewInApp: (post: ChurchPost) => void;
}

export const ManagePostsView: React.FC<ManagePostsViewProps> = ({
  posts,
  onToggleHighlight,
  onDeletePost,
  onNavigateToPublish,
  onPreviewInApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'noticia' | 'evento' | 'carrossel'>('todos');
  const [postToDelete, setPostToDelete] = useState<ChurchPost | null>(null);

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'noticia') return p.tipo === 'noticia';
    if (filterType === 'evento') return p.tipo === 'evento';
    if (filterType === 'carrossel') return p.destaqueCarrossel;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gerenciar Postagens</h2>
          <p className="text-xs text-gray-500">
            {posts.length} publicações cadastradas no Portal da Igreja
          </p>
        </div>

        <button
          onClick={onNavigateToPublish}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center space-x-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Notícia / Evento</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, conteúdo ou ministério..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 border border-gray-200 p-1 rounded-lg bg-gray-50">
          {[
            { id: 'todos', label: 'Todas as Postagens' },
            { id: 'noticia', label: '📰 Notícias' },
            { id: 'evento', label: '📅 Eventos / Cultos' },
            { id: 'carrossel', label: '⭐ Carrossel' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                filterType === f.id
                  ? 'bg-white text-indigo-900 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-700">Nenhuma postagem encontrada</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Não encontramos itens com os filtros atuais. Altere os termos da busca ou crie uma nova publicação.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('todos');
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition mt-2"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Image Banner & Badges */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={post.imagemCapa}
                    alt={post.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Type Badge */}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider text-white shadow-xs ${
                      post.tipo === 'evento' ? 'bg-purple-600' : 'bg-indigo-600'
                    }`}
                  >
                    {post.tipo === 'evento' ? '📅 Evento' : '📰 Notícia'}
                  </span>

                  {/* Carousel Star Toggle */}
                  <button
                    onClick={() => onToggleHighlight(post.id)}
                    className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md transition cursor-pointer ${
                      post.destaqueCarrossel
                        ? 'bg-amber-400 text-white hover:bg-amber-500'
                        : 'bg-black/50 text-gray-300 hover:text-white backdrop-blur-xs'
                    }`}
                    title={
                      post.destaqueCarrossel
                        ? 'Em destaque no Carrossel (clique p/ remover)'
                        : 'Clique para destacar no Carrossel'
                    }
                  >
                    <Star
                      className={`w-4 h-4 ${
                        post.destaqueCarrossel ? 'fill-white' : ''
                      }`}
                    />
                  </button>

                  {/* Category Tag */}
                  {post.categoria && (
                    <span className="absolute bottom-2 left-3 px-2 py-0.5 bg-white/90 text-gray-800 text-[10px] font-semibold rounded backdrop-blur-xs">
                      {post.categoria}
                    </span>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <h3 className="font-bold text-base text-gray-800 leading-snug">
                    {post.titulo}
                  </h3>

                  {/* Event Meta info */}
                  {post.tipo === 'evento' && post.dataEvento && (
                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-1 text-xs text-indigo-900">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {new Date(post.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} • {post.horarioEvento}
                        </span>
                      </div>
                      {post.localEvento && (
                        <div className="flex items-center gap-1.5 text-indigo-700 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{post.localEvento}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {post.conteudo}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-[11px] text-gray-400">
                  <span>{post.visualizacoes} views</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPreviewInApp(post)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded transition cursor-pointer"
                    title="Ver no App"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setPostToDelete(post)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                    title="Excluir Postagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-800">Confirmar Exclusão</h3>
                <p className="text-xs text-gray-500">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
              Deseja realmente remover a publicação <strong>"{postToDelete.titulo}"</strong> do Portal e do aplicativo dos membros?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePost(postToDelete.id);
                  setPostToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm transition cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
