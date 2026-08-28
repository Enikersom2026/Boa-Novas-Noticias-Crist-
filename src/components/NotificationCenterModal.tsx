import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  X,
  Calendar,
  Sparkles,
  Heart,
  Megaphone,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { ChurchNotification, ChurchPost, NotificationPreferences } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ChurchNotification[];
  churchName: string;
  onSelectPostById?: (postId: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  browserPermission: NotificationPermission;
  onRequestBrowserPermission: () => void;
  preferences: NotificationPreferences;
  onTogglePreference: (key: keyof NotificationPreferences) => void;
  onSendTestNotification: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  churchName,
  onSelectPostById,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  browserPermission,
  onRequestBrowserPermission,
  preferences,
  onTogglePreference,
  onSendTestNotification,
}) => {
  const [filterType, setFilterType] = useState<'todos' | 'evento' | 'noticia' | 'oracao'>('todos');
  const [showSettings, setShowSettings] = useState(false);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'todos') return true;
    return notif.tipo === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      if (diffDays === 1) return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return 'Recentemente';
    }
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'evento':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'noticia':
        return <Megaphone className="w-4 h-4 text-indigo-600" />;
      case 'oracao':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getBadgeStyle = (tipo: string) => {
    switch (tipo) {
      case 'evento':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'noticia':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'oracao':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-800/80 border border-indigo-700/60 flex items-center justify-center relative">
              <BellRing className="w-5 h-5 text-amber-300 animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-indigo-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">Central de Notificações</h3>
              <p className="text-xs text-indigo-200 truncate max-w-[220px]">
                {churchName || 'Igreja Local'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl text-xs transition cursor-pointer ${
                showSettings ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-800'
              }`}
              title="Configurações de Notificação"
            >
              {preferences.som ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-300" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Permissão Push do Navegador */}
        {browserPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 p-3.5 border-b border-amber-200/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Ativar Notificações no seu Dispositivo</p>
                <p className="text-[11px] text-gray-600">Receba avisos instantâneos de novos eventos e notícias.</p>
              </div>
            </div>
            <button
              onClick={onRequestBrowserPermission}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs shrink-0 transition cursor-pointer"
            >
              Ativar
            </button>
          </div>
        )}

        {/* Painel de Preferências Expansível */}
        {showSettings && (
          <div className="p-4 bg-slate-50 border-b border-gray-200 space-y-3 shrink-0 text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">Preferências de Avisos</span>
              <button
                onClick={onSendTestNotification}
                className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Testar Notificação Agora</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.som}
                  onChange={() => onTogglePreference('som')}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs font-medium">Alerta Sonoro</span>
              </label>

              <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.eventos}
                  onChange={() => onTogglePreference('eventos')}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs font-medium">Novos Eventos</span>
              </label>

              <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.noticias}
                  onChange={() => onTogglePreference('noticias')}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs font-medium">Notícias Gerais</span>
              </label>

              <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.oracoes}
                  onChange={() => onTogglePreference('oracoes')}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs font-medium">Mural de Oração</span>
              </label>
            </div>
          </div>
        )}

        {/* Filtros e Ações em Lote */}
        <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
          {/* Filtro por Categoria */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                filterType === 'todos'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('evento')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                filterType === 'evento'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📅 Eventos
            </button>
            <button
              onClick={() => setFilterType('noticia')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                filterType === 'noticia'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📢 Notícias
            </button>
          </div>

          {/* Marcar todas como lidas */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Marcar lidas</span>
            </button>
          )}
        </div>

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Nenhum aviso no momento</p>
                <p className="text-xs text-gray-400 mt-0.5 max-w-xs mx-auto">
                  Sua congregação enviará alertas instantâneos de novos eventos e notícias por aqui.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.lida;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (notif.postId && onSelectPostById) {
                      onSelectPostById(notif.postId);
                      onClose();
                    }
                  }}
                  className={`group relative p-3.5 rounded-2xl border transition duration-150 cursor-pointer ${
                    isUnread
                      ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300 shadow-xs'
                      : 'bg-white border-gray-150 hover:border-gray-300 hover:bg-gray-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Imagem de Capa ou Ícone */}
                    {notif.imagemCapa ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                        <img
                          src={notif.imagemCapa}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        {getIconForType(notif.tipo)}
                      </div>
                    )}

                    {/* Conteúdo da Notificação */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getBadgeStyle(
                            notif.tipo
                          )}`}
                        >
                          {notif.tipo === 'evento' ? 'Evento' : notif.tipo === 'noticia' ? 'Notícia' : 'Aviso'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        )}
                      </div>

                      <h4 className={`text-xs sm:text-sm leading-snug truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.titulo}
                      </h4>

                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notif.mensagem}
                      </p>

                      {notif.tipo === 'evento' && notif.dataEvento && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 w-fit">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>
                            {new Date(notif.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')} • {notif.horarioEvento || '19:30'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações Rápidas de Hover */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notif.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-md transition"
                      title="Excluir notificação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Notificações oficiais da liderança</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
