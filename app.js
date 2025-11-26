// app.js - Catrion Lumi
// ===============================
// IMPORTS FIREBASE (modular)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ===============================
// FIREBASE INIT
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBRYiyP6NfaYt0QORlOo8s0w4oJkOpMZ7w",
  authDomain: "catrion-lumi.firebaseapp.com",
  projectId: "catrion-lumi",
  storageBucket: "catrion-lumi.firebasestorage.app",
  messagingSenderId: "236769242398",
  appId: "1:236769242398:web:c4f734e313b9821b5bed0f"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// ===============================
// ESTADO EM MEMÓRIA
// ===============================
let clientes = [];        // {id, nome, tel, end, cid, est}
let produtos = [];        // {id, nome, unidade, preco, custo}
let materiasPrimas = [];  // {id, nome, unidade}
let fornecedores = [];    // {id, ...}

// para cadastros (ID em edição)
let clienteEditId = null;
let produtoEditId = null;
let mpEditId = null;
let fornecedorEditId = null;

// pedidos em memória (ainda não persiste no Firestore)
let pedidoItens = []; // cada item: {clienteNome, produtoNome, quantidade, totalVenda, totalCusto}

// ===============================
// NAV / VIEWS
// ===============================
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
    header && header.classList.remove('visible');
    bottomNav && bottomNav.classList.remove('visible');
  } else {
    header && header.classList.add('visible');
    bottomNav && bottomNav.classList.add('visible');
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

// Bypass login: já entra no HOME
showView('home');

// ===============================
// LOGIN / CADASTRO (desabilitado por enquanto)
// ===============================
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
  btnLogin.addEventListener('click', () => {
    // login desabilitado: entra direto no app
    showView('home');
  });
}
if (btnRegistrar) {
  btnRegistrar.addEventListener('click', () => {
    // cadastro desabilitado: só volta pro login
    showView('login');
  });
}

// BOTÕES com data-target-view (home, config, etc.)
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

// Email em Config (placeholder)
const configEmail = document.getElementById('config-email');
if (configEmail) {
  configEmail.textContent = 'Modo teste (sem login)';
}

// ===============================
// CALENDÁRIO AGENDA
// ===============================
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

// por enquanto agendaEventos vazio (depois ligamos na Agenda do registro)
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

      const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
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

// ===============================
// VENDAS - MÊS NO CHIP
// ===============================
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

// ===============================
// MODAL GENÉRICO (FINANÇAS / AGENDA REGISTRO por enquanto)
// ===============================
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

// ===============================
// FAB (+) - ROTEAMENTO
// ===============================
document.querySelectorAll('.fab-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.id;

    if (id === 'fab-add-item') {
      abrirModalItem();
      return;
    }
    if (id === 'fab-add-cliente') {
      abrirModalCliente(null);
      return;
    }
    if (id === 'fab-add-produto') {
      abrirModalProduto(null);
      return;
    }
    if (id === 'fab-add-mp') {
      abrirModalMp(null);
      return;
    }
    if (id === 'fab-add-fornecedor') {
      abrirModalFornecedor(null);
      return;
    }

    // fallback: modal genérico
    const ctx = btn.dataset.addContext || 'registro';
    abrirModalGenerico(ctx);
  });
});

// ===============================
// NOVO PEDIDO - LISTA NA TELA
// ===============================
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

  if (!pedidoItens.length) {
    listaItensEl.innerHTML = '<p class="item-meta">Nenhum item adicionado ainda. Toque em “+” para incluir.</p>';
    if (pedidoTotalEl) pedidoTotalEl.textContent = 'Total do pedido: R$ 0,00';
    return;
  }

  const grupos = {};

  pedidoItens.forEach(item => {
    const key = item.clienteNome && item.clienteNome.trim()
      ? item.clienteNome.trim()
      : '(sem cliente)';

    if (!grupos[key]) {
      grupos[key] = {
        clienteNome: key,
        itens: [],
        totalVenda: 0,
        totalCusto: 0
      };
    }

    grupos[key].itens.push(item);
    grupos[key].totalVenda += item.totalVenda;
    grupos[key].totalCusto += item.totalCusto;
  });

  const gruposArr = Object.values(grupos);

  let totalGlobal = 0;
  gruposArr.forEach(g => totalGlobal += g.totalVenda);

  const html = gruposArr.map((grupo, idx) => {
    const porProduto = {};
    grupo.itens.forEach(it => {
      porProduto[it.produtoNome] = (porProduto[it.produtoNome] || 0) + it.quantidade;
    });

    const resumoProdutos = Object.entries(porProduto)
      .map(([nome, qtd]) => `${nome} (${qtd})`)
      .join(', ');

    const detalhes = grupo.itens.map(it => `
      <li>
        ${it.produtoNome} — Qtd: ${it.quantidade}
        • Venda: R$ ${it.totalVenda.toFixed(2)}
        • Custo: R$ ${it.totalCusto.toFixed(2)}
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

  // modo edição: remover grupo
  if (editMode) {
    const gruposRef = gruposArr;
    listaItensEl.querySelectorAll('[data-remover-grupo]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.removerGrupo, 10);
        if (isNaN(idx)) return;

        const grupo = gruposRef[idx];
        const key = grupo.clienteNome;

        pedidoItens = pedidoItens.filter(it => {
          const k = it.clienteNome && it.clienteNome.trim()
            ? it.clienteNome.trim()
            : '(sem cliente)';
          return k !== key;
        });

        renderizarItensPedido();
      });
    });
  }
}

// render inicial
renderizarItensPedido();

// ===============================
// MODAL - NOVO PEDIDO
// ===============================
const modalItem = document.getElementById('modal-item');
const btnModalFechar = document.getElementById('modal-item-fechar');
const btnModalCancelar = document.getElementById('modal-item-cancelar');
const btnModalSalvar = document.getElementById('modal-item-salvar');
const btnAddProdutoModal = document.getElementById('btn-add-produto');

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

// ---------- BUSCA CLIENTE ----------
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
      .filter(c => c.nome.toLowerCase().includes(texto))
      .forEach(c => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = c.nome;
        item.addEventListener('click', () => {
          campoBuscaCliente.value = c.nome;
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

    listaClientesEl.style.display = listaClientesEl.children.length ? 'block' : 'none';
  });
}

// ---------- BUSCA PRODUTO + VALORES ----------
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
      .filter(p => p.nome.toLowerCase().includes(texto))
      .forEach(p => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = `${p.nome} — R$ ${p.preco.toFixed(2)}`;
        item.addEventListener('click', () => {
          inputBusca.value = p.nome;
          inputBusca.dataset.preco = p.preco;
          inputBusca.dataset.custo = p.custo;

          atualizarValoresProduto(divProduto);

          lista.innerHTML = '';
          lista.style.display = 'none';
        });
        lista.appendChild(item);
      });

    lista.style.display = lista.children.length ? 'block' : 'none';
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

    const vendaNum = Number(vendaEl.textContent.replace('R$', '').trim() || 0);
    const custoNum = Number(custoEl.textContent.replace('R$', '').trim() || 0);

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

// SALVAR DO MODAL PARA A LISTA (ainda só em memória)
function salvarPedidoDoModal() {
  const clienteNome = campoBuscaCliente ? campoBuscaCliente.value.trim() : '';

  const novos = [];

  document.querySelectorAll('.produto-item').forEach(div => {
    const inputBusca = div.querySelector('.produto-busca');
    const qtdInput = div.querySelector('.produto-qtd');

    if (!inputBusca || !qtdInput) return;

    const nomeProd = inputBusca.value.trim();
    const preco = Number(inputBusca.dataset.preco || 0);
    const custo = Number(inputBusca.dataset.custo || 0);
    const qtd = Number(qtdInput.value || 0);

    if (!nomeProd || qtd <= 0 || preco <= 0) return;

    novos.push({
      clienteNome,
      produtoNome: nomeProd,
      quantidade: qtd,
      totalVenda: qtd * preco,
      totalCusto: qtd * custo
    });
  });

  if (!novos.length) {
    alert('Adicione pelo menos um produto válido.');
    return;
  }

  pedidoItens = pedidoItens.concat(novos);
  renderizarItensPedido();
  fecharModalItem();
}

// listeners do modal
if (campoBuscaCliente) configurarBuscaCliente();
if (btnAddProdutoModal) btnAddProdutoModal.addEventListener('click', adicionarProdutoLinha);
if (btnModalFechar) btnModalFechar.addEventListener('click', fecharModalItem);
if (btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalItem);
if (btnModalSalvar) btnModalSalvar.addEventListener('click', salvarPedidoDoModal);

// ===============================
// CADASTRO DE CLIENTES (CRUD Firestore)
// ===============================
const clientesBuscaInput = document.getElementById('clientes-busca');
const clientesListEl = document.getElementById('clientes-list');
const fabAddCliente = document.getElementById('fab-add-cliente');

// modal cliente
const modalCliente = document.getElementById('modal-cliente');
const modalClienteTitulo = document.getElementById('modal-cliente-titulo');
const modalClienteFechar = document.getElementById('modal-cliente-fechar');
const clienteNomeInput = document.getElementById('cliente-nome');
const clienteTelInput = document.getElementById('cliente-telefone');
const clienteEndInput = document.getElementById('cliente-endereco');
const clienteCidInput = document.getElementById('cliente-cidade');
const clienteEstInput = document.getElementById('cliente-estado');
const clienteExcluirBtn = document.getElementById('cliente-excluir');
const clienteCancelarBtn = document.getElementById('cliente-cancelar');
const clienteSalvarBtn = document.getElementById('cliente-salvar');

function renderClientesLista(filtro = '') {
  if (!clientesListEl) return;
  const texto = (filtro || '').toLowerCase();

  const filtrados = clientes
    .filter(c => c.nome.toLowerCase().includes(texto))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  if (!filtrados.length) {
    clientesListEl.innerHTML = '<p class="item-meta">Nenhum cliente cadastrado.</p>';
    return;
  }

  clientesListEl.innerHTML = filtrados.map(c => `
    <div class="item-card cliente-card" data-id="${c.id}">
      <div class="item-row">
        <span class="item-title">${c.nome}</span>
      </div>
      <div class="item-meta">
        ${c.tel ? `Tel: ${c.tel} • ` : ''}${c.cid || ''}${c.est ? ' - ' + c.est : ''}
      </div>
      ${c.end ? `<div class="item-meta">Endereço: ${c.end}</div>` : ''}
    </div>
  `).join('');

  clientesListEl.querySelectorAll('.cliente-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      abrirModalCliente(id);
    });
  });
}

function abrirModalCliente(idOrNull) {
  if (!modalCliente) return;
  clienteEditId = idOrNull;

  if (clienteEditId) {
    const c = clientes.find(x => x.id === clienteEditId);
    if (!c) return;
    modalClienteTitulo.textContent = 'Editar cliente';
    clienteNomeInput.value = c.nome || '';
    clienteTelInput.value = c.tel || '';
    clienteEndInput.value = c.end || '';
    clienteCidInput.value = c.cid || '';
    clienteEstInput.value = c.est || '';
    if (clienteExcluirBtn) clienteExcluirBtn.style.display = 'inline-block';
  } else {
    modalClienteTitulo.textContent = 'Novo cliente';
    clienteNomeInput.value = '';
    clienteTelInput.value = '';
    clienteEndInput.value = '';
    clienteCidInput.value = '';
    clienteEstInput.value = '';
    if (clienteExcluirBtn) clienteExcluirBtn.style.display = 'none';
  }

  modalCliente.classList.add('visible');
}

function fecharModalCliente() {
  if (!modalCliente) return;
  modalCliente.classList.remove('visible');
  clienteEditId = null;
}

async function salvarClienteFirestore() {
  const nome = (clienteNomeInput.value || '').trim();
  const telefone = (clienteTelInput.value || '').trim();
  const endereco = (clienteEndInput.value || '').trim();
  const cidade = (clienteCidInput.value || '').trim();
  const estado = (clienteEstInput.value || '').trim();

  if (!nome) {
    alert('Informe o nome do cliente.');
    return;
  }

  const payload = { nome, telefone, endereco, cidade, estado };

  try {
    if (clienteEditId) {
      await updateDoc(doc(db, 'clientes', clienteEditId), payload);
    } else {
      await addDoc(collection(db, 'clientes'), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }
    fecharModalCliente();
  } catch (err) {
    console.error('Erro ao salvar cliente', err);
    alert('Erro ao salvar cliente.');
  }
}

async function excluirClienteFirestore() {
  if (!clienteEditId) {
    fecharModalCliente();
    return;
  }
  if (!confirm('Deseja realmente excluir este cliente?')) return;

  try {
    await deleteDoc(doc(db, 'clientes', clienteEditId));
    fecharModalCliente();
  } catch (err) {
    console.error('Erro ao excluir cliente', err);
    alert('Erro ao excluir cliente.');
  }
}

if (clientesBuscaInput) {
  clientesBuscaInput.addEventListener('input', () => {
    renderClientesLista(clientesBuscaInput.value);
  });
}
if (fabAddCliente) fabAddCliente.addEventListener('click', () => abrirModalCliente(null));
if (modalClienteFechar) modalClienteFechar.addEventListener('click', fecharModalCliente);
if (clienteCancelarBtn) clienteCancelarBtn.addEventListener('click', fecharModalCliente);
if (clienteSalvarBtn) clienteSalvarBtn.addEventListener('click', salvarClienteFirestore);
if (clienteExcluirBtn) clienteExcluirBtn.addEventListener('click', excluirClienteFirestore);

// ===============================
// CADASTRO DE PRODUTOS (CRUD Firestore)
// ===============================
const produtosBuscaInput = document.getElementById('produtos-busca');
const produtosListEl = document.getElementById('produtos-list');
const fabAddProduto = document.getElementById('fab-add-produto');

const modalProduto = document.getElementById('modal-produto');
const modalProdutoTitulo = document.getElementById('modal-produto-titulo');
const modalProdutoFechar = document.getElementById('modal-produto-fechar');
const produtoNomeInput = document.getElementById('produto-nome');
const produtoUnidadeSelect = document.getElementById('produto-unidade');
const produtoPrecoInput = document.getElementById('produto-preco');
const produtoCustoInput = document.getElementById('produto-custo');
const produtoExcluirBtn = document.getElementById('produto-excluir');
const produtoCancelarBtn = document.getElementById('produto-cancelar');
const produtoSalvarBtn = document.getElementById('produto-salvar');

function renderProdutosLista(filtro = '') {
  if (!produtosListEl) return;
  const texto = (filtro || '').toLowerCase();

  const filtrados = produtos
    .filter(p => p.nome.toLowerCase().includes(texto))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  if (!filtrados.length) {
    produtosListEl.innerHTML = '<p class="item-meta">Nenhum produto cadastrado.</p>';
    return;
  }

  produtosListEl.innerHTML = filtrados.map(p => {
    const margem =
      p.custo > 0 ? (((p.preco - p.custo) / p.custo) * 100).toFixed(1) + '%' : '—';
    return `
      <div class="item-card produto-card" data-id="${p.id}">
        <div class="item-row">
          <span class="item-title">${p.nome}</span>
        </div>
        <div class="item-meta">
          Unidade: ${p.unidade || '—'}
        </div>
        <div class="item-meta">
          Preço: R$ ${p.preco.toFixed(2)} • Custo: R$ ${p.custo.toFixed(2)} • Lucro: ${margem}
        </div>
      </div>
    `;
  }).join('');

  produtosListEl.querySelectorAll('.produto-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      abrirModalProduto(id);
    });
  });
}

function abrirModalProduto(idOrNull) {
  if (!modalProduto) return;
  produtoEditId = idOrNull;

  if (produtoEditId) {
    const p = produtos.find(x => x.id === produtoEditId);
    if (!p) return;
    modalProdutoTitulo.textContent = 'Editar produto';
    produtoNomeInput.value = p.nome || '';
    produtoUnidadeSelect.value = p.unidade || 'peça';
    produtoPrecoInput.value = p.preco || 0;
    produtoCustoInput.value = p.custo || 0;
    if (produtoExcluirBtn) produtoExcluirBtn.style.display = 'inline-block';
  } else {
    modalProdutoTitulo.textContent = 'Novo produto';
    produtoNomeInput.value = '';
    produtoUnidadeSelect.value = 'peça';
    produtoPrecoInput.value = '';
    produtoCustoInput.value = '';
    if (produtoExcluirBtn) produtoExcluirBtn.style.display = 'none';
  }

  modalProduto.classList.add('visible');
}

function fecharModalProduto() {
  if (!modalProduto) return;
  modalProduto.classList.remove('visible');
  produtoEditId = null;
}

async function salvarProdutoFirestore() {
  const nome = (produtoNomeInput.value || '').trim();
  const unidade = produtoUnidadeSelect.value || 'peça';
  const preco = Number(produtoPrecoInput.value || 0);
  const custo = Number(produtoCustoInput.value || 0);

  if (!nome) {
    alert('Informe a descrição do produto.');
    return;
  }

  const payload = { nome, unidade, preco, custo };

  try {
    if (produtoEditId) {
      await updateDoc(doc(db, 'produtos', produtoEditId), payload);
    } else {
      await addDoc(collection(db, 'produtos'), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }
    fecharModalProduto();
  } catch (err) {
    console.error('Erro ao salvar produto', err);
    alert('Erro ao salvar produto.');
  }
}

async function excluirProdutoFirestore() {
  if (!produtoEditId) {
    fecharModalProduto();
    return;
  }
  if (!confirm('Deseja realmente excluir este produto?')) return;

  try {
    await deleteDoc(doc(db, 'produtos', produtoEditId));
    fecharModalProduto();
  } catch (err) {
    console.error('Erro ao excluir produto', err);
    alert('Erro ao excluir produto.');
  }
}

if (produtosBuscaInput) {
  produtosBuscaInput.addEventListener('input', () => {
    renderProdutosLista(produtosBuscaInput.value);
  });
}
if (fabAddProduto) fabAddProduto.addEventListener('click', () => abrirModalProduto(null));
if (modalProdutoFechar) modalProdutoFechar.addEventListener('click', fecharModalProduto);
if (produtoCancelarBtn) produtoCancelarBtn.addEventListener('click', fecharModalProduto);
if (produtoSalvarBtn) produtoSalvarBtn.addEventListener('click', salvarProdutoFirestore);
if (produtoExcluirBtn) produtoExcluirBtn.addEventListener('click', excluirProdutoFirestore);

// ===============================
// CADASTRO DE MATÉRIA-PRIMA (CRUD Firestore básico)
// ===============================
const mpBuscaInput = document.getElementById('mp-busca');
const mpListEl = document.getElementById('mp-list');
const fabAddMp = document.getElementById('fab-add-mp');

const modalMp = document.getElementById('modal-mp');
const modalMpTitulo = document.getElementById('modal-mp-titulo');
const modalMpFechar = document.getElementById('modal-mp-fechar');
const mpNomeInput = document.getElementById('mp-nome');
const mpUnidadeSelect = document.getElementById('mp-unidade');
const mpExcluirBtn = document.getElementById('mp-excluir');
const mpCancelarBtn = document.getElementById('mp-cancelar');
const mpSalvarBtn = document.getElementById('mp-salvar');

function renderMpLista(filtro = '') {
  if (!mpListEl) return;
  const texto = (filtro || '').toLowerCase();

  const filtrados = materiasPrimas
    .filter(m => m.nome.toLowerCase().includes(texto))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  if (!filtrados.length) {
    mpListEl.innerHTML = '<p class="item-meta">Nenhuma matéria-prima cadastrada.</p>';
    return;
  }

  mpListEl.innerHTML = filtrados.map(m => `
    <div class="item-card mp-card" data-id="${m.id}">
      <div class="item-row">
        <span class="item-title">${m.nome}</span>
      </div>
      <div class="item-meta">
        Unidade: ${m.unidade || '—'}
      </div>
    </div>
  `).join('');

  mpListEl.querySelectorAll('.mp-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      abrirModalMp(id);
    });
  });
}

function abrirModalMp(idOrNull) {
  if (!modalMp) return;
  mpEditId = idOrNull;

  if (mpEditId) {
    const m = materiasPrimas.find(x => x.id === mpEditId);
    if (!m) return;
    modalMpTitulo.textContent = 'Editar matéria-prima';
    mpNomeInput.value = m.nome || '';
    mpUnidadeSelect.value = m.unidade || 'peça';
    if (mpExcluirBtn) mpExcluirBtn.style.display = 'inline-block';
  } else {
    modalMpTitulo.textContent = 'Nova matéria-prima';
    mpNomeInput.value = '';
    mpUnidadeSelect.value = 'peça';
    if (mpExcluirBtn) mpExcluirBtn.style.display = 'none';
  }

  modalMp.classList.add('visible');
}

function fecharModalMp() {
  if (!modalMp) return;
  modalMp.classList.remove('visible');
  mpEditId = null;
}

async function salvarMpFirestore() {
  const nome = (mpNomeInput.value || '').trim();
  const unidade = mpUnidadeSelect.value || 'peça';

  if (!nome) {
    alert('Informe a descrição da matéria-prima.');
    return;
  }

  const payload = { nome, unidade };

  try {
    if (mpEditId) {
      await updateDoc(doc(db, 'materiasPrimas', mpEditId), payload);
    } else {
      await addDoc(collection(db, 'materiasPrimas'), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }
    fecharModalMp();
  } catch (err) {
    console.error('Erro ao salvar matéria-prima', err);
    alert('Erro ao salvar matéria-prima.');
  }
}

async function excluirMpFirestore() {
  if (!mpEditId) {
    fecharModalMp();
    return;
  }
  if (!confirm('Deseja realmente excluir esta matéria-prima?')) return;

  try {
    await deleteDoc(doc(db, 'materiasPrimas', mpEditId));
    fecharModalMp();
  } catch (err) {
    console.error('Erro ao excluir matéria-prima', err);
    alert('Erro ao excluir matéria-prima.');
  }
}

if (mpBuscaInput) {
  mpBuscaInput.addEventListener('input', () => {
    renderMpLista(mpBuscaInput.value);
  });
}
if (fabAddMp) fabAddMp.addEventListener('click', () => abrirModalMp(null));
if (modalMpFechar) modalMpFechar.addEventListener('click', fecharModalMp);
if (mpCancelarBtn) mpCancelarBtn.addEventListener('click', fecharModalMp);
if (mpSalvarBtn) mpSalvarBtn.addEventListener('click', salvarMpFirestore);
if (mpExcluirBtn) mpExcluirBtn.addEventListener('click', excluirMpFirestore);

// ===============================
// CADASTRO DE FORNECEDORES (CRUD Firestore básico)
// ===============================
const fornecedoresBuscaInput = document.getElementById('fornecedores-busca');
const fornecedoresListEl = document.getElementById('fornecedores-list');
const fabAddFornecedor = document.getElementById('fab-add-fornecedor');

const modalFornecedor = document.getElementById('modal-fornecedor');
const modalFornecedorTitulo = document.getElementById('modal-fornecedor-titulo');
const modalFornecedorFechar = document.getElementById('modal-fornecedor-fechar');

const fornecedorNomeInput = document.getElementById('fornecedor-nome');
const fornecedorLocalSelect = document.getElementById('fornecedor-local');

const fornecedorBlocoFisico = document.getElementById('fornecedor-bloco-fisico');
const fornecedorEnderecoInput = document.getElementById('fornecedor-endereco');
const fornecedorContatoInput = document.getElementById('fornecedor-contato');
const fornecedorCidadeInput = document.getElementById('fornecedor-cidade');
const fornecedorEstadoInput = document.getElementById('fornecedor-estado');

const fornecedorBlocoInternet = document.getElementById('fornecedor-bloco-internet');
const fornecedorPlataformaInput = document.getElementById('fornecedor-plataforma');
const fornecedorContatoIntInput = document.getElementById('fornecedor-contato-int');
const fornecedorCidadeIntInput = document.getElementById('fornecedor-cidade-int');
const fornecedorEstadoIntInput = document.getElementById('fornecedor-estado-int');

const fornecedorExcluirBtn = document.getElementById('fornecedor-excluir');
const fornecedorCancelarBtn = document.getElementById('fornecedor-cancelar');
const fornecedorSalvarBtn = document.getElementById('fornecedor-salvar');

function atualizarBlocosFornecedor() {
  const tipo = fornecedorLocalSelect.value;
  if (tipo === 'fisico') {
    fornecedorBlocoFisico.style.display = 'block';
    fornecedorBlocoInternet.style.display = 'none';
  } else {
    fornecedorBlocoFisico.style.display = 'none';
    fornecedorBlocoInternet.style.display = 'block';
  }
}

if (fornecedorLocalSelect) {
  fornecedorLocalSelect.addEventListener('change', atualizarBlocosFornecedor);
}

function renderFornecedoresLista(filtro = '') {
  if (!fornecedoresListEl) return;
  const texto = (filtro || '').toLowerCase();

  const filtrados = fornecedores
    .filter(f => (f.nome || '').toLowerCase().includes(texto))
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));

  if (!filtrados.length) {
    fornecedoresListEl.innerHTML = '<p class="item-meta">Nenhum fornecedor cadastrado.</p>';
    return;
  }

  fornecedoresListEl.innerHTML = filtrados.map(f => {
    let linha2 = '';
    if (f.tipoLocal === 'fisico') {
      linha2 = `${f.endereco || ''} ${f.cidade ? '• ' + f.cidade : ''}${f.estado ? ' - ' + f.estado : ''}`;
    } else {
      linha2 = `${f.plataforma || ''} ${f.contatoInternet ? '• ' + f.contatoInternet : ''}`;
    }
    return `
      <div class="item-card fornecedor-card" data-id="${f.id}">
        <div class="item-row">
          <span class="item-title">${f.nome || '(sem nome)'}</span>
        </div>
        <div class="item-meta">
          Local: ${f.tipoLocal === 'fisico' ? 'Físico' : 'Internet'}
        </div>
        ${linha2 ? `<div class="item-meta">${linha2}</div>` : ''}
      </div>
    `;
  }).join('');

  fornecedoresListEl.querySelectorAll('.fornecedor-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      abrirModalFornecedor(id);
    });
  });
}

function abrirModalFornecedor(idOrNull) {
  if (!modalFornecedor) return;
  fornecedorEditId = idOrNull;

  if (fornecedorEditId) {
    const f = fornecedores.find(x => x.id === fornecedorEditId);
    if (!f) return;
    modalFornecedorTitulo.textContent = 'Editar fornecedor';
    fornecedorNomeInput.value = f.nome || '';
    fornecedorLocalSelect.value = f.tipoLocal || 'fisico';

    fornecedorEnderecoInput.value = f.endereco || '';
    fornecedorContatoInput.value = f.contato || '';
    fornecedorCidadeInput.value = f.cidade || '';
    fornecedorEstadoInput.value = f.estado || '';

    fornecedorPlataformaInput.value = f.plataforma || '';
    fornecedorContatoIntInput.value = f.contatoInternet || '';
    fornecedorCidadeIntInput.value = f.cidadeInternet || '';
    fornecedorEstadoIntInput.value = f.estadoInternet || '';

    if (fornecedorExcluirBtn) fornecedorExcluirBtn.style.display = 'inline-block';
  } else {
    modalFornecedorTitulo.textContent = 'Novo fornecedor';
    fornecedorNomeInput.value = '';
    fornecedorLocalSelect.value = 'fisico';

    fornecedorEnderecoInput.value = '';
    fornecedorContatoInput.value = '';
    fornecedorCidadeInput.value = '';
    fornecedorEstadoInput.value = '';

    fornecedorPlataformaInput.value = '';
    fornecedorContatoIntInput.value = '';
    fornecedorCidadeIntInput.value = '';
    fornecedorEstadoIntInput.value = '';

    if (fornecedorExcluirBtn) fornecedorExcluirBtn.style.display = 'none';
  }

  atualizarBlocosFornecedor();
  modalFornecedor.classList.add('visible');
}

function fecharModalFornecedor() {
  if (!modalFornecedor) return;
  modalFornecedor.classList.remove('visible');
  fornecedorEditId = null;
}

async function salvarFornecedorFirestore() {
  const nome = (fornecedorNomeInput.value || '').trim();
  const tipoLocal = fornecedorLocalSelect.value || 'fisico';

  if (!nome) {
    alert('Informe o nome do fornecedor.');
    return;
  }

  const payload = {
    nome,
    tipoLocal,
    endereco: fornecedorEnderecoInput.value || '',
    contato: fornecedorContatoInput.value || '',
    cidade: fornecedorCidadeInput.value || '',
    estado: fornecedorEstadoInput.value || '',
    plataforma: fornecedorPlataformaInput.value || '',
    contatoInternet: fornecedorContatoIntInput.value || '',
    cidadeInternet: fornecedorCidadeIntInput.value || '',
    estadoInternet: fornecedorEstadoIntInput.value || ''
  };

  try {
    if (fornecedorEditId) {
      await updateDoc(doc(db, 'fornecedores', fornecedorEditId), payload);
    } else {
      await addDoc(collection(db, 'fornecedores'), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }
    fecharModalFornecedor();
  } catch (err) {
    console.error('Erro ao salvar fornecedor', err);
    alert('Erro ao salvar fornecedor.');
  }
}

async function excluirFornecedorFirestore() {
  if (!fornecedorEditId) {
    fecharModalFornecedor();
    return;
  }
  if (!confirm('Deseja realmente excluir este fornecedor?')) return;

  try {
    await deleteDoc(doc(db, 'fornecedores', fornecedorEditId));
    fecharModalFornecedor();
  } catch (err) {
    console.error('Erro ao excluir fornecedor', err);
    alert('Erro ao excluir fornecedor.');
  }
}

if (fornecedoresBuscaInput) {
  fornecedoresBuscaInput.addEventListener('input', () => {
    renderFornecedoresLista(fornecedoresBuscaInput.value);
  });
}
if (fabAddFornecedor) fabAddFornecedor.addEventListener('click', () => abrirModalFornecedor(null));
if (modalFornecedorFechar) modalFornecedorFechar.addEventListener('click', fecharModalFornecedor);
if (fornecedorCancelarBtn) fornecedorCancelarBtn.addEventListener('click', fecharModalFornecedor);
if (fornecedorSalvarBtn) fornecedorSalvarBtn.addEventListener('click', salvarFornecedorFirestore);
if (fornecedorExcluirBtn) fornecedorExcluirBtn.addEventListener('click', excluirFornecedorFirestore);

// ===============================
// FIRESTORE SUBSCRIPTIONS (tempo real)
// ===============================
function subscribeClientes() {
  const colRef = collection(db, 'clientes');
  const q = query(colRef, orderBy('nome'));
  onSnapshot(q, snapshot => {
    clientes = snapshot.docs.map(d => {
      const data = d.data() || {};
      return {
        id: d.id,
        nome: data.nome || '',
        tel: data.telefone || '',
        end: data.endereco || '',
        cid: data.cidade || '',
        est: data.estado || ''
      };
    });
    renderClientesLista(clientesBuscaInput ? clientesBuscaInput.value : '');
  });
}

function subscribeProdutos() {
  const colRef = collection(db, 'produtos');
  const q = query(colRef, orderBy('nome'));
  onSnapshot(q, snapshot => {
    produtos = snapshot.docs.map(d => {
      const data = d.data() || {};
      return {
        id: d.id,
        nome: data.nome || '',
        unidade: data.unidade || '',
        preco: Number(data.preco || 0),
        custo: Number(data.custo || 0)
      };
    });
    renderProdutosLista(produtosBuscaInput ? produtosBuscaInput.value : '');
  });
}

function subscribeMateriasPrimas() {
  const colRef = collection(db, 'materiasPrimas');
  const q = query(colRef, orderBy('nome'));
  onSnapshot(q, snapshot => {
    materiasPrimas = snapshot.docs.map(d => {
      const data = d.data() || {};
      return {
        id: d.id,
        nome: data.nome || data.descricao || '',
        unidade: data.unidade || ''
      };
    });
    renderMpLista(mpBuscaInput ? mpBuscaInput.value : '');
  });
}

function subscribeFornecedores() {
  const colRef = collection(db, 'fornecedores');
  const q = query(colRef, orderBy('nome'));
  onSnapshot(q, snapshot => {
    fornecedores = snapshot.docs.map(d => {
      const data = d.data() || {};
      return {
        id: d.id,
        nome: data.nome || '',
        tipoLocal: data.tipoLocal || 'fisico',
        endereco: data.endereco || '',
        contato: data.contato || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        plataforma: data.plataforma || '',
        contatoInternet: data.contatoInternet || '',
        cidadeInternet: data.cidadeInternet || '',
        estadoInternet: data.estadoInternet || ''
      };
    });
    renderFornecedoresLista(fornecedoresBuscaInput ? fornecedoresBuscaInput.value : '');
  });
}

// ligar tudo
subscribeClientes();
subscribeProdutos();
subscribeMateriasPrimas();
subscribeFornecedores();
