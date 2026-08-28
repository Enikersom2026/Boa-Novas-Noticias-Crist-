import React from 'react';
import {
  LayoutDashboard,
  FileText,
  List,
  Settings,
  LogOut,
  X,
  Church,
  Smartphone,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import { NavTab, ChurchProfile } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  churchProfile: ChurchProfile;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onSwitchToMember: () => void;
  postCount: number;
  prayerCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  churchProfile,
  isMobileOpen,
  onCloseMobile,
  onLogout,
  onSwitchToMember,
  postCount,
  prayerCount,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number | string;
  }> = [
    {
      id: 'resumo',
      label: 'Início / Resumo',
      icon: LayoutDashboard,
    },
    {
      id: 'publicar',
      label: 'Nova Notícia / Evento',
      icon: FileText,
    },
    {
      id: 'postagens',
      label: 'Gerenciar Postagens',
      icon: List,
      badge: postCount,
    },
    {
      id: 'oracao',
      label: 'Pedidos de Oração',
      icon: HeartHandshake,
      badge: prayerCount,
    },
    {
      id: 'perfil',
      label: 'Perfil da Igreja',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-indigo-900 text-white flex flex-col justify-between fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Identificação da Igreja Logada */}
          <div className="p-6 border-b border-indigo-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-900 font-bold text-xl overflow-hidden shadow-inner shrink-0">
                ✝️
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-sm leading-tight truncate text-white">
                  {churchProfile.nome}
                </h2>
                <span className="text-xs text-indigo-300 font-mono">
                  ID: #{churchProfile.idRegistro}
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden text-indigo-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badge do Portal */}
          <div className="px-4 pt-4 pb-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 border border-indigo-700/50 rounded-lg text-indigo-200 text-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Painel Administrativo Oficial</span>
            </div>
          </div>

          {/* Links do Menu */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-indigo-800 text-white font-medium shadow-sm'
                      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-indigo-700 text-indigo-100'
                          : 'bg-indigo-950 text-indigo-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Usuário Logado / Sair */}
        <div className="p-4 border-t border-indigo-800 bg-indigo-950 flex items-center justify-between">
          <div className="text-xs overflow-hidden pr-2">
            <p className="font-medium text-gray-200 truncate">{churchProfile.pastorPrincipal}</p>
            <p className="text-indigo-400 truncate">{churchProfile.cargo}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-indigo-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-indigo-900/50 transition cursor-pointer flex items-center gap-1 text-xs"
            title="Sair da Conta"
          >
            <LogOut className="w-5 h-5" />
            <span className="sr-only">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
