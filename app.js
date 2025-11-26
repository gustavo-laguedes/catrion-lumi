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
// FAB (+) para todos os contextos
// =========================
document.querySelectorAll('.fab-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const ctx = btn.dataset.addContext || 'registro';

    // caso específico: Novo Pedido
    if (btn.id === 'fab-add-item') {
      abrirModalItem();
      return;
    }

    // demais "+" usam modal genérico
    abrirModalGenerico(ctx);
  });
});

// =========================
// MODAL GENÉRICO PARA OUTROS "+" (AINDA FICTÍCIO)
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

let clientes = [];
let produtos = [];
let pedidos = [];

// listeners em tempo real
function startClientesListener() {
  const ref = collection(db, 'clientes');
  onSnapshot(ref, snapshot => {
    clientes = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  });
}

function startProdutosListener() {
  const ref = collection(db, 'produtos');
  onSnapshot(ref, snapshot => {
    produtos = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
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
  });
}

// =========================
// NOVO PEDIDO - LISTA NA HOME (AGRUPADO POR CLIENTE)
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
// MODAL MODERNO - NOVO PEDIDO
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

    // removido o "+ Cadastrar cliente" por enquanto, para não quebrar o fluxo
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

    // removido o "+ Cadastrar produto" pra não quebrar o fluxo ainda
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
      statusPagamento: 'a receber',
      createdAt: serverTimestamp()
    });

    fecharModalItem();
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    alert('Não foi possível salvar o pedido.');
  }
}

// listeners do modal
if (campoBuscaCliente) configurarBuscaCliente();
if (btnAddProduto) btnAddProduto.addEventListener('click', adicionarProdutoLinha);
if (btnModalFechar) btnModalFechar.addEventListener('click', fecharModalItem);
if (btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalItem);
if (btnModalSalvar) btnModalSalvar.addEventListener('click', salvarPedidoDoModal);

// =========================
// INIT GERAL
// =========================
function init() {
  // listeners em tempo real
  startClientesListener();
  startProdutosListener();
  startPedidosListener();

  // entrar direto na home (login desabilitado por enquanto)
  showView('home');
}

init();
