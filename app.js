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
    header.classList.remove('visible');
    bottomNav.classList.remove('visible');
  } else {
    header.classList.add('visible');
    bottomNav.classList.add('visible');
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
// LOGIN / CADASTRO
// =========================
document.getElementById('link-cadastro').addEventListener('click', () => {
  showView('register');
});

document.getElementById('link-voltar-login').addEventListener('click', () => {
  showView('login');
});

document.getElementById('btn-login').addEventListener('click', () => {
  showView('home');
});

document.getElementById('btn-registrar').addEventListener('click', () => {
  // depois vamos validar senha e chamar Firebase
  showView('login');
});

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
// CALENDÁRIO AGENDA
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

// Exemplo: depois vamos preencher com dados reais de agenda
const agendaEventos = {
  // '2025-11-21': true
};

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
// MODAL GENÉRICO PARA OUTROS "+"
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

  // limpa campos
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
// DADOS TEMPORÁRIOS (CLIENTES / PRODUTOS)
// =========================
let clientes = [
  { nome: "Maria Souza", tel: "12 99999-2222", end: "Rua A, 100", cid: "Taubaté", est: "SP" },
  { nome: "Ana Paula", tel: "12 98888-1111", end: "Av. B, 345", cid: "Pinda", est: "SP" }
];

let produtos = [
  { nome: "Quadro decorativo", preco: 50, custo: 20 },
  { nome: "Caneca floral", preco: 35, custo: 12 }
];

// =========================
// NOVO PEDIDO - LISTA NA TELA PRINCIPAL
// =========================
let pedidoItens = []; // cada item: {clienteNome, produtoNome, quantidade, totalVenda, totalCusto}

const listaItensEl = document.getElementById('lista-itens-pedido');
const pedidoTotalEl = document.getElementById('pedido-total');

let editMode = false; // quando true, mostra o "-" nos cards

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

  // ---- agrupa itens por cliente ----
  const grupos = {}; // chave: clienteNome

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

  // ---- total global ----
  let totalGlobal = 0;
  gruposArr.forEach(g => totalGlobal += g.totalVenda);

  // ---- monta HTML dos cards, 1 por cliente ----
  const html = gruposArr.map((grupo, idx) => {
    // resumo: Quadro (2), Caneca (3)...
    const porProduto = {};
    grupo.itens.forEach(it => {
      porProduto[it.produtoNome] = (porProduto[it.produtoNome] || 0) + it.quantidade;
    });
    const resumoProdutos = Object.entries(porProduto)
      .map(([nome, qtd]) => `${nome} (${qtd})`)
      .join(', ');

    // detalhes completos (expandido quando clica no card)
    const detalhes = grupo.itens.map(it => {
      return `
        <li>
          ${it.produtoNome} — Qtd: ${it.quantidade}
          • Venda: R$ ${it.totalVenda.toFixed(2)}
          • Custo: R$ ${it.totalCusto.toFixed(2)}
        </li>
      `;
    }).join('');

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

  // atualiza total global embaixo
  if (pedidoTotalEl) {
    pedidoTotalEl.textContent = `Total do pedido: R$ ${totalGlobal.toFixed(2)}`;
  }

  // clique no card -> abre/fecha detalhes
  listaItensEl.querySelectorAll('.pedido-group-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('open');
    });
  });

  // modo edição: botão "-" remove todos os itens daquele cliente
  if (editMode) {
    const gruposRef = gruposArr; // pra usar dentro do handler

    listaItensEl.querySelectorAll('[data-remover-grupo]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); // não abrir/fechar detalhes ao clicar no "-"

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

  // remover item
  listaItensEl.querySelectorAll('[data-remover-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removerItem, 10);
      if (!isNaN(idx)) {
        pedidoItens.splice(idx, 1);
        renderizarItensPedido();
      }
    });
  });
}

// render inicial (sem itens)
renderizarItensPedido();

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

  // limpa cliente
  if (campoBuscaCliente) {
    campoBuscaCliente.value = '';
  }
  if (clienteInfoCard) {
    clienteInfoCard.style.display = 'none';
  }
  if (listaClientesEl) {
    listaClientesEl.innerHTML = '';
    listaClientesEl.style.display = 'none';
  }

  // limpa produtos dentro do modal
  limparProdutosDoPedido();
  adicionarProdutoLinha();
  atualizarTotaisModal();

  modalItem.classList.add('visible');
}

function fecharModalItem() {
  if (!modalItem) return;
  modalItem.classList.remove('visible');
}

function limparProdutosDoPedido() {
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
            if (infoTel) infoTel.textContent = c.tel;
            if (infoEnd) infoEnd.textContent = c.end;
            if (infoCid) infoCid.textContent = c.cid;
            if (infoEst) infoEst.textContent = c.est;
          }
        });
        listaClientesEl.appendChild(item);
      });

    // opção de cadastrar cliente
    const addItem = document.createElement('div');
    addItem.className = 'autocomplete-item';
    addItem.textContent = '+ Cadastrar cliente';
    addItem.addEventListener('click', () => {
      showView('cad-clientes');
      fecharModalItem();
    });
    listaClientesEl.appendChild(addItem);

    listaClientesEl.style.display = 'block';
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

    // opção cadastrar produto
    const addItem = document.createElement('div');
    addItem.className = 'autocomplete-item';
    addItem.textContent = '+ Cadastrar produto';
    addItem.addEventListener('click', () => {
      showView('cad-produtos');
      fecharModalItem();
    });
    lista.appendChild(addItem);

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

    const vendaNum = Number(vendaEl.textContent.replace('R$','').trim() || 0);
    const custoNum = Number(custoEl.textContent.replace('R$','').trim() || 0);

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

// ---------- SALVAR DO MODAL PARA A LISTA ----------
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
if (btnAddProduto) btnAddProduto.addEventListener('click', adicionarProdutoLinha);
if (btnModalFechar) btnModalFechar.addEventListener('click', fecharModalItem);
if (btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalItem);
if (btnModalSalvar) btnModalSalvar.addEventListener('click', salvarPedidoDoModal);
