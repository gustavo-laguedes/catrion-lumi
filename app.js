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

// LOGIN / CADASTRO
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

// --- CALENDÁRIO AGENDA ---
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

document.querySelectorAll('.fab-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const ctx = btn.dataset.addContext || 'registro';

    // caso específico: item do pedido (modal completo)
    if (btn.id === 'fab-add-item') {
      abrirModalItem();
      return;
    }

    // demais "+" usam modal genérico
    abrirModalGenerico(ctx);
  });
});

// --- MODAL GENÉRICO PARA DEMAIS "+" ---
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
    // aqui no futuro vamos realmente salvar (Firebase, lista etc.)
    // por enquanto só fecha pra dar feedback visual
    fecharModalGenerico();
  });
}

// Catálogo temporário de produtos (depois vai vir do cadastro/Firebase)
const produtosCatalogo = [
  { id: 'p1', nome: 'Caixa personalizada', preco: 50.00 },
  { id: 'p2', nome: 'Caneca floral', preco: 35.00 },
  { id: 'p3', nome: 'Quadro decorativo', preco: 80.00 }
];


// --- Novo Pedido: modal de itens e listagem ---
let pedidoItens = [];

const modalItem = document.getElementById('modal-item');
const btnModalFechar = document.getElementById('modal-item-fechar');
const btnModalCancelar = document.getElementById('modal-item-cancelar');
const btnModalSalvar = document.getElementById('modal-item-salvar');
const btnModalAddRow = document.getElementById('modal-item-add-row');
const itensMultiContainer = document.getElementById('itens-multi-container');
const listaItensEl = document.getElementById('lista-itens-pedido');
const pedidoTotalEl = document.getElementById('pedido-total');

function preencherSelectProdutos(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">— selecione —</option>';
  produtosCatalogo.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.nome} — R$ ${p.preco.toFixed(2)}`;
    selectEl.appendChild(opt);
  });
}

function criarLinhaItem() {
  if (!itensMultiContainer) return;

  const row = document.createElement('div');
  row.classList.add('item-modal-row');

  row.innerHTML = `
    <div class="form-group">
      <label>Produto</label>
      <select class="item-produto-select"></select>
    </div>
    <div class="form-group">
      <label>Qtd.</label>
      <input type="number" class="item-quantidade-input" min="1" value="1">
    </div>
  `;

  itensMultiContainer.appendChild(row);

  const select = row.querySelector('.item-produto-select');
  preencherSelectProdutos(select);
}

function abrirModalItem() {
  if (!modalItem || !itensMultiContainer) return;

  // limpa todas as linhas e cria uma nova
  itensMultiContainer.innerHTML = '';
  criarLinhaItem();

  modalItem.classList.add('visible');
}

function fecharModalItem() {
  if (!modalItem) return;
  modalItem.classList.remove('visible');
}

function calcularTotalPedido() {
  const total = pedidoItens.reduce((acc, item) => {
    return acc + (item.quantidade * item.preco);
  }, 0);

  if (pedidoTotalEl) {
    pedidoTotalEl.textContent = `Total do pedido: R$ ${total.toFixed(2)}`;
  }
}

function renderizarItensPedido() {
  if (!listaItensEl) return;

  if (!pedidoItens.length) {
    listaItensEl.innerHTML = '<p class="item-meta">Nenhum item adicionado ainda. Toque em “+” para incluir.</p>';
    calcularTotalPedido();
    return;
  }

  const html = pedidoItens.map((item, idx) => {
    const total = item.quantidade * item.preco;
    return `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${item.produtoNome}</span>
          <span class="badge badge-venda">Qtd: ${item.quantidade}</span>
        </div>
        <div class="item-meta">
          Preço unit.: R$ ${item.preco.toFixed(2)} • Total: R$ ${total.toFixed(2)}
        </div>
        <div class="item-actions">
          <button type="button" class="btn-text" data-editar-item="${idx}">✏️ Editar</button>
          <button type="button" class="btn-text btn-text-danger" data-remover-item="${idx}">Remover</button>
        </div>
      </div>
    `;
  }).join('');

  listaItensEl.innerHTML = html;

  // eventos de remover
  listaItensEl.querySelectorAll('[data-remover-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removerItem, 10);
      if (!isNaN(idx)) {
        pedidoItens.splice(idx, 1);
        renderizarItensPedido();
      }
    });
  });

  // eventos de editar (por enquanto só um alerta / placeholder)
  listaItensEl.querySelectorAll('[data-editar-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.editarItem, 10);
      if (!isNaN(idx)) {
        alert('Edição de item ainda será implementada. (Item #' + (idx + 1) + ')');
      }
    });
  });

  calcularTotalPedido();
}

// eventos do modal de itens
if (btnModalFechar) btnModalFechar.addEventListener('click', fecharModalItem);
if (btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalItem);
if (btnModalAddRow) btnModalAddRow.addEventListener('click', criarLinhaItem);

if (btnModalSalvar) {
  btnModalSalvar.addEventListener('click', () => {
    if (!itensMultiContainer) return;

    const rows = itensMultiContainer.querySelectorAll('.item-modal-row');
    const novosItens = [];

    rows.forEach(row => {
      const select = row.querySelector('.item-produto-select');
      const qtdInput = row.querySelector('.item-quantidade-input');

      if (!select || !qtdInput) return;

      const produtoId = select.value;
      const quantidade = Number(qtdInput.value || 0);

      if (!produtoId || quantidade <= 0) {
        return;
      }

      const prod = produtosCatalogo.find(p => p.id === produtoId);
      if (!prod) return;

      novosItens.push({
        produtoId: prod.id,
        produtoNome: prod.nome,
        quantidade,
        preco: prod.preco
      });
    });

    if (!novosItens.length) {
      alert('Selecione pelo menos um produto com quantidade válida.');
      return;
    }

    pedidoItens = pedidoItens.concat(novosItens);
    renderizarItensPedido();
    fecharModalItem();
  });
}

// render inicial
renderizarItensPedido();





// --- MÊS NA TELA DE VENDAS ---
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
