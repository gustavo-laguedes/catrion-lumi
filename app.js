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

    // caso específico: botão de item do pedido
    if (btn.id === 'fab-add-item') {
      abrirModalItem();
      return;
    }

    // outros + continuam só com mensagem por enquanto
    alert('Aqui vai abrir o formulário para adicionar ' + ctx + '.');
  });
});

// --- Novo Pedido: modal de itens e listagem ---
let pedidoItens = [];

const modalItem = document.getElementById('modal-item');
const btnModalFechar = document.getElementById('modal-item-fechar');
const btnModalCancelar = document.getElementById('modal-item-cancelar');
const btnModalSalvar = document.getElementById('modal-item-salvar');
const listaItensEl = document.getElementById('lista-itens-pedido');

function abrirModalItem() {
  if (!modalItem) return;
  // limpa campos básicos
  document.getElementById('item-produto').value = '';
  document.getElementById('item-quantidade').value = 1;
  document.getElementById('item-preco').value = 0;
  document.getElementById('item-tempo').value = 0;
  document.getElementById('item-energia').value = 0;
  document.getElementById('item-obs').value = '';

  modalItem.classList.add('visible');
}

function fecharModalItem() {
  if (!modalItem) return;
  modalItem.classList.remove('visible');
}

function renderizarItensPedido() {
  if (!listaItensEl) return;

  if (!pedidoItens.length) {
    listaItensEl.innerHTML = '<p class="item-meta">Nenhum item adicionado ainda. Toque em “+” para incluir.</p>';
    return;
  }

  const html = pedidoItens.map((item, idx) => {
    const total = item.quantidade * item.preco;
    return `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${item.produto}</span>
          <span class="badge badge-venda">Qtd: ${item.quantidade}</span>
        </div>
        <div class="item-meta">
          Preço unit.: R$ ${item.preco.toFixed(2)} • Total: R$ ${total.toFixed(2)}<br>
          Tempo: ${item.tempo} min • Energia: ${item.energia} kWh
        </div>
        ${item.obs ? `<div class="item-meta">Obs.: ${item.obs}</div>` : ''}
        <div class="item-actions">
          <button type="button" class="btn-text btn-text-danger" data-remover-item="${idx}">Remover</button>
        </div>
      </div>
    `;
  }).join('');

  listaItensEl.innerHTML = html;

  // adiciona eventos de remover
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

// eventos do modal
if (btnModalFechar) btnModalFechar.addEventListener('click', fecharModalItem);
if (btnModalCancelar) btnModalCancelar.addEventListener('click', fecharModalItem);

if (btnModalSalvar) {
  btnModalSalvar.addEventListener('click', () => {
    const produto = document.getElementById('item-produto').value.trim();
    const quantidade = Number(document.getElementById('item-quantidade').value || 0);
    const preco = Number(document.getElementById('item-preco').value || 0);
    const tempo = Number(document.getElementById('item-tempo').value || 0);
    const energia = Number(document.getElementById('item-energia').value || 0);
    const obs = document.getElementById('item-obs').value.trim();

    if (!produto) {
      alert('Informe o nome do produto.');
      return;
    }
    if (quantidade <= 0) {
      alert('Quantidade deve ser maior que zero.');
      return;
    }

    pedidoItens.push({
      produto,
      quantidade,
      preco,
      tempo,
      energia,
      obs
    });

    renderizarItensPedido();
    fecharModalItem();
  });
}

// render inicial (caso queira garantir estado)
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
