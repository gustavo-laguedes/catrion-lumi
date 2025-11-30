// app.js - Versão desktop focada em localStorage (sem login / Firebase)

(function () {
  // ----------------- UTIL -----------------
  const DB_KEYS = {
    clientes: 'lumi_clientes',
    produtos: 'lumi_produtos',
    mp: 'lumi_mp',
    fornecedores: 'lumi_fornecedores',
    pedidos: 'lumi_pedidos',
    lancamentos: 'lumi_lancamentos',
    agenda: 'lumi_agenda',
    negocio: 'lumi_negocio'
  };

  function loadArray(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  function saveArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function loadObject(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  }

  function saveObject(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function parseNumber(val) {
    if (val == null) return 0;
    return Number(String(val).replace(/\./g, '').replace(',', '.')) || 0;
  }

  function fmtMoeda(n) {
    const num = Number(n) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function fmtDataISO(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }

  function $(sel) {
    return document.querySelector(sel);
  }
  function $all(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  // ----------------- NAVEGAÇÃO ENTRE VIEWS -----------------
  function showView(viewName) {
    $all('.view').forEach(v => {
      if (v.dataset.view === viewName) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // atualizar bottom nav
    $all('.bottom-nav .nav-item').forEach(btn => {
      if (btn.dataset.targetView === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // atualizar header engrenagem para ir pra config
    if (viewName === 'config') {
      $('#app-header')?.classList.add('in-config');
    } else {
      $('#app-header')?.classList.remove('in-config');
    }

    // views que precisam recarregar lista quando abertas
    if (viewName === 'cad-clientes') renderClientes();
    if (viewName === 'cad-mp') renderMp();
    if (viewName === 'cad-fornecedores') renderFornecedores();
    if (viewName === 'cad-produtos') renderProdutos();
    if (viewName === 'consulta-estoque') renderConsultaEstoque();
    if (viewName === 'pedidos') renderPedidosLista();
    if (viewName === 'status-pedidos') renderStatusPedidos();
    if (viewName === 'vendas') renderResumoVendas();
    if (viewName === 'consulta-financas') renderResumoFinancas();
    if (viewName === 'agenda') buildAgendaGrid();
  }

  function initNavigation() {
    // tiles da home
    $all('[data-target-view]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.targetView;
        if (target) showView(target);
      });
    });

    // engrenagem
    const gear = document.querySelector('.header-gear');
    if (gear) {
      gear.addEventListener('click', () => showView('config'));
    }
  }

  // ----------------- CONFIG NEGÓCIO -----------------
  function initConfigNegocio() {
    const nomeInput = $('#config-nome-negocio');
    const logoEmpresaTop = $('#logo-empresa-top');
    const btnSalvar = $('#config-salvar-negocio');

    const dados = loadObject(DB_KEYS.negocio);
    if (dados.nome && nomeInput) nomeInput.value = dados.nome;
    if (dados.nome && logoEmpresaTop) logoEmpresaTop.textContent = dados.nome;

    if (btnSalvar) {
      btnSalvar.addEventListener('click', () => {
        const nome = nomeInput.value.trim();
        const obj = { ...dados, nome };
        saveObject(DB_KEYS.negocio, obj);
        if (logoEmpresaTop) logoEmpresaTop.textContent = nome || 'Logo da empresa (upload)';
        alert('Dados do negócio salvos localmente.');
      });
    }
  }

  // ----------------- CLIENTES -----------------
  function renderClientes() {
    const container = $('#lista-clientes-cad');
    if (!container) return;
    const clientes = loadArray(DB_KEYS.clientes)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (!clientes.length) {
      container.innerHTML = '<div class="item-meta">Nenhum cliente cadastrado ainda.</div>';
      return;
    }
    container.innerHTML = clientes.map(cl => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${cl.nome}</span>
        </div>
        <div class="item-meta">
          ${cl.tel ? `Tel: ${cl.tel} — ` : ''}${cl.cidade || ''}${cl.estado ? ' / ' + cl.estado : ''}
        </div>
      </div>
    `).join('');
  }

  function initClientes() {
    const listSection = $('#clientes-list-section');
    const formSection = $('#clientes-form-section');
    const fab = $('#fab-add-cliente');
    const btnVoltar = $('#btn-clientes-voltar-lista');
    const btnSalvar = $('#cad-cliente-salvar');
    const btnLimpar = $('#cad-cliente-limpar');

    function abrirForm() {
      if (listSection) listSection.style.display = 'none';
      if (formSection) formSection.style.display = 'block';
      $('#cad-cliente-nome').value = '';
      $('#cad-cliente-tel').value = '';
      $('#cad-cliente-end').value = '';
      $('#cad-cliente-cid').value = '';
      $('#cad-cliente-est').value = '';
    }

    function voltarLista() {
      if (formSection) formSection.style.display = 'none';
      if (listSection) listSection.style.display = 'block';
      renderClientes();
    }

    fab?.addEventListener('click', abrirForm);
    btnVoltar?.addEventListener('click', voltarLista);
    btnLimpar?.addEventListener('click', () => abrirForm());

    btnSalvar?.addEventListener('click', () => {
      const nome = $('#cad-cliente-nome').value.trim();
      if (!nome) {
        alert('Informe o nome do cliente.');
        return;
      }
      const tel = $('#cad-cliente-tel').value.trim();
      const end = $('#cad-cliente-end').value.trim();
      const cid = $('#cad-cliente-cid').value.trim();
      const est = $('#cad-cliente-est').value.trim();

      const clientes = loadArray(DB_KEYS.clientes);
      clientes.push({
        id: uid(),
        nome,
        tel,
        endereco: end,
        cidade: cid,
        estado: est
      });
      saveArray(DB_KEYS.clientes, clientes);
      voltarLista();
    });

    renderClientes();
  }

  // ----------------- MATÉRIA-PRIMA -----------------
  function renderMp() {
    const container = $('#lista-mp-cad');
    if (!container) return;
    const mps = loadArray(DB_KEYS.mp)
      .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'));
    if (!mps.length) {
      container.innerHTML = '<div class="item-meta">Nenhuma matéria-prima cadastrada.</div>';
      return;
    }
    container.innerHTML = mps.map(mp => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${mp.descricao}</span>
          <span class="item-badge">${mp.unidade}</span>
        </div>
        <div class="item-meta">Custo: ${fmtMoeda(mp.custo || 0)}</div>
        <div class="item-meta">Fornecedor: ${mp.fornecedor || '-'}</div>
      </div>
    `).join('');
  }

  function initMp() {
    const listSection = $('#mp-list-section');
    const formSection = $('#mp-form-section');
    const fab = $('#fab-add-mp');
    const btnVoltar = $('#btn-mp-voltar-lista');
    const btnSalvar = $('#cad-mp-salvar');
    const btnLimpar = $('#cad-mp-limpar');

    function abrirForm() {
      if (listSection) listSection.style.display = 'none';
      if (formSection) formSection.style.display = 'block';
      $('#cad-mp-desc').value = '';
      $('#cad-mp-unid').value = '';
      $('#cad-mp-custo').value = '';
      $('#cad-mp-forn').value = '';
    }

    function voltarLista() {
      if (formSection) formSection.style.display = 'none';
      if (listSection) listSection.style.display = 'block';
      renderMp();
    }

    fab?.addEventListener('click', abrirForm);
    btnVoltar?.addEventListener('click', voltarLista);
    btnLimpar?.addEventListener('click', () => abrirForm());

    btnSalvar?.addEventListener('click', () => {
      const desc = $('#cad-mp-desc').value.trim();
      if (!desc) {
        alert('Informe a descrição da matéria-prima.');
        return;
      }
      const un = $('#cad-mp-unid').value.trim();
      const custo = parseNumber($('#cad-mp-custo').value);
      const forn = $('#cad-mp-forn').value.trim();

      const mps = loadArray(DB_KEYS.mp);
      mps.push({
        id: uid(),
        descricao: desc,
        unidade: un,
        custo,
        fornecedor: forn
      });
      saveArray(DB_KEYS.mp, mps);
      voltarLista();
    });

    renderMp();
  }

  // ----------------- FORNECEDORES -----------------
  function renderFornecedores() {
    const container = $('#lista-forn-cad');
    if (!container) return;
    const lista = loadArray(DB_KEYS.fornecedores)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (!lista.length) {
      container.innerHTML = '<div class="item-meta">Nenhum fornecedor cadastrado.</div>';
      return;
    }
    container.innerHTML = lista.map(f => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${f.nome}</span>
        </div>
        <div class="item-meta">
          ${f.contato || ''} ${f.notas ? ' — ' + f.notas : ''}
        </div>
      </div>
    `).join('');
  }

  function initFornecedores() {
    const listSection = $('#forn-list-section');
    const formSection = $('#forn-form-section');
    const fab = $('#fab-add-forn');
    const btnVoltar = $('#btn-forn-voltar-lista');
    const btnSalvar = $('#cad-forn-salvar');
    const btnLimpar = $('#cad-forn-limpar');

    function abrirForm() {
      if (listSection) listSection.style.display = 'none';
      if (formSection) formSection.style.display = 'block';
      $('#cad-forn-nome').value = '';
      $('#cad-forn-contato').value = '';
      $('#cad-forn-notas').value = '';
    }

    function voltarLista() {
      if (formSection) formSection.style.display = 'none';
      if (listSection) listSection.style.display = 'block';
      renderFornecedores();
    }

    fab?.addEventListener('click', abrirForm);
    btnVoltar?.addEventListener('click', voltarLista);
    btnLimpar?.addEventListener('click', () => abrirForm());

    btnSalvar?.addEventListener('click', () => {
      const nome = $('#cad-forn-nome').value.trim();
      if (!nome) {
        alert('Informe o nome do fornecedor.');
        return;
      }
      const contato = $('#cad-forn-contato').value.trim();
      const notas = $('#cad-forn-notas').value.trim();

      const lista = loadArray(DB_KEYS.fornecedores);
      lista.push({ id: uid(), nome, contato, notas });
      saveArray(DB_KEYS.fornecedores, lista);
      voltarLista();
    });

    renderFornecedores();
  }

  // ----------------- PRODUTOS -----------------
  function renderProdutos() {
    const container = $('#lista-produtos-cad');
    if (!container) return;
    const produtos = loadArray(DB_KEYS.produtos)
      .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'));
    if (!produtos.length) {
      container.innerHTML = '<div class="item-meta">Nenhum produto cadastrado.</div>';
      return;
    }
    container.innerHTML = produtos.map(p => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${p.descricao}</span>
          <span class="item-badge">${p.unidade || ''}</span>
        </div>
        <div class="item-meta">
          Custo: ${fmtMoeda(p.custoTotal || 0)} — Venda: ${fmtMoeda(p.valorVenda || 0)}
        </div>
        <div class="item-meta">
          Lucro: ${p.lucroPercent != null ? p.lucroPercent.toFixed(1) + '%' : '-'}
        </div>
      </div>
    `).join('');
  }

  function recalcularCustoProduto() {
    const container = $('#cad-prod-mp-container');
    if (!container) return;
    const mps = loadArray(DB_KEYS.mp);
    let total = 0;

    container.querySelectorAll('.prod-mp-row').forEach(row => {
      const sel = row.querySelector('.prod-mp-select');
      const qtdInput = row.querySelector('.prod-mp-qtd');
      const custoSpan = row.querySelector('.prod-mp-custo');

      const mpId = sel.value;
      const qtd = parseNumber(qtdInput.value);
      const mp = mps.find(m => m.id === mpId);
      const custoUnit = mp ? (mp.custo || 0) : 0;
      const custoTotal = custoUnit * qtd;
      total += custoTotal;
      if (custoSpan) custoSpan.textContent = fmtMoeda(custoTotal);
    });

    const custoInput = $('#cad-prod-custo');
    if (custoInput) custoInput.value = total ? total.toFixed(2) : '';
    const vendaInput = $('#cad-prod-venda');
    const lucroBox = $('#cad-prod-lucro');
    const venda = vendaInput ? parseNumber(vendaInput.value) : 0;
    let lucro = 0;
    if (total > 0 && venda > 0) {
      lucro = ((venda - total) / total) * 100;
    }
    if (lucroBox) lucroBox.textContent = total > 0 && venda > 0 ? `${lucro.toFixed(1)}%` : '0%';
  }

  function addLinhaMpProduto() {
    const container = $('#cad-prod-mp-container');
    if (!container) return;
    const mps = loadArray(DB_KEYS.mp).sort((a, b) =>
      a.descricao.localeCompare(b.descricao, 'pt-BR')
    );

    if (!mps.length) {
      alert('Cadastre matérias-primas antes de vincular a um produto.');
      return;
    }

    const div = document.createElement('div');
    div.className = 'prod-mp-row';
    div.innerHTML = `
      <div class="form-row-2">
        <div class="form-group">
          <label>Matéria-prima</label>
          <select class="prod-mp-select">
            <option value="">— selecione —</option>
            ${mps.map(mp => `<option value="${mp.id}">${mp.descricao}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Qtd</label>
          <input type="number" class="prod-mp-qtd" min="0" step="0.01" />
        </div>
      </div>
      <div class="form-group prod-mp-footer">
        <span class="item-meta">Custo desta MP: <span class="prod-mp-custo">${fmtMoeda(0)}</span></span>
        <button type="button" class="btn-text prod-mp-remover">Remover</button>
      </div>
    `;

    container.appendChild(div);

    const sel = div.querySelector('.prod-mp-select');
    const qtdInput = div.querySelector('.prod-mp-qtd');
    const btnRemover = div.querySelector('.prod-mp-remover');

    sel.addEventListener('change', recalcularCustoProduto);
    qtdInput.addEventListener('input', recalcularCustoProduto);
    btnRemover.addEventListener('click', () => {
      div.remove();
      recalcularCustoProduto();
    });
  }

  function initProdutos() {
    const listSection = $('#produtos-list-section');
    const formSection = $('#produtos-form-section');
    const fab = $('#fab-add-produto');
    const btnVoltar = $('#btn-produtos-voltar-lista');
    const btnSalvar = $('#cad-prod-salvar');
    const btnLimpar = $('#cad-prod-limpar');
    const btnAddMp = $('#cad-prod-mp-add');
    const vendaInput = $('#cad-prod-venda');

    function abrirForm() {
      if (listSection) listSection.style.display = 'none';
      if (formSection) formSection.style.display = 'block';
      $('#cad-prod-desc').value = '';
      $('#cad-prod-unid').value = '';
      $('#cad-prod-custo').value = '';
      $('#cad-prod-venda').value = '';
      $('#cad-prod-lucro').textContent = '0%';
      $('#cad-prod-notas').value = '';
      const container = $('#cad-prod-mp-container');
      if (container) container.innerHTML = '';
    }

    function voltarLista() {
      if (formSection) formSection.style.display = 'none';
      if (listSection) listSection.style.display = 'block';
      renderProdutos();
    }

    fab?.addEventListener('click', abrirForm);
    btnVoltar?.addEventListener('click', voltarLista);
    btnLimpar?.addEventListener('click', () => abrirForm());
    btnAddMp?.addEventListener('click', addLinhaMpProduto);
    vendaInput?.addEventListener('input', recalcularCustoProduto);

    btnSalvar?.addEventListener('click', () => {
      const desc = $('#cad-prod-desc').value.trim();
      if (!desc) {
        alert('Informe a descrição do produto.');
        return;
      }
      const unidade = $('#cad-prod-unid').value.trim();
      const container = $('#cad-prod-mp-container');
      const mps = loadArray(DB_KEYS.mp);
      const mpItens = [];
      let total = 0;

      container.querySelectorAll('.prod-mp-row').forEach(row => {
        const sel = row.querySelector('.prod-mp-select');
        const qtdInput = row.querySelector('.prod-mp-qtd');
        const mpId = sel.value;
        const qtd = parseNumber(qtdInput.value);
        if (!mpId || !qtd) return;
        const mp = mps.find(m => m.id === mpId);
        if (!mp) return;
        const custoUnit = mp.custo || 0;
        const custoTotal = custoUnit * qtd;
        total += custoTotal;
        mpItens.push({
          mpId,
          descricao: mp.descricao,
          qtd,
          custoUnit,
          custoTotal
        });
      });

      const venda = parseNumber($('#cad-prod-venda').value);
      let lucroPercent = null;
      if (total > 0 && venda > 0) {
        lucroPercent = ((venda - total) / total) * 100;
      }

      const notas = $('#cad-prod-notas').value.trim();

      const produtos = loadArray(DB_KEYS.produtos);
      produtos.push({
        id: uid(),
        descricao: desc,
        unidade,
        materiasPrimas: mpItens,
        custoTotal: total,
        valorVenda: venda,
        lucroPercent,
        notas
      });
      saveArray(DB_KEYS.produtos, produtos);
      voltarLista();
    });

    renderProdutos();
  }

  // ----------------- CONSULTA ESTOQUE -----------------
  function renderConsultaEstoque() {
    const container = $('#consulta-estoque-lista');
    if (!container) return;
    const mps = loadArray(DB_KEYS.mp).sort((a, b) =>
      a.descricao.localeCompare(b.descricao, 'pt-BR')
    );
    if (!mps.length) {
      container.innerHTML = '<div class="item-meta">Cadastre matérias-primas para visualizar aqui.</div>';
      return;
    }
    container.innerHTML = mps.map(mp => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${mp.descricao}</span>
          <span class="item-badge">${mp.unidade || ''}</span>
        </div>
        <div class="item-meta">
          Custo unitário: ${fmtMoeda(mp.custo || 0)}
        </div>
      </div>
    `).join('');
  }

  // ----------------- PEDIDOS -----------------
  function clientesAutocompleteSetup() {
    const input = $('#pedido-cliente-input');
    const sugestoesBox = $('#pedido-cliente-sugestoes');
    const cardInfo = $('#pedido-cliente-info');
    const telSpan = $('#pedido-cliente-tel');
    const endSpan = $('#pedido-cliente-end');
    const cidSpan = $('#pedido-cliente-cid');
    const estSpan = $('#pedido-cliente-est');

    if (!input || !sugestoesBox) return;

    input.addEventListener('input', () => {
      const termo = input.value.trim().toLowerCase();
      const clientes = loadArray(DB_KEYS.clientes)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      if (!termo) {
        sugestoesBox.innerHTML = '';
        sugestoesBox.style.display = 'none';
        return;
      }
      const filtrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(termo)
      );
      if (!filtrados.length) {
        sugestoesBox.innerHTML = '<div class="autocomplete-item disabled">Nenhum cliente encontrado</div>';
        sugestoesBox.style.display = 'block';
        return;
      }
      sugestoesBox.innerHTML = filtrados.map(c => `
        <div class="autocomplete-item" data-id="${c.id}">
          ${c.nome}
        </div>
      `).join('');
      sugestoesBox.style.display = 'block';

      sugestoesBox.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          const cl = filtrados.find(c => c.id === id);
          if (!cl) return;
          input.value = cl.nome;
          sugestoesBox.innerHTML = '';
          sugestoesBox.style.display = 'none';

          input.dataset.clienteId = cl.id;
          if (cardInfo) cardInfo.style.display = 'block';
          if (telSpan) telSpan.textContent = cl.tel || '-';
          if (endSpan) endSpan.textContent = cl.endereco || '-';
          if (cidSpan) cidSpan.textContent = cl.cidade || '-';
          if (estSpan) estSpan.textContent = cl.estado || '-';
        });
      });
    });
  }

  function addLinhaItemPedido() {
    const container = $('#pedido-itens-container');
    if (!container) return;
    const produtos = loadArray(DB_KEYS.produtos)
      .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'));

    if (!produtos.length) {
      alert('Cadastre produtos antes de montar pedidos.');
      return;
    }

    const div = document.createElement('div');
    div.className = 'pedido-item-row';
    div.innerHTML = `
      <div class="form-row-2">
        <div class="form-group">
          <label>Produto</label>
          <select class="pedido-prod-select">
            <option value="">— selecione —</option>
            ${produtos.map(p => `<option value="${p.id}">${p.descricao}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Qtd</label>
          <input type="number" class="pedido-prod-qtd" min="0" step="0.01" />
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label>Valor unitário</label>
          <input type="number" class="pedido-prod-venda" min="0" step="0.01" />
        </div>
        <div class="form-group">
          <label>Total linha</label>
          <div class="descricao-caixa pedido-prod-total">R$ 0,00</div>
        </div>
      </div>
      <div class="form-group">
        <button type="button" class="btn-text pedido-remover-item">Remover</button>
      </div>
    `;

    container.appendChild(div);

    const sel = div.querySelector('.pedido-prod-select');
    const qtdInput = div.querySelector('.pedido-prod-qtd');
    const vendaInput = div.querySelector('.pedido-prod-venda');
    const totalDiv = div.querySelector('.pedido-prod-total');
    const btnRemover = div.querySelector('.pedido-remover-item');

    function atualizarLinha() {
      const prodId = sel.value;
      const prod = produtos.find(p => p.id === prodId);
      let vendaUnit = parseNumber(vendaInput.value);
      if (prod && !vendaUnit) {
        vendaUnit = prod.valorVenda || 0;
        vendaInput.value = vendaUnit ? vendaUnit.toFixed(2) : '';
      }
      const qtd = parseNumber(qtdInput.value);
      const total = vendaUnit * qtd;
      totalDiv.textContent = fmtMoeda(total);
      recalcularTotaisPedido();
    }

    sel.addEventListener('change', atualizarLinha);
    qtdInput.addEventListener('input', atualizarLinha);
    vendaInput.addEventListener('input', atualizarLinha);

    btnRemover.addEventListener('click', () => {
      div.remove();
      recalcularTotaisPedido();
    });
  }

  function recalcularTotaisPedido() {
    const container = $('#pedido-itens-container');
    if (!container) return;
    const produtos = loadArray(DB_KEYS.produtos);
    let totalVenda = 0;
    let totalCusto = 0;

    container.querySelectorAll('.pedido-item-row').forEach(row => {
      const sel = row.querySelector('.pedido-prod-select');
      const qtdInput = row.querySelector('.pedido-prod-qtd');
      const vendaInput = row.querySelector('.pedido-prod-venda');

      const prodId = sel.value;
      const qtd = parseNumber(qtdInput.value);
      const vendaUnit = parseNumber(vendaInput.value);
      const totalLinha = vendaUnit * qtd;
      totalVenda += totalLinha;

      const prod = produtos.find(p => p.id === prodId);
      const custoUnit = prod && prod.custoTotal && prod.qtdBase
        ? (prod.custoTotal / prod.qtdBase)
        : (prod ? (prod.custoTotal || 0) : 0);
      totalCusto += (custoUnit || 0) * qtd;
    });

    const elVenda = $('#pedido-total-venda');
    const elCusto = $('#pedido-total-custo');
    const elLucro = $('#pedido-total-lucro');
    if (elVenda) elVenda.textContent = fmtMoeda(totalVenda);
    if (elCusto) elCusto.textContent = fmtMoeda(totalCusto);
    let lucroPercent = 0;
    if (totalCusto > 0 && totalVenda > 0) {
      lucroPercent = ((totalVenda - totalCusto) / totalCusto) * 100;
    }
    if (elLucro) elLucro.textContent =
      totalCusto > 0 && totalVenda > 0 ? `${lucroPercent.toFixed(1)}%` : '0%';
  }

  function limparPedido() {
    $('#pedido-cliente-input').value = '';
    const sug = $('#pedido-cliente-sugestoes');
    if (sug) {
      sug.innerHTML = '';
      sug.style.display = 'none';
    }
    const info = $('#pedido-cliente-info');
    if (info) info.style.display = 'none';
    const cont = $('#pedido-itens-container');
    if (cont) cont.innerHTML = '';
    recalcularTotaisPedido();
  }

  function initPedido() {
    clientesAutocompleteSetup();
    $('#btn-pedido-add-item')?.addEventListener('click', addLinhaItemPedido);
    $('#btn-pedido-cancelar')?.addEventListener('click', limparPedido);
    $('#btn-pedido-salvar')?.addEventListener('click', () => {
      const clienteNome = $('#pedido-cliente-input').value.trim();
      if (!clienteNome) {
        alert('Selecione o cliente.');
        return;
      }
      const clienteId = $('#pedido-cliente-input').dataset.clienteId || null;
      const itensContainer = $('#pedido-itens-container');
      const produtos = loadArray(DB_KEYS.produtos);
      const itens = [];
      let totalVenda = 0;
      let totalCusto = 0;

      itensContainer.querySelectorAll('.pedido-item-row').forEach(row => {
        const sel = row.querySelector('.pedido-prod-select');
        const qtdInput = row.querySelector('.pedido-prod-qtd');
        const vendaInput = row.querySelector('.pedido-prod-venda');

        const prodId = sel.value;
        const qtd = parseNumber(qtdInput.value);
        const vendaUnit = parseNumber(vendaInput.value);
        if (!prodId || !qtd || !vendaUnit) return;

        const totalLinha = vendaUnit * qtd;
        const prod = produtos.find(p => p.id === prodId);
        const custoUnit = prod && prod.custoTotal && prod.qtdBase
          ? (prod.custoTotal / prod.qtdBase)
          : (prod ? (prod.custoTotal || 0) : 0);
        const custoLinha = (custoUnit || 0) * qtd;

        itens.push({
          prodId,
          descricao: prod ? prod.descricao : '',
          qtd,
          valorUnitario: vendaUnit,
          totalLinha,
          custoLinha
        });

        totalVenda += totalLinha;
        totalCusto += custoLinha;
      });

      if (!itens.length) {
        alert('Adicione ao menos um produto.');
        return;
      }

      const pedidos = loadArray(DB_KEYS.pedidos);
      const pedido = {
        id: uid(),
        dataCriacao: new Date().toISOString(),
        clienteId,
        clienteNome,
        itens,
        totalVenda,
        totalCusto,
        statusPedido: 'aguardando',
        statusPagamento: 'pendente'
      };
      pedidos.push(pedido);
      saveArray(DB_KEYS.pedidos, pedidos);
      alert('Pedido salvo localmente.');
      limparPedido();
      renderPedidosLista();
      renderStatusPedidos();
      renderResumoVendas();
    });
  }

  function renderPedidosLista() {
    const container = $('#lista-pedidos');
    if (!container) return;
    const pedidos = loadArray(DB_KEYS.pedidos)
      .sort((a, b) => (a.dataCriacao || '').localeCompare(b.dataCriacao || ''));
    if (!pedidos.length) {
      container.innerHTML = '<div class="item-meta">Nenhum pedido cadastrado.</div>';
      return;
    }
    container.innerHTML = pedidos.map(p => `
      <div class="item-card">
        <div class="item-row">
          <span class="item-title">${p.clienteNome}</span>
          <span class="item-badge">${fmtDataISO(p.dataCriacao)}</span>
        </div>
        <div class="item-meta">
          ${p.itens.length} item(s) — Total: ${fmtMoeda(p.totalVenda || 0)}
        </div>
        <div class="item-meta">
          Status: ${p.statusPedido || '-'} / Pagamento: ${p.statusPagamento || '-'}
        </div>
      </div>
    `).join('');
  }

  function renderStatusPedidos() {
    const container = $('#lista-status-pedidos');
    if (!container) return;
    const pedidos = loadArray(DB_KEYS.pedidos)
      .sort((a, b) => (a.dataCriacao || '').localeCompare(b.dataCriacao || ''));
    if (!pedidos.length) {
      container.innerHTML = '<div class="item-meta">Nenhum pedido para atualizar.</div>';
      return;
    }
    container.innerHTML = pedidos.map(p => `
      <div class="item-card" data-id="${p.id}">
        <div class="item-row">
          <span class="item-title">${p.clienteNome}</span>
          <span class="item-badge">${fmtDataISO(p.dataCriacao)}</span>
        </div>
        <div class="item-meta">
          Total: ${fmtMoeda(p.totalVenda || 0)}
        </div>
        <div class="form-row-2 mt-4">
          <div class="form-group">
            <label>Status do pedido</label>
            <select class="status-pedido-select">
              <option value="aguardando" ${p.statusPedido === 'aguardando' ? 'selected' : ''}>Aguardando</option>
              <option value="em_producao" ${p.statusPedido === 'em_producao' ? 'selected' : ''}>Em produção</option>
              <option value="concluido" ${p.statusPedido === 'concluido' ? 'selected' : ''}>Concluído</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status do pagamento</label>
            <select class="status-pag-select">
              <option value="pendente" ${p.statusPagamento === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="parcial" ${p.statusPagamento === 'parcial' ? 'selected' : ''}>Parcial</option>
              <option value="pago" ${p.statusPagamento === 'pago' ? 'selected' : ''}>Pago</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.item-card').forEach(card => {
      const id = card.dataset.id;
      const selStatus = card.querySelector('.status-pedido-select');
      const selPag = card.querySelector('.status-pag-select');

      selStatus.addEventListener('change', () => {
        atualizarStatusPedido(id, selStatus.value, null);
      });
      selPag.addEventListener('change', () => {
        atualizarStatusPedido(id, null, selPag.value);
      });
    });
  }

  function atualizarStatusPedido(id, statusPedido, statusPag) {
    const pedidos = loadArray(DB_KEYS.pedidos);
    const idx = pedidos.findIndex(p => p.id === id);
    if (idx === -1) return;
    if (statusPedido) pedidos[idx].statusPedido = statusPedido;
    if (statusPag) pedidos[idx].statusPagamento = statusPag;
    saveArray(DB_KEYS.pedidos, pedidos);
    renderPedidosLista();
    renderResumoVendas();
  }

  // ----------------- FINANÇAS / LANÇAMENTOS -----------------
  function initLancamentos() {
    const selTipo = $('#lanc-tipo');
    const blocos = {
      'saida-investimento': $('#bloco-saida-investimento'),
      'compra-mp': $('#bloco-compra-mp'),
      'venda': $('#bloco-venda'),
      'entrada-investimento': $('#bloco-entrada-investimento')
    };

    function mostrarBloco(tipo) {
      Object.keys(blocos).forEach(k => {
        if (blocos[k]) {
          blocos[k].style.display = (k === tipo) ? 'block' : 'none';
        }
      });
    }

    selTipo?.addEventListener('change', () => {
      mostrarBloco(selTipo.value || '');
    });

    const chkParcial = $('#lanc-venda-parcial');
    const parcialBloco = $('#lanc-venda-parcial-bloco');
    const dataTotalBloco = $('#lanc-venda-data-total-bloco');

    chkParcial?.addEventListener('change', () => {
      if (chkParcial.checked) {
        parcialBloco.style.display = 'block';
        dataTotalBloco.style.display = 'none';
      } else {
        parcialBloco.style.display = 'none';
        dataTotalBloco.style.display = 'block';
      }
    });

    $('#lanc-cancelar')?.addEventListener('click', () => {
      selTipo.value = '';
      mostrarBloco('');
    });

    // autocomplete de pedido na tela de venda
    const inputPedido = $('#lanc-venda-pedido');
    const sugPedido = $('#lanc-venda-pedido-sugestoes');
    const descBox = $('#lanc-venda-descricao');
    const valorBox = $('#lanc-venda-valor');

    inputPedido?.addEventListener('input', () => {
      const termo = inputPedido.value.trim().toLowerCase();
      const pedidos = loadArray(DB_KEYS.pedidos);
      if (!termo) {
        sugPedido.innerHTML = '';
        sugPedido.style.display = 'none';
        return;
      }
      const filtrados = pedidos.filter(p =>
        p.clienteNome.toLowerCase().includes(termo)
      );
      if (!filtrados.length) {
        sugPedido.innerHTML = '<div class="autocomplete-item disabled">Nenhum pedido encontrado</div>';
        sugPedido.style.display = 'block';
        return;
      }
      sugPedido.innerHTML = filtrados.map(p => `
        <div class="autocomplete-item" data-id="${p.id}">
          ${p.clienteNome} — ${fmtDataISO(p.dataCriacao)}
        </div>
      `).join('');
      sugPedido.style.display = 'block';

      sugPedido.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          const ped = filtrados.find(p => p.id === id);
          if (!ped) return;
          inputPedido.value = `${ped.clienteNome} — ${fmtDataISO(ped.dataCriacao)}`;
          inputPedido.dataset.pedidoId = ped.id;
          sugPedido.innerHTML = '';
          sugPedido.style.display = 'none';

          descBox.textContent = ped.itens.map(i =>
            `${i.qtd}x ${i.descricao}`
          ).join(' | ');
          valorBox.textContent = fmtMoeda(ped.totalVenda || 0);
        });
      });
    });

    $('#lanc-salvar')?.addEventListener('click', () => {
      const tipo = selTipo.value;
      if (!tipo) {
        alert('Selecione o tipo de lançamento.');
        return;
      }
      const lancs = loadArray(DB_KEYS.lancamentos);

      if (tipo === 'saida-investimento') {
        const valor = parseNumber($('#lanc-saida-valor').value);
        if (!valor) {
          alert('Informe o valor.');
          return;
        }
        const desc = $('#lanc-saida-tipo').value.trim();
        const data = $('#lanc-saida-data').value;
        lancs.push({
          id: uid(),
          tipo,
          valor,
          descricao: desc,
          data
        });
      } else if (tipo === 'compra-mp') {
        const mat = $('#lanc-mp-material').value.trim();
        const qtd = parseNumber($('#lanc-mp-qtd').value);
        const forn = $('#lanc-mp-fornecedor').value.trim();
        const valor = parseNumber($('#lanc-mp-valor').value);
        const data = $('#lanc-mp-data').value;
        if (!mat || !valor) {
          alert('Informe pelo menos a matéria-prima e o valor.');
          return;
        }
        lancs.push({
          id: uid(),
          tipo,
          material: mat,
          qtd,
          fornecedor: forn,
          valor,
          data
        });
      } else if (tipo === 'venda') {
        const pedidoId = inputPedido.dataset.pedidoId || null;
        const valorPedido = (() => {
          const ped = loadArray(DB_KEYS.pedidos).find(p => p.id === pedidoId);
          return ped ? ped.totalVenda || 0 : 0;
        })();
        let valor = valorPedido;
        let pago = valorPedido;
        let statusPag = 'pago';
        let data = $('#lanc-venda-data-total').value;

        if ($('#lanc-venda-parcial').checked) {
          pago = parseNumber($('#lanc-venda-valor-pago').value);
          if (!pago) {
            alert('Informe o valor pago.');
            return;
          }
          valor = valorPedido;
          statusPag = 'parcial';
          data = $('#lanc-venda-data').value;
        }

        lancs.push({
          id: uid(),
          tipo,
          pedidoId,
