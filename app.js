// app.js - Catrion Lumi (sem login, usando localStorage)
// Tudo aqui é modular, mas sem import de firebase por enquanto.

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE = {
  clientes: 'lumi_clientes',
  mp: 'lumi_mp',
  fornecedores: 'lumi_fornecedores',
  produtos: 'lumi_produtos',
  pedidos: 'lumi_pedidos',
  lancamentos: 'lumi_lancamentos',
  agenda: 'lumi_agenda'
};

function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler localStorage', key, e);
    return [];
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao salvar localStorage', key, e);
  }
}

function formatMoney(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(p) {
  const n = Number(p) || 0;
  return `${n.toFixed(1).replace('.', ',')}%`;
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

// SPA / Navegação
function showView(viewName) {
  $$('.view').forEach((v) => v.classList.remove('active'));
  const target = document.querySelector(`.view[data-view="${viewName}"]`);
  if (target) {
    target.classList.add('active');
  }

  // bottom nav active
  $$('.bottom-nav .nav-item').forEach((btn) => {
    const targetView = btn.dataset.targetView;
    btn.classList.toggle('active', targetView === viewName);
  });
}

function initNavigation() {
  // clicks em qualquer data-target-view
  $$('[data-target-view]').forEach((el) => {
    el.addEventListener('click', () => {
      const v = el.dataset.targetView;
      if (v) showView(v);
    });
  });

  // começa sempre na home
  showView('home');
}

// Estado global simples em memória
let clientes = [];
let mpList = [];
let fornecedores = [];
let produtos = [];
let pedidos = [];
let lancamentos = [];
let agendaItens = [];

// ---------- CADASTRO DE CLIENTES ----------
function renderClientes() {
  const container = $('#lista-clientes-cad');
  if (!container) return;

  if (!clientes.length) {
    container.innerHTML = `<div class="item-meta">Nenhum cliente cadastrado ainda.</div>`;
    return;
  }

  const ordenados = [...clientes].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR')
  );

  container.innerHTML = ordenados
    .map(
      (c) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${c.nome}</span>
          <span class="item-meta">${c.tel || ''}</span>
        </div>
        <div class="item-meta">
          ${[c.end, c.cid, c.est].filter(Boolean).join(' - ')}
        </div>
      </div>
    `
    )
    .join('');
}

function initClientes() {
  const fabAdd = $('#fab-add-cliente');
  const sectionLista = $('#clientes-list-section');
  const sectionForm = $('#clientes-form-section');
  const btnVoltar = $('#btn-clientes-voltar-lista');
  const btnLimpar = $('#cad-cliente-limpar');
  const btnSalvar = $('#cad-cliente-salvar');

  if (!fabAdd || !sectionLista || !sectionForm) return;

  function limparFormCliente() {
    $('#cad-cliente-nome').value = '';
    $('#cad-cliente-tel').value = '';
    $('#cad-cliente-end').value = '';
    $('#cad-cliente-cid').value = '';
    $('#cad-cliente-est').value = '';
  }

  fabAdd.addEventListener('click', () => {
    sectionLista.style.display = 'none';
    sectionForm.style.display = 'block';
    limparFormCliente();
  });

  btnVoltar.addEventListener('click', () => {
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  btnLimpar.addEventListener('click', limparFormCliente);

  btnSalvar.addEventListener('click', () => {
    const nome = $('#cad-cliente-nome').value.trim();
    if (!nome) {
      alert('Informe o nome do cliente.');
      return;
    }

    const novo = {
      id: Date.now(),
      nome,
      tel: $('#cad-cliente-tel').value.trim(),
      end: $('#cad-cliente-end').value.trim(),
      cid: $('#cad-cliente-cid').value.trim(),
      est: $('#cad-cliente-est').value.trim()
    };

    clientes.push(novo);
    saveData(STORAGE.clientes, clientes);
    renderClientes();
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  renderClientes();
}

// ---------- CADASTRO DE MATÉRIA-PRIMA ----------
function renderMp() {
  const container = $('#lista-mp-cad');
  if (!container) return;

  if (!mpList.length) {
    container.innerHTML = `<div class="item-meta">Nenhuma matéria-prima cadastrada.</div>`;
    return;
  }

  const ordenados = [...mpList].sort((a, b) =>
    a.desc.localeCompare(b.desc, 'pt-BR')
  );

  container.innerHTML = ordenados
    .map(
      (m) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${m.desc}</span>
          <span class="item-meta">${m.unid || ''}</span>
        </div>
        <div class="item-meta">
          Custo: ${formatMoney(m.custo)} ${m.unid ? ' / ' + m.unid : ''}
          ${m.forn ? ' • Fornecedor: ' + m.forn : ''}
        </div>
      </div>
    `
    )
    .join('');
}

function initMp() {
  const fabAdd = $('#fab-add-mp');
  const sectionLista = $('#mp-list-section');
  const sectionForm = $('#mp-form-section');
  const btnVoltar = $('#btn-mp-voltar-lista');
  const btnLimpar = $('#cad-mp-limpar');
  const btnSalvar = $('#cad-mp-salvar');

  if (!fabAdd || !sectionLista || !sectionForm) return;

  function limparFormMp() {
    $('#cad-mp-desc').value = '';
    $('#cad-mp-unid').value = '';
    $('#cad-mp-custo').value = '';
    $('#cad-mp-forn').value = '';
  }

  fabAdd.addEventListener('click', () => {
    sectionLista.style.display = 'none';
    sectionForm.style.display = 'block';
    limparFormMp();
  });

  btnVoltar.addEventListener('click', () => {
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  btnLimpar.addEventListener('click', limparFormMp);

  btnSalvar.addEventListener('click', () => {
    const desc = $('#cad-mp-desc').value.trim();
    if (!desc) {
      alert('Informe a descrição da matéria-prima.');
      return;
    }

    const custo = parseFloat($('#cad-mp-custo').value.replace(',', '.')) || 0;

    const novo = {
      id: Date.now(),
      desc,
      unid: $('#cad-mp-unid').value.trim(),
      custo,
      forn: $('#cad-mp-forn').value.trim()
    };

    mpList.push(novo);
    saveData(STORAGE.mp, mpList);
    renderMp();
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  renderMp();
}

// ---------- CADASTRO DE FORNECEDORES ----------
function renderFornecedores() {
  const container = $('#lista-forn-cad');
  if (!container) return;

  if (!fornecedores.length) {
    container.innerHTML = `<div class="item-meta">Nenhum fornecedor cadastrado.</div>`;
    return;
  }

  const ordenados = [...fornecedores].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR')
  );

  container.innerHTML = ordenados
    .map(
      (f) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${f.nome}</span>
          <span class="item-meta">${f.contato || ''}</span>
        </div>
        <div class="item-meta">
          ${f.notas || ''}
        </div>
      </div>
    `
    )
    .join('');
}

function initFornecedores() {
  const fabAdd = $('#fab-add-forn');
  const sectionLista = $('#forn-list-section');
  const sectionForm = $('#forn-form-section');
  const btnVoltar = $('#btn-forn-voltar-lista');
  const btnLimpar = $('#cad-forn-limpar');
  const btnSalvar = $('#cad-forn-salvar');

  if (!fabAdd || !sectionLista || !sectionForm) return;

  function limparFormForn() {
    $('#cad-forn-nome').value = '';
    $('#cad-forn-contato').value = '';
    $('#cad-forn-notas').value = '';
  }

  fabAdd.addEventListener('click', () => {
    sectionLista.style.display = 'none';
    sectionForm.style.display = 'block';
    limparFormForn();
  });

  btnVoltar.addEventListener('click', () => {
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  btnLimpar.addEventListener('click', limparFormForn);

  btnSalvar.addEventListener('click', () => {
    const nome = $('#cad-forn-nome').value.trim();
    if (!nome) {
      alert('Informe o nome do fornecedor.');
      return;
    }

    const novo = {
      id: Date.now(),
      nome,
      contato: $('#cad-forn-contato').value.trim(),
      notas: $('#cad-forn-notas').value.trim()
    };

    fornecedores.push(novo);
    saveData(STORAGE.fornecedores, fornecedores);
    renderFornecedores();
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  renderFornecedores();
}

// ---------- CADASTRO DE PRODUTOS ----------
function calcularProdutoCustoELucro() {
  const linhas = $$('#cad-prod-mp-container .prod-mp-line');
  let somaCusto = 0;

  linhas.forEach((linha) => {
    const qtd = parseFloat(
      linha.querySelector('.prod-mp-qtd').value.replace(',', '.')
    ) || 0;
    const custoUn = parseFloat(
      linha.querySelector('.prod-mp-custo-un').value.replace(',', '.')
    ) || 0;
    const total = qtd * custoUn;
    somaCusto += total;

    const spanTotal = linha.querySelector('.prod-mp-total');
    if (spanTotal) {
      spanTotal.textContent = formatMoney(total);
    }
  });

  const inputCusto = $('#cad-prod-custo');
  if (inputCusto) inputCusto.value = somaCusto.toFixed(2);

  const venda = parseFloat(
    ($('#cad-prod-venda').value || '').toString().replace(',', '.')
  ) || 0;

  const lucroDiv = $('#cad-prod-lucro');
  if (lucroDiv) {
    if (venda > 0) {
      const perc = ((venda - somaCusto) / venda) * 100;
      lucroDiv.textContent = formatPercent(perc);
    } else {
      lucroDiv.textContent = '0%';
    }
  }
}

function adicionarLinhaMpProduto(dados) {
  const container = $('#cad-prod-mp-container');
  if (!container) return;

  const linha = document.createElement('div');
  linha.className = 'prod-mp-line';

  linha.innerHTML = `
    <input type="text" class="prod-mp-desc" placeholder="Matéria-prima" />
    <input type="number" class="prod-mp-qtd" min="0" step="0.01" placeholder="Qtd" />
    <input type="number" class="prod-mp-custo-un" min="0" step="0.01" placeholder="Custo/un" />
    <span class="prod-mp-total">R$ 0,00</span>
    <button type="button" class="btn-text prod-mp-remover">Remover</button>
  `;

  container.appendChild(linha);

  if (dados) {
    linha.querySelector('.prod-mp-desc').value = dados.desc || '';
    linha.querySelector('.prod-mp-qtd').value = dados.qtd || '';
    linha.querySelector('.prod-mp-custo-un').value = dados.custoUn || '';
  }

  linha
    .querySelectorAll('.prod-mp-qtd, .prod-mp-custo-un')
    .forEach((input) => {
      input.addEventListener('input', calcularProdutoCustoELucro);
    });

  const btnRem = linha.querySelector('.prod-mp-remover');
  btnRem.addEventListener('click', () => {
    linha.remove();
    calcularProdutoCustoELucro();
  });

  calcularProdutoCustoELucro();
}

function renderProdutos() {
  const container = $('#lista-produtos-cad');
  if (!container) return;

  if (!produtos.length) {
    container.innerHTML = `<div class="item-meta">Nenhum produto cadastrado.</div>`;
    return;
  }

  const ordenados = [...produtos].sort((a, b) =>
    a.desc.localeCompare(b.desc, 'pt-BR')
  );

  container.innerHTML = ordenados
    .map(
      (p) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${p.desc} (${p.unid || ''})</span>
          <span class="item-meta">Venda: ${formatMoney(p.venda)}</span>
        </div>
        <div class="item-meta">
          Custo: ${formatMoney(p.custoTotal)} • Lucro: ${formatPercent(p.lucroPercent || 0)}
        </div>
      </div>
    `
    )
    .join('');
}

function initProdutos() {
  const fabAdd = $('#fab-add-produto');
  const sectionLista = $('#produtos-list-section');
  const sectionForm = $('#produtos-form-section');
  const btnVoltar = $('#btn-produtos-voltar-lista');
  const btnLimpar = $('#cad-prod-limpar');
  const btnSalvar = $('#cad-prod-salvar');
  const btnAddMp = $('#cad-prod-mp-add');
  const inputVenda = $('#cad-prod-venda');

  if (!fabAdd || !sectionLista || !sectionForm) return;

  function limparFormProduto() {
    $('#cad-prod-desc').value = '';
    $('#cad-prod-unid').value = '';
    $('#cad-prod-custo').value = '';
    $('#cad-prod-venda').value = '';
    $('#cad-prod-lucro').textContent = '0%';
    $('#cad-prod-notas').value = '';
    const cont = $('#cad-prod-mp-container');
    if (cont) cont.innerHTML = '';
    adicionarLinhaMpProduto();
  }

  fabAdd.addEventListener('click', () => {
    sectionLista.style.display = 'none';
    sectionForm.style.display = 'block';
    limparFormProduto();
  });

  btnVoltar.addEventListener('click', () => {
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  btnLimpar.addEventListener('click', limparFormProduto);

  if (btnAddMp) {
    btnAddMp.addEventListener('click', () => adicionarLinhaMpProduto());
  }

  if (inputVenda) {
    inputVenda.addEventListener('input', calcularProdutoCustoELucro);
  }

  btnSalvar.addEventListener('click', () => {
    const desc = $('#cad-prod-desc').value.trim();
    if (!desc) {
      alert('Informe a descrição do produto.');
      return;
    }

    const unid = $('#cad-prod-unid').value;
    const custoTotal = parseFloat(
      ($('#cad-prod-custo').value || '').toString().replace(',', '.')
    ) || 0;
    const venda = parseFloat(
      ($('#cad-prod-venda').value || '').toString().replace(',', '.')
    ) || 0;
    let lucroPercent = 0;
    if (venda > 0) {
      lucroPercent = ((venda - custoTotal) / venda) * 100;
    }

    const linhas = $$('#cad-prod-mp-container .prod-mp-line');
    const mpItens = linhas.map((linha) => {
      const d = linha.querySelector('.prod-mp-desc').value.trim();
      const qtd = parseFloat(
        linha.querySelector('.prod-mp-qtd').value.replace(',', '.')
      ) || 0;
      const custoUn = parseFloat(
        linha.querySelector('.prod-mp-custo-un').value.replace(',', '.')
      ) || 0;
      return {
        desc: d,
        qtd,
        custoUn,
        total: qtd * custoUn
      };
    });

    const novo = {
      id: Date.now(),
      desc,
      unid,
      custoTotal,
      venda,
      lucroPercent,
      notas: $('#cad-prod-notas').value.trim(),
      mpItens
    };

    produtos.push(novo);
    saveData(STORAGE.produtos, produtos);
    renderProdutos();
    sectionForm.style.display = 'none';
    sectionLista.style.display = 'block';
  });

  renderProdutos();
}

// ---------- NOVO PEDIDO ----------
function atualizarTotaisPedido() {
  const linhas = $$('#pedido-itens-container .pedido-item-line');
  let totalVenda = 0;
  let totalCusto = 0;

  linhas.forEach((linha) => {
    const qtd = parseFloat(
      linha.querySelector('.pedido-item-qtd').value.replace(',', '.')
    ) || 0;
    const valor = parseFloat(
      linha.querySelector('.pedido-item-valor').value.replace(',', '.')
    ) || 0;
    const custo = parseFloat(
      linha.querySelector('.pedido-item-custo').value.replace(',', '.')
    ) || 0;

    totalVenda += qtd * valor;
    totalCusto += qtd * custo;
  });

  $('#pedido-total-venda').textContent = formatMoney(totalVenda);
  $('#pedido-total-custo').textContent = formatMoney(totalCusto);

  let perc = 0;
  if (totalVenda > 0) {
    perc = ((totalVenda - totalCusto) / totalVenda) * 100;
  }
  $('#pedido-total-lucro').textContent = formatPercent(perc);
}

function adicionarLinhaPedidoItem(dados) {
  const container = $('#pedido-itens-container');
  if (!container) return;

  const linha = document.createElement('div');
  linha.className = 'pedido-item-line';

  linha.innerHTML = `
    <input type="text" class="pedido-item-desc" placeholder="Produto" />
    <input type="number" class="pedido-item-qtd" min="0" step="1" placeholder="Qtd" />
    <input type="number" class="pedido-item-valor" min="0" step="0.01" placeholder="Valor unitário" />
    <input type="number" class="pedido-item-custo" min="0" step="0.01" placeholder="Custo unitário" />
    <button type="button" class="btn-text pedido-item-remover">Remover</button>
  `;

  container.appendChild(linha);

  if (dados) {
    linha.querySelector('.pedido-item-desc').value = dados.desc || '';
    linha.querySelector('.pedido-item-qtd').value = dados.qtd || '';
    linha.querySelector('.pedido-item-valor').value = dados.valorUnit || '';
    linha.querySelector('.pedido-item-custo').value = dados.custoUnit || '';
  }

  linha
    .querySelectorAll(
      '.pedido-item-qtd, .pedido-item-valor, .pedido-item-custo'
    )
    .forEach((input) => {
      input.addEventListener('input', atualizarTotaisPedido);
    });

  linha.querySelector('.pedido-item-remover').addEventListener('click', () => {
    linha.remove();
    atualizarTotaisPedido();
  });

  atualizarTotaisPedido();
}

function initNovoPedido() {
  const inputCliente = $('#pedido-cliente-input');
  const sugestoes = $('#pedido-cliente-sugestoes');
  const infoCard = $('#pedido-cliente-info');

  if (!inputCliente || !sugestoes) return;

  function limparClienteInfo() {
    $('#pedido-cliente-tel').textContent = '';
    $('#pedido-cliente-end').textContent = '';
    $('#pedido-cliente-cid').textContent = '';
    $('#pedido-cliente-est').textContent = '';
    if (infoCard) infoCard.style.display = 'none';
  }

  function preencherClienteInfo(cliente) {
    if (!cliente) {
      limparClienteInfo();
      return;
    }
    $('#pedido-cliente-tel').textContent = cliente.tel || '';
    $('#pedido-cliente-end').textContent = cliente.end || '';
    $('#pedido-cliente-cid').textContent = cliente.cid || '';
    $('#pedido-cliente-est').textContent = cliente.est || '';
    infoCard.style.display = 'block';
  }

  inputCliente.addEventListener('input', () => {
    const termo = inputCliente.value.toLowerCase();
    sugestoes.innerHTML = '';
    if (!termo) return;

    const filtrados = clientes.filter((c) =>
      c.nome.toLowerCase().includes(termo)
    );

    if (!filtrados.length) return;

    filtrados.forEach((c) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = `${c.nome} ${c.tel ? ' - ' + c.tel : ''}`;
      item.addEventListener('click', () => {
        inputCliente.value = c.nome;
        sugestoes.innerHTML = '';
        preencherClienteInfo(c);
      });
      sugestoes.appendChild(item);
    });
  });

  document.addEventListener('click', (e) => {
    if (!sugestoes.contains(e.target) && e.target !== inputCliente) {
      sugestoes.innerHTML = '';
    }
  });

  const btnAddItem = $('#btn-pedido-add-item');
  if (btnAddItem) {
    btnAddItem.addEventListener('click', () => adicionarLinhaPedidoItem());
  }

  const btnLimpar = $('#btn-pedido-cancelar');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      inputCliente.value = '';
      limparClienteInfo();
      const cont = $('#pedido-itens-container');
      if (cont) cont.innerHTML = '';
      adicionarLinhaPedidoItem();
      atualizarTotaisPedido();
    });
  }

  const btnSalvar = $('#btn-pedido-salvar');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
      const clienteNome = inputCliente.value.trim();
      if (!clienteNome) {
        alert('Informe o cliente do pedido.');
        return;
      }

      const linhas = $$('#pedido-itens-container .pedido-item-line');
      if (!linhas.length) {
        alert('Adicione pelo menos um item ao pedido.');
        return;
      }

      const itens = [];
      linhas.forEach((linha) => {
        const desc = linha
          .querySelector('.pedido-item-desc')
          .value.trim();
        const qtd = parseFloat(
          linha.querySelector('.pedido-item-qtd').value.replace(',', '.')
        ) || 0;
        const valorUnit = parseFloat(
          linha
            .querySelector('.pedido-item-valor')
            .value.replace(',', '.')
        ) || 0;
        const custoUnit = parseFloat(
          linha
            .querySelector('.pedido-item-custo')
            .value.replace(',', '.')
        ) || 0;
        if (!desc || qtd <= 0 || valorUnit <= 0) return;
        itens.push({
          desc,
          qtd,
          valorUnit,
          custoUnit,
          total: qtd * valorUnit,
          totalCusto: qtd * custoUnit
        });
      });

      if (!itens.length) {
        alert('Preencha pelo menos um item com descrição, quantidade e valor.');
        return;
      }

      let totalVenda = 0;
      let totalCusto = 0;
      itens.forEach((i) => {
        totalVenda += i.total;
        totalCusto += i.totalCusto;
      });
      let lucroPercent = 0;
      if (totalVenda > 0) {
        lucroPercent = ((totalVenda - totalCusto) / totalVenda) * 100;
      }

      const clienteObj =
        clientes.find((c) => c.nome === clienteNome) || null;

      const pedido = {
        id: Date.now(),
        clienteNome,
        cliente: clienteObj,
        itens,
        totalVenda,
        totalCusto,
        lucroPercent,
        statusPedido: 'Aguardando',
        statusPagamento: 'Pendente'
      };

      pedidos.push(pedido);
      saveData(STORAGE.pedidos, pedidos);

      // Atualiza telas relacionadas
      renderPedidosLista();
      renderStatusPedidos();
      renderVendasResumo();
      atualizarTotaisPedido();

      // Reseta form
      inputCliente.value = '';
      limparClienteInfo();
      const cont = $('#pedido-itens-container');
      if (cont) cont.innerHTML = '';
      adicionarLinhaPedidoItem();

      alert('Pedido salvo com sucesso!');
    });
  }

  // garante pelo menos uma linha ao abrir
  const cont = $('#pedido-itens-container');
  if (cont && !cont.children.length) {
    adicionarLinhaPedidoItem();
  }
}

// ---------- LISTA DE PEDIDOS ----------
function renderPedidosLista() {
  const container = $('#lista-pedidos');
  if (!container) return;

  if (!pedidos.length) {
    container.innerHTML = `<div class="item-meta">Nenhum pedido cadastrado.</div>`;
    return;
  }

  const ordenados = [...pedidos].sort((a, b) => b.id - a.id);

  container.innerHTML = ordenados
    .map(
      (p) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">#${p.id} - ${p.clienteNome}</span>
          <span class="item-meta">${formatMoney(p.totalVenda)}</span>
        </div>
        <div class="item-meta">
          Status: ${p.statusPedido} • Pagamento: ${p.statusPagamento}
        </div>
      </div>
    `
    )
    .join('');
}

// ---------- STATUS DOS PEDIDOS ----------
function renderStatusPedidos() {
  const container = $('#lista-status-pedidos');
  if (!container) return;

  if (!pedidos.length) {
    container.innerHTML = `<div class="item-meta">Nenhum pedido para atualizar.</div>`;
    return;
  }

  const statusOpcoes = ['Aguardando', 'Em produção', 'Concluído', 'Cancelado'];
  const pagamentoOpcoes = ['Pendente', 'Pago parcial', 'Pago total'];

  const ordenados = [...pedidos].sort((a, b) => b.id - a.id);

  container.innerHTML = ordenados
    .map(
      (p) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">#${p.id} - ${p.clienteNome}</span>
          <span class="item-meta">${formatMoney(p.totalVenda)}</span>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Status do pedido</label>
            <select class="status-pedido-select" data-id="${p.id}">
              ${statusOpcoes
                .map(
                  (s) =>
                    `<option value="${s}" ${
                      p.statusPedido === s ? 'selected' : ''
                    }>${s}</option>`
                )
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Status do pagamento</label>
            <select class="status-pag-select" data-id="${p.id}">
              ${pagamentoOpcoes
                .map(
                  (s) =>
                    `<option value="${s}" ${
                      p.statusPagamento === s ? 'selected' : ''
                    }>${s}</option>`
                )
                .join('')}
            </select>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  $$('.status-pedido-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const id = Number(sel.dataset.id);
      const pedido = pedidos.find((p) => p.id === id);
      if (pedido) {
        pedido.statusPedido = sel.value;
        saveData(STORAGE.pedidos, pedidos);
        renderPedidosLista();
      }
    });
  });

  $$('.status-pag-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const id = Number(sel.dataset.id);
      const pedido = pedidos.find((p) => p.id === id);
      if (pedido) {
        pedido.statusPagamento = sel.value;
        saveData(STORAGE.pedidos, pedidos);
        renderPedidosLista();
        renderVendasResumo();
      }
    });
  });
}

// ---------- RESUMO DE VENDAS ----------
function renderVendasResumo() {
  const spanQtde = $('#vendas-resumo-qtde');
  const spanTotal = $('#vendas-resumo-total');
  if (!spanQtde || !spanTotal) return;

  const qtde = pedidos.length;
  let total = 0;
  pedidos.forEach((p) => {
    total += p.totalVenda || 0;
  });

  spanQtde.textContent = qtde.toString();
  spanTotal.textContent = (Number(total) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ---------- CONSULTA ESTOQUE ----------
function renderEstoque() {
  const container = $('#consulta-estoque-lista');
  if (!container) return;

  const termo = ($('#estoque-busca')?.value || '').toLowerCase();

  let filtrados = mpList;
  if (termo) {
    filtrados = mpList.filter((m) =>
      m.desc.toLowerCase().includes(termo)
    );
  }

  if (!filtrados.length) {
    container.innerHTML = `<div class="item-meta">Nenhuma matéria-prima encontrada.</div>`;
    return;
  }

  const ordenados = [...filtrados].sort((a, b) =>
    a.desc.localeCompare(b.desc, 'pt-BR')
  );

  container.innerHTML = ordenados
    .map(
      (m) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${m.desc}</span>
          <span class="item-meta">${m.unid || ''}</span>
        </div>
        <div class="item-meta">
          Custo: ${formatMoney(m.custo)} ${m.unid ? ' / ' + m.unid : ''}
        </div>
      </div>
    `
    )
    .join('');
}

function initEstoque() {
  const inputBusca = $('#estoque-busca');
  if (!inputBusca) return;
  inputBusca.addEventListener('input', renderEstoque);
  renderEstoque();
}

// ---------- FINANÇAS (LANÇAMENTOS) ----------
function initFinancas() {
  const selectTipo = $('#lanc-tipo');
  if (!selectTipo) return;

  const blocos = {
    'saida-investimento': $('#bloco-saida-investimento'),
    'compra-mp': $('#bloco-compra-mp'),
    venda: $('#bloco-venda'),
    'entrada-investimento': $('#bloco-entrada-investimento')
  };

  function mostrarBloco(tipo) {
    Object.keys(blocos).forEach((t) => {
      if (blocos[t]) blocos[t].style.display = t === tipo ? 'block' : 'none';
    });
  }

  selectTipo.addEventListener('change', () => {
    mostrarBloco(selectTipo.value || '');
  });

  const chkParcial = $('#lanc-venda-parcial');
  if (chkParcial) {
    chkParcial.addEventListener('change', () => {
      const parcialBloco = $('#lanc-venda-parcial-bloco');
      const totalBloco = $('#lanc-venda-data-total-bloco');
      if (chkParcial.checked) {
        if (parcialBloco) parcialBloco.style.display = 'block';
        if (totalBloco) totalBloco.style.display = 'none';
      } else {
        if (parcialBloco) parcialBloco.style.display = 'none';
        if (totalBloco) totalBloco.style.display = 'block';
      }
    });
  }

  const btnLimpar = $('#lanc-cancelar');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      selectTipo.value = '';
      mostrarBloco('');
      [
        '#lanc-saida-valor',
        '#lanc-saida-tipo',
        '#lanc-saida-data',
        '#lanc-mp-material',
        '#lanc-mp-qtd',
        '#lanc-mp-fornecedor',
        '#lanc-mp-valor',
        '#lanc-mp-data',
        '#lanc-venda-pedido',
        '#lanc-venda-valor-pago',
        '#lanc-venda-data',
        '#lanc-venda-data-total',
        '#lanc-ent-valor',
        '#lanc-ent-desc',
        '#lanc-ent-data'
      ].forEach((sel) => {
        const el = $(sel);
        if (el) el.value = '';
      });
      $('#lanc-venda-descricao').textContent = 'Selecione um pedido.';
      $('#lanc-venda-valor').textContent = 'R$ 0,00';
      if (chkParcial) chkParcial.checked = false;
      if ($('#lanc-venda-parcial-bloco'))
        $('#lanc-venda-parcial-bloco').style.display = 'none';
      if ($('#lanc-venda-data-total-bloco'))
        $('#lanc-venda-data-total-bloco').style.display = 'block';
    });
  }

  // atalho simples: ao digitar número de pedido em venda, preenche descrição/valor se existir
  const inputPedidoVenda = $('#lanc-venda-pedido');
  if (inputPedidoVenda) {
    inputPedidoVenda.addEventListener('blur', () => {
      const termo = inputPedidoVenda.value.trim();
      if (!termo) return;

      const pedido = pedidos.find(
        (p) =>
          p.id.toString() === termo ||
          p.clienteNome.toLowerCase().includes(termo.toLowerCase())
      );
      if (!pedido) return;

      const descCaixa = $('#lanc-venda-descricao');
      const valorCaixa = $('#lanc-venda-valor');

      if (descCaixa) {
        const listaDesc = pedido.itens
          .map((i) => `${i.qtd}x ${i.desc}`)
          .join(' | ');
        descCaixa.textContent = listaDesc;
      }
      if (valorCaixa) {
        valorCaixa.textContent = formatMoney(pedido.totalVenda);
      }
    });
  }

  const btnSalvar = $('#lanc-salvar');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
      const tipo = selectTipo.value;
      if (!tipo) {
        alert('Selecione o tipo de lançamento.');
        return;
      }

      let registro = {
        id: Date.now(),
        tipo
      };

      if (tipo === 'saida-investimento') {
        registro.valor =
          parseFloat(
            ($('#lanc-saida-valor').value || '').toString().replace(',', '.')
          ) || 0;
        registro.desc = $('#lanc-saida-tipo').value.trim();
        registro.data = $('#lanc-saida-data').value;
      } else if (tipo === 'compra-mp') {
        registro.material = $('#lanc-mp-material').value.trim();
        registro.qtd =
          parseFloat(
            ($('#lanc-mp-qtd').value || '').toString().replace(',', '.')
          ) || 0;
        registro.fornecedor = $('#lanc-mp-fornecedor').value.trim();
        registro.valor =
          parseFloat(
            ($('#lanc-mp-valor').value || '').toString().replace(',', '.')
          ) || 0;
        registro.data = $('#lanc-mp-data').value;
      } else if (tipo === 'venda') {
        registro.pedidoRef = $('#lanc-venda-pedido').value.trim();
        registro.valorPedidoTexto = $('#lanc-venda-valor').textContent;
        registro.pagoParcial = !!$('#lanc-venda-parcial').checked;
        if (registro.pagoParcial) {
          registro.valorPago =
            parseFloat(
              (
                $('#lanc-venda-valor-pago').value || ''
              ).toString().replace(',', '.')
            ) || 0;
          registro.data = $('#lanc-venda-data').value;
        } else {
          registro.valorPagoTexto = $('#lanc-venda-valor').textContent;
          registro.data = $('#lanc-venda-data-total').value;
        }
      } else if (tipo === 'entrada-investimento') {
        registro.valor =
          parseFloat(
            ($('#lanc-ent-valor').value || '').toString().replace(',', '.')
          ) || 0;
        registro.desc = $('#lanc-ent-desc').value.trim();
        registro.data = $('#lanc-ent-data').value;
      }

      lancamentos.push(registro);
      saveData(STORAGE.lancamentos, lancamentos);
      alert('Lançamento salvo.');
    });
  }
}

// ---------- AGENDA ----------
function initAgendaRegistro() {
  const selectTipo = $('#agenda-tipo');
  const blocoPedido = $('#agenda-pedido-bloco');
  const btnLimpar = $('#agenda-reg-limpar');
  const btnSalvar = $('#agenda-reg-salvar');

  if (!selectTipo || !btnSalvar) return;

  selectTipo.addEventListener('change', () => {
    if (selectTipo.value === 'producao' || selectTipo.value === 'entrega') {
      blocoPedido.style.display = 'block';
    } else {
      blocoPedido.style.display = 'none';
    }
  });

  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      selectTipo.value = '';
      $('#agenda-pedido').value = '';
      $('#agenda-data').value = '';
      $('#agenda-descricao').value = '';
      blocoPedido.style.display = 'none';
    });
  }

  btnSalvar.addEventListener('click', () => {
    const tipo = selectTipo.value;
    const data = $('#agenda-data').value;
    const desc = $('#agenda-descricao').value.trim();
    const pedidoRef = $('#agenda-pedido').value.trim();

    if (!tipo) {
      alert('Selecione o tipo de compromisso.');
      return;
    }
    if (!data) {
      alert('Selecione a data.');
      return;
    }

    const novo = {
      id: Date.now(),
      tipo,
      data,
      desc,
      pedidoRef
    };

    agendaItens.push(novo);
    saveData(STORAGE.agenda, agendaItens);
    alert('Compromisso registrado.');
    $('#agenda-descricao').value = '';
    $('#agenda-pedido').value = '';
  });
}

let agendaDataAtual = new Date();

function mesmaDataStr(dateStr, y, m, d) {
  if (!dateStr) return false;
  const [yy, mm, dd] = dateStr.split('-').map(Number);
  return yy === y && mm === m + 1 && dd === d;
}

function renderAgendaDiaDetalhes(dateStr) {
  const header = $('#agenda-dia-header');
  const lista = $('#agenda-dia-lista');
  if (!header || !lista) return;

  const itensDia = agendaItens.filter((a) => a.data === dateStr);
  header.textContent = itensDia.length
    ? `Compromissos em ${formatDateLabel(dateStr)}`
    : `Nenhum compromisso em ${formatDateLabel(dateStr)}.`;

  if (!itensDia.length) {
    lista.innerHTML = '';
    return;
  }

  lista.innerHTML = itensDia
    .map(
      (a) => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${
            a.tipo === 'producao'
              ? 'Produção'
              : a.tipo === 'entrega'
              ? 'Entrega'
              : 'Outros'
          }</span>
          <span class="item-meta">${
            a.pedidoRef ? 'Pedido: ' + a.pedidoRef : ''
          }</span>
        </div>
        <div class="item-meta">${a.desc || ''}</div>
      </div>
    `
    )
    .join('');
}

function renderAgendaCalendario() {
  const grid = $('#agenda-grid');
  const label = $('#agenda-month-label');
  if (!grid || !label) return;

  grid.innerHTML = '';

  const ano = agendaDataAtual.getFullYear();
  const mes = agendaDataAtual.getMonth(); // 0-11

  const nomesMes = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro'
  ];

  label.textContent = `${nomesMes[mes]} / ${ano}`;

  const primeiroDia = new Date(ano, mes, 1);
  const diaSemanaInicio = primeiroDia.getDay(); // 0-dom

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  for (let i = 0; i < diaSemanaInicio; i++) {
    const div = document.createElement('div');
    div.className = 'agenda-day empty';
    grid.appendChild(div);
  }

  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dateStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(
      dia
    ).padStart(2, '0')}`;

    const div = document.createElement('div');
    div.className = 'agenda-day';
    div.dataset.date = dateStr;

    const spanNum = document.createElement('div');
    spanNum.className = 'agenda-day-number';
    spanNum.textContent = dia.toString();
    div.appendChild(spanNum);

    if (dateStr === hojeStr) {
      div.classList.add('agenda-today');
    }

    const itensDia = agendaItens.filter((a) =>
      mesmaDataStr(a.data, ano, mes, dia)
    );
    if (itensDia.length) {
      if (itensDia.some((a) => a.tipo === 'producao')) {
        div.classList.add('agenda-producao');
      }
      if (itensDia.some((a) => a.tipo === 'entrega')) {
        div.classList.add('agenda-entrega');
      }
      if (itensDia.some((a) => a.tipo === 'outros')) {
        div.classList.add('agenda-outros');
      }
    }

    div.addEventListener('click', () => {
      renderAgendaDiaDetalhes(dateStr);
    });

    grid.appendChild(div);
  }
}

function initAgendaVisual() {
  const btnPrev = $('#agenda-prev');
  const btnNext = $('#agenda-next');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      agendaDataAtual.setMonth(agendaDataAtual.getMonth() - 1);
      renderAgendaCalendario();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      agendaDataAtual.setMonth(agendaDataAtual.getMonth() + 1);
      renderAgendaCalendario();
    });
  }

  renderAgendaCalendario();
}

// ---------- INICIALIZAÇÃO GLOBAL ----------
document.addEventListener('DOMContentLoaded', () => {
  // carrega dados do localStorage
  clientes = loadData(STORAGE.clientes);
  mpList = loadData(STORAGE.mp);
  fornecedores = loadData(STORAGE.fornecedores);
  produtos = loadData(STORAGE.produtos);
  pedidos = loadData(STORAGE.pedidos);
  lancamentos = loadData(STORAGE.lancamentos);
  agendaItens = loadData(STORAGE.agenda);

  initNavigation();
  initClientes();
  initMp();
  initFornecedores();
  initProdutos();
  initNovoPedido();
  renderPedidosLista();
  renderStatusPedidos();
  renderVendasResumo();
  initEstoque();
  initFinancas();
  initAgendaRegistro();
  initAgendaVisual();
});
