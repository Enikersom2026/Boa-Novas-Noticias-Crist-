import React, { useEffect } from 'react';
import {
  BellRing,
  X,
  Calendar,
  Megaphone,
  Heart,
  Sparkles,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { ChurchNotification } from '../types';

interface InAppPushBannerProps {
  notification: ChurchNotification | null;
  onDismiss: () => void;
  onOpen: (notif: ChurchNotification) => void;
}

export const InAppPushBanner: React.FC<InAppPushBannerProps> = ({
  notification,
  onDismiss,
  onOpen,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.tipo) {
      case 'evento':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'noticia':
        return <Megaphone className="w-5 h-5 text-indigo-500" />;
      case 'oracao':
        return <Heart className="w-5 h-5 text-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top-6 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/40 p-4 relative overflow-hidden backdrop-blur-md">
        {/* Barra de progresso animada */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 animate-[progress_7s_linear_infinite]" />

        <div className="flex items-start gap-3">
          {notification.imagemCapa ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-800">
              <img
                src={notification.imagemCapa}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
          )}

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {notification.tipo === 'evento' ? 'Novo Evento' : notification.tipo === 'noticia' ? 'Nova Notícia' : 'Aviso da Liderança'}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
              {notification.titulo}
            </h4>

            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {notification.mensagem}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onOpen(notification);
                  onDismiss();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Ver Publicação</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={onDismiss}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                Dispensar
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
