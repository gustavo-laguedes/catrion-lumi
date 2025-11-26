// app.js (module)

// =========================
// IMPORTS FIREBASE
// =========================
import { db } from './firebase.js';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// =========================
// NAVIGAÇÃO / VIEWS
// =========================
const views = document.querySelectorAll('.view');
const header = document.getElementById('app-header');
const bottomNav = document.getElementById('bottom-nav');

function showView(name) {
  views.forEach(v => {
    if (v.dataset.view === name) {
      v.classList.add('active');
    } else {
      v.classList.remove('active');
    }
  });

  const authViews = ['login', 'register'];
  const isAuth = authViews.includes(name);
  if (isAuth) {
    if (header) header.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';
  } else {
    if (header) header.style.display = 'flex';
    if (bottomNav) bottomNav.style.display = 'block';
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    const target = btn.dataset.targetView;
    if (target === name) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// =========================
// LOGIN / CADASTRO (APENAS VISUAL AGORA)
// =========================
const linkCadastro = document.getElementById('link-cadastro');
const linkVoltarLogin = document.getElementById('link-voltar-login');
const btnLogin = document.getElementById('btn-login');
const btnRegistrar = document.getElementById('btn-registrar');

if (linkCadastro) {
  linkCadastro.addEventListener('click', () => showView('register'));
}
if (linkVoltarLogin) {
  linkVoltarLogin.addEventListener('click', () => showView('login'));
}
if (btnLogin) {
  btnLogin.addEventListener('click', () => showView('home'));
}
if (btnRegistrar) {
  btnRegistrar.addEventListener('click', () => {
    // depois vamos validar e salvar no Firebase Auth
    showView('login');
  });
}

// BOTÕES com data-target-view (home, config, etc)
document.querySelectorAll('[data-target-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.targetView;
    if (target) showView(target);
  });
});

// NAV INFERIOR
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.targetView;
    if (target) showView(target);
  });
});

// Olho da senha
document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// Email fake em Config
const configEmail = document.getElementById('config-email');
if (configEmail) {
  configEmail.textContent = 'email@exemplo.com';
}

// =========================
// CALENDÁRIO AGENDA (VISUAL)
// =========================
const agendaGrid = document.getElementById('agenda-grid');
const agendaLabel = document.getElementById('agenda-month-label');
const agendaPrev = document.getElementById('agenda-prev');
const agendaNext = document.getElementById('agenda-next');

const monthNames = [
  'janeiro', 'fevereiro', 'março', 'abril',
  'maio', 'junho', 'julho', 'agosto',
  'setembro', 'outubro', 'novembro', 'dezembro'
];

let today = new Date();
let calMonth = today.getMonth();
let calYear = today.getFullYear();

// depois vamos preencher com dados reais de agenda
const agendaEventos = {};

function renderAgenda() {
  if (!agendaGrid || !agendaLabel) return;

  agendaGrid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1);
  const startingDay = firstDay.getDay(); // 0 domingo
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  agendaLabel.textContent = `${monthNames[calMonth]} de ${calYear}`;

  for (let i = 0; i < 42; i++) {
    const cell = document.createElement('div');
    cell.classList.add('agenda-day');

    let dayNumber;
    let inCurrentMonth = true;

    if (i < startingDay) {
      dayNumber = prevMonthDays - (startingDay - 1 - i);
      inCurrentMonth = false;
    } else if (i >= startingDay + daysInMonth) {
      dayNumber = i - (startingDay + daysInMonth) + 1;
      inCurrentMonth = false;
    } else {
      dayNumber = i - startingDay + 1;
    }

    cell.textContent = dayNumber;

    if (!inCurrentMonth) {
      cell.classList.add('inactive');
    } else {
      const isToday =
        dayNumber === today.getDate() &&
        calMonth === today.getMonth() &&
        calYear === today.getFullYear();

      if (isToday) {
        cell.classList.add('today');
      }

      const dateKey = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(dayNumber).padStart(2,'0')}`;
      if (agendaEventos[dateKey]) {
        cell.classList.add('has-event');
      }
    }

    agendaGrid.appendChild(cell);
  }
}

if (agendaPrev && agendaNext) {
  agendaPrev.addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) {
      calMonth = 11;
      calYear--;
    }
    renderAgenda();
  });

  agendaNext.addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) {
      calMonth = 0;
      calYear++;
    }
    renderAgenda();
  });
}

if (agendaGrid) {
  renderAgenda();
}

// =========================
// FAB (+) genérico (ainda pouco usado)
// =========================
document.querySelectorAll('.fab-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const ctx = btn.dataset.addContext || 'registro';

    // caso específico: Novo Pedido (se existir)
    if (btn.id === 'fab-add-item') {
      abrirModalItem();
      return;
    }

    // demais "+" poderiam usar modal genérico
    abrirModalGenerico(ctx);
  });
});

// =========================
// MODAL GENÉRICO (AINDA FICTÍCIO)
// =========================
const modalGeneric = document.getElementById('modal-generic');
const modalGenericTitle = document.getElementById('modal-generic-title');
const modalGenericText = document.getElementById('modal-generic-text');
const modalGenericClose = document.getElementById('modal-generic-close');
const modalGenericCancel = document.getElementById('modal-generic-cancel');
const modalGenericSave = document.getElementById('modal-generic-save');
const modalGenericNome = document.getElementById('modal-generic-nome');
const modalGenericNotas = document.getElementById('modal-generic-notas');

function abrirModalGenerico(contexto) {
  if (!modalGeneric) return;

  modalGenericTitle.textContent = 'Adicionar ' + contexto;
  modalGenericText.textContent =
    'Este é o formulário inicial para adicionar ' + contexto + '. ' +
    'Depois vamos detalhar campos específicos para cada tipo.';

  if (modalGenericNome) modalGenericNome.value = '';
  if (modalGenericNotas) modalGenericNotas.value = '';

  modalGeneric.classList.add('visible');
}

function fecharModalGenerico() {
  if (!modalGeneric) return;
  modalGeneric.classList.remove('visible');
}

if (modalGenericClose) {
  modalGenericClose.addEventListener('click', fecharModalGenerico);
}
if (modalGenericCancel) {
  modalGenericCancel.addEventListener('click', fecharModalGenerico);
}
if (modalGenericSave) {
  modalGenericSave.addEventListener('click', () => {
    fecharModalGenerico();
  });
}

// =========================
// MÊS NA TELA DE VENDAS
// =========================
const vendasMesChip = document.getElementById('vendas-mes-chip');
const vendasMesPrev = document.getElementById('vendas-mes-prev');
const vendasMesNext = document.getElementById('vendas-mes-next');

let vendasMonth = today.getMonth();
let vendasYear = today.getFullYear();

function renderVendasMes() {
  if (vendasMesChip) {
    vendasMesChip.textContent = `${monthNames[vendasMonth]}/${vendasYear}`;
  }
}

if (vendasMesPrev && vendasMesNext) {
  vendasMesPrev.addEventListener('click', () => {
    vendasMonth--;
    if (vendasMonth < 0) {
      vendasMonth = 11;
      vendasYear--;
    }
    renderVendasMes();
  });

  vendasMesNext.addEventListener('click', () => {
    vendasMonth++;
    if (vendasMonth > 11) {
      vendasMonth = 0;
      vendasYear++;
    }
    renderVendasMes();
  });
}

renderVendasMes();

// =========================
// DADOS EM MEMÓRIA + FIRESTORE
// =========================

// coleções do Firestore:
// - clientes: {nome, tel, end, cid, est}
// - produtos: {nome, preco, custo}
// - pedidos:  {clienteNome, itens[], totalVenda, totalCusto, status, statusPagamento, createdAt}
// - materiasPrima: {descricao, unidade}
// - fornecedores: {nome, ...}

let clientes = [];
let produtos = [];
let pedidos = [];
let materiasPrima = [];
let fornecedores = [];

// ---------- RENDER LISTAS DE CADASTRO ----------

function renderClientesLista() {
  const lista = document.getElementById('lista-clientes-cad');
  if (!lista) return;

  if (!clientes.length) {
    lista.innerHTML = '<p class="item-meta">Nenhum cliente cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...clientes].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
  );

  lista.innerHTML = ordenados.map(c => {
    const linhaEndereco = [
      c.end || '',
      c.cid || '',
      c.est ? `/${c.est}` : ''
    ].filter(Boolean).join(' - ').replace(' - /', '/');

    return `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${c.nome || '(sem nome)'}</span>
        </div>
        <div class="item-meta">
          ${c.tel || ''}<br>
          ${linhaEndereco || ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderProdutosLista() {
  const lista = document.getElementById('lista-produtos-cad');
  if (!lista) return;

  if (!produtos.length) {
    lista.innerHTML = '<p class="item-meta">Nenhum produto cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...produtos].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
  );

  lista.innerHTML = ordenados.map(p => `
    <div class="item-card">
      <div class="item-row">
        <span class="item-title">${p.nome || '(sem nome)'}</span>
      </div>
      <div class="item-meta">
        Unidade: ${p.unid || '-'}<br>
        Custo: R$ ${Number(p.custo || 0).toFixed(2)}<br>
        Venda: R$ ${Number(p.preco || 0).toFixed(2)}
      </div>
    </div>
  `).join('');
}

function renderMateriasLista() {
  const lista = document.getElementById('lista-mp-cad');
  if (!lista) return;

  if (!materiasPrima.length) {
    lista.innerHTML = '<p class="item-meta">Nenhuma matéria-prima cadastrada ainda.</p>';
    return;
  }

  const ordenados = [...materiasPrima].sort((a, b) =>
    (a.descricao || '').localeCompare(b.descricao || '', 'pt-BR')
  );

  lista.innerHTML = ordenados.map(mp => `
    <div class="item-card">
      <div class="item-row">
        <span class="item-title">${mp.descricao || '(sem descrição)'}</span>
      </div>
      <div class="item-meta">
        Unidade: ${mp.unidade || '-'}
      </div>
    </div>
  `).join('');
}

function renderFornecedoresLista() {
  const lista = document.getElementById('lista-forn-cad');
  if (!lista) return;

  if (!fornecedores.length) {
    lista.innerHTML = '<p class="item-meta">Nenhum fornecedor cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...fornecedores].sort((a, b) =>
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
  );

  lista.innerHTML = ordenados.map(f => {
    const tipo = f.tipoLocal === 'internet' ? 'Internet' : 'Físico';
    const detalhes = [];

    if (f.tipoLocal === 'fisico') {
      const linhaEnd = [
        f.end || '',
        f.cid || '',
        f.est ? `/${f.est}` : ''
      ].filter(Boolean).join(' - ').replace(' - /', '/');
      if (linhaEnd) detalhes.push(linhaEnd);
      if (f.contato) detalhes.push(`Contato: ${f.contato}`);
    } else {
      if (f.plataforma) detalhes.push(`Plataforma: ${f.plataforma}`);
      const loc = [f.cidadeInternet || '', f.estadoInternet || '']
        .filter(Boolean).join(' / ');
      if (loc) detalhes.push(loc);
    }

    return `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${f.nome || '(sem nome)'}</span>
        </div>
        <div class="item-meta">
          Tipo: ${tipo}<br>
          ${detalhes.join('<br>')}
        </div>
      </div>
    `;
  }).join('');
}

// ---------- LISTENERS EM TEMPO REAL ----------

function startClientesListener() {
  const ref = collection(db, 'clientes');
  onSnapshot(ref, snapshot => {
    clientes = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderClientesLista();
  });
}

function startProdutosListener() {
  const ref = collection(db, 'produtos');
  onSnapshot(ref, snapshot => {
    produtos = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderProdutosLista();
  });
}

function startPedidosListener() {
  const ref = collection(db, 'pedidos');
  onSnapshot(ref, snapshot => {
    pedidos = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderizarItensPedido();
    atualizarAgendaPedidos(); // para o registro de agenda enxergar os pedidos
  });
}

function startMateriasPrimaListener() {
  const ref = collection(db, 'materiasPrima');
  onSnapshot(ref, snapshot => {
    materiasPrima = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderMateriasLista();
  });
}

function startFornecedoresListener() {
  const ref = collection(db, 'fornecedores');
  onSnapshot(ref, snapshot => {
    fornecedores = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderFornecedoresLista();
  });
}

// =========================
// NOVO PEDIDO - LISTA NA HOME (ainda não está visível, mas mantemos)
// =========================

const listaItensEl = document.getElementById('lista-itens-pedido');
const pedidoTotalEl = document.getElementById('pedido-total');

// modo edição (canetinha)
let editMode = false;
const btnEditPedidos = document.getElementById('fab-edit-pedidos');
if (btnEditPedidos) {
  btnEditPedidos.addEventListener('click', () => {
    editMode = !editMode;
    renderizarItensPedido();
  });
}

function renderizarItensPedido() {
  if (!listaItensEl) return;

  if (!pedidos.length) {
    listaItensEl.innerHTML = '<p class="item-meta">Nenhum item adicionado ainda. Toque em “+” para incluir.</p>';
    if (pedidoTotalEl) pedidoTotalEl.textContent = 'Total do pedido: R$ 0,00';
    return;
  }

  // agrupar por cliente
  const gruposMap = {};
  pedidos.forEach(p => {
    const key = p.clienteNome && p.clienteNome.trim()
      ? p.clienteNome.trim()
      : '(sem cliente)';

    if (!gruposMap[key]) {
      gruposMap[key] = {
        clienteNome: key,
        itens: [],
        totalVenda: 0,
        totalCusto: 0
      };
    }

    const grupo = gruposMap[key];

    if (Array.isArray(p.itens)) {
      p.itens.forEach(it => {
        grupo.itens.push(it);
        grupo.totalVenda += Number(it.totalVenda || 0);
        grupo.totalCusto += Number(it.totalCusto || 0);
      });
    } else {
      grupo.totalVenda += Number(p.totalVenda || 0);
      grupo.totalCusto += Number(p.totalCusto || 0);
    }
  });

  const gruposArr = Object.values(gruposMap);

  // total global
  let totalGlobal = 0;
  gruposArr.forEach(g => totalGlobal += g.totalVenda);

  const html = gruposArr.map((grupo, idx) => {
    // resumo dos produtos (soma por nome)
    const porProduto = {};
    grupo.itens.forEach(it => {
      const nome = it.produtoNome || 'Produto';
      porProduto[nome] = (porProduto[nome] || 0) + Number(it.quantidade || 0);
    });

    const resumoProdutos = Object.entries(porProduto)
      .map(([nome, qtd]) => `${nome} (${qtd})`)
      .join(', ');

    const detalhes = grupo.itens.map(it => `
      <li>
        ${it.produtoNome || 'Produto'} — Qtd: ${it.quantidade || 0}
        • Venda: R$ ${(it.totalVenda || 0).toFixed ? it.totalVenda.toFixed(2) : Number(it.totalVenda || 0).toFixed(2)}
        • Custo: R$ ${(it.totalCusto || 0).toFixed ? it.totalCusto.toFixed(2) : Number(it.totalCusto || 0).toFixed(2)}
      </li>
    `).join('');

    return `
      <div class="item-card pedido-group-card" data-grupo-idx="${idx}">
        <div class="pedido-group-header item-row">
          <span class="item-title">${grupo.clienteNome}</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge badge-venda">R$ ${grupo.totalVenda.toFixed(2)}</span>
            ${editMode ? `<button type="button" class="btn-remove-group" data-remover-grupo="${idx}">−</button>` : ''}
          </div>
        </div>
        <div class="pedido-summary">
          Itens: ${resumoProdutos || '—'}
        </div>
        <div class="pedido-detalhes">
          <ul>
            ${detalhes}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  listaItensEl.innerHTML = html;

  if (pedidoTotalEl) {
    pedidoTotalEl.textContent = `Total do pedido: R$ ${totalGlobal.toFixed(2)}`;
  }

  // abrir/fechar detalhes
  listaItensEl.querySelectorAll('.pedido-group-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('open');
    });
  });

  // modo edição: remover grupo (apaga todos os pedidos desse cliente no Firestore)
  if (editMode) {
    const gruposRef = gruposArr;
    listaItensEl.querySelectorAll('[data-remover-grupo]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.removerGrupo, 10);
        if (isNaN(idx)) return;

        const grupo = gruposRef[idx];
        const nome = grupo.clienteNome;

        const promises = pedidos
          .filter(p => {
            const k = p.clienteNome && p.clienteNome.trim()
              ? p.clienteNome.trim()
              : '(sem cliente)';
            return k === nome;
          })
          .map(p => deleteDoc(doc(db, 'pedidos', p.id)));

        try {
          await Promise.all(promises);
        } catch (err) {
          console.error('Erro ao remover pedidos do cliente:', err);
          alert('Não foi possível remover os pedidos desse cliente.');
        }
      });
    });
  }
}

// =========================
// MODAL MODERNO - NOVO PEDIDO (ainda não usado na UI nova, mas mantido)
// =========================
const modalItem = document.getElementById('modal-item');
const btnModalFechar = document.getElementById('modal-item-fechar');
const btnModalCancelar = document.getElementById('modal-item-cancelar');
const btnModalSalvar = document.getElementById('modal-item-salvar');
const btnAddProduto = document.getElementById('btn-add-produto');

const campoBuscaCliente = document.getElementById('pedido-busca-cliente');
const listaClientesEl = document.getElementById('lista-clientes');
const clienteInfoCard = document.getElementById('cliente-info');
const infoTel = document.getElementById('info-telefone');
const infoEnd = document.getElementById('info-endereco');
const infoCid = document.getElementById('info-cidade');
const infoEst = document.getElementById('info-estado');

function abrirModalItem() {
  if (!modalItem) return;

  if (campoBuscaCliente) campoBuscaCliente.value = '';
  if (clienteInfoCard) clienteInfoCard.style.display = 'none';
  if (listaClientesEl) {
    listaClientesEl.innerHTML = '';
    listaClientesEl.style.display = 'none';
  }

  limparProdutosDoPedidoModal();
  adicionarProdutoLinha();
  atualizarTotaisModal();

  modalItem.classList.add('visible');
}

function fecharModalItem() {
  if (!modalItem) return;
  modalItem.classList.remove('visible');
}

function limparProdutosDoPedidoModal() {
  const container = document.getElementById('pedido-produtos-container');
  if (container) container.innerHTML = '';
}

function adicionarProdutoLinha() {
  const container = document.getElementById('pedido-produtos-container');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'produto-item';
  div.innerHTML = `
    <div class="form-group">
      <label>Produto</label>
      <input type="text" class="produto-busca" placeholder="Buscar produto...">
      <div class="autocomplete-list"></div>
    </div>

    <div class="form-row">
      <div class="form-group half">
        <label>Qtd.</label>
        <input type="number" min="1" value="1" class="produto-qtd">
      </div>
      <div class="form-group half">
        <label>Valor venda</label>
        <div class="valor verde produto-total-venda">R$ 0,00</div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group half">
        <label>Custo</label>
        <div class="valor vermelho produto-total-custo">R$ 0,00</div>
      </div>
    </div>

    <hr>
  `;

  container.appendChild(div);

  configurarBuscaProduto(div);
  configurarQuantidade(div);
}

// ---------- BUSCA CLIENTE (USA COLEÇÃO 'clientes') ----------
function configurarBuscaCliente() {
  if (!campoBuscaCliente || !listaClientesEl) return;

  campoBuscaCliente.addEventListener('input', () => {
    const texto = campoBuscaCliente.value.toLowerCase();
    listaClientesEl.innerHTML = '';

    if (!texto) {
      listaClientesEl.style.display = 'none';
      return;
    }

    clientes
      .filter(c => (c.nome || '').toLowerCase().includes(texto))
      .forEach(c => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = c.nome || '(sem nome)';
        item.addEventListener('click', () => {
          campoBuscaCliente.value = c.nome || '';
          listaClientesEl.innerHTML = '';
          listaClientesEl.style.display = 'none';

          if (clienteInfoCard) {
            clienteInfoCard.style.display = 'block';
            if (infoTel) infoTel.textContent = c.tel || '';
            if (infoEnd) infoEnd.textContent = c.end || '';
            if (infoCid) infoCid.textContent = c.cid || '';
            if (infoEst) infoEst.textContent = c.est || '';
          }
        });
        listaClientesEl.appendChild(item);
      });

    listaClientesEl.style.display = 'block';
  });
}

// ---------- BUSCA PRODUTO + VALORES (USA COLEÇÃO 'produtos') ----------
function configurarBuscaProduto(divProduto) {
  const inputBusca = divProduto.querySelector('.produto-busca');
  const lista = divProduto.querySelector('.autocomplete-list');
  const qtdInput = divProduto.querySelector('.produto-qtd');
  const totalVenda = divProduto.querySelector('.produto-total-venda');
  const totalCusto = divProduto.querySelector('.produto-total-custo');

  if (!inputBusca || !lista || !qtdInput || !totalVenda || !totalCusto) return;

  inputBusca.addEventListener('input', () => {
    const texto = inputBusca.value.toLowerCase();
    lista.innerHTML = '';

    if (!texto) {
      lista.style.display = 'none';
      return;
    }

    produtos
      .filter(p => (p.nome || '').toLowerCase().includes(texto))
      .forEach(p => {
        const item = document.createElement('div');
        const precoNum = Number(p.preco || 0);
        item.className = 'autocomplete-item';
        item.textContent = `${p.nome || 'Produto'} — R$ ${precoNum.toFixed(2)}`;
        item.addEventListener('click', () => {
          inputBusca.value = p.nome || '';
          inputBusca.dataset.preco = precoNum;
          inputBusca.dataset.custo = Number(p.custo || 0);
          inputBusca.dataset.produtoId = p.id || '';

          atualizarValoresProduto(divProduto);

          lista.innerHTML = '';
          lista.style.display = 'none';
        });
        lista.appendChild(item);
      });

    lista.style.display = 'block';
  });
}

function configurarQuantidade(divProduto) {
  const qtdInput = divProduto.querySelector('.produto-qtd');
  if (!qtdInput) return;

  qtdInput.addEventListener('input', () => {
    atualizarValoresProduto(divProduto);
  });
}

function atualizarValoresProduto(divProduto) {
  const inputBusca = divProduto.querySelector('.produto-busca');
  const qtdInput = divProduto.querySelector('.produto-qtd');
  const totalVenda = divProduto.querySelector('.produto-total-venda');
  const totalCusto = divProduto.querySelector('.produto-total-custo');

  if (!inputBusca || !qtdInput || !totalVenda || !totalCusto) return;

  const qtd = Number(qtdInput.value || 0);
  const preco = Number(inputBusca.dataset.preco || 0);
  const custo = Number(inputBusca.dataset.custo || 0);

  totalVenda.textContent = 'R$ ' + (qtd * preco).toFixed(2);
  totalCusto.textContent = 'R$ ' + (qtd * custo).toFixed(2);

  atualizarTotaisModal();
}

function atualizarTotaisModal() {
  let totalVenda = 0;
  let totalCusto = 0;

  document.querySelectorAll('.produto-item').forEach(div => {
    const vendaEl = div.querySelector('.produto-total-venda');
    const custoEl = div.querySelector('.produto-total-custo');
    if (!vendaEl || !custoEl) return;

    const vendaNum = Number(
      (vendaEl.textContent || '0').replace('R$','').replace('.','').replace(',','.') || 0
    );
    const custoNum = Number(
      (custoEl.textContent || '0').replace('R$','').replace('.','').replace(',','.') || 0
    );

    totalVenda += vendaNum;
    totalCusto += custoNum;
  });

  const vendaSpan = document.getElementById('total-venda-modal');
  const custoSpan = document.getElementById('total-custo-modal');
  const lucroSpan = document.getElementById('total-lucro-modal');

  if (vendaSpan) vendaSpan.textContent = 'R$ ' + totalVenda.toFixed(2);
  if (custoSpan) custoSpan.textContent = 'R$ ' + totalCusto.toFixed(2);

  let lucroPerc = 0;
  if (totalCusto > 0) {
    lucroPerc = ((totalVenda - totalCusto) / totalCusto) * 100;
  }
  if (lucroSpan) lucroSpan.textContent = lucroPerc.toFixed(1) + '%';
}

// ---------- SALVAR DO MODAL PARA FIRESTORE ('pedidos') ----------
async function salvarPedidoDoModal() {
  const clienteNome = campoBuscaCliente ? campoBuscaCliente.value.trim() : '';

  const itens = [];

  document.querySelectorAll('.produto-item').forEach(div => {
    const inputBusca = div.querySelector('.produto-busca');
    const qtdInput = div.querySelector('.produto-qtd');

    if (!inputBusca || !qtdInput) return;

    const nomeProd = inputBusca.value.trim();
    const preco = Number(inputBusca.dataset.preco || 0);
    const custo = Number(inputBusca.dataset.custo || 0);
    const qtd = Number(qtdInput.value || 0);
    const produtoId = inputBusca.dataset.produtoId || null;

    if (!nomeProd || qtd <= 0 || preco <= 0) return;

    const totalVenda = qtd * preco;
    const totalCusto = qtd * custo;

    itens.push({
      produtoId,
      produtoNome: nomeProd,
      quantidade: qtd,
      precoUnit: preco,
      custoUnit: custo,
      totalVenda,
      totalCusto
    });
  });

  if (!itens.length) {
    alert('Adicione pelo menos um produto válido.');
    return;
  }

  // soma pra salvar no documento
  let totalVenda = 0;
  let totalCusto = 0;
  itens.forEach(it => {
    totalVenda += it.totalVenda;
    totalCusto += it.totalCusto;
  });

  try {
    await addDoc(collection(db, 'pedidos'), {
      clienteNome: clienteNome || '(sem cliente)',
      itens,
      totalVenda,
      totalCusto,
      status: 'aguardando',
      statusPagamento: 'a-receber',
      createdAt: serverTimestamp()
    });

    fecharModalItem();
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    alert('Não foi possível salvar o pedido.');
  }
}

// listeners do modal de pedido (se existir)
if (campoBuscaCliente) configurarBuscaCliente();
if (btnAddProduto) btnAddProduto.addEventListener('click', adicionarProdutoLinha);
if (btnModalFechar) btnModalFechar.addEventListener('click', fecharModalItem);
if (btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalItem);
if (btnModalSalvar) btnModalSalvar.addEventListener('click', salvarPedidoDoModal);

// =========================
// FINANÇAS - MOSTRAR BLOCOS POR TIPO
// =========================
const lancTipo = document.getElementById('lanc-tipo');
const blocoSaidaInvest = document.getElementById('bloco-saida-investimento');
const blocoCompraMp = document.getElementById('bloco-compra-mp');
const blocoVenda = document.getElementById('bloco-venda');
const blocoEntradaInvest = document.getElementById('bloco-entrada-investimento');

function atualizarBlocosLanc() {
  if (!lancTipo) return;

  if (blocoSaidaInvest) blocoSaidaInvest.style.display = 'none';
  if (blocoCompraMp) blocoCompraMp.style.display = 'none';
  if (blocoVenda) blocoVenda.style.display = 'none';
  if (blocoEntradaInvest) blocoEntradaInvest.style.display = 'none';

  const tipo = lancTipo.value;

  if (tipo === 'saida-investimento' && blocoSaidaInvest) {
    blocoSaidaInvest.style.display = 'block';
  } else if (tipo === 'compra-mp' && blocoCompraMp) {
    blocoCompraMp.style.display = 'block';
  } else if (tipo === 'venda' && blocoVenda) {
    blocoVenda.style.display = 'block';
  } else if (tipo === 'entrada-investimento' && blocoEntradaInvest) {
    blocoEntradaInvest.style.display = 'block';
  }
}

if (lancTipo) {
  lancTipo.addEventListener('change', atualizarBlocosLanc);
}

// toggle "Pago parcialmente" na parte de venda
const chkVendaParcial = document.getElementById('lanc-venda-parcial');
const blocoVendaParcial = document.getElementById('lanc-venda-parcial-bloco');
const blocoVendaDataTotal = document.getElementById('lanc-venda-data-total-bloco');

function configurarToggleParcialVenda() {
  if (!chkVendaParcial || !blocoVendaParcial || !blocoVendaDataTotal) return;

  function apply() {
    if (chkVendaParcial.checked) {
      blocoVendaParcial.style.display = 'block';
      blocoVendaDataTotal.style.display = 'none';
    } else {
      blocoVendaParcial.style.display = 'none';
      blocoVendaDataTotal.style.display = 'block';
    }
  }

  chkVendaParcial.addEventListener('change', apply);
  apply();
}

// =========================
// AGENDA REGISTRO - VINCULAR PEDIDOS POR STATUS
// =========================
const agendaTipo = document.getElementById('agenda-tipo');

let agendaPedidoWrapper = null;
let agendaPedidoSelect = null;

function setupAgendaPedidoSelect() {
  if (!agendaTipo) return;
  if (agendaPedidoWrapper && agendaPedidoSelect) return; // já criado

  const tipoGroup = agendaTipo.parentElement;
  const section = document.querySelector('[data-view="agenda-registro"] .home-section');
  if (!tipoGroup || !section) return;

  agendaPedidoWrapper = document.createElement('div');
  agendaPedidoWrapper.className = 'form-group';
  agendaPedidoWrapper.style.display = 'none';

  const label = document.createElement('label');
  label.setAttribute('for', 'agenda-pedido-select');
  label.textContent = 'Pedido vinculado';

  agendaPedidoSelect = document.createElement('select');
  agendaPedidoSelect.id = 'agenda-pedido-select';

  agendaPedidoWrapper.appendChild(label);
  agendaPedidoWrapper.appendChild(agendaPedidoSelect);

  // insere logo abaixo do campo "Tipo"
  tipoGroup.insertAdjacentElement('afterend', agendaPedidoWrapper);
}

function atualizarAgendaPedidos() {
  if (!agendaTipo || !agendaPedidoWrapper || !agendaPedidoSelect) return;

  const tipo = agendaTipo.value;

  if (tipo === 'producao' || tipo === 'entrega') {
    agendaPedidoWrapper.style.display = 'block';

    let statusPermitidos = [];
    if (tipo === 'producao') {
      // só pedidos aguardando
      statusPermitidos = ['aguardando'];
    } else if (tipo === 'entrega') {
      // aguardando, em andamento, finalizado
      statusPermitidos = ['aguardando', 'andamento', 'finalizado'];
    }

    const filtrados = pedidos.filter(p =>
      p.status && statusPermitidos.includes(p.status)
    );

    agendaPedidoSelect.innerHTML = '';
    const optVazio = document.createElement('option');
    optVazio.value = '';
    optVazio.textContent = '— selecione um pedido —';
    agendaPedidoSelect.appendChild(optVazio);

    filtrados.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      const nomeCliente = p.clienteNome || '(sem cliente)';
      const total = Number(p.totalVenda || 0).toFixed(2);
      opt.textContent = `${nomeCliente} — R$ ${total}`;
      agendaPedidoSelect.appendChild(opt);
    });
  } else {
    // tipo "outros" ou vazio: não mostra pedido
    agendaPedidoWrapper.style.display = 'none';
  }
}

if (agendaTipo) {
  agendaTipo.addEventListener('change', atualizarAgendaPedidos);
}

// =========================
// FABs E MODAIS DOS CADASTROS
// =========================

// ---- CLIENTES ----
const fabAddCliente = document.getElementById('fab-add-cliente');
const modalCliente = document.getElementById('modal-cliente');
const modalClienteFechar = document.getElementById('modal-cliente-fechar');
const cadClienteCancelar = document.getElementById('cad-cliente-cancelar');
const cadClienteSalvar = document.getElementById('cad-cliente-salvar');

const inpCliNome = document.getElementById('cad-cliente-nome');
const inpCliTel = document.getElementById('cad-cliente-tel');
const inpCliEnd = document.getElementById('cad-cliente-end');
const inpCliCid = document.getElementById('cad-cliente-cid');
const inpCliEst = document.getElementById('cad-cliente-est');

function abrirModalCliente() {
  if (!modalCliente) return;
  if (inpCliNome) inpCliNome.value = '';
  if (inpCliTel) inpCliTel.value = '';
  if (inpCliEnd) inpCliEnd.value = '';
  if (inpCliCid) inpCliCid.value = '';
  if (inpCliEst) inpCliEst.value = '';
  modalCliente.classList.add('visible');
}

function fecharModalCliente() {
  if (!modalCliente) return;
  modalCliente.classList.remove('visible');
}

if (fabAddCliente) fabAddCliente.addEventListener('click', abrirModalCliente);
if (modalClienteFechar) modalClienteFechar.addEventListener('click', fecharModalCliente);
if (cadClienteCancelar) cadClienteCancelar.addEventListener('click', fecharModalCliente);

if (cadClienteSalvar) {
  cadClienteSalvar.addEventListener('click', async () => {
    const nome = (inpCliNome?.value || '').trim();
    if (!nome) {
      alert('Informe pelo menos o nome do cliente.');
      return;
    }

    try {
      await addDoc(collection(db, 'clientes'), {
        nome,
        tel: inpCliTel?.value || '',
        end: inpCliEnd?.value || '',
        cid: inpCliCid?.value || '',
        est: inpCliEst?.value || '',
        createdAt: serverTimestamp()
      });
      fecharModalCliente();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('Não foi possível salvar o cliente.');
    }
  });
}

// ---- PRODUTOS ----
const fabAddProdutoCad = document.getElementById('fab-add-produto');
const modalProduto = document.getElementById('modal-produto');
const modalProdutoFechar = document.getElementById('modal-produto-fechar');
const cadProdCancelar = document.getElementById('cad-prod-cancelar');
const cadProdSalvar = document.getElementById('cad-prod-salvar');

const inpProdDesc = document.getElementById('cad-prod-desc');
const inpProdUnid = document.getElementById('cad-prod-unid');
const inpProdCusto = document.getElementById('cad-prod-custo');
const inpProdVenda = document.getElementById('cad-prod-venda');
const inpProdNotas = document.getElementById('cad-prod-notas');

function abrirModalProduto() {
  if (!modalProduto) return;
  if (inpProdDesc) inpProdDesc.value = '';
  if (inpProdUnid) inpProdUnid.value = '';
  if (inpProdCusto) inpProdCusto.value = '';
  if (inpProdVenda) inpProdVenda.value = '';
  if (inpProdNotas) inpProdNotas.value = '';
  modalProduto.classList.add('visible');
}

function fecharModalProduto() {
  if (!modalProduto) return;
  modalProduto.classList.remove('visible');
}

if (fabAddProdutoCad) fabAddProdutoCad.addEventListener('click', abrirModalProduto);
if (modalProdutoFechar) modalProdutoFechar.addEventListener('click', fecharModalProduto);
if (cadProdCancelar) cadProdCancelar.addEventListener('click', fecharModalProduto);

if (cadProdSalvar) {
  cadProdSalvar.addEventListener('click', async () => {
    const nome = (inpProdDesc?.value || '').trim();
    if (!nome) {
      alert('Informe a descrição do produto.');
      return;
    }

    const unid = inpProdUnid?.value || '';
    const custo = Number(inpProdCusto?.value || 0);
    const preco = Number(inpProdVenda?.value || 0);
    const notas = inpProdNotas?.value || '';

    try {
      await addDoc(collection(db, 'produtos'), {
        nome,
        unid,
        custo,
        preco,
        notas,
        createdAt: serverTimestamp()
      });
      fecharModalProduto();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Não foi possível salvar o produto.');
    }
  });
}

// ---- MATÉRIA-PRIMA ----
const fabAddMp = document.getElementById('fab-add-mp');
const modalMp = document.getElementById('modal-mp');
const modalMpFechar = document.getElementById('modal-mp-fechar');
const cadMpCancelar = document.getElementById('cad-mp-cancelar');
const cadMpSalvar = document.getElementById('cad-mp-salvar');

const inpMpDesc = document.getElementById('cad-mp-desc');
const inpMpUnid = document.getElementById('cad-mp-unid');

function abrirModalMp() {
  if (!modalMp) return;
  if (inpMpDesc) inpMpDesc.value = '';
  if (inpMpUnid) inpMpUnid.value = '';
  modalMp.classList.add('visible');
}

function fecharModalMp() {
  if (!modalMp) return;
  modalMp.classList.remove('visible');
}

if (fabAddMp) fabAddMp.addEventListener('click', abrirModalMp);
if (modalMpFechar) modalMpFechar.addEventListener('click', fecharModalMp);
if (cadMpCancelar) cadMpCancelar.addEventListener('click', fecharModalMp);

if (cadMpSalvar) {
  cadMpSalvar.addEventListener('click', async () => {
    const descricao = (inpMpDesc?.value || '').trim();
    if (!descricao) {
      alert('Informe a descrição da matéria-prima.');
      return;
    }
    const unidade = inpMpUnid?.value || '';

    try {
      await addDoc(collection(db, 'materiasPrima'), {
        descricao,
        unidade,
        createdAt: serverTimestamp()
      });
      fecharModalMp();
    } catch (err) {
      console.error('Erro ao salvar matéria-prima:', err);
      alert('Não foi possível salvar a matéria-prima.');
    }
  });
}

// ---- FORNECEDORES ----
const fabAddForn = document.getElementById('fab-add-forn');
const modalForn = document.getElementById('modal-forn');
const modalFornFechar = document.getElementById('modal-forn-fechar');
const cadFornCancelar = document.getElementById('cad-forn-cancelar');
const cadFornSalvar = document.getElementById('cad-forn-salvar');

const inpFornNome = document.getElementById('cad-forn-nome');
const inpFornLocal = document.getElementById('cad-forn-local');

const blocoFornFisico = document.getElementById('cad-forn-bloco-fisico');
const blocoFornInternet = document.getElementById('cad-forn-bloco-internet');

const inpFornEnd = document.getElementById('cad-forn-end');
const inpFornCid = document.getElementById('cad-forn-cid');
const inpFornEst = document.getElementById('cad-forn-est');
const inpFornContato = document.getElementById('cad-forn-contato');

const inpFornPlataforma = document.getElementById('cad-forn-plataforma');
const inpFornCidInt = document.getElementById('cad-forn-cidade-int');
const inpFornEstInt = document.getElementById('cad-forn-estado-int');

function aplicarVisibilidadeForn() {
  if (!inpFornLocal || !blocoFornFisico || !blocoFornInternet) return;
  const tipo = inpFornLocal.value;

  if (tipo === 'fisico') {
    blocoFornFisico.style.display = 'block';
    blocoFornInternet.style.display = 'none';
  } else if (tipo === 'internet') {
    blocoFornFisico.style.display = 'none';
    blocoFornInternet.style.display = 'block';
  } else {
    blocoFornFisico.style.display = 'none';
    blocoFornInternet.style.display = 'none';
  }
}

if (inpFornLocal) {
  inpFornLocal.addEventListener('change', aplicarVisibilidadeForn);
}

function abrirModalForn() {
  if (!modalForn) return;

  if (inpFornNome) inpFornNome.value = '';
  if (inpFornLocal) inpFornLocal.value = '';

  if (inpFornEnd) inpFornEnd.value = '';
  if (inpFornCid) inpFornCid.value = '';
  if (inpFornEst) inpFornEst.value = '';
  if (inpFornContato) inpFornContato.value = '';

  if (inpFornPlataforma) inpFornPlataforma.value = '';
  if (inpFornCidInt) inpFornCidInt.value = '';
  if (inpFornEstInt) inpFornEstInt.value = '';

  aplicarVisibilidadeForn();

  modalForn.classList.add('visible');
}

function fecharModalForn() {
  if (!modalForn) return;
  modalForn.classList.remove('visible');
}

if (fabAddForn) fabAddForn.addEventListener('click', abrirModalForn);
if (modalFornFechar) modalFornFechar.addEventListener('click', fecharModalForn);
if (cadFornCancelar) cadFornCancelar.addEventListener('click', fecharModalForn);

if (cadFornSalvar) {
  cadFornSalvar.addEventListener('click', async () => {
    const nome = (inpFornNome?.value || '').trim();
    if (!nome) {
      alert('Informe o nome do fornecedor.');
      return;
    }

    const tipoLocal = inpFornLocal?.value || '';

    const payload = {
      nome,
      tipoLocal,
      createdAt: serverTimestamp()
    };

    if (tipoLocal === 'fisico') {
      payload.end = inpFornEnd?.value || '';
      payload.cid = inpFornCid?.value || '';
      payload.est = inpFornEst?.value || '';
      payload.contato = inpFornContato?.value || '';
    } else if (tipoLocal === 'internet') {
      payload.plataforma = inpFornPlataforma?.value || '';
      payload.cidadeInternet = inpFornCidInt?.value || '';
      payload.estadoInternet = inpFornEstInt?.value || '';
    }

    try {
      await addDoc(collection(db, 'fornecedores'), payload);
      fecharModalForn();
    } catch (err) {
      console.error('Erro ao salvar fornecedor:', err);
      alert('Não foi possível salvar o fornecedor.');
    }
  });
}

// =========================
// INIT GERAL
// =========================
function init() {
  // listeners em tempo real
  startClientesListener();
  startProdutosListener();
  startPedidosListener();
  startMateriasPrimaListener();
  startFornecedoresListener();

  // login desabilitado por enquanto -> cai direto na home
  showView('home');

  // finanças
  atualizarBlocosLanc();
  configurarToggleParcialVenda();

  // agenda registro
  setupAgendaPedidoSelect();
  atualizarAgendaPedidos();
}

init();
