// js/app.js
// Lógica da aplicação para membros da igreja
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut,
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from './firebase-config.js';

let currentUserProfile = null;
let carouselItems = [];
let currentCarouselIndex = 0;
let carouselTimer = null;

// Elementos da DOM
const memberNameElem = document.getElementById('member-name');
const churchNameElem = document.getElementById('church-name');
const carouselContainer = document.getElementById('carousel-container');
const carouselIndicators = document.getElementById('carousel-indicators');
const feedContainer = document.getElementById('feed-container');
const emptyFeedElem = document.getElementById('empty-feed');
const btnLogout = document.getElementById('btn-logout');

// 1. Monitorar estado de autenticação
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Redireciona para login/cadastro se não autenticado
    window.location.href = 'cadastro_membro.html';
    return;
  }

  try {
    // Buscar perfil do membro para recuperar o 'igreja_id'
    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      alert('Perfil de usuário não encontrado. Por favor, cadastre-se novamente.');
      await signOut(auth);
      window.location.href = 'cadastro_membro.html';
      return;
    }

    currentUserProfile = userDocSnap.data();
    
    // Atualizar dados na interface
    if (memberNameElem) memberNameElem.textContent = currentUserProfile.nome || 'Irmão(ã)';
    if (churchNameElem) churchNameElem.textContent = currentUserProfile.igreja_nome || 'Sua Congregação Local';

    // 2. Iniciar escutas em tempo real (onSnapshot) isoladas pelo igreja_id
    escutarNoticiasIgreja(currentUserProfile.igreja_id);

  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
  }
});

// 2. Função de escuta em tempo real do Firestore
function escutarNoticiasIgreja(igrejaId) {
  if (!igrejaId) return;

  const noticiasRef = collection(db, 'noticias');
  // Query filtrada com o isolamento multi-tenant
  const q = query(
    noticiasRef, 
    where('igreja_id', '==', String(igrejaId)),
    orderBy('createdAt', 'desc')
  );

  onSnapshot(q, (snapshot) => {
    const noticias = [];
    snapshot.forEach((doc) => {
      noticias.push({ id: doc.id, ...doc.data() });
    });

    // Separar carrossel e feed
    const destaques = noticias.filter(n => n.destaque_carrossel === true);
    const regulares = noticias.filter(n => !n.destaque_carrossel);

    renderizarCarrossel(destaques);
    renderizarFeed(regulares);
  }, (error) => {
    console.error('Erro ao escutar notícias:', error);
  });
}

// 3. Renderização do Carrossel de Destaques
function renderizarCarrossel(destaques) {
  if (!carouselContainer) return;
  carouselItems = destaques;
  currentCarouselIndex = 0;

  if (carouselTimer) clearInterval(carouselTimer);

  if (destaques.length === 0) {
    carouselContainer.innerHTML = `
      <div class="w-full h-44 bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-2xl flex flex-col items-center justify-center text-white text-center p-4">
        <span class="text-2xl mb-1">✝️</span>
        <h4 class="font-bold text-sm">Bem-vindo à sua Igreja</h4>
        <p class="text-xs text-indigo-200">Nenhum aviso em destaque no momento.</p>
      </div>
    `;
    if (carouselIndicators) carouselIndicators.innerHTML = '';
    return;
  }

  // Montar slides
  carouselContainer.innerHTML = destaques.map((item, idx) => `
    <div class="carousel-slide absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}" data-index="${idx}">
      <div class="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg group">
        <img src="${item.imagem_url || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800'}" alt="${item.titulo}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
          <span class="inline-block bg-indigo-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md self-start mb-1 tracking-wider">
            ${item.tipo === 'evento' ? '📅 Evento Especial' : '⭐ Destaque'}
          </span>
          <h3 class="font-bold text-base leading-snug line-clamp-2">${item.titulo}</h3>
          <p class="text-xs text-gray-200 line-clamp-1 mt-0.5">${item.conteudo}</p>
        </div>
      </div>
    </div>
  `).join('');

  // Montar indicadores (bolinhas)
  if (carouselIndicators) {
    carouselIndicators.innerHTML = destaques.map((_, idx) => `
      <button class="w-2 h-2 rounded-full transition-all ${idx === 0 ? 'bg-indigo-600 w-5' : 'bg-gray-300'}" onclick="irParaSlide(${idx})"></button>
    `).join('');
  }

  // Timer para rotação automática
  if (destaques.length > 1) {
    carouselTimer = setInterval(proximoSlide, 5000);
  }
}

// Controle manual de slides
window.irParaSlide = (index) => {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = carouselIndicators ? carouselIndicators.children : [];
  
  slides.forEach((s, idx) => {
    if (idx === index) {
      s.classList.remove('opacity-0', 'z-0');
      s.classList.add('opacity-100', 'z-10');
    } else {
      s.classList.remove('opacity-100', 'z-10');
      s.classList.add('opacity-0', 'z-0');
    }
  });

  for (let i = 0; i < dots.length; i++) {
    if (i === index) {
      dots[i].className = 'w-5 h-2 rounded-full transition-all bg-indigo-600';
    } else {
      dots[i].className = 'w-2 h-2 rounded-full transition-all bg-gray-300';
    }
  }

  currentCarouselIndex = index;
};

function proximoSlide() {
  if (carouselItems.length <= 1) return;
  const next = (currentCarouselIndex + 1) % carouselItems.length;
  window.irParaSlide(next);
}

// 4. Renderização do Feed Regular de Cards
function renderizarFeed(noticias) {
  if (!feedContainer) return;

  if (noticias.length === 0) {
    feedContainer.innerHTML = '';
    if (emptyFeedElem) emptyFeedElem.classList.remove('hidden');
    return;
  }

  if (emptyFeedElem) emptyFeedElem.classList.add('hidden');

  feedContainer.innerHTML = noticias.map((n) => `
    <article class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      ${n.imagem_url ? `
        <div class="h-36 w-full overflow-hidden bg-gray-100 relative">
          <img src="${n.imagem_url}" alt="${n.titulo}" class="w-full h-full object-cover">
          <span class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            ${n.tipo === 'evento' ? '📅 Culto/Evento' : '📢 Notícia'}
          </span>
        </div>
      ` : ''}
      <div class="p-4">
        <h4 class="font-bold text-gray-900 text-sm mb-1 leading-snug">${n.titulo}</h4>
        <p class="text-xs text-gray-600 leading-relaxed mb-3">${n.conteudo}</p>
        
        ${n.tipo === 'evento' && n.data_evento ? `
          <div class="p-2.5 bg-indigo-50/70 rounded-xl text-[11px] text-indigo-900 flex items-center justify-between mb-2">
            <span>📍 ${n.local_evento || 'Templo Central'}</span>
            <span class="font-bold">⏰ ${n.data_evento} ${n.horario_evento ? 'às ' + n.horario_evento : ''}</span>
          </div>
        ` : ''}

        <div class="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-50 pt-2.5 mt-1">
          <span>Publicado por: <strong class="text-gray-600">${n.autor_nome || 'Secretaria'}</strong></span>
          <span>${formatarData(n.createdAt)}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function formatarData(timestamp) {
  if (!timestamp) return 'Recente';
  try {
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return 'Recente';
  }
}

// 5. Logout
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      await signOut(auth);
      window.location.href = 'cadastro_membro.html';
    }
  });
}
