import React from 'react';
import { Menu, Smartphone, PlusCircle, LogOut } from 'lucide-react';
import { NavTab, ChurchProfile } from '../types';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onOpenAppSimulator: () => void;
  onNewPostClick: () => void;
  onSwitchToMember: () => void;
  churchProfile: ChurchProfile;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenAppSimulator,
  onNewPostClick,
  onSwitchToMember,
  churchProfile,
  onLogout,
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'publicar':
        return 'Publicar Conteúdo';
      case 'resumo':
        return 'Início / Resumo';
      case 'postagens':
        return 'Gerenciar Postagens';
      case 'oracao':
        return 'Pedidos de Oração';
      case 'perfil':
        return 'Perfil da Igreja';
      default:
        return 'Painel Administrativo';
    }
  };

  const getTabSubtitle = (tab: NavTab) => {
    switch (tab) {
      case 'publicar':
        return 'Crie notícias, eventos e comunicados para o aplicativo dos membros';
      case 'resumo':
        return `Visão geral do engajamento e publicações da ${churchProfile.nome}`;
      case 'postagens':
        return 'Visualize, filtre, edite ou alterne destaques das publicações ativas';
      case 'oracao':
        return 'Receba, interceda e responda aos pedidos de oração dos membros';
      case 'perfil':
        return 'Configurações institucionais, liderança pastoral e horários de cultos';
      default:
        return '';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center space-x-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-indigo-900 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
            {getTabTitle(currentTab)}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {getTabSubtitle(currentTab)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Quick New Post shortcut if not already in publishing */}
        {currentTab !== 'publicar' && (
          <button
            onClick={onNewPostClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Notícia</span>
          </button>
        )}

        {/* Botão Sair */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-red-600" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}

        {/* Espaço Isolado e Conexão Segura */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500 pl-2 border-l border-gray-200">
          <span>Painel Admin</span>
          <span
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"
            title="Conexão Segura"
          />
        </div>
      </div>
    </header>
  );
};
