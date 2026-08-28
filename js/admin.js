// js/admin.js
// Lógica do Painel Administrativo de Liderança
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut,
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp 
} from './firebase-config.js';

let currentAdminProfile = null;

// Elementos da DOM
const adminNomeElem = document.getElementById('admin-nome');
const adminIgrejaElem = document.getElementById('admin-igreja');
const adminIgrejaIdBadge = document.getElementById('admin-igreja-id');
const formPublicacao = document.getElementById('form-publicacao');
const listaPublicacoes = document.getElementById('lista-publicacoes');
const btnLogout = document.getElementById('btn-admin-logout');
const countNoticias = document.getElementById('count-noticias');
const countDestaques = document.getElementById('count-destaques');

// Campos do Formulário
const inputTipo = document.getElementById('input-tipo');
const camposEvento = document.getElementById('campos-evento');
const inputTitulo = document.getElementById('input-titulo');
const inputConteudo = document.getElementById('input-conteudo');
const inputImagem = document.getElementById('input-imagem');
const inputDestaque = document.getElementById('input-destaque');
const inputDataEvento = document.getElementById('input-data-evento');
const inputHorarioEvento = document.getElementById('input-horario-evento');
const inputLocalEvento = document.getElementById('input-local-evento');
const btnSubmit = document.getElementById('btn-submit-post');

// 1. Alternar campos específicos de evento
if (inputTipo) {
  inputTipo.addEventListener('change', (e) => {
    if (e.target.value === 'evento') {
      camposEvento.classList.remove('hidden');
    } else {
      camposEvento.classList.add('hidden');
    }
  });
}

// 2. Proteger a rota e verificar o igreja_id do Administrador
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'cadastro_lideranca.html';
    return;
  }

  try {
    const userDocRef = doc(db, 'usuarios', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      alert('Acesso negado: Perfil de liderança não encontrado.');
      await signOut(auth);
      window.location.href = 'cadastro_lideranca.html';
      return;
    }

    currentAdminProfile = userSnap.data();

    // Validar se o usuário possui cargo ou função de liderança/admin
    if (currentAdminProfile.role !== 'admin' && currentAdminProfile.tipo !== 'lideranca') {
      alert('Acesso restrito: Este usuário não possui privilégios de liderança.');
      await signOut(auth);
      window.location.href = 'cadastro_lideranca.html';
      return;
    }

    // Atualizar UI
    if (adminNomeElem) adminNomeElem.textContent = currentAdminProfile.nome || 'Pastor / Administrador';
    if (adminIgrejaElem) adminIgrejaElem.textContent = currentAdminProfile.igreja_nome || 'Igreja Local';
    if (adminIgrejaIdBadge) adminIgrejaIdBadge.textContent = `#${currentAdminProfile.igreja_id}`;

    // Escutar publicações da congregação no Firestore
    escutarPublicacoesAdmin(currentAdminProfile.igreja_id);

  } catch (error) {
    console.error('Erro na autenticação do painel:', error);
  }
});

// 3. Cadastrar nova notícia/evento com injeção segura do 'igreja_id'
if (formPublicacao) {
  formPublicacao.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentAdminProfile || !currentAdminProfile.igreja_id) {
      alert('Erro: Igreja não identificada na sessão.');
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span>Salvando no Firestore...</span>`;

    try {
      const novaPublicacao = {
        igreja_id: String(currentAdminProfile.igreja_id), // Garantia do multi-tenant
        tipo: inputTipo.value,
        titulo: inputTitulo.value.trim(),
        conteudo: inputConteudo.value.trim(),
        imagem_url: inputImagem.value.trim() || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800',
        destaque_carrossel: inputDestaque.checked,
        data_evento: inputTipo.value === 'evento' ? inputDataEvento.value : null,
        horario_evento: inputTipo.value === 'evento' ? inputHorarioEvento.value : null,
        local_evento: inputTipo.value === 'evento' ? inputLocalEvento.value : null,
        autor_id: auth.currentUser.uid,
        autor_nome: currentAdminProfile.nome,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'noticias'), novaPublicacao);

      alert('Publicação enviada com sucesso para o feed dos irmãos!');
      formPublicacao.reset();
      camposEvento.classList.add('hidden');

    } catch (error) {
      console.error('Erro ao salvar publicação:', error);
      alert('Erro ao publicar: ' + error.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <span>Publicar Notícia / Evento</span>
      `;
    }
  });
}

// 4. Escutar publicações existentes filtradas pelo igreja_id
function escutarPublicacoesAdmin(igrejaId) {
  const noticiasRef = collection(db, 'noticias');
  const q = query(
    noticiasRef, 
    where('igreja_id', '==', String(igrejaId)),
    orderBy('createdAt', 'desc')
  );

  onSnapshot(q, (snapshot) => {
    const posts = [];
    let destaquesCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({ id: doc.id, ...data });
      if (data.destaque_carrossel) destaquesCount++;
    });

    // Atualizar métricas
    if (countNoticias) countNoticias.textContent = posts.length;
    if (countDestaques) countDestaques.textContent = destaquesCount;

    // Renderizar lista administrativa
    renderizarListaAdmin(posts);
  });
}

function renderizarListaAdmin(posts) {
  if (!listaPublicacoes) return;

  if (posts.length === 0) {
    listaPublicacoes.innerHTML = `
      <div class="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <p class="text-sm font-medium">Nenhuma publicação registrada para sua congregação ainda.</p>
        <p class="text-xs text-gray-400 mt-1">Preencha o formulário acima para publicar o primeiro comunicado.</p>
      </div>
    `;
    return;
  }

  listaPublicacoes.innerHTML = posts.map((post) => `
    <div class="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <img src="${post.imagem_url}" alt="${post.titulo}" class="w-14 h-14 rounded-xl object-cover shrink-0">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${post.tipo === 'evento' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}">
              ${post.tipo}
            </span>
            ${post.destaque_carrossel ? `
              <span class="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                ⭐ No Carrossel
              </span>
            ` : ''}
          </div>
          <h4 class="font-bold text-gray-900 text-sm leading-snug">${post.titulo}</h4>
          <p class="text-xs text-gray-500 line-clamp-1">${post.conteudo}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-end sm:self-center">
        <button onclick="excluirPublicacao('${post.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          <span>Excluir</span>
        </button>
      </div>
    </div>
  `).join('');
}

// 5. Exclusão de publicação
window.excluirPublicacao = async (postId) => {
  if (confirm('Deseja realmente remover esta publicação do feed da igreja?')) {
    try {
      await deleteDoc(doc(db, 'noticias', postId));
      alert('Publicação removida com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir documento: ' + err.message);
    }
  }
};

// 6. Logout
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'cadastro_lideranca.html';
  });
}
