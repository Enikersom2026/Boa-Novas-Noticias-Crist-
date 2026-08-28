export type AppPortal = 'portal-selector' | 'admin-panel' | 'member-app';

export type NavTab = 'resumo' | 'publicar' | 'postagens' | 'oracao' | 'perfil';

export type MemberNavTab = 'inicio' | 'agenda' | 'oracao' | 'perfil';

export type PostType = 'noticia' | 'evento';

export interface ChurchPost {
  id: string;
  tipo: PostType;
  titulo: string;
  conteudo: string;
  dataEvento?: string;
  horarioEvento?: string;
  localEvento?: string;
  categoria?: string;
  imagemCapa: string;
  destaqueCarrossel: boolean;
  igrejaId: string;
  autor: string;
  autorCargo: string;
  createdAt: string;
  visualizacoes: number;
  likes: number;
  status: 'publicado' | 'rascunho';
}

export interface ChurchProfile {
  id?: string;
  nome: string;
  idRegistro: string;
  pastorPrincipal: string;
  cargo: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  horariosCultos: Array<{
    dia: string;
    horario: string;
    titulo: string;
  }>;
  chavePix: string;
  instagram: string;
  youtube: string;
  createdAt?: string;
}

export interface MemberAccount {
  id?: string;
  nome: string;
  email: string;
  senha?: string;
  estado?: string;
  cidade?: string;
  igrejaId: string;
  igrejaNome?: string;
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  nome: string;
  pedido: string;
  createdAt: string;
  intercessores: number;
  orado?: boolean;
  categoria?: string;
  contato?: string;
  status?: 'pendente' | 'em_oracao' | 'atendido';
  respostaPastoral?: string;
  dataResposta?: string;
  igrejaId?: string;
}

export type NotificationType = 'evento' | 'noticia' | 'oracao' | 'aviso' | 'urgente';

export interface ChurchNotification {
  id: string;
  igrejaId: string;
  titulo: string;
  mensagem: string;
  tipo: NotificationType;
  postId?: string;
  imagemCapa?: string;
  createdAt: string;
  autor?: string;
  dataEvento?: string;
  horarioEvento?: string;
  localEvento?: string;
  lida?: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  eventos: boolean;
  noticias: boolean;
  oracoes: boolean;
  som: boolean;
}
