// app.js (module)

// =========================
// IMPORTS FIREBASE
// =========================
import { db } from './firebase.js';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
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
// LOGIN / CADASTRO (VISUAL)
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
// ESTADO GLOBAL (MEMÓRIA)
// =========================
let clientes = [];
let materiasPrima = [];
let fornecedores = [];
let produtos = [];
let pedidos = [];
let agendaDocs = [];
let lancamentos = [];

// =========================
// LISTENERS FIRESTORE
// =========================
function startClientesListener() {
  const ref = collection(db, 'clientes');
  onSnapshot(ref, snapshot => {
    clientes = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderListaClientes();
    atualizarSugestoesClientesPedido();
  });
}

function startMateriasPrimaListener() {
  const ref = collection(db, 'materiasPrima');
  onSnapshot(ref, snapshot => {
    materiasPrima = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderListaMp();
    renderConsultaEstoque();
    atualizarOptionsMpProdutoTodasLinhas();
  });
}

function startFornecedoresListener() {
  const ref = collection(db, 'fornecedores');
  onSnapshot(ref, snapshot => {
    fornecedores = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderListaFornecedores();
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
    renderConsultaEstoque(); // pra listar produtos quando trocar aba
  });
}

function startPedidosListener() {
  const ref = collection(db, 'pedidos');
  onSnapshot(ref, snapshot => {
    pedidos = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderListaPedidos();
    renderListaStatusPedidos();
    atualizarSugestoesPedidosFinancas();
    atualizarSugestoesPedidosAgenda();
    atualizarResumoVendas();
  });
}

function startAgendaListener() {
  const ref = collection(db, 'agenda');
  onSnapshot(ref, snapshot => {
    agendaDocs = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    renderAgenda();
  });
}

function startLancamentosListener() {
  const ref = collection(db, 'lancamentos');
  onSnapshot(ref, snapshot => {
    lancamentos = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    // depois podemos usar para resumo financeiro
  });
}

// =========================
// CALENDÁRIO AGENDA (VISUAL)
// =========================
const agendaGrid = document.getElementById('agenda-grid');
const agendaLabel = document.getElementById('agenda-month-label');
const agendaPrev = document.getElementById('agenda-prev');
const agendaNext = document.getElementById('agenda-next');
const agendaDiaHeader = document.getElementById('agenda-dia-header');
const agendaDiaLista = document.getElementById('agenda-dia-lista');

const monthNames = [
  'janeiro', 'fevereiro', 'março', 'abril',
  'maio', 'junho', 'julho', 'agosto',
  'setembro', 'outubro', 'novembro', 'dezembro'
];

let today = new Date();
let calMonth = today.getMonth();
let calYear = today.getFullYear();

function getDateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function eventosPorDia() {
  const map = {};
  agendaDocs.forEach(ev => {
    if (!ev.data) return;
    const key = ev.data;
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  });
  return map;
}

function renderAgenda() {
  if (!agendaGrid || !agendaLabel) return;

  agendaGrid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1);
  const startingDay = firstDay.getDay(); // 0 domingo
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  agendaLabel.textContent = `${monthNames[calMonth]} de ${calYear}`;

  const eventosMap = eventosPorDia();

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

      const dateKey = getDateKey(calYear, calMonth, dayNumber);
      const eventosDia = eventosMap[dateKey];

      if (eventosDia && eventosDia.length) {
        const tipos = new Set(eventosDia.map(e => e.tipo));
        const dotsContainer = document.createElement('div');
        dotsContainer.style.display = 'flex';
        dotsContainer.style.gap = '2px';
        dotsContainer.style.position = 'absolute';
        dotsContainer.style.bottom = '2px';

        tipos.forEach(t => {
          const dot = document.createElement('span');
          dot.style.width = '6px';
          dot.style.height = '6px';
          dot.style.borderRadius = '999px';
          if (t === 'producao') dot.style.background = '#7b5cff';
          else if (t === 'entrega') dot.style.background = '#ff9800';
          else dot.style.background = '#ff6fa8';
          dotsContainer.appendChild(dot);
        });

        cell.style.position = 'relative';
        cell.appendChild(dotsContainer);

        cell.classList.add('has-event');
      }

      cell.addEventListener('click', () => {
        const key = getDateKey(calYear, calMonth, dayNumber);
        mostrarEventosDoDia(key);
      });
    }

    agendaGrid.appendChild(cell);
  }
}

function mostrarEventosDoDia(dateKey) {
  if (!agendaDiaHeader || !agendaDiaLista) return;

  agendaDiaLista.innerHTML = '';
  const eventosDia = agendaDocs.filter(ev => ev.data === dateKey);

  const [y, m, d] = dateKey.split('-');
  agendaDiaHeader.textContent = `Compromissos em ${d}/${m}/${y}`;

  if (!eventosDia.length) {
    agendaDiaLista.innerHTML = '<p class="item-meta">Nenhum compromisso neste dia.</p>';
    return;
  }

  const html = eventosDia.map(ev => {
    let labelTipo = 'Outros';
    let cor = '#ff6fa8';
    if (ev.tipo === 'producao') {
      labelTipo = 'Produção';
      cor = '#7b5cff';
    } else if (ev.tipo === 'entrega') {
      labelTipo = 'Entrega';
      cor = '#ff9800';
    }
    const pedidoLabel = ev.pedidoNome ? ` • Pedido: ${ev.pedidoNome}` : '';
    const desc = ev.descricao || '';

    return `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${labelTipo}${pedidoLabel}</span>
          <span class="badge" style="background:${cor}; color:#fff; font-size:0.7rem;">${labelTipo}</span>
        </div>
        <div class="item-meta">${desc}</div>
      </div>
    `;
  }).join('');

  agendaDiaLista.innerHTML = html;
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

// =========================
// CADASTRO DE CLIENTES
// =========================
const cadCliNome = document.getElementById('cad-cliente-nome');
const cadCliTel = document.getElementById('cad-cliente-tel');
const cadCliEnd = document.getElementById('cad-cliente-end');
const cadCliCid = document.getElementById('cad-cliente-cid');
const cadCliEst = document.getElementById('cad-cliente-est');

const btnCliLimpar = document.getElementById('cad-cliente-limpar');
const btnCliSalvar = document.getElementById('cad-cliente-salvar');
const listaClientesCad = document.getElementById('lista-clientes-cad');

function limparFormCliente() {
  if (cadCliNome) cadCliNome.value = '';
  if (cadCliTel) cadCliTel.value = '';
  if (cadCliEnd) cadCliEnd.value = '';
  if (cadCliCid) cadCliCid.value = '';
  if (cadCliEst) cadCliEst.value = '';
}

async function salvarCliente() {
  const nome = (cadCliNome?.value || '').trim();
  if (!nome) {
    alert('Informe o nome do cliente.');
    return;
  }
  const tel = cadCliTel?.value || '';
  const end = cadCliEnd?.value || '';
  const cid = cadCliCid?.value || '';
  const est = cadCliEst?.value || '';

  try {
    await addDoc(collection(db, 'clientes'), {
      nome, tel, end, cid, est,
      createdAt: serverTimestamp()
    });
    limparFormCliente();
  } catch (err) {
    console.error('Erro ao salvar cliente:', err);
    alert('Não foi possível salvar o cliente.');
  }
}

function renderListaClientes() {
  if (!listaClientesCad) return;

  if (!clientes.length) {
    listaClientesCad.innerHTML = '<p class="item-meta">Nenhum cliente cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...clientes].sort((a,b) => {
    const na = (a.nome || '').toLowerCase();
    const nb = (b.nome || '').toLowerCase();
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  });

  const html = ordenados.map(c => `
    <div class="item-card">
      <div class="item-row">
        <span class="item-title">${c.nome || '(sem nome)'}</span>
      </div>
      <div class="item-meta">
        ${c.tel || ''} • ${c.end || ''} • ${c.cid || ''} - ${c.est || ''}
      </div>
    </div>
  `).join('');

  listaClientesCad.innerHTML = html;
}

if (btnCliLimpar) btnCliLimpar.addEventListener('click', limparFormCliente);
if (btnCliSalvar) btnCliSalvar.addEventListener('click', salvarCliente);

// =========================
// CADASTRO MATÉRIA-PRIMA
// =========================
const cadMpDesc = document.getElementById('cad-mp-desc');
const cadMpUnid = document.getElementById('cad-mp-unid');
const cadMpCusto = document.getElementById('cad-mp-custo');
const cadMpForn = document.getElementById('cad-mp-forn');

const btnMpLimpar = document.getElementById('cad-mp-limpar');
const btnMpSalvar = document.getElementById('cad-mp-salvar');
const listaMpCad = document.getElementById('lista-mp-cad');

function limparFormMp() {
  if (cadMpDesc) cadMpDesc.value = '';
  if (cadMpUnid) cadMpUnid.value = '';
  if (cadMpCusto) cadMpCusto.value = '';
  if (cadMpForn) cadMpForn.value = '';
}

async function salvarMp() {
  const descricao = (cadMpDesc?.value || '').trim();
  if (!descricao) {
    alert('Informe a descrição da matéria-prima.');
    return;
  }
  const unid = cadMpUnid?.value || '';
  const custo = Number(cadMpCusto?.value || 0);
  const forn = cadMpForn?.value || '';

  try {
    await addDoc(collection(db, 'materiasPrima'), {
      descricao, unid, custo, fornecedorTexto: forn,
      createdAt: serverTimestamp()
    });
    limparFormMp();
  } catch (err) {
    console.error('Erro ao salvar matéria-prima:', err);
    alert('Não foi possível salvar a matéria-prima.');
  }
}

function renderListaMp() {
  if (!listaMpCad) return;

  if (!materiasPrima.length) {
    listaMpCad.innerHTML = '<p class="item-meta">Nenhuma matéria-prima cadastrada ainda.</p>';
    return;
  }

  const ordenados = [...materiasPrima].sort((a,b) => {
    const da = (a.descricao || '').toLowerCase();
    const db = (b.descricao || '').toLowerCase();
    if (da < db) return -1;
    if (da > db) return 1;
    return 0;
  });

  const html = ordenados.map(mp => `
    <div class="item-card">
      <div class="item-row">
        <span class="item-title">${mp.descricao || '(sem descrição)'}</span>
        <span class="badge badge-venda">R$ ${Number(mp.custo || 0).toFixed(2)}</span>
      </div>
      <div class="item-meta">
        Unid: ${mp.unid || ''} • Fornecedor: ${mp.fornecedorTexto || ''}
      </div>
    </div>
  `).join('');

  listaMpCad.innerHTML = html;
}

if (btnMpLimpar) btnMpLimpar.addEventListener('click', limparFormMp);
if (btnMpSalvar) btnMpSalvar.addEventListener('click', salvarMp);

// =========================
// CONSULTA ESTOQUE (MP x PRODUTOS + busca)
// =========================
const consultaEstoqueLista = document.getElementById('consulta-estoque-lista');
const consultaEstoqueBusca = document.getElementById('consulta-estoque-busca');
const btnConsultaMp = document.getElementById('btn-consulta-mp');
const btnConsultaProd = document.getElementById('btn-consulta-prod');

let consultaEstoqueTipo = 'mp'; // 'mp' ou 'prod'

function getTextoBuscaEstoque() {
  return (consultaEstoqueBusca?.value || '').toLowerCase();
}

function renderConsultaEstoque() {
  if (!consultaEstoqueLista) return;

  const busca = getTextoBuscaEstoque();

  let listaBase = [];
  if (consultaEstoqueTipo === 'mp') {
    listaBase = [...(materiasPrima || [])];
  } else {
    listaBase = [...(produtos || [])];
  }

  if (!listaBase.length) {
    consultaEstoqueLista.innerHTML = '<p class="item-meta">Nenhum registro cadastrado ainda.</p>';
    return;
  }

  if (busca) {
    listaBase = listaBase.filter(item => {
      const texto = (consultaEstoqueTipo === 'mp'
        ? (item.descricao || '')
        : (item.nome || '')
      ).toLowerCase();
      return texto.includes(busca);
    });
  }

  if (!listaBase.length) {
    consultaEstoqueLista.innerHTML = '<p class="item-meta">Nenhum resultado para esse filtro.</p>';
    return;
  }

  const html = listaBase.map(item => {
    if (consultaEstoqueTipo === 'mp') {
      return `
        <div class="item-card">
          <div class="item-row">
            <span class="item-title">${item.descricao || '(sem descrição)'}</span>
            <span class="badge badge-venda">R$ ${Number(item.custo || 0).toFixed(2)}</span>
          </div>
          <div class="item-meta">
            Unid: ${item.unid || ''} • Fornecedor: ${item.fornecedorTexto || ''}
          </div>
        </div>
      `;
    } else {
      const custo = Number(item.custo || 0);
      const preco = Number(item.preco || 0);
      let perc = 0;
      if (custo > 0 && preco > 0) {
        perc = ((preco - custo) / custo) * 100;
      }
      return `
        <div class="item-card">
          <div class="item-row">
            <span class="item-title">${item.nome || '(sem nome)'}</span>
            <span class="badge badge-venda">R$ ${preco.toFixed(2)}</span>
          </div>
          <div class="item-meta">
            Unid: ${item.unid || ''} • Custo: R$ ${custo.toFixed(2)} • Lucro: ${perc.toFixed(1)}%
          </div>
        </div>
      `;
    }
  }).join('');

  consultaEstoqueLista.innerHTML = html;

  if (btnConsultaMp && btnConsultaProd) {
    if (consultaEstoqueTipo === 'mp') {
      btnConsultaMp.classList.add('tab-active');
      btnConsultaProd.classList.remove('tab-active');
    } else {
      btnConsultaProd.classList.add('tab-active');
      btnConsultaMp.classList.remove('tab-active');
    }
  }
}

if (btnConsultaMp) {
  btnConsultaMp.addEventListener('click', () => {
    consultaEstoqueTipo = 'mp';
    renderConsultaEstoque();
  });
}
if (btnConsultaProd) {
  btnConsultaProd.addEventListener('click', () => {
    consultaEstoqueTipo = 'prod';
    renderConsultaEstoque();
  });
}
if (consultaEstoqueBusca) {
  consultaEstoqueBusca.addEventListener('input', () => {
    renderConsultaEstoque();
  });
}

// =========================
// CADASTRO FORNECEDORES
// =========================
const cadFornNome = document.getElementById('cad-forn-nome');
const cadFornContato = document.getElementById('cad-forn-contato');
const cadFornNotas = document.getElementById('cad-forn-notas');
const btnFornLimpar = document.getElementById('cad-forn-limpar');
const btnFornSalvar = document.getElementById('cad-forn-salvar');
const listaFornCad = document.getElementById('lista-forn-cad');

function limparFormForn() {
  if (cadFornNome) cadFornNome.value = '';
  if (cadFornContato) cadFornContato.value = '';
  if (cadFornNotas) cadFornNotas.value = '';
}

async function salvarFornecedor() {
  const nome = (cadFornNome?.value || '').trim();
  if (!nome) {
    alert('Informe o nome do fornecedor.');
    return;
  }
  const contato = cadFornContato?.value || '';
  const notas = cadFornNotas?.value || '';

  try {
    await addDoc(collection(db, 'fornecedores'), {
      nome, contato, notas,
      createdAt: serverTimestamp()
    });
    limparFormForn();
  } catch (err) {
    console.error('Erro ao salvar fornecedor:', err);
    alert('Não foi possível salvar o fornecedor.');
  }
}

function renderListaFornecedores() {
  if (!listaFornCad) return;

  if (!fornecedores.length) {
    listaFornCad.innerHTML = '<p class="item-meta">Nenhum fornecedor cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...fornecedores].sort((a,b) => {
    const na = (a.nome || '').toLowerCase();
    const nb = (b.nome || '').toLowerCase();
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  });

  const html = ordenados.map(f => `
    <div class="item-card">
      <div class="item-row">
        <span class="item-title">${f.nome || '(sem nome)'}</span>
      </div>
      <div class="item-meta">
        ${f.contato || ''} • ${f.notas || ''}
      </div>
    </div>
  `).join('');

  listaFornCad.innerHTML = html;
}

if (btnFornLimpar) btnFornLimpar.addEventListener('click', limparFormForn);
if (btnFornSalvar) btnFornSalvar.addEventListener('click', salvarFornecedor);

// =========================
// PRODUTOS (com matérias-primas)
// =========================
const btnNovoProdMpAdd = document.getElementById('cad-prod-mp-add');
const cadProdDesc = document.getElementById('cad-prod-desc');
const cadProdUnid = document.getElementById('cad-prod-unid');
const cadProdCusto = document.getElementById('cad-prod-custo');
const cadProdVenda = document.getElementById('cad-prod-venda');
const cadProdLucro = document.getElementById('cad-prod-lucro');
const cadProdNotas = document.getElementById('cad-prod-notas');
const cadProdLimpar = document.getElementById('cad-prod-limpar');
const cadProdSalvar = document.getElementById('cad-prod-salvar');
const cadProdMpContainer = document.getElementById('cad-prod-mp-container');
const listaProdutosCad = document.getElementById('lista-produtos-cad');

let linhasMpProduto = []; // { selectEl, qtdEl, custoLinhaEl }

function resetProdutoForm() {
  if (cadProdDesc) cadProdDesc.value = '';
  if (cadProdUnid) cadProdUnid.value = '';
  if (cadProdCusto) cadProdCusto.value = '0.00';
  if (cadProdVenda) cadProdVenda.value = '';
  if (cadProdNotas) cadProdNotas.value = '';
  if (cadProdLucro) cadProdLucro.textContent = '0%';

  linhasMpProduto = [];
  if (cadProdMpContainer) cadProdMpContainer.innerHTML = '';
  adicionarLinhaMpProduto();
}

// Preenche options de uma linha de MP
function preencherOptionsMpProduto(selectEl) {
  if (!selectEl) return;

  const valorAtual = selectEl.value;
  selectEl.innerHTML = '';

  const optVazio = document.createElement('option');
  optVazio.value = '';
  optVazio.textContent = '— selecione —';
  selectEl.appendChild(optVazio);

  (materiasPrima || []).forEach(mp => {
    const opt = document.createElement('option');
    opt.value = mp.id;
    opt.textContent = mp.descricao || '(sem descrição)';
    selectEl.appendChild(opt);
  });

  if (valorAtual) {
    const aindaExiste = (materiasPrima || []).some(mp => mp.id === valorAtual);
    if (aindaExiste) {
      selectEl.value = valorAtual;
    }
  }
}

function atualizarOptionsMpProdutoTodasLinhas() {
  linhasMpProduto.forEach(linha => preencherOptionsMpProduto(linha.selectEl));
}

function adicionarLinhaMpProduto() {
  if (!cadProdMpContainer) return;

  const linha = document.createElement('div');
  linha.className = 'cad-prod-mp-item';

  linha.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Matéria-prima</label>
        <select class="cad-prod-mp-select">
          <option value="">— selecione —</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group half">
        <label>Quantidade</label>
        <input type="number" class="cad-prod-mp-qtd" min="0" step="0.01" value="0" />
      </div>
      <div class="form-group half">
        <label>Custo desta MP</label>
        <div class="descricao-caixa cad-prod-mp-custo-linha">
          R$ 0,00
        </div>
      </div>
    </div>

    <button type="button" class="btn-text cad-prod-mp-remover">
      Remover
    </button>

    <hr>
  `;

  cadProdMpContainer.appendChild(linha);

  const selectEl = linha.querySelector('.cad-prod-mp-select');
  const qtdEl = linha.querySelector('.cad-prod-mp-qtd');
  const custoLinhaEl = linha.querySelector('.cad-prod-mp-custo-linha');
  const btnRemover = linha.querySelector('.cad-prod-mp-remover');

  preencherOptionsMpProduto(selectEl);

  if (btnRemover) {
    btnRemover.addEventListener('click', () => {
      const idx = linhasMpProduto.findIndex(l => l.selectEl === selectEl);
      if (idx >= 0) linhasMpProduto.splice(idx, 1);
      linha.remove();
      recalcularCustoELucroProduto();
    });
  }

  if (selectEl) {
    selectEl.addEventListener('change', () => {
      recalcularCustoELucroProduto();
    });
  }

  if (qtdEl) {
    qtdEl.addEventListener('input', () => {
      recalcularCustoELucroProduto();
    });
  }

  linhasMpProduto.push({ selectEl, qtdEl, custoLinhaEl });
  recalcularCustoELucroProduto();
}

function recalcularCustoELucroProduto() {
  let custoTotal = 0;

  linhasMpProduto.forEach(linha => {
    const { selectEl, qtdEl, custoLinhaEl } = linha;
    if (!selectEl || !qtdEl || !custoLinhaEl) return;

    const mpId = selectEl.value;
    const qtd = Number(qtdEl.value || 0);

    let custoUnit = 0;
    if (mpId) {
      const mp = (materiasPrima || []).find(m => m.id === mpId);
      if (mp && mp.custo != null) {
        custoUnit = Number(mp.custo || 0);
      }
    }

    const custoLinha = qtd * custoUnit;
    custoTotal += custoLinha;

    custoLinhaEl.textContent = 'R$ ' + custoLinha.toFixed(2);
  });

  if (cadProdCusto) {
    cadProdCusto.value = custoTotal.toFixed(2);
  }

  const venda = Number(cadProdVenda?.value || 0);
  let perc = 0;
  if (custoTotal > 0 && venda > 0) {
    perc = ((venda - custoTotal) / custoTotal) * 100;
  }

  if (cadProdLucro) {
    cadProdLucro.textContent = perc.toFixed(1) + '%';
  }
}

function renderProdutosLista() {
  if (!listaProdutosCad) return;

  if (!produtos.length) {
    listaProdutosCad.innerHTML = '<p class="item-meta">Nenhum produto cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...produtos].sort((a,b) => {
    const na = (a.nome || '').toLowerCase();
    const nb = (b.nome || '').toLowerCase();
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  });

  const html = ordenados.map(p => {
    const custo = Number(p.custo || 0);
    const preco = Number(p.preco || 0);
    let perc = 0;
    if (custo > 0 && preco > 0) {
      perc = ((preco - custo) / custo) * 100;
    }

    return `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${p.nome || '(sem nome)'}</span>
          <span class="badge badge-venda">
            R$ ${preco.toFixed(2)}
          </span>
        </div>
        <div class="item-meta">
          Unid: ${p.unid || '-'} • Custo: R$ ${custo.toFixed(2)} • Lucro: ${perc.toFixed(1)}%
        </div>
        ${
          (p.materiasUsadas && p.materiasUsadas.length)
            ? `<div class="item-meta">
                 MPs: ${p.materiasUsadas.map(mu => `${mu.descricao || 'MP'} (${mu.quantidade})`).join(', ')}
               </div>`
            : ''
        }
      </div>
    `;
  }).join('');

  listaProdutosCad.innerHTML = html;
}

if (btnNovoProdMpAdd) {
  btnNovoProdMpAdd.addEventListener('click', () => {
    adicionarLinhaMpProduto();
  });
}

if (cadProdVenda) {
  cadProdVenda.addEventListener('input', () => {
    recalcularCustoELucroProduto();
  });
}

if (cadProdLimpar) {
  cadProdLimpar.addEventListener('click', resetProdutoForm);
}

if (cadProdSalvar) {
  cadProdSalvar.addEventListener('click', async () => {
    const nome = (cadProdDesc?.value || '').trim();
    if (!nome) {
      alert('Informe a descrição do produto.');
      return;
    }

    const unid = cadProdUnid?.value || '';
    const precoVenda = Number(cadProdVenda?.value || 0);
    const custoTotal = Number(cadProdCusto?.value || 0);
    const notas = cadProdNotas?.value || '';

    const materiasUsadas = linhasMpProduto
      .map(linha => {
        const mpId = linha.selectEl?.value || '';
        const qtd = Number(linha.qtdEl?.value || 0);
        if (!mpId || qtd <= 0) return null;

        const mp = (materiasPrima || []).find(m => m.id === mpId);
        const custoUnit = mp && mp.custo != null ? Number(mp.custo || 0) : 0;
        const custoTotalLinha = qtd * custoUnit;

        return {
          mpId,
          descricao: mp?.descricao || '',
          quantidade: qtd,
          custoUnit,
          custoTotal: custoTotalLinha
        };
      })
      .filter(Boolean);

    try {
      await addDoc(collection(db, 'produtos'), {
        nome,
        unid,
        custo: custoTotal,
        preco: precoVenda,
        notas,
        materiasUsadas,
        createdAt: serverTimestamp()
      });
      resetProdutoForm();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Não foi possível salvar o produto.');
    }
  });
}

// =========================
// NOVO PEDIDO
// =========================
const pedidoClienteInput = document.getElementById('pedido-cliente-input');
const pedidoClienteSugestoes = document.getElementById('pedido-cliente-sugestoes');
const pedidoClienteInfo = document.getElementById('pedido-cliente-info');
const pedidoClienteTel = document.getElementById('pedido-cliente-tel');
const pedidoClienteEnd = document.getElementById('pedido-cliente-end');
const pedidoClienteCid = document.getElementById('pedido-cliente-cid');
const pedidoClienteEst = document.getElementById('pedido-cliente-est');

const pedidoItensContainer = document.getElementById('pedido-itens-container');
const btnPedidoAddItem = document.getElementById('btn-pedido-add-item');
const pedidoTotalVendaEl = document.getElementById('pedido-total-venda');
const pedidoTotalCustoEl = document.getElementById('pedido-total-custo');
const pedidoTotalLucroEl = document.getElementById('pedido-total-lucro');
const btnPedidoCancelar = document.getElementById('btn-pedido-cancelar');
const btnPedidoSalvar = document.getElementById('btn-pedido-salvar');

let linhasPedido = []; // { rowEl, produtoInput, produtoSugestoes, qtdInput, totalVendaEl, totalCustoEl, produtoId, precoUnit, custoUnit }

function atualizarSugestoesClientesPedido() {
  if (!pedidoClienteInput || !pedidoClienteSugestoes) return;

  pedidoClienteInput.addEventListener('input', () => {
    const texto = pedidoClienteInput.value.toLowerCase();
    pedidoClienteSugestoes.innerHTML = '';

    if (!texto) {
      pedidoClienteSugestoes.style.display = 'none';
      return;
    }

    const filtrados = clientes.filter(c =>
      (c.nome || '').toLowerCase().includes(texto)
    );

    filtrados.forEach(c => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = c.nome || '(sem nome)';
      item.addEventListener('click', () => {
        pedidoClienteInput.value = c.nome || '';
        pedidoClienteInput.dataset.clienteId = c.id;
        pedidoClienteSugestoes.innerHTML = '';
        pedidoClienteSugestoes.style.display = 'none';

        if (pedidoClienteInfo) {
          pedidoClienteInfo.style.display = 'block';
          if (pedidoClienteTel) pedidoClienteTel.textContent = c.tel || '';
          if (pedidoClienteEnd) pedidoClienteEnd.textContent = c.end || '';
          if (pedidoClienteCid) pedidoClienteCid.textContent = c.cid || '';
          if (pedidoClienteEst) pedidoClienteEst.textContent = c.est || '';
        }
      });
      pedidoClienteSugestoes.appendChild(item);
    });

    pedidoClienteSugestoes.style.display = filtrados.length ? 'block' : 'none';
  });
}

function adicionarLinhaPedido() {
  if (!pedidoItensContainer) return;

  const row = document.createElement('div');
  row.className = 'produto-item';

  row.innerHTML = `
    <div class="form-group">
      <label>Produto</label>
      <input type="text" class="pedido-prod-busca" placeholder="Buscar produto..." />
      <div class="autocomplete-list pedido-prod-sugestoes"></div>
    </div>

    <div class="form-row">
      <div class="form-group half">
        <label>Qtd.</label>
        <input type="number" min="1" value="1" class="pedido-prod-qtd" />
      </div>
      <div class="form-group half">
        <label>Valor venda</label>
        <div class="descricao-caixa pedido-prod-total-venda">R$ 0,00</div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group half">
        <label>Custo</label>
        <div class="descricao-caixa pedido-prod-total-custo">R$ 0,00</div>
      </div>
    </div>

    <button type="button" class="btn-text pedido-prod-remover">Remover item</button>

    <hr>
  `;

  pedidoItensContainer.appendChild(row);

  const produtoInput = row.querySelector('.pedido-prod-busca');
  const produtoSugestoes = row.querySelector('.pedido-prod-sugestoes');
  const qtdInput = row.querySelector('.pedido-prod-qtd');
  const totalVendaElLocal = row.querySelector('.pedido-prod-total-venda');
  const totalCustoElLocal = row.querySelector('.pedido-prod-total-custo');
  const btnRemover = row.querySelector('.pedido-prod-remover');

  const linha = {
    rowEl: row,
    produtoInput,
    produtoSugestoes,
    qtdInput,
    totalVendaEl: totalVendaElLocal,
    totalCustoEl: totalCustoElLocal,
    produtoId: null,
    precoUnit: 0,
    custoUnit: 0
  };

  if (produtoInput && produtoSugestoes) {
    produtoInput.addEventListener('input', () => {
      const texto = produtoInput.value.toLowerCase();
      produtoSugestoes.innerHTML = '';

      if (!texto) {
        produtoSugestoes.style.display = 'none';
        return;
      }

      const filtrados = produtos.filter(p =>
        (p.nome || '').toLowerCase().includes(texto)
      );

      filtrados.forEach(p => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = `${p.nome || 'Produto'} — R$ ${Number(p.preco || 0).toFixed(2)}`;
        item.addEventListener('click', () => {
          produtoInput.value = p.nome || '';
          linha.produtoId = p.id;
          linha.precoUnit = Number(p.preco || 0);
          linha.custoUnit = Number(p.custo || 0);

          produtoSugestoes.innerHTML = '';
          produtoSugestoes.style.display = 'none';

          atualizarTotaisLinhaPedido(linha);
        });
        produtoSugestoes.appendChild(item);
      });

      produtoSugestoes.style.display = filtrados.length ? 'block' : 'none';
    });
  }

  if (qtdInput) {
    qtdInput.addEventListener('input', () => {
      atualizarTotaisLinhaPedido(linha);
    });
  }

  if (btnRemover) {
    btnRemover.addEventListener('click', () => {
      linhasPedido = linhasPedido.filter(l => l !== linha);
      row.remove();
      atualizarTotaisPedido();
    });
  }

  linhasPedido.push(linha);
  atualizarTotaisPedido();
}

function atualizarTotaisLinhaPedido(linha) {
  const qtd = Number(linha.qtdInput?.value || 0);
  const totalVenda = qtd * linha.precoUnit;
  const totalCusto = qtd * linha.custoUnit;

  if (linha.totalVendaEl) {
    linha.totalVendaEl.textContent = 'R$ ' + totalVenda.toFixed(2);
  }
  if (linha.totalCustoEl) {
    linha.totalCustoEl.textContent = 'R$ ' + totalCusto.toFixed(2);
  }

  atualizarTotaisPedido();
}

function atualizarTotaisPedido() {
  let totalVenda = 0;
  let totalCusto = 0;

  linhasPedido.forEach(linha => {
    const qtd = Number(linha.qtdInput?.value || 0);
    totalVenda += qtd * linha.precoUnit;
    totalCusto += qtd * linha.custoUnit;
  });

  if (pedidoTotalVendaEl) pedidoTotalVendaEl.textContent = 'R$ ' + totalVenda.toFixed(2);
  if (pedidoTotalCustoEl) pedidoTotalCustoEl.textContent = 'R$ ' + totalCusto.toFixed(2);

  let perc = 0;
  if (totalCusto > 0 && totalVenda > 0) {
    perc = ((totalVenda - totalCusto) / totalCusto) * 100;
  }
  if (pedidoTotalLucroEl) pedidoTotalLucroEl.textContent = perc.toFixed(1) + '%';
}

function limparNovoPedido() {
  if (pedidoClienteInput) {
    pedidoClienteInput.value = '';
    pedidoClienteInput.dataset.clienteId = '';
  }
  if (pedidoClienteInfo) {
    pedidoClienteInfo.style.display = 'none';
  }
  if (pedidoClienteSugestoes) {
    pedidoClienteSugestoes.innerHTML = '';
    pedidoClienteSugestoes.style.display = 'none';
  }
  if (pedidoItensContainer) {
    pedidoItensContainer.innerHTML = '';
  }
  linhasPedido = [];
  adicionarLinhaPedido();
  atualizarTotaisPedido();
}

async function salvarNovoPedido() {
  const clienteNome = (pedidoClienteInput?.value || '').trim();
  const clienteId = pedidoClienteInput?.dataset.clienteId || null;

  if (!clienteNome) {
    alert('Selecione um cliente.');
    return;
  }

  const itens = linhasPedido
    .map(l => {
      if (!l.produtoId || !l.precoUnit || !l.qtdInput) return null;
      const qtd = Number(l.qtdInput.value || 0);
      if (qtd <= 0) return null;
      const totalVenda = qtd * l.precoUnit;
      const totalCusto = qtd * l.custoUnit;

      return {
        produtoId: l.produtoId,
        quantidade: qtd,
        precoUnit: l.precoUnit,
        custoUnit: l.custoUnit,
        totalVenda,
        totalCusto
      };
    })
    .filter(Boolean);

  if (!itens.length) {
    alert('Adicione pelo menos um produto válido.');
    return;
  }

  let totalVenda = 0;
  let totalCusto = 0;
  itens.forEach(it => {
    totalVenda += it.totalVenda;
    totalCusto += it.totalCusto;
  });

  try {
    await addDoc(collection(db, 'pedidos'), {
      clienteNome,
      clienteId,
      itens,
      totalVenda,
      totalCusto,
      status: 'aguardando',
      statusPagamento: 'a_receber',
      createdAt: serverTimestamp()
    });
    limparNovoPedido();
    alert('Pedido salvo com sucesso.');
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    alert('Não foi possível salvar o pedido.');
  }
}

if (btnPedidoAddItem) btnPedidoAddItem.addEventListener('click', adicionarLinhaPedido);
if (btnPedidoCancelar) btnPedidoCancelar.addEventListener('click', limparNovoPedido);
if (btnPedidoSalvar) btnPedidoSalvar.addEventListener('click', salvarNovoPedido);

// =========================
// LISTA DE PEDIDOS & STATUS
// =========================
const listaPedidosEl = document.getElementById('lista-pedidos');
const listaStatusPedidosEl = document.getElementById('lista-status-pedidos');

function formatarStatusPagamento(st) {
  if (!st || st === 'a_receber') return 'A receber';
  if (st === 'pago') return 'Pago';
  if (st === 'pago_parcial') return 'Pago parcialmente';
  if (st === 'cancelado') return 'Cancelado';
  return st;
}

function renderListaPedidos() {
  if (!listaPedidosEl) return;

  if (!pedidos.length) {
    listaPedidosEl.innerHTML = '<p class="item-meta">Nenhum pedido cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...pedidos].sort((a, b) => {
    const ta = a.createdAt?.seconds || 0;
    const tb = b.createdAt?.seconds || 0;
    return tb - ta; // mais recentes primeiro
  });

  const html = ordenados.map(p => `
    <div class="item-card">
      <div class="item-row">
        <span class="item-title">${p.clienteNome || '(sem cliente)'}</span>
        <span class="badge badge-pendente">${p.status || 'aguardando'}</span>
      </div>
      <div class="item-meta">
        Itens: ${(p.itens || []).length} • Total: R$ ${Number(p.totalVenda || 0).toFixed(2)}
      </div>
      <div class="item-meta">
        Pagamento: ${formatarStatusPagamento(p.statusPagamento)}
      </div>
    </div>
  `).join('');

  listaPedidosEl.innerHTML = html;
}

async function atualizarStatusPedido(pedidoId, novoStatus) {
  try {
    await updateDoc(doc(db, 'pedidos', pedidoId), {
      status: novoStatus
    });
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err);
    alert('Não foi possível atualizar o status.');
  }
}

async function atualizarStatusPagamentoPedido(pedidoId, novoStatusPag) {
  try {
    await updateDoc(doc(db, 'pedidos', pedidoId), {
      statusPagamento: novoStatusPag
    });
  } catch (err) {
    console.error('Erro ao atualizar status de pagamento:', err);
    alert('Não foi possível atualizar o status de pagamento.');
  }
}

function renderListaStatusPedidos() {
  if (!listaStatusPedidosEl) return;

  if (!pedidos.length) {
    listaStatusPedidosEl.innerHTML = '<p class="item-meta">Nenhum pedido cadastrado ainda.</p>';
    return;
  }

  const ordenados = [...pedidos].sort((a,b) => {
    const ta = a.createdAt?.seconds || 0;
    const tb = b.createdAt?.seconds || 0;
    return tb - ta;
  });

  const html = ordenados.map(p => `
    <div class="item-card">
      <div class="item-row">
        <span class="item-title">${p.clienteNome || '(sem cliente)'}</span>
      </div>
      <div class="item-meta">
        Total: R$ ${Number(p.totalVenda || 0).toFixed(2)}
      </div>

      <div class="form-group" style="margin-top:6px;">
        <label>Status do pedido</label>
        <select data-status-pedido="${p.id}">
          <option value="aguardando" ${p.status === 'aguardando' ? 'selected' : ''}>Aguardando</option>
          <option value="andamento" ${p.status === 'andamento' ? 'selected' : ''}>Em andamento</option>
          <option value="aguardando_pagamento" ${p.status === 'aguardando_pagamento' ? 'selected' : ''}>Aguardando pagamento</option>
          <option value="finalizado" ${p.status === 'finalizado' ? 'selected' : ''}>Finalizado</option>
          <option value="cancelado" ${p.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </div>

      <div class="form-group" style="margin-top:6px;">
        <label>Status do pagamento</label>
        <select data-status-pagamento="${p.id}">
          <option value="a_receber" ${!p.statusPagamento || p.statusPagamento === 'a_receber' ? 'selected' : ''}>A receber</option>
          <option value="pago_parcial" ${p.statusPagamento === 'pago_parcial' ? 'selected' : ''}>Pago parcialmente</option>
          <option value="pago" ${p.statusPagamento === 'pago' ? 'selected' : ''}>Pago</option>
          <option value="cancelado" ${p.statusPagamento === 'cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </div>
    </div>
  `).join('');

  listaStatusPedidosEl.innerHTML = html;

  listaStatusPedidosEl.querySelectorAll('select[data-status-pedido]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = sel.dataset.statusPedido;
      const novoStatus = sel.value;
      atualizarStatusPedido(id, novoStatus);
    });
  });

  listaStatusPedidosEl.querySelectorAll('select[data-status-pagamento]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = sel.dataset.statusPagamento;
      const novoStatusPag = sel.value;
      atualizarStatusPagamentoPedido(id, novoStatusPag);
    });
  });
}

// =========================
// FINANÇAS - EXIBIR BLOCOS E SALVAR
// =========================
const lancTipo = document.getElementById('lanc-tipo');
const blocoSaidaInv = document.getElementById('bloco-saida-investimento');
const blocoCompraMp = document.getElementById('bloco-compra-mp');
const blocoVenda = document.getElementById('bloco-venda');
const blocoEntradaInv = document.getElementById('bloco-entrada-investimento');

const lancCancelar = document.getElementById('lanc-cancelar');
const lancSalvar = document.getElementById('lanc-salvar');

const lancVendaParcialChk = document.getElementById('lanc-venda-parcial');
const lancVendaParcialBloco = document.getElementById('lanc-venda-parcial-bloco');
const lancVendaDataTotalBloco = document.getElementById('lanc-venda-data-total-bloco');

function atualizarBlocosFinancas() {
  if (!lancTipo) return;
  const tipo = lancTipo.value;

  if (blocoSaidaInv) blocoSaidaInv.style.display = tipo === 'saida-investimento' ? 'block' : 'none';
  if (blocoCompraMp) blocoCompraMp.style.display = tipo === 'compra-mp' ? 'block' : 'none';
  if (blocoVenda) blocoVenda.style.display = tipo === 'venda' ? 'block' : 'none';
  if (blocoEntradaInv) blocoEntradaInv.style.display = tipo === 'entrada-investimento' ? 'block' : 'none';
}

if (lancTipo) {
  lancTipo.addEventListener('change', atualizarBlocosFinancas);
  atualizarBlocosFinancas();
}

if (lancVendaParcialChk) {
  lancVendaParcialChk.addEventListener('change', () => {
    const parcial = lancVendaParcialChk.checked;
    if (lancVendaParcialBloco) lancVendaParcialBloco.style.display = parcial ? 'block' : 'none';
    if (lancVendaDataTotalBloco) lancVendaDataTotalBloco.style.display = parcial ? 'none' : 'block';
  });
}

// Sugestões de pedidos em Finanças (venda)
const lancVendaPedidoInput = document.getElementById('lanc-venda-pedido');
const lancVendaPedidoSug = document.getElementById('lanc-venda-pedido-sugestoes');
const lancVendaDescricao = document.getElementById('lanc-venda-descricao');
const lancVendaValor = document.getElementById('lanc-venda-valor');

function atualizarSugestoesPedidosFinancas() {
  if (!lancVendaPedidoInput || !lancVendaPedidoSug) return;

  lancVendaPedidoInput.addEventListener('input', () => {
    const texto = lancVendaPedidoInput.value.toLowerCase();
    lancVendaPedidoSug.innerHTML = '';

    if (!texto) {
      lancVendaPedidoSug.style.display = 'none';
      return;
    }

    const filtrados = pedidos.filter(p =>
      (p.clienteNome || '').toLowerCase().includes(texto)
    );

    filtrados.forEach(p => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = `${p.clienteNome || 'Cliente'} • R$ ${Number(p.totalVenda || 0).toFixed(2)}`;
      item.addEventListener('click', () => {
        lancVendaPedidoInput.value = p.clienteNome || '';
        lancVendaPedidoInput.dataset.pedidoId = p.id;

        if (lancVendaDescricao) {
          const desc = (p.itens || []).map(it => {
            return `${it.quantidade}x (R$ ${Number(it.precoUnit || 0).toFixed(2)})`;
          }).join(', ');
          lancVendaDescricao.textContent = desc || 'Sem detalhes.';
        }
        if (lancVendaValor) {
          lancVendaValor.textContent = 'R$ ' + Number(p.totalVenda || 0).toFixed(2);
        }

        lancVendaPedidoSug.innerHTML = '';
        lancVendaPedidoSug.style.display = 'none';
      });
      lancVendaPedidoSug.appendChild(item);
    });

    lancVendaPedidoSug.style.display = filtrados.length ? 'block' : 'none';
  });
}

function limparFinancas() {
  if (!lancTipo) return;
  lancTipo.value = '';
  atualizarBlocosFinancas();

  document.querySelectorAll('.lanc-bloco input, .lanc-bloco textarea').forEach(inp => {
    inp.value = '';
  });

  if (lancVendaParcialChk) {
    lancVendaParcialChk.checked = false;
    if (lancVendaParcialBloco) lancVendaParcialBloco.style.display = 'none';
    if (lancVendaDataTotalBloco) lancVendaDataTotalBloco.style.display = 'block';
  }

  if (lancVendaPedidoInput) {
    lancVendaPedidoInput.value = '';
    lancVendaPedidoInput.dataset.pedidoId = '';
  }
  if (lancVendaDescricao) lancVendaDescricao.textContent = 'Selecione um pedido.';
  if (lancVendaValor) lancVendaValor.textContent = 'R$ 0,00';
}

async function salvarLancamento() {
  if (!lancTipo) return;
  const tipo = lancTipo.value;
  if (!tipo) {
    alert('Selecione o tipo de lançamento.');
    return;
  }

  let dados = { tipo, createdAt: serverTimestamp() };

  if (tipo === 'saida-investimento') {
    const val = Number(document.getElementById('lanc-saida-valor')?.value || 0);
    const desc = document.getElementById('lanc-saida-tipo')?.value || '';
    const data = document.getElementById('lanc-saida-data')?.value || '';
    dados.valor = val;
    dados.descricao = desc;
    dados.data = data;
  } else if (tipo === 'compra-mp') {
    const mat = document.getElementById('lanc-mp-material')?.value || '';
    const qtd = Number(document.getElementById('lanc-mp-qtd')?.value || 0);
    const forn = document.getElementById('lanc-mp-fornecedor')?.value || '';
    const val = Number(document.getElementById('lanc-mp-valor')?.value || 0);
    const data = document.getElementById('lanc-mp-data')?.value || '';
    dados.material = mat;
    dados.quantidade = qtd;
    dados.fornecedor = forn;
    dados.valor = val;
    dados.data = data;
  } else if (tipo === 'venda') {
    const pedidoId = lancVendaPedidoInput?.dataset.pedidoId || '';
    const parcial = lancVendaParcialChk?.checked || false;
    const valorPago = Number(document.getElementById('lanc-venda-valor-pago')?.value || 0);
    const dataParcial = document.getElementById('lanc-venda-data')?.value || '';
    const dataTotal = document.getElementById('lanc-venda-data-total')?.value || '';
    dados.pedidoId = pedidoId;
    dados.parcial = parcial;
    dados.valorPago = valorPago;
    dados.dataParcial = dataParcial;
    dados.dataTotal = dataTotal;
  } else if (tipo === 'entrada-investimento') {
    const val = Number(document.getElementById('lanc-ent-valor')?.value || 0);
    const desc = document.getElementById('lanc-ent-desc')?.value || '';
    const data = document.getElementById('lanc-ent-data')?.value || '';
    dados.valor = val;
    dados.descricao = desc;
    dados.data = data;
  }

  try {
    await addDoc(collection(db, 'lancamentos'), dados);
    limparFinancas();
    alert('Lançamento salvo.');
  } catch (err) {
    console.error('Erro ao salvar lançamento:', err);
    alert('Não foi possível salvar o lançamento.');
  }
}

if (lancCancelar) lancCancelar.addEventListener('click', limparFinancas);
if (lancSalvar) lancSalvar.addEventListener('click', salvarLancamento);

// =========================
// AGENDA - REGISTRO
// =========================
const agendaTipoSel = document.getElementById('agenda-tipo');
const agendaPedidoBloco = document.getElementById('agenda-pedido-bloco');
const agendaPedidoInput = document.getElementById('agenda-pedido');
const agendaPedidoSug = document.getElementById('agenda-pedido-sugestoes');
const agendaDataInput = document.getElementById('agenda-data');
const agendaDescInput = document.getElementById('agenda-descricao');
const agendaRegLimpar = document.getElementById('agenda-reg-limpar');
const agendaRegSalvar = document.getElementById('agenda-reg-salvar');

function atualizarSugestoesPedidosAgenda() {
  if (!agendaPedidoInput || !agendaPedidoSug) return;

  agendaPedidoInput.addEventListener('input', () => {
    const texto = agendaPedidoInput.value.toLowerCase();
    agendaPedidoSug.innerHTML = '';

    if (!texto) {
      agendaPedidoSug.style.display = 'none';
      return;
    }

    const filtrados = pedidos.filter(p =>
      (p.clienteNome || '').toLowerCase().includes(texto)
    );

    filtrados.forEach(p => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = `${p.clienteNome || 'Cliente'} • R$ ${Number(p.totalVenda || 0).toFixed(2)}`;
      item.addEventListener('click', () => {
        agendaPedidoInput.value = p.clienteNome || '';
        agendaPedidoInput.dataset.pedidoId = p.id;
        agendaPedidoSug.innerHTML = '';
        agendaPedidoSug.style.display = 'none';
      });
      agendaPedidoSug.appendChild(item);
    });

    agendaPedidoSug.style.display = filtrados.length ? 'block' : 'none';
  });
}

function atualizarVisibilidadeAgendaPedido() {
  if (!agendaTipoSel || !agendaPedidoBloco) return;
  const tipo = agendaTipoSel.value;
  agendaPedidoBloco.style.display = (tipo === 'producao' || tipo === 'entrega') ? 'block' : 'none';
}

if (agendaTipoSel) {
  agendaTipoSel.addEventListener('change', atualizarVisibilidadeAgendaPedido);
  atualizarVisibilidadeAgendaPedido();
}

function limparAgendaRegistro() {
  if (agendaTipoSel) agendaTipoSel.value = '';
  atualizarVisibilidadeAgendaPedido();
  if (agendaPedidoInput) {
    agendaPedidoInput.value = '';
    agendaPedidoInput.dataset.pedidoId = '';
  }
  if (agendaPedidoSug) {
    agendaPedidoSug.innerHTML = '';
    agendaPedidoSug.style.display = 'none';
  }
  if (agendaDataInput) agendaDataInput.value = '';
  if (agendaDescInput) agendaDescInput.value = '';
}

async function salvarAgendaRegistro() {
  const tipo = agendaTipoSel?.value || '';
  if (!tipo) {
    alert('Selecione o tipo de compromisso.');
    return;
  }

  const data = agendaDataInput?.value || '';
  if (!data) {
    alert('Selecione uma data.');
    return;
  }

  const descricao = agendaDescInput?.value || '';
  const pedidoId = agendaPedidoInput?.dataset.pedidoId || '';
  const pedidoNome = agendaPedidoInput?.value || '';

  const docData = {
    tipo,
    data,
    descricao,
    pedidoId: (tipo === 'producao' || tipo === 'entrega') ? pedidoId : null,
    pedidoNome: (tipo === 'producao' || tipo === 'entrega') ? pedidoNome : null,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'agenda'), docData);
    limparAgendaRegistro();
    alert('Compromisso registrado.');
  } catch (err) {
    console.error('Erro ao salvar compromisso:', err);
    alert('Não foi possível salvar o compromisso.');
  }
}

if (agendaRegLimpar) agendaRegLimpar.addEventListener('click', limparAgendaRegistro);
if (agendaRegSalvar) agendaRegSalvar.addEventListener('click', salvarAgendaRegistro);

// =========================
// VENDAS - RESUMO SIMPLES
// =========================
const vendasResumoQtde = document.getElementById('vendas-resumo-qtde');
const vendasResumoTotal = document.getElementById('vendas-resumo-total');

function atualizarResumoVendas() {
  if (!vendasResumoQtde || !vendasResumoTotal) return;

  const qtde = pedidos.length;
  let total = 0;
  pedidos.forEach(p => {
    total += Number(p.totalVenda || 0);
  });

  vendasResumoQtde.textContent = String(qtde);
  vendasResumoTotal.textContent = total.toFixed(2);
}

// =========================
// ATALHO PROS FABs DE CADASTRO (se você tiver colocado no HTML)
// =========================
function focarNoElemento(el) {
  if (!el) return;
  const sec = el.closest('.home-section') || el;
  const top = sec.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
  el.focus();
}

// IDs sugeridos pros botões flutuantes: fab-add-cliente / fab-add-produto / fab-add-mp / fab-add-fornecedor
const fabAddCliente = document.getElementById('fab-add-cliente');
if (fabAddCliente && cadCliNome) {
  fabAddCliente.addEventListener('click', () => focarNoElemento(cadCliNome));
}
const fabAddProduto = document.getElementById('fab-add-produto');
if (fabAddProduto && cadProdDesc) {
  fabAddProduto.addEventListener('click', () => focarNoElemento(cadProdDesc));
}
const fabAddMp = document.getElementById('fab-add-mp');
if (fabAddMp && cadMpDesc) {
  fabAddMp.addEventListener('click', () => focarNoElemento(cadMpDesc));
}
const fabAddForn = document.getElementById('fab-add-fornecedor');
if (fabAddForn && cadFornNome) {
  fabAddForn.addEventListener('click', () => focarNoElemento(cadFornNome));
}

// =========================
// INIT GERAL
// =========================
function init() {
  // listeners
  startClientesListener();
  startMateriasPrimaListener();
  startFornecedoresListener();
  startProdutosListener();
  startPedidosListener();
  startAgendaListener();
  startLancamentosListener();

  // sug. clientes no novo pedido
  atualizarSugestoesClientesPedido();
  atualizarSugestoesPedidosFinancas();
  atualizarSugestoesPedidosAgenda();

  // entrar direto na home (login desabilitado por enquanto)
  showView('home');

  // inicializa novo pedido com uma linha
  limparNovoPedido();

  // render agenda inicial
  renderAgenda();

  // render estoque inicial
  renderConsultaEstoque();
}

init();
