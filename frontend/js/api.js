// api.js — Centraliza todas as chamadas para o backend
// Importado em todas as páginas do frontend

const API_BASE = 'https://organizador-de-leituras.vercel.app/api';

// ─── Objeto principal da API ──────────────────────────────────────────────────
const api = {

  // ── Helpers de autenticação (localStorage) ──────────────────────────────────

  // Salva o token JWT (mantém o usuário logado mesmo fechando o navegador)
  setToken(token) { localStorage.setItem('bs_token', token); },

  // Recupera o token salvo
  getToken() { return localStorage.getItem('bs_token'); },

  // Remove o token
  removeToken() { localStorage.removeItem('bs_token'); },

  // Salva os dados do usuário logado como JSON
  setUser(user) { localStorage.setItem('bs_user', JSON.stringify(user)); },

  // Recupera os dados do usuário logado
  getUser() {
    try { return JSON.parse(localStorage.getItem('bs_user')); }
    catch { return null; }
  },

  // Remove os dados do usuário
  removeUser() { localStorage.removeItem('bs_user'); },

  // Verifica se há um usuário logado
  isLoggedIn() { return !!this.getToken(); },

  // Faz logout: limpa os dados e redireciona para a tela de login
  logout() {
    this.removeToken();
    this.removeUser();
    // Descobre o caminho correto para o index.html
    // (funciona tanto em /pages/ quanto na raiz /frontend/)
    const estaNaPasta = window.location.pathname.includes('/pages/');
    window.location.href = estaNaPasta ? '../index.html' : 'index.html';
  },

  // ── Função principal de requisição ──────────────────────────────────────────

  // Faz uma requisição HTTP para o backend
  // method: 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
  // path: ex: '/books', '/auth/login'
  // body: dados para POST/PUT (opcional)
  // precisaToken: se true, envia o JWT no cabeçalho Authorization
  async request(method, path, body = null, precisaToken = true) {
    const headers = { 'Content-Type': 'application/json' };

    if (precisaToken) {
      const token = this.getToken();
      if (!token) { this.logout(); return; }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const opcoes = { method, headers };
    if (body) opcoes.body = JSON.stringify(body);

    const resposta = await fetch(`${API_BASE}${path}`, opcoes);
    const dados    = await resposta.json();

    // Token expirado ou inválido → logout automático
    if (resposta.status === 401) { this.logout(); return; }

    // Erro na requisição → lança erro com mensagem do servidor
    if (!resposta.ok) throw new Error(dados.message || 'Erro na requisição');

    return dados;
  },

  // ── Atalhos para os métodos HTTP ─────────────────────────────────────────────

  get(path)          { return this.request('GET',    path); },
  post(path, body)   { return this.request('POST',   path, body); },
  put(path, body)    { return this.request('PUT',    path, body); },
  patch(path, body)  { return this.request('PATCH',  path, body); },
  delete(path)       { return this.request('DELETE', path); },

  // ── Endpoints de autenticação ────────────────────────────────────────────────

  auth: {
    login(dados)    { return api.request('POST', '/auth/login',    dados, false); },
    register(dados) { return api.request('POST', '/auth/register', dados, false); },
    me()            { return api.get('/auth/me'); }
  },

  // ── Endpoints de livros ───────────────────────────────────────────────────────

  books: {
    list(query = '') { return api.get(`/books${query}`); },
    byId(id)         { return api.get(`/books/${id}`); },
    stats()          { return api.get('/books/stats'); },
    create(dados)    { return api.post('/books', dados); },
    update(id, dados){ return api.put(`/books/${id}`, dados); },
    delete(id)       { return api.delete(`/books/${id}`); }
  },

  // ── Endpoints de trilhas ──────────────────────────────────────────────────────

  trails: {
    list()                    { return api.get('/trails'); },
    byId(id)                  { return api.get(`/trails/${id}`); },
    create(dados)             { return api.post('/trails', dados); },
    update(id, dados)         { return api.put(`/trails/${id}`, dados); },
    delete(id)                { return api.delete(`/trails/${id}`); },
    updateBook(id, bookId, st){ return api.patch(`/trails/${id}/books/${bookId}/status`, { status: st }); }
  }
};

// ─── Funções utilitárias para o frontend ──────────────────────────────────────

// Exibe uma notificação (toast) no canto da tela
// type: 'success', 'error' ou 'info'
function showToast(type, title, msg = '') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icones = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icones[type] || '📢'}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>`;

  container.appendChild(el);

  // Remove o toast após 3.5 segundos com animação de saída
  setTimeout(() => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(20px)';
    el.style.transition = '.3s';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

// Coloca um botão no estado de "carregando" (spinner) ou restaura o texto original
function setLoading(btn, carregando) {
  if (carregando) {
    btn.dataset.textoOriginal = btn.innerHTML;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-color:rgba(255,255,255,.3);border-top-color:#fff;"></span>`;
    btn.disabled  = true;
  } else {
    btn.innerHTML = btn.dataset.textoOriginal || btn.innerHTML;
    btn.disabled  = false;
  }
}

// Redireciona para o login se o usuário não estiver autenticado
// Deve ser chamado no início de cada página protegida
function requireAuth() {
  if (!api.isLoggedIn()) {
    const estaNaPasta = window.location.pathname.includes('/pages/');
    window.location.href = estaNaPasta ? '../index.html' : 'index.html';
  }
}

// Preenche os dados do usuário na sidebar (nome e inicial do avatar)
function initSidebarUser() {
  const user = api.getUser();
  if (!user) return;

  const nomeEl    = document.getElementById('sidebarUserName');
  const inicialEl = document.getElementById('sidebarUserInit');
  if (nomeEl)    nomeEl.textContent    = user.name || user.email;
  if (inicialEl) inicialEl.textContent = (user.name || user.email || '?')[0].toUpperCase();

  // Adiciona logout em todos os botões com a classe logout-btn
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => api.logout());
  });
}

// Renderiza estrelas de avaliação
// rating: de 0 a 5 | editavel: permite clicar para alterar | onChange: callback com novo valor
function renderStars(rating, container, editavel = false, onChange = null) {
  container.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const estrela = document.createElement('span');
    estrela.className = 'star' + (i <= rating ? ' filled' : '');
    estrela.textContent = '★';

    if (editavel) {
      estrela.style.cursor = 'pointer';

      estrela.addEventListener('click', () => {
        renderStars(i, container, true, onChange);
        if (onChange) onChange(i);
      });

      // Efeito de hover: ilumina ao passar o mouse
      estrela.addEventListener('mouseover', () => {
        container.querySelectorAll('.star').forEach((s, idx) => {
          s.classList.toggle('filled', idx < i);
        });
      });

      // Restaura ao tirar o mouse
      estrela.addEventListener('mouseout', () => {
        renderStars(rating, container, true, onChange);
      });
    }

    container.appendChild(estrela);
  }
}
