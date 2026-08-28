import { ChurchPost, ChurchProfile } from '../types';

export const INITIAL_CHURCH_PROFILE: ChurchProfile = {
  nome: '',
  idRegistro: '',
  pastorPrincipal: '',
  cargo: 'Administrador',
  email: '',
  telefone: '',
  endereco: '',
  cidade: '',
  estado: '',
  horariosCultos: [],
  chavePix: '',
  instagram: '',
  youtube: '',
};

export const INITIAL_POSTS: ChurchPost[] = [];

export const PRESET_IMAGE_GALLERY = [
  {
    title: 'Louvor e Adoração no Templo',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Bíblia Sagrada e Oração',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Ação Social e Solidariedade',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Juventude e Comunhão',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Cruz e Luz Celestial',
    url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Encontro de Casais e Famílias',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  },
];
