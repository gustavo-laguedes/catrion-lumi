// app.js
document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // "BANCO DE DADOS" EM MEMÓRIA
  // ===============================
  let listaClientes = [];
  let listaProdutos = [];
  let listaMaterias = [];
  let listaFornecedores = [];

  let modoEdicaoClientes = false;
  let modoEdicaoProdutos = false;
  let modoEdicaoMaterias = false;
  let modoEdicaoFornecedores = false;

    // Índices dos itens que estão no modal de detalhes
  let clienteDetalheIndex = null;
  let produtoDetalheIndex = null;
  let materiaDetalheIndex = null;
  let fornecedorDetalheIndex = null;
  let clienteDetalheNovaFoto = null;
  let produtoDetalheNovaFoto = null;




  // ===============================
  // FUNÇÕES DE APOIO
  // ===============================
  function ordenarPorNome(lista) {
    return lista.sort((a, b) => a.nome.localeCompare(b.nome));
  }

    // Renderizar CLIENTES
  function renderClientes() {
    const container = document.querySelector(".clientes-list-container");
    if (!container) return;

    container.innerHTML = "";

    if (listaClientes.length === 0) {
      container.innerHTML = `<div class="clientes-list-empty">Nenhum cliente cadastrado ainda.</div>`;
      return;
    }

    const ordenado = ordenarPorNome([...listaClientes]);

    ordenado.forEach((cli, index) => {
      const item = document.createElement("div");
      item.classList.add("lista-item");

      item.innerHTML = `
        <div class="item-foto" style="background-image: url(${cli.foto || ""});"></div>
        <span class="item-nome">${cli.nome}</span>

        <button class="item-delete-btn ${modoEdicaoClientes ? "show" : ""}" data-index="${index}">
          –
        </button>
      `;

      container.appendChild(item);
    });

        // excluir cliente (com confirmação)
    container.querySelectorAll(".item-delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // não dispara clique no item

        const idx = Number(btn.getAttribute("data-index"));
        const confirmar = window.confirm(
          "Tem certeza que deseja excluir este cliente?"
        );
        if (!confirmar) return;

        listaClientes.splice(idx, 1);
        renderClientes();
      });
    });

        // Clique na linha (foto ou nome) para abrir o modal de detalhes
    container.querySelectorAll(".lista-item").forEach((itemDiv, idx) => {
      itemDiv.addEventListener("click", () => {
        abrirDetalheCliente(idx);
      });
    });

  }

  // Renderizar PRODUTOS
  function renderProdutos() {
    const container = document.querySelector(".produtos-list-container");
    if (!container) return;

    container.innerHTML = "";

    if (listaProdutos.length === 0) {
      container.innerHTML = `<div class="produtos-list-empty">Nenhum produto cadastrado ainda.</div>`;
      return;
    }

    const ordenado = ordenarPorNome([...listaProdutos]);

    ordenado.forEach((prod, index) => {
      const item = document.createElement("div");
      item.classList.add("lista-item");

      item.innerHTML = `
        <div class="item-foto" style="background-image: url(${prod.foto || ""});"></div>
        <span class="item-nome">${prod.nome}</span>
        ${prod.preco ? `<span class="item-valor">R$ ${prod.preco}</span>` : ""}

        <button class="item-delete-btn ${modoEdicaoProdutos ? "show" : ""}" data-index="${index}">
          –
        </button>
      `;

      container.appendChild(item);
    });

        // excluir produto (com confirmação)
    container.querySelectorAll(".item-delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const idx = Number(btn.getAttribute("data-index"));
        const confirmar = window.confirm(
          "Tem certeza que deseja excluir este produto?"
        );
        if (!confirmar) return;

        listaProdutos.splice(idx, 1);
        renderProdutos();
      });
    });
    // Clique na linha (foto ou nome) para abrir o modal de detalhes do produto
    container.querySelectorAll(".lista-item").forEach((itemDiv, idx) => {
      itemDiv.addEventListener("click", () => {
        abrirDetalheProduto(idx);
      });
    });

  }

  // Renderizar MATÉRIAS-PRIMAS
  function renderMaterias() {
    const container = document.querySelector(".materias-list-container");
    if (!container) return;

    container.innerHTML = "";

    if (listaMaterias.length === 0) {
      container.innerHTML = `<div class="materias-list-empty">Nenhuma matéria-prima cadastrada ainda.</div>`;
      return;
    }

    const ordenado = ordenarPorNome([...listaMaterias]);

    ordenado.forEach((mp, index) => {
      const item = document.createElement("div");
      item.classList.add("lista-item");

      item.innerHTML = `
  <div class="item-foto" style="background-image: url(${mp.foto || ""});"></div>

  <span class="item-nome">${mp.nome}</span>

  <span class="item-valor">${mp.unidade || ""}</span>

  <button class="item-delete-btn ${modoEdicaoMaterias ? "show" : ""}" data-index="${index}">
    –
  </button>
`;


      container.appendChild(item);
    });

        // excluir matéria-prima (com confirmação)
    container.querySelectorAll(".item-delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const idx = Number(btn.getAttribute("data-index"));
        const confirmar = window.confirm(
          "Tem certeza que deseja excluir esta matéria-prima?"
        );
        if (!confirmar) return;

        listaMaterias.splice(idx, 1);
        renderMaterias();
      });
    });
    // Clique na linha (nome) para abrir o modal de detalhes da matéria-prima
    container.querySelectorAll(".lista-item").forEach((itemDiv, idx) => {
      itemDiv.addEventListener("click", () => {
        abrirDetalheMateria(idx);
      });
    });


  }

  // Renderizar FORNECEDORES
function renderFornecedores() {
  const container = document.querySelector(".fornecedores-list-container");
  if (!container) return;

  container.innerHTML = "";

  if (listaFornecedores.length === 0) {
    container.innerHTML = `<div class="fornecedores-list-empty">Nenhum fornecedor cadastrado ainda.</div>`;
    return;
  }

  const ordenado = ordenarPorNome([...listaFornecedores]);

  ordenado.forEach((forn, index) => {
    const item = document.createElement("div");
    item.classList.add("lista-item");

    // texto que vai lá no final da linha
    let textoFinal = "";
    if (forn.tipo === "fisico") {
      textoFinal = "Físico";
    } else if (forn.tipo === "internet") {
      // se tiver plataforma, mostra; senão mostra só "Internet"
      textoFinal = forn.plataforma || "Internet";
    }

    item.innerHTML = `
      <span class="item-nome">${forn.nome}</span>
      ${textoFinal ? `<span class="item-valor">${textoFinal}</span>` : ""}

      <button class="item-delete-btn ${modoEdicaoFornecedores ? "show" : ""}" data-index="${index}">
        –
      </button>
    `;

    container.appendChild(item);
  });

  // excluir fornecedor (com confirmação)
  container.querySelectorAll(".item-delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const idx = Number(btn.getAttribute("data-index"));
      const confirmar = window.confirm(
        "Tem certeza que deseja excluir este fornecedor?"
      );
      if (!confirmar) return;

      listaFornecedores.splice(idx, 1);
      renderFornecedores();
    });
  });

  // Clique na linha para abrir o modal de detalhes do fornecedor
  container.querySelectorAll(".lista-item").forEach((itemDiv, idx) => {
    itemDiv.addEventListener("click", () => {
      abrirDetalheFornecedor(idx);
    });
  });
}



  // ===============================
  // TELAS
  // ===============================
  const homeScreen = document.getElementById("home-screen");
  const clientesScreen = document.getElementById("clientes-screen");
  const produtosScreen = document.getElementById("produtos-screen");
  const materiasScreen = document.getElementById("materias-screen");
  const fornecedoresScreen = document.getElementById("fornecedores-screen");
  const pedidosScreen = document.getElementById("pedidos-screen");


  // Botões de edição (para etapa 3)
  const btnEditCliente = document.querySelector(".fab-edit-cliente");
  const btnEditProduto = document.querySelector(".fab-edit-produto");
  const btnEditMateria = document.querySelector(".fab-edit-materia");
  const btnEditFornecedor = document.querySelector(".fab-edit-fornecedor");

    // Liga/desliga modo edição em cada tela
  if (btnEditCliente) {
    btnEditCliente.addEventListener("click", () => {
      modoEdicaoClientes = !modoEdicaoClientes;
      renderClientes();
    });
  }

  if (btnEditProduto) {
    btnEditProduto.addEventListener("click", () => {
      modoEdicaoProdutos = !modoEdicaoProdutos;
      renderProdutos();
    });
  }

  if (btnEditMateria) {
    btnEditMateria.addEventListener("click", () => {
      modoEdicaoMaterias = !modoEdicaoMaterias;
      renderMaterias();
    });
  }

  if (btnEditFornecedor) {
    btnEditFornecedor.addEventListener("click", () => {
      modoEdicaoFornecedores = !modoEdicaoFornecedores;
      renderFornecedores();
    });
  }


  // ===============================
  // NAVEGAÇÃO HOME (CARD CADASTROS)
  // ===============================
  const btnClienteHome = document.getElementById("btn-home-clientes");
  const btnProdutoHome = document.getElementById("btn-home-produtos");
  const btnMateriaHome = document.getElementById("btn-home-materias");
  const btnFornecedorHome = document.getElementById("btn-home-fornecedores");
  const btnNovoPedido = document.getElementById("btn-home-novo-pedido");

  function clearScreens() {
    if (homeScreen) homeScreen.classList.remove("active");
    if (clientesScreen) clientesScreen.classList.remove("active");
    if (produtosScreen) produtosScreen.classList.remove("active");
    if (materiasScreen) materiasScreen.classList.remove("active");
    if (fornecedoresScreen) fornecedoresScreen.classList.remove("active");
    if (pedidosScreen) pedidosScreen.classList.remove("active");
  }

  function clearBottomNavActive() {
    document.querySelectorAll(".bottom-nav .nav-item").forEach((btn) => {
      btn.classList.remove("active");
    });
  }

    // Novo Pedido (card Registros)
  if (btnNovoPedido && pedidosScreen && homeScreen) {
    btnNovoPedido.addEventListener("click", () => {
      clearScreens();
      pedidosScreen.classList.add("active");
      clearBottomNavActive();
    });
  }


  // Cliente
  if (btnClienteHome && clientesScreen && homeScreen) {
    btnClienteHome.addEventListener("click", () => {
      clearScreens();
      clientesScreen.classList.add("active");
      clearBottomNavActive();
    });
  }

  // Produto
  if (btnProdutoHome && produtosScreen && homeScreen) {
    btnProdutoHome.addEventListener("click", () => {
      clearScreens();
      produtosScreen.classList.add("active");
      clearBottomNavActive();
    });
  }

  // Matéria-prima
  if (btnMateriaHome && materiasScreen && homeScreen) {
    btnMateriaHome.addEventListener("click", () => {
      clearScreens();
      materiasScreen.classList.add("active");
      clearBottomNavActive();
    });
  }

  // Fornecedor
  if (btnFornecedorHome && fornecedoresScreen && homeScreen) {
    btnFornecedorHome.addEventListener("click", () => {
      clearScreens();
      fornecedoresScreen.classList.add("active");
      clearBottomNavActive();
    });
  }

  // ===============================
  // BOTTOM NAV — BOTÃO HOME
  // ===============================
  const btnHomeNav = document.querySelector(
    ".bottom-nav .nav-item:nth-child(1)"
  );

  if (btnHomeNav) {
    btnHomeNav.addEventListener("click", () => {
      clearScreens();
      if (homeScreen) homeScreen.classList.add("active");

      clearBottomNavActive();
      btnHomeNav.classList.add("active");
    });
  }

  // =========================
  // MODAL DE CLIENTE
  // =========================
  const fabAddCliente = document.querySelector(".fab-add-cliente");
  const modalOverlayCliente = document.querySelector(".cliente-modal-overlay");
  const modalCloseCliente = document.querySelector(".cliente-modal-close");
  const modalBoxCliente = document.querySelector(".cliente-modal");
  const formCliente = document.getElementById("cliente-form");

  function abrirModalCliente() {
    if (modalOverlayCliente) {
      modalOverlayCliente.classList.add("open");
    }
  }

  function fecharModalCliente() {
    if (modalOverlayCliente) {
      modalOverlayCliente.classList.remove("open");
    }
  }

  if (fabAddCliente) {
    fabAddCliente.addEventListener("click", abrirModalCliente);
  }

  if (modalCloseCliente) {
    modalCloseCliente.addEventListener("click", fecharModalCliente);
  }

  if (modalOverlayCliente && modalBoxCliente) {
    modalOverlayCliente.addEventListener("click", (e) => {
      if (e.target === modalOverlayCliente) fecharModalCliente();
    });
    modalBoxCliente.addEventListener("click", (e) => e.stopPropagation());
  }

  // Preview da foto do cliente
  const inputFotoCliente = document.getElementById("cliente-foto");
  const previewFotoCliente = document.getElementById("cliente-foto-preview");

     // ----- MODAL DE DETALHES DO CLIENTE -----
  const detalheOverlayCliente = document.querySelector(".cliente-detalhe-overlay");
  const detalheModalCliente = document.querySelector(".cliente-detalhe-modal");
  const btnDetalheClose = document.querySelector(".cliente-detalhe-close");
  const divDetalheFoto = document.getElementById("detalhe-cliente-foto");
  const inputDetalheFotoFile = document.getElementById("detalhe-cliente-foto-input");
  const inputDetalheNome = document.getElementById("detalhe-cliente-nome");
  const inputDetalheTelefone = document.getElementById("detalhe-cliente-telefone");
  const inputDetalheEndereco = document.getElementById("detalhe-cliente-endereco");
  const inputDetalheCidade = document.getElementById("detalhe-cliente-cidade");
  const inputDetalheEstado = document.getElementById("detalhe-cliente-estado");
  const btnDetalheEditar = document.getElementById("cliente-detalhe-editar");
  const btnDetalheSalvar = document.getElementById("cliente-detalhe-salvar");

  function travarDetalheCliente(travar) {
    if (inputDetalheNome) inputDetalheNome.disabled = travar;
    if (inputDetalheTelefone) inputDetalheTelefone.disabled = travar;
    if (inputDetalheEndereco) inputDetalheEndereco.disabled = travar;
    if (inputDetalheCidade) inputDetalheCidade.disabled = travar;
    if (inputDetalheEstado) inputDetalheEstado.disabled = travar;
    if (btnDetalheSalvar) btnDetalheSalvar.disabled = travar;
  }

  function abrirDetalheCliente(index) {
    const cli = listaClientes[index];
    if (!cli || !detalheOverlayCliente) return;

    clienteDetalheIndex = index;
    clienteDetalheNovaFoto = null;

    if (divDetalheFoto) {
      if (cli.foto) {
        divDetalheFoto.style.backgroundImage = `url(${cli.foto})`;
      } else {
        divDetalheFoto.style.backgroundImage = "none";
      }
    }

    if (inputDetalheNome)      inputDetalheNome.value      = cli.nome      || "";
    if (inputDetalheTelefone)  inputDetalheTelefone.value  = cli.telefone  || "";
    if (inputDetalheEndereco)  inputDetalheEndereco.value  = cli.endereco  || "";
    if (inputDetalheCidade)    inputDetalheCidade.value    = cli.cidade    || "";
    if (inputDetalheEstado)    inputDetalheEstado.value    = cli.estado    || "";

    travarDetalheCliente(true);
    detalheOverlayCliente.classList.add("open");
  }

  function fecharDetalheCliente() {
    if (detalheOverlayCliente) detalheOverlayCliente.classList.remove("open");
    clienteDetalheIndex = null;
    clienteDetalheNovaFoto = null;
  }

  if (btnDetalheClose && detalheOverlayCliente && detalheModalCliente) {
    btnDetalheClose.addEventListener("click", fecharDetalheCliente);
    detalheOverlayCliente.addEventListener("click", (e) => {
      if (e.target === detalheOverlayCliente) fecharDetalheCliente();
    });
    detalheModalCliente.addEventListener("click", (e) => e.stopPropagation());
  }

  if (btnDetalheEditar) {
    btnDetalheEditar.addEventListener("click", () => {
      travarDetalheCliente(false);
      if (inputDetalheNome) inputDetalheNome.focus();
    });
  }

  if (btnDetalheSalvar) {
    btnDetalheSalvar.addEventListener("click", () => {
      if (clienteDetalheIndex === null) return;
      const cli = listaClientes[clienteDetalheIndex];
      if (!cli) return;

      cli.nome      = (inputDetalheNome?.value || "").trim();
      cli.telefone  = (inputDetalheTelefone?.value || "").trim();
      cli.endereco  = (inputDetalheEndereco?.value || "").trim();
      cli.cidade    = (inputDetalheCidade?.value || "").trim();
      cli.estado    = (inputDetalheEstado?.value || "").trim();

      if (clienteDetalheNovaFoto) {
        cli.foto = clienteDetalheNovaFoto;
      }

      renderClientes();
      fecharDetalheCliente();
    });
  }

  // Clique na foto para trocar a imagem (somente em modo edição)
  if (divDetalheFoto && inputDetalheFotoFile) {
    divDetalheFoto.addEventListener("click", () => {
      // se o botão Salvar estiver desabilitado, ainda não estamos em modo edição
      if (btnDetalheSalvar && btnDetalheSalvar.disabled) return;
      inputDetalheFotoFile.click();
    });

    inputDetalheFotoFile.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem.");
        inputDetalheFotoFile.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        clienteDetalheNovaFoto = ev.target.result;
        if (divDetalheFoto) {
          divDetalheFoto.style.backgroundImage = `url(${clienteDetalheNovaFoto})`;
        }
      };
      reader.readAsDataURL(file);
    });
  }



  if (inputFotoCliente && previewFotoCliente) {
    inputFotoCliente.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        previewFotoCliente.style.backgroundImage = "none";
        previewFotoCliente.classList.add("empty");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem.");
        inputFotoCliente.value = "";
        previewFotoCliente.style.backgroundImage = "none";
        previewFotoCliente.classList.add("empty");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        previewFotoCliente.style.backgroundImage = `url(${ev.target.result})`;
        previewFotoCliente.classList.remove("empty");
      };
      reader.readAsDataURL(file);
    });
  }

  if (formCliente) {
    formCliente.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("cliente-nome").value.trim();
const telefone = document.getElementById("cliente-telefone").value.trim();
const endereco = document.getElementById("cliente-endereco").value.trim();
const cidade = document.getElementById("cliente-cidade").value.trim();
const estado = document.getElementById("cliente-estado").value.trim();

let foto = null;
if (previewFotoCliente && previewFotoCliente.style.backgroundImage) {
  const bg = previewFotoCliente.style.backgroundImage;
  foto = bg.replace('url("', "").replace('")', "");
}

// agora salvando todos os campos
listaClientes.push({
  nome,
  telefone,
  endereco,
  cidade,
  estado,
  foto
});


      renderClientes();

      formCliente.reset();
      if (previewFotoCliente) {
        previewFotoCliente.style.backgroundImage = "none";
        previewFotoCliente.classList.add("empty");
      }
      fecharModalCliente();
    });
  }

  // =========================
  // MODAL DE PRODUTO
  // =========================
  const fabAddProduto = document.querySelector(".fab-add-produto");
  const modalOverlayProduto = document.querySelector(".produto-modal-overlay");
  const modalCloseProduto = document.querySelector(".produto-modal-close");
  const modalBoxProduto = document.querySelector(".produto-modal");
  const formProduto = document.getElementById("produto-form");

  const mpContainer = document.getElementById("produto-mp-container");
  const btnAddMp = document.getElementById("btn-add-mp");
  const inputPrecoVenda = document.getElementById("produto-preco");
  const resumoCusto = document.getElementById("produto-resumo-custo");
  const resumoLucro = document.getElementById("produto-resumo-lucro");

  function abrirModalProduto() {
    if (modalOverlayProduto) {
      modalOverlayProduto.classList.add("open");
    }
    if (mpContainer && mpContainer.children.length === 0) {
      adicionarLinhaMp();
    }
    recalcularResumoProduto();
  }

  function fecharModalProduto() {
    if (modalOverlayProduto) {
      modalOverlayProduto.classList.remove("open");
    }
  }

  if (fabAddProduto) {
    fabAddProduto.addEventListener("click", abrirModalProduto);
  }

  if (modalCloseProduto) {
    modalCloseProduto.addEventListener("click", fecharModalProduto);
  }

  if (modalOverlayProduto && modalBoxProduto) {
    modalOverlayProduto.addEventListener("click", (e) => {
      if (e.target === modalOverlayProduto) fecharModalProduto();
    });
    modalBoxProduto.addEventListener("click", (e) => e.stopPropagation());
  }

  const inputFotoProduto = document.getElementById("produto-foto");
  const previewFotoProduto = document.getElementById("produto-foto-preview");

    
   // ----- MODAL DE DETALHES DO PRODUTO -----
  const detalheOverlayProduto = document.querySelector(".produto-detalhe-overlay");
  const detalheModalProduto = document.querySelector(".produto-detalhe-modal");
  const btnProdutoDetalheClose = document.querySelector(".produto-detalhe-close");
  const divDetalheFotoProduto = document.getElementById("detalhe-produto-foto");
  const inputDetalheProdutoNome = document.getElementById("detalhe-produto-nome");
  const inputDetalheProdutoPreco = document.getElementById("detalhe-produto-preco");
  const inputDetalheProdutoFotoFile = document.getElementById("detalhe-produto-foto-input");
  const btnProdutoDetalheEditar = document.getElementById("produto-detalhe-editar");
  const btnProdutoDetalheSalvar = document.getElementById("produto-detalhe-salvar");
  const detalheMpContainer = document.getElementById("detalhe-produto-mp-container");
  const detalheResumoCusto = document.getElementById("detalhe-produto-resumo-custo");
  const detalheResumoLucro = document.getElementById("detalhe-produto-resumo-lucro");
  const detalheBtnAddMp = document.getElementById("detalhe-btn-add-mp");

  function travarDetalheProduto(travar) {
    // nome e preço
    if (inputDetalheProdutoNome)  inputDetalheProdutoNome.disabled  = travar;
    if (inputDetalheProdutoPreco) inputDetalheProdutoPreco.disabled = travar;
    if (btnProdutoDetalheSalvar)  btnProdutoDetalheSalvar.disabled  = travar;

    // campos das matérias-primas
    if (detalheMpContainer) {
      detalheMpContainer
        .querySelectorAll(".mp-nome, .mp-quantidade, .mp-valor, .mp-unidade")
        .forEach((inp) => {
          inp.disabled = travar;
        });

      // botões de remover MP
      detalheMpContainer
        .querySelectorAll(".mp-remove-btn-detalhe")
        .forEach((btn) => {
          btn.style.display = travar ? "none" : "inline-flex";
        });
    }

    // botão de adicionar MP
    if (detalheBtnAddMp) {
      detalheBtnAddMp.style.display = travar ? "none" : "block";
    }
  }

  function abrirDetalheProduto(index) {
    const prod = listaProdutos[index];
    if (!prod || !detalheOverlayProduto) return;

    produtoDetalheIndex = index;
    produtoDetalheNovaFoto = null;

    // foto
    if (divDetalheFotoProduto) {
      if (prod.foto) {
        divDetalheFotoProduto.style.backgroundImage = `url(${prod.foto})`;
      } else {
        divDetalheFotoProduto.style.backgroundImage = "none";
      }
    }

    // nome
    if (inputDetalheProdutoNome) {
      inputDetalheProdutoNome.value = prod.nome || "";
    }

    // preço
    if (inputDetalheProdutoPreco) {
      inputDetalheProdutoPreco.value = prod.preco || "";
    }

    // matérias-primas
    if (detalheMpContainer) {
      detalheMpContainer.innerHTML = "";

      if (prod.materiasPrimas && prod.materiasPrimas.length > 0) {
        prod.materiasPrimas.forEach((mp) => {
          const linha = document.createElement("div");
          linha.classList.add("produto-mp-item");

          linha.innerHTML = `
            <div class="produto-mp-header">
              <div class="produto-mp-row">
                <div class="field-group">
                  <label>Matéria-prima</label>
                  <input type="text" class="mp-nome" value="${mp.nome || ""}">
                </div>
                <div class="field-group small">
                  <label>Unidade</label>
                  <select class="mp-unidade">
                    <option value="">Selecione...</option>
                    <option value="UN" ${mp.unidade === "UN" ? "selected" : ""}>Unidade</option>
                    <option value="M"  ${mp.unidade === "M"  ? "selected" : ""}>Metro</option>
                    <option value="KG" ${mp.unidade === "KG" ? "selected" : ""}>Quilo</option>
                  </select>
                </div>
              </div>

              <button type="button" class="mp-remove-btn-detalhe" title="Remover">
                &times;
              </button>
            </div>

            <div class="produto-mp-row">
              <div class="field-group small">
                <label>Qtd</label>
                <input type="number" class="mp-quantidade" step="0.01" min="0"
                       value="${mp.quantidade ?? ""}">
              </div>
              <div class="field-group produto-mp-valor-group">
                <label>Valor (R$)</label>
                <input type="number" class="mp-valor" step="0.01" min="0"
                       value="${mp.valor ?? ""}">
              </div>
            </div>
          `;

          const btnRemove = linha.querySelector(".mp-remove-btn-detalhe");
          if (btnRemove) {
            btnRemove.addEventListener("click", () => {
              linha.remove();
              recalcularResumoProdutoDetalhe();
            });
          }

          const inpQtd   = linha.querySelector(".mp-quantidade");
          const inpValor = linha.querySelector(".mp-valor");
          if (inpQtd)   inpQtd.addEventListener("input", recalcularResumoProdutoDetalhe);
          if (inpValor) inpValor.addEventListener("input", recalcularResumoProdutoDetalhe);

          detalheMpContainer.appendChild(linha);
        });
      } else {
        detalheMpContainer.innerHTML =
          `<p style="font-size:13px;color:#888;">Nenhuma matéria-prima cadastrada.</p>`;
      }
    }

    // resumo inicial
    if (detalheResumoCusto && detalheResumoLucro) {
      const custo = typeof prod.custoTotal === "number" ? prod.custoTotal : 0;
      const lucro = typeof prod.lucro === "number" ? prod.lucro : 0;
      const perc  = typeof prod.percLucro === "number" ? prod.percLucro : 0;

      detalheResumoCusto.textContent = formatarReal(custo);
      detalheResumoLucro.textContent =
        `${formatarReal(lucro)} (${perc.toFixed(1).replace(".", ",")}%)`;
    }

    travarDetalheProduto(true);
    detalheOverlayProduto.classList.add("open");

    // ajusta cores/valores iniciais
    recalcularResumoProdutoDetalhe();
  }

  function fecharDetalheProduto() {
    if (detalheOverlayProduto) detalheOverlayProduto.classList.remove("open");
    produtoDetalheIndex = null;
  }

  function adicionarLinhaMpDetalhe() {
    if (!detalheMpContainer) return;

    // se ainda estiver travado (não clicou em "Editar"), não adiciona
    if (btnProdutoDetalheSalvar && btnProdutoDetalheSalvar.disabled) return;

    const linha = document.createElement("div");
    linha.classList.add("produto-mp-item");

    linha.innerHTML = `
      <div class="produto-mp-header">
        <div class="produto-mp-row">
          <div class="field-group">
            <label>Matéria-prima</label>
            <input type="text" class="mp-nome">
          </div>
          <div class="field-group small">
            <label>Unidade</label>
            <select class="mp-unidade">
              <option value="">Selecione...</option>
              <option value="UN">Unidade</option>
              <option value="M">Metro</option>
              <option value="KG">Quilo</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          class="mp-remove-btn-detalhe"
          title="Remover matéria-prima"
        >
          &times;
        </button>
      </div>

      <div class="produto-mp-row">
        <div class="field-group small">
          <label>Qtd</label>
          <input type="number" class="mp-quantidade" step="0.01" min="0">
        </div>
        <div class="field-group produto-mp-valor-group">
          <label>Valor (R$)</label>
          <input type="number" class="mp-valor" step="0.01" min="0">
        </div>
      </div>
    `;

    const btnRemove = linha.querySelector(".mp-remove-btn-detalhe");
    if (btnRemove) {
      btnRemove.addEventListener("click", () => {
        linha.remove();
        recalcularResumoProdutoDetalhe();
      });
    }

    const inpQtd   = linha.querySelector(".mp-quantidade");
    const inpValor = linha.querySelector(".mp-valor");
    if (inpQtd)   inpQtd.addEventListener("input", recalcularResumoProdutoDetalhe);
    if (inpValor) inpValor.addEventListener("input", recalcularResumoProdutoDetalhe);

    detalheMpContainer.appendChild(linha);
    recalcularResumoProdutoDetalhe();
  }

  // botão + adicionar MP no detalhe
  if (detalheBtnAddMp) {
    detalheBtnAddMp.addEventListener("click", adicionarLinhaMpDetalhe);
  }

  // fechar no X e no overlay
  if (btnProdutoDetalheClose && detalheOverlayProduto && detalheModalProduto) {
    btnProdutoDetalheClose.addEventListener("click", fecharDetalheProduto);
    detalheOverlayProduto.addEventListener("click", (e) => {
      if (e.target === detalheOverlayProduto) fecharDetalheProduto();
    });
    detalheModalProduto.addEventListener("click", (e) => e.stopPropagation());
  }

  // botão EDITAR (libera campos)
  if (btnProdutoDetalheEditar) {
    btnProdutoDetalheEditar.addEventListener("click", () => {
      travarDetalheProduto(false);
      if (inputDetalheProdutoNome) inputDetalheProdutoNome.focus();
    });
  }

  // botão SALVAR (atualiza nome/preço, foto e recalcula custo/lucro)
  if (btnProdutoDetalheSalvar) {
    btnProdutoDetalheSalvar.addEventListener("click", () => {
      if (produtoDetalheIndex === null) return;
      const prod = listaProdutos[produtoDetalheIndex];
      if (!prod) return;

      // nome e preço
      prod.nome  = (inputDetalheProdutoNome?.value || "").trim();
      prod.preco = (inputDetalheProdutoPreco?.value || "").trim();

      // se trocou a foto no detalhe, aplica
      if (produtoDetalheNovaFoto) {
        prod.foto = produtoDetalheNovaFoto;
      }

      // ler matérias-primas da tela de detalhe
      const novasMaterias = [];
      let custoTotal = 0;

      if (detalheMpContainer) {
        const linhas = detalheMpContainer.querySelectorAll(".produto-mp-item");

        linhas.forEach((linha) => {
          const nomeMp    = linha.querySelector(".mp-nome")?.value.trim();
          const unidadeMp = (linha.querySelector(".mp-unidade")?.value || "").trim();
          const qtdMp     = lerNumero(linha.querySelector(".mp-quantidade")?.value);
          const valMp     = lerNumero(linha.querySelector(".mp-valor")?.value);

          if (nomeMp) {
            novasMaterias.push({
              nome: nomeMp,
              unidade: unidadeMp,
              quantidade: qtdMp,
              valor: valMp,
            });

            const custoLinha = qtdMp > 0 ? qtdMp * valMp : valMp;
            custoTotal += custoLinha;
          }
        });
      }

      // substitui o array antigo pelo novo
      prod.materiasPrimas = novasMaterias;

      const precoNumero = lerNumero(prod.preco);
      const lucro = precoNumero - custoTotal;
      const percLucro = precoNumero > 0 ? (lucro / precoNumero) * 100 : 0;

      prod.custoTotal = custoTotal;
      prod.lucro = lucro;
      prod.percLucro = percLucro;

      if (detalheResumoCusto && detalheResumoLucro) {
        detalheResumoCusto.textContent = formatarReal(custoTotal);
        detalheResumoLucro.textContent =
          `${formatarReal(lucro)} (${percLucro.toFixed(1).replace(".", ",")}%)`;
      }

      renderProdutos();
      fecharDetalheProduto();
    });
  }

  // preço no detalhe também recalcula resumo em tempo real
  if (inputDetalheProdutoPreco) {
    inputDetalheProdutoPreco.addEventListener("input", recalcularResumoProdutoDetalhe);
  }


// Clique na foto do PRODUTO para trocar a imagem (somente em modo edição)
if (divDetalheFotoProduto && inputDetalheProdutoFotoFile) {
  divDetalheFotoProduto.addEventListener("click", () => {
    // se o botão Salvar estiver desabilitado, ainda não estamos em modo edição
    if (btnProdutoDetalheSalvar && btnProdutoDetalheSalvar.disabled) return;
    inputDetalheProdutoFotoFile.click();
  });

  inputDetalheProdutoFotoFile.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      inputDetalheProdutoFotoFile.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      produtoDetalheNovaFoto = ev.target.result;
      if (divDetalheFotoProduto) {
        divDetalheFotoProduto.style.backgroundImage = `url(${produtoDetalheNovaFoto})`;
      }
    };
    reader.readAsDataURL(file);
  });
}



  if (inputFotoProduto && previewFotoProduto) {
    inputFotoProduto.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        previewFotoProduto.style.backgroundImage = "none";
        previewFotoProduto.classList.add("empty");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem.");
        inputFotoProduto.value = "";
        previewFotoProduto.style.backgroundImage = "none";
        previewFotoProduto.classList.add("empty");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        previewFotoProduto.style.backgroundImage = `url(${ev.target.result})`;
        previewFotoProduto.classList.remove("empty");
      };
      reader.readAsDataURL(file);
    });
  }

 function adicionarLinhaMp() {
  if (!mpContainer) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("produto-mp-item");

  wrapper.innerHTML = `
    <div class="produto-mp-header">
      <div class="produto-mp-row">
        <div class="field-group">
          <label>Matéria-prima</label>
          <input type="text" class="mp-nome" placeholder="Buscar matéria-prima">
        </div>
        <div class="field-group small">
          <label>Unidade</label>
          <select class="mp-unidade">
            <option value="">Selecione...</option>
            <option value="UN">Unidade</option>
            <option value="M">Metro</option>
            <option value="KG">Quilo</option>
          </select>
        </div>
      </div>

      <button type="button" class="mp-remove-btn" title="Remover matéria-prima">
        &times;
      </button>
    </div>

    <div class="produto-mp-row">
      <div class="field-group small">
        <label>Qtd</label>
        <input type="number" class="mp-quantidade" step="0.01" min="0">
      </div>
      <div class="field-group produto-mp-valor-group">
        <label>Valor (R$)</label>
        <input type="number" class="mp-valor" step="0.01" min="0">
      </div>
    </div>
  `;

  mpContainer.appendChild(wrapper);

  const inputValor = wrapper.querySelector(".mp-valor");
  const inputQtd = wrapper.querySelector(".mp-quantidade");
  const btnRemove = wrapper.querySelector(".mp-remove-btn");

  if (inputValor) inputValor.addEventListener("input", recalcularResumoProduto);
  if (inputQtd) inputQtd.addEventListener("input", recalcularResumoProduto);

  if (btnRemove) {
    btnRemove.addEventListener("click", () => {
      wrapper.remove();
      recalcularResumoProduto();
    });
  }
}


  if (btnAddMp) {
    btnAddMp.addEventListener("click", () => {
      adicionarLinhaMp();
      recalcularResumoProduto();
    });
  }

  if (inputPrecoVenda) {
    inputPrecoVenda.addEventListener("input", recalcularResumoProduto);
  }

  if (inputDetalheProdutoPreco) {
  inputDetalheProdutoPreco.addEventListener("input", recalcularResumoProdutoDetalhe);
}


  function lerNumero(valor) {
    if (!valor) return 0;
    const num = parseFloat(String(valor).replace(",", "."));
    return isNaN(num) ? 0 : num;
  }

  function formatarReal(n) {
    return "R$ " + n.toFixed(2).replace(".", ",");
  }

  function recalcularResumoProduto() {
    if (!mpContainer || !resumoCusto || !resumoLucro) return;

    let custoTotal = 0;
    const linhas = mpContainer.querySelectorAll(".produto-mp-item");

    linhas.forEach((linha) => {
      const inpValor = linha.querySelector(".mp-valor");
      const inpQtd = linha.querySelector(".mp-quantidade");

      const valor = lerNumero(inpValor && inpValor.value);
      const qtd = lerNumero(inpQtd && inpQtd.value);

      const custoLinha = qtd > 0 ? valor * qtd : valor;

      custoTotal += custoLinha;
    });

    const precoVenda = lerNumero(inputPrecoVenda && inputPrecoVenda.value);
    const lucro = precoVenda - custoTotal;
    const percLucro = precoVenda > 0 ? (lucro / precoVenda) * 100 : 0;

    resumoCusto.textContent = formatarReal(custoTotal);
    resumoLucro.textContent =
      formatarReal(lucro) +
      " (" +
      percLucro.toFixed(1).replace(".", ",") +
      "%)";

    resumoCusto.style.color = "#cc3b3b";

    let corLucro;
    if (percLucro < 50) {
      corLucro = "#cc3b3b";
    } else if (percLucro < 70) {
      corLucro = "#c9a000";
    } else {
      corLucro = "#2f9d4d";
    }

    resumoLucro.style.color = corLucro;
  }

function recalcularResumoProdutoDetalhe() {
  if (!detalheMpContainer || !detalheResumoCusto || !detalheResumoLucro) return;

  let custoTotal = 0;
  const linhas = detalheMpContainer.querySelectorAll(".produto-mp-item");

  linhas.forEach((linha) => {
    const inpValor = linha.querySelector(".mp-valor");
    const inpQtd   = linha.querySelector(".mp-quantidade");

    const valor = lerNumero(inpValor && inpValor.value);
    const qtd   = lerNumero(inpQtd && inpQtd.value);

    const custoLinha = qtd > 0 ? valor * qtd : valor;
    custoTotal += custoLinha;
  });

  const precoVenda = lerNumero(inputDetalheProdutoPreco && inputDetalheProdutoPreco.value);
  const lucro      = precoVenda - custoTotal;
  const percLucro  = precoVenda > 0 ? (lucro / precoVenda) * 100 : 0;

  detalheResumoCusto.textContent = formatarReal(custoTotal);
  detalheResumoLucro.textContent =
    `${formatarReal(lucro)} (${percLucro.toFixed(1).replace(".", ",")}%)`;

  // mesmas cores do cadastro
  detalheResumoCusto.style.color = "#cc3b3b";

  let corLucro;
  if (percLucro < 50) {
    corLucro = "#cc3b3b";
  } else if (percLucro < 70) {
    corLucro = "#c9a000";
  } else {
    corLucro = "#2f9d4d";
  }
  detalheResumoLucro.style.color = corLucro;
}


  if (formProduto) {
  formProduto.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome  = document.getElementById("produto-nome").value.trim();
    const preco = document.getElementById("produto-preco").value.trim();

    let foto = null;
    if (previewFotoProduto && previewFotoProduto.style.backgroundImage) {
      const bg = previewFotoProduto.style.backgroundImage;
      foto = bg.replace('url("', "").replace('")', "");
    }

    // pegar as MPs da tela
    const materiasPrimas = [];
    if (mpContainer) {
      const linhas = mpContainer.querySelectorAll(".produto-mp-item");
      linhas.forEach((linha) => {
  const nomeMp    = linha.querySelector(".mp-nome")?.value.trim();
  const unidadeMp = (linha.querySelector(".mp-unidade")?.value || "").trim();
  const qtdMp     = lerNumero(linha.querySelector(".mp-quantidade")?.value);
  const valMp     = lerNumero(linha.querySelector(".mp-valor")?.value);

  if (nomeMp) {
    materiasPrimas.push({
      nome: nomeMp,
      unidade: unidadeMp,
      quantidade: qtdMp,
      valor: valMp,
    });
  }
});

    }

    // calcula custo e lucro pra já guardar no objeto
    const precoNumero = lerNumero(preco);
    let custoTotal = 0;
    materiasPrimas.forEach((mp) => {
      const custoLinha = mp.quantidade > 0 ? mp.quantidade * mp.valor : mp.valor;
      custoTotal += custoLinha;
    });
    const lucro = precoNumero - custoTotal;
    const percLucro = precoNumero > 0 ? (lucro / precoNumero) * 100 : 0;

    listaProdutos.push({
      nome,
      preco,          // string pra exibir
      foto,
      materiasPrimas, // array com as MPs usadas
      custoTotal,
      lucro,
      percLucro,
    });

    renderProdutos();

    formProduto.reset();
    if (previewFotoProduto) {
      previewFotoProduto.style.backgroundImage = "none";
      previewFotoProduto.classList.add("empty");
    }
    if (mpContainer) mpContainer.innerHTML = "";
    if (resumoCusto) resumoCusto.textContent = "R$ 0,00";
    if (resumoLucro) resumoLucro.textContent = "R$ 0,00 (0%)";
    fecharModalProduto();
  });
}


  // =========================
  // MODAL DE MATÉRIA-PRIMA
  // =========================
  const fabAddMateria = document.querySelector(".fab-add-materia");
  const modalOverlayMateria = document.querySelector(".materia-modal-overlay");
  const modalCloseMateria = document.querySelector(".materia-modal-close");
  const modalBoxMateria = document.querySelector(".materia-modal");
  const formMateria = document.getElementById("materia-form");

  function abrirModalMateria() {
    if (modalOverlayMateria) {
      modalOverlayMateria.classList.add("open");
    }
  }

  function fecharModalMateria() {
    if (modalOverlayMateria) {
      modalOverlayMateria.classList.remove("open");
    }
  }

  if (fabAddMateria) {
    fabAddMateria.addEventListener("click", abrirModalMateria);
  }

  if (modalCloseMateria) {
    modalCloseMateria.addEventListener("click", fecharModalMateria);
  }

  if (modalOverlayMateria && modalBoxMateria) {
    modalOverlayMateria.addEventListener("click", (e) => {
      if (e.target === modalOverlayMateria) fecharModalMateria();
    });
    modalBoxMateria.addEventListener("click", (e) => e.stopPropagation());
  }

  const inputFotoMateria = document.getElementById("materia-foto");
const previewFotoMateria = document.getElementById("materia-foto-preview");

if (inputFotoMateria && previewFotoMateria) {
  inputFotoMateria.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      previewFotoMateria.style.backgroundImage = "none";
      previewFotoMateria.classList.add("empty");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      inputFotoMateria.value = "";
      previewFotoMateria.style.backgroundImage = "none";
      previewFotoMateria.classList.add("empty");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      previewFotoMateria.style.backgroundImage = `url(${ev.target.result})`;
      previewFotoMateria.classList.remove("empty");
    };
    reader.readAsDataURL(file);
  });
}


  if (formMateria) {
    formMateria.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("materia-nome").value.trim();
      const unidade = document
        .getElementById("materia-unidade")
        .value.trim();

     let foto = null;
const prevMateria = document.getElementById("materia-foto-preview");
if (prevMateria && prevMateria.style.backgroundImage) {
  const bg = prevMateria.style.backgroundImage;
  foto = bg.replace('url("', "").replace('")', "");
}

listaMaterias.push({
  nome,
  unidade,
  foto
});


      renderMaterias();
      formMateria.reset();
      fecharModalMateria();
    });
  }

    // ----- MODAL DE DETALHES DA MATÉRIA-PRIMA -----
  const detalheOverlayMateria = document.querySelector(".materia-detalhe-overlay");
  const detalheModalMateria = document.querySelector(".materia-detalhe-modal");
  const btnMateriaDetalheClose = document.querySelector(".materia-detalhe-close");
  const inputDetalheMateriaNome = document.getElementById("detalhe-materia-nome");
  const inputDetalheMateriaUnidade = document.getElementById("detalhe-materia-unidade");
  const btnMateriaDetalheEditar = document.getElementById("materia-detalhe-editar");
  const btnMateriaDetalheSalvar = document.getElementById("materia-detalhe-salvar");
  // Foto no detalhe da matéria-prima
const divDetalheMateriaFoto = document.getElementById("detalhe-materia-foto");
const inputDetalheMateriaFotoFile = document.getElementById("detalhe-materia-foto-input");
let materiaDetalheNovaFoto = null;


  function travarDetalheMateria(travar) {
    if (inputDetalheMateriaNome) inputDetalheMateriaNome.disabled = travar;
    if (inputDetalheMateriaUnidade) inputDetalheMateriaUnidade.disabled = travar;
    if (btnMateriaDetalheSalvar) btnMateriaDetalheSalvar.disabled = travar;
  }

  function abrirDetalheMateria(index) {
  const mp = listaMaterias[index];
  if (!mp || !detalheOverlayMateria) return;

  materiaDetalheIndex = index;
  materiaDetalheNovaFoto = null;

  // foto
  if (divDetalheMateriaFoto) {
    if (mp.foto) {
      divDetalheMateriaFoto.style.backgroundImage = `url(${mp.foto})`;
      divDetalheMateriaFoto.classList.remove("empty");
    } else {
      divDetalheMateriaFoto.style.backgroundImage = "none";
      divDetalheMateriaFoto.classList.add("empty");
    }
  }

  // campos
  if (inputDetalheMateriaNome) inputDetalheMateriaNome.value = mp.nome || "";
  if (inputDetalheMateriaUnidade) inputDetalheMateriaUnidade.value = mp.unidade || "";

  travarDetalheMateria(true);
  detalheOverlayMateria.classList.add("open");
}


  function fecharDetalheMateria() {
    if (detalheOverlayMateria) detalheOverlayMateria.classList.remove("open");
    materiaDetalheIndex = null;
  }

  // Clique para trocar a foto da matéria-prima (somente no modo edição)
if (divDetalheMateriaFoto && inputDetalheMateriaFotoFile) {
  divDetalheMateriaFoto.addEventListener("click", () => {
    // se o botão Salvar estiver desabilitado, ainda não estamos em modo edição
    if (btnMateriaDetalheSalvar && btnMateriaDetalheSalvar.disabled) return;
    inputDetalheMateriaFotoFile.click();
  });

  inputDetalheMateriaFotoFile.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      inputDetalheMateriaFotoFile.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      materiaDetalheNovaFoto = ev.target.result;
      divDetalheMateriaFoto.style.backgroundImage = `url(${materiaDetalheNovaFoto})`;
      divDetalheMateriaFoto.classList.remove("empty");
    };
    reader.readAsDataURL(file);
  });
}


  if (btnMateriaDetalheClose && detalheOverlayMateria && detalheModalMateria) {
    btnMateriaDetalheClose.addEventListener("click", fecharDetalheMateria);
    detalheOverlayMateria.addEventListener("click", (e) => {
      if (e.target === detalheOverlayMateria) fecharDetalheMateria();
    });
    detalheModalMateria.addEventListener("click", (e) => e.stopPropagation());
  }

  if (btnMateriaDetalheEditar) {
    btnMateriaDetalheEditar.addEventListener("click", () => {
      travarDetalheMateria(false);
      if (inputDetalheMateriaNome) inputDetalheMateriaNome.focus();
    });
  }

  if (btnMateriaDetalheSalvar) {
  btnMateriaDetalheSalvar.addEventListener("click", () => {
    if (materiaDetalheIndex === null) return;
    const mp = listaMaterias[materiaDetalheIndex];
    if (!mp) return;

    mp.nome    = (inputDetalheMateriaNome?.value || "").trim();
    mp.unidade = (inputDetalheMateriaUnidade?.value || "").trim();

    if (materiaDetalheNovaFoto) {
      mp.foto = materiaDetalheNovaFoto;
    }

    renderMaterias();
    fecharDetalheMateria();
  });
}



  // =========================
  // MODAL DE FORNECEDOR
  // =========================
  const fabAddFornecedor = document.querySelector(".fab-add-fornecedor");
  const modalOverlayFornecedor = document.querySelector(
    ".fornecedor-modal-overlay"
  );
  const modalCloseFornecedor = document.querySelector(
    ".fornecedor-modal-close"
  );
  const modalBoxFornecedor = document.querySelector(".fornecedor-modal");
  const formFornecedor = document.getElementById("fornecedor-form");

  const selectTipoFornecedor = document.getElementById("fornecedor-tipo");
  const boxInternet = document.getElementById("fornecedor-internet-fields");
  const boxFisico = document.getElementById("fornecedor-fisico-fields");

  function abrirModalFornecedor() {
    if (modalOverlayFornecedor) {
      modalOverlayFornecedor.classList.add("open");
    }
  }

  function fecharModalFornecedor() {
    if (modalOverlayFornecedor) {
      modalOverlayFornecedor.classList.remove("open");
    }
  }

  if (fabAddFornecedor) {
    fabAddFornecedor.addEventListener("click", abrirModalFornecedor);
  }

  if (modalCloseFornecedor) {
    modalCloseFornecedor.addEventListener("click", fecharModalFornecedor);
  }

  if (modalOverlayFornecedor && modalBoxFornecedor) {
    modalOverlayFornecedor.addEventListener("click", (e) => {
      if (e.target === modalOverlayFornecedor) fecharModalFornecedor();
    });
    modalBoxFornecedor.addEventListener("click", (e) => e.stopPropagation());
  }

  function atualizarCamposFornecedor() {
    if (!selectTipoFornecedor || !boxInternet || !boxFisico) return;

    const tipo = selectTipoFornecedor.value;

    boxInternet.classList.remove("active");
    boxFisico.classList.remove("active");

    if (tipo === "internet") {
      boxInternet.classList.add("active");
    } else if (tipo === "fisico") {
      boxFisico.classList.add("active");
    }
  }

  if (selectTipoFornecedor) {
    selectTipoFornecedor.addEventListener("change", atualizarCamposFornecedor);
    atualizarCamposFornecedor();
  }

  if (formFornecedor) {
  formFornecedor.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("fornecedor-nome").value.trim();
    const tipo = selectTipoFornecedor ? selectTipoFornecedor.value : "";

    // campos extras
    let plataforma = "";
    let cidadeInt  = "";
    let estadoInt  = "";
    let contato    = "";
    let endereco   = "";
    let cidade     = "";
    let estado     = "";

    if (tipo === "internet") {
      plataforma = document.getElementById("fornecedor-plataforma")?.value.trim() || "";
      cidadeInt  = document.getElementById("fornecedor-cidade-int")?.value.trim()  || "";
      estadoInt  = document.getElementById("fornecedor-estado-int")?.value.trim()  || "";
    } else if (tipo === "fisico") {
      contato  = document.getElementById("fornecedor-contato")?.value.trim() || "";
      endereco = document.getElementById("fornecedor-endereco")?.value.trim() || "";
      cidade   = document.getElementById("fornecedor-cidade")?.value.trim()   || "";
      estado   = document.getElementById("fornecedor-estado")?.value.trim()   || "";
    }

    listaFornecedores.push({
      nome,
      tipo,         // "internet" ou "fisico"
      plataforma,   // se internet
      cidadeInt,
      estadoInt,
      contato,      // se físico
      endereco,
      cidade,
      estado
    });

    renderFornecedores();
    formFornecedor.reset();
    atualizarCamposFornecedor();
    fecharModalFornecedor();
  });
}


  // ----- MODAL DE DETALHES DO FORNECEDOR -----
  const detalheOverlayFornecedor = document.querySelector(".fornecedor-detalhe-overlay");
  const detalheModalFornecedor = document.querySelector(".fornecedor-detalhe-modal");
  const btnFornecedorDetalheClose = document.querySelector(".fornecedor-detalhe-close");
  const inputDetalheFornecedorNome = document.getElementById("detalhe-fornecedor-nome");
  const btnFornecedorDetalheEditar = document.getElementById("fornecedor-detalhe-editar");
  const btnFornecedorDetalheSalvar = document.getElementById("fornecedor-detalhe-salvar");
  // novos campos do detalhe de fornecedor
const inputDetalheFornecedorTipo        = document.getElementById("detalhe-fornecedor-tipo");
const boxDetalheFornecedorFisico        = document.getElementById("detalhe-fornecedor-fisico");
const boxDetalheFornecedorInternet      = document.getElementById("detalhe-fornecedor-internet");

function atualizarBlocosDetalheFornecedor(tipo) {
  if (boxDetalheFornecedorFisico) {
    boxDetalheFornecedorFisico.style.display = (tipo === "fisico") ? "block" : "none";
  }
  if (boxDetalheFornecedorInternet) {
    boxDetalheFornecedorInternet.style.display = (tipo === "internet") ? "block" : "none";
  }
}

if (inputDetalheFornecedorTipo) {
  inputDetalheFornecedorTipo.addEventListener("change", () => {
    const tipo = inputDetalheFornecedorTipo.value;
    atualizarBlocosDetalheFornecedor(tipo);
  });
}



// físico
const inputDetalheFornecedorContato     = document.getElementById("detalhe-fornecedor-contato");
const inputDetalheFornecedorEndereco    = document.getElementById("detalhe-fornecedor-endereco");
const inputDetalheFornecedorCidade      = document.getElementById("detalhe-fornecedor-cidade");
const inputDetalheFornecedorEstado      = document.getElementById("detalhe-fornecedor-estado");

// internet
const inputDetalheFornecedorPlataforma  = document.getElementById("detalhe-fornecedor-plataforma");
const inputDetalheFornecedorCidadeInt   = document.getElementById("detalhe-fornecedor-cidade-int");
const inputDetalheFornecedorEstadoInt   = document.getElementById("detalhe-fornecedor-estado-int");


  function travarDetalheFornecedor(travar) {
  if (inputDetalheFornecedorNome)  inputDetalheFornecedorNome.disabled  = travar;
  if (inputDetalheFornecedorTipo)  inputDetalheFornecedorTipo.disabled  = travar; // agora pode editar no modo edição

  if (inputDetalheFornecedorContato)    inputDetalheFornecedorContato.disabled    = travar;
  if (inputDetalheFornecedorEndereco)   inputDetalheFornecedorEndereco.disabled   = travar;
  if (inputDetalheFornecedorCidade)     inputDetalheFornecedorCidade.disabled     = travar;
  if (inputDetalheFornecedorEstado)     inputDetalheFornecedorEstado.disabled     = travar;

  if (inputDetalheFornecedorPlataforma) inputDetalheFornecedorPlataforma.disabled = travar;
  if (inputDetalheFornecedorCidadeInt)  inputDetalheFornecedorCidadeInt.disabled  = travar;
  if (inputDetalheFornecedorEstadoInt)  inputDetalheFornecedorEstadoInt.disabled  = travar;

  if (btnFornecedorDetalheSalvar) btnFornecedorDetalheSalvar.disabled = travar;
}



  function abrirDetalheFornecedor(index) {
  const forn = listaFornecedores[index];
  if (!forn || !detalheOverlayFornecedor) return;

  fornecedorDetalheIndex = index;

  // nome
  if (inputDetalheFornecedorNome) {
    inputDetalheFornecedorNome.value = forn.nome || "";
  }

  // select de tipo (valor = "fisico" ou "internet")
  if (inputDetalheFornecedorTipo) {
    inputDetalheFornecedorTipo.value = forn.tipo || "";
  }

  // preencher campos conforme o tipo
  if (forn.tipo === "fisico") {
    if (inputDetalheFornecedorContato)  inputDetalheFornecedorContato.value  = forn.contato  || "";
    if (inputDetalheFornecedorEndereco) inputDetalheFornecedorEndereco.value = forn.endereco || "";
    if (inputDetalheFornecedorCidade)   inputDetalheFornecedorCidade.value   = forn.cidade   || "";
    if (inputDetalheFornecedorEstado)   inputDetalheFornecedorEstado.value   = forn.estado   || "";
  } else if (forn.tipo === "internet") {
    if (inputDetalheFornecedorPlataforma) inputDetalheFornecedorPlataforma.value = forn.plataforma || "";
    if (inputDetalheFornecedorCidadeInt)  inputDetalheFornecedorCidadeInt.value  = forn.cidadeInt  || "";
    if (inputDetalheFornecedorEstadoInt)  inputDetalheFornecedorEstadoInt.value  = forn.estadoInt  || "";
  }

  // mostra bloco certo
  atualizarBlocosDetalheFornecedor(forn.tipo || "");

  travarDetalheFornecedor(true);
  detalheOverlayFornecedor.classList.add("open");
}


  function fecharDetalheFornecedor() {
    if (detalheOverlayFornecedor) detalheOverlayFornecedor.classList.remove("open");
    fornecedorDetalheIndex = null;
  }

  if (btnFornecedorDetalheClose && detalheOverlayFornecedor && detalheModalFornecedor) {
    btnFornecedorDetalheClose.addEventListener("click", fecharDetalheFornecedor);
    detalheOverlayFornecedor.addEventListener("click", (e) => {
      if (e.target === detalheOverlayFornecedor) fecharDetalheFornecedor();
    });
    detalheModalFornecedor.addEventListener("click", (e) => e.stopPropagation());
  }

  if (btnFornecedorDetalheEditar) {
    btnFornecedorDetalheEditar.addEventListener("click", () => {
      travarDetalheFornecedor(false);
      if (inputDetalheFornecedorNome) inputDetalheFornecedorNome.focus();
    });
  }

  if (btnFornecedorDetalheSalvar) {
  btnFornecedorDetalheSalvar.addEventListener("click", () => {
    if (fornecedorDetalheIndex === null) return;
    const forn = listaFornecedores[fornecedorDetalheIndex];
    if (!forn) return;

    // nome
    forn.nome = (inputDetalheFornecedorNome?.value || "").trim();

    // tipo selecionado no select
    const tipoSelecionado = (inputDetalheFornecedorTipo?.value || "").trim();
    forn.tipo = tipoSelecionado;

    // zera tudo antes de regravar (pra não ficar lixo)
    forn.contato = "";
    forn.endereco = "";
    forn.cidade = "";
    forn.estado = "";
    forn.plataforma = "";
    forn.cidadeInt = "";
    forn.estadoInt = "";

    if (tipoSelecionado === "fisico") {
      forn.contato  = (inputDetalheFornecedorContato?.value || "").trim();
      forn.endereco = (inputDetalheFornecedorEndereco?.value || "").trim();
      forn.cidade   = (inputDetalheFornecedorCidade?.value || "").trim();
      forn.estado   = (inputDetalheFornecedorEstado?.value || "").trim();
    } else if (tipoSelecionado === "internet") {
      forn.plataforma = (inputDetalheFornecedorPlataforma?.value || "").trim();
      forn.cidadeInt  = (inputDetalheFornecedorCidadeInt?.value || "").trim();
      forn.estadoInt  = (inputDetalheFornecedorEstadoInt?.value || "").trim();
    }

    renderFornecedores();
    fecharDetalheFornecedor();
  });
}

  // ===============================
  // TELA DE NOVO PEDIDO
  // ===============================

  // --- Cliente ---
  const pedidoClienteInput = document.getElementById("pedido-cliente-busca");
  const pedidoClienteSugestoes = document.getElementById("pedido-cliente-sugestoes");
  const pedidoClienteResumo = document.getElementById("pedido-cliente-resumo");
  let pedidoClienteSelecionado = null;

  function limparResumoCliente() {
    pedidoClienteSelecionado = null;
    if (pedidoClienteResumo) {
      pedidoClienteResumo.classList.add("vazio");
      pedidoClienteResumo.innerHTML = "<p>Nenhum cliente selecionado.</p>";
    }
  }

  function preencherResumoCliente(cli) {
    if (!pedidoClienteResumo || !cli) return;

    pedidoClienteResumo.classList.remove("vazio");

    const fotoStyle = cli.foto ? `style="background-image:url(${cli.foto})"` : "";

    pedidoClienteResumo.innerHTML = `
      <div class="pedido-cliente-avatar" ${fotoStyle}></div>
      <div class="pedido-cliente-dados">
        <strong>${cli.nome || ""}</strong>
        <span>${cli.telefone || ""}</span>
        <span>${cli.endereco || ""}</span>
        <span>${cli.cidade || ""} ${cli.estado || ""}</span>
      </div>
    `;
  }

  function atualizarSugestoesClientes() {
    if (!pedidoClienteSugestoes) return;
    pedidoClienteSugestoes.innerHTML = "";

    const termo = (pedidoClienteInput?.value || "").trim().toLowerCase();
    if (!termo) {
      return;
    }

    const encontrados = listaClientes.filter((cli) =>
      cli.nome && cli.nome.toLowerCase().includes(termo)
    );

    encontrados.forEach((cli) => {
      const item = document.createElement("div");
      item.classList.add("pedido-sugestao-item");
      item.textContent = cli.nome;
      item.addEventListener("click", () => {
        pedidoClienteSelecionado = cli;
        if (pedidoClienteInput) pedidoClienteInput.value = cli.nome;
        pedidoClienteSugestoes.innerHTML = "";
        preencherResumoCliente(cli);
      });
      pedidoClienteSugestoes.appendChild(item);
    });
  }

  if (pedidoClienteInput) {
    pedidoClienteInput.addEventListener("input", atualizarSugestoesClientes);
    pedidoClienteInput.addEventListener("focus", atualizarSugestoesClientes);
  }

  // --- Produtos do pedido ---
  const pedidoProdutosContainer = document.getElementById("pedido-produtos-container");
  const pedidoAddProdutoBtn = document.getElementById("pedido-add-produto");

  // =========================
// ACRÉSCIMOS / DESCONTOS
// =========================

let pedidoAjustes = [];

const pedidoAjustesContainer = document.getElementById("pedido-ajustes-container");
const pedidoAddAjusteBtn     = document.getElementById("pedido-add-ajuste");

const pedidoResumoAcrescimosEl = document.getElementById("pedido-resumo-acrescimos");
const pedidoResumoDescontosEl  = document.getElementById("pedido-resumo-descontos");
const pedidoResumoCustoEl      = document.getElementById("pedido-resumo-custo");
const pedidoResumoVendaEl      = document.getElementById("pedido-resumo-venda");
const pedidoResumoLucroEl      = document.getElementById("pedido-resumo-lucro");

// formata número em R$ X,XX
function formatarBRL(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

// lê um elemento tipo "R$ 123,45" e transforma em número 123.45
function lerValorDoElemento(el) {
  if (!el) return 0;
  const txt = el.textContent || "";
  const limpo = txt.replace(/[^\d,,-]/g, "").replace(".", "").replace(",", ".");
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
}

// cria uma linha de ajuste na tela
function criarLinhaAjuste(ajuste) {
  const row = document.createElement("div");
  row.className = "pedido-ajuste-item";
  row.dataset.id = ajuste.id;

  // ORDEM: [tipo] [valor] [descrição] + botão de remover
  row.innerHTML = `
    <div class="field-group pedido-ajuste-tipo-group">
      <select class="pedido-ajuste-tipo">
        <option value="acrescimo" ${ajuste.tipo === "acrescimo" ? "selected" : ""}>
          Acréscimo
        </option>
        <option value="desconto" ${ajuste.tipo === "desconto" ? "selected" : ""}>
          Desconto
        </option>
      </select>
    </div>

    <div class="field-group pedido-ajuste-valor-group">
      <input
        type="number"
        step="0.01"
        min="0"
        class="pedido-ajuste-valor"
        placeholder="R$"
        value="${ajuste.valor || ""}"
      >
    </div>

    <div class="field-group pedido-ajuste-descricao-group">
      <input
        type="text"
        class="pedido-ajuste-descricao"
        placeholder="Ex.: Frete, taxa extra, cupom..."
        value="${ajuste.descricao || ""}"
      >
    </div>

    <button
      type="button"
      class="pedido-ajuste-remove"
      title="Remover ajuste"
    >
      −
    </button>
  `;

  // listeners de mudança
  const descInput  = row.querySelector(".pedido-ajuste-descricao");
  const tipoSelect = row.querySelector(".pedido-ajuste-tipo");
  const valorInput = row.querySelector(".pedido-ajuste-valor");
   const removerBtn = row.querySelector(".pedido-ajuste-remove");


  descInput.addEventListener("input", () => {
    ajuste.descricao = descInput.value.trim();
  });

  tipoSelect.addEventListener("change", () => {
    ajuste.tipo = tipoSelect.value;
    atualizarResumoComAjustes();
  });

  valorInput.addEventListener("input", () => {
    const v = parseFloat(valorInput.value.replace(",", ".")) || 0;
    ajuste.valor = v;
    atualizarResumoComAjustes();
  });

  removerBtn.addEventListener("click", () => {
    pedidoAjustes = pedidoAjustes.filter(a => a.id !== ajuste.id);
    renderizarAjustes();
    atualizarResumoComAjustes();
  });

  return row;
}

// redesenha todas as linhas de ajustes
function renderizarAjustes() {
  pedidoAjustesContainer.innerHTML = "";

  if (!pedidoAjustes.length) {
    const vazio = document.createElement("div");
    vazio.className = "pedido-ajustes-empty";
    vazio.textContent = "Nenhum ajuste adicionado.";
    pedidoAjustesContainer.appendChild(vazio);
    return;
  }

  pedidoAjustes.forEach(ajuste => {
    const row = criarLinhaAjuste(ajuste);
    pedidoAjustesContainer.appendChild(row);
  });
}

// soma acréscimos/descontos e atualiza resumo
function atualizarResumoComAjustes() {
  const custoBase  = lerValorDoElemento(pedidoResumoCustoEl);
  const vendaBase  = lerValorDoElemento(pedidoResumoVendaEl);

  let totalAcrescimos = 0;
  let totalDescontos  = 0;

  pedidoAjustes.forEach(a => {
    if (!a.valor) return;
    if (a.tipo === "acrescimo") {
      totalAcrescimos += a.valor;
    } else {
      totalDescontos += a.valor;
    }
  });

  // escreve nas linhas novas
  pedidoResumoAcrescimosEl.textContent = formatarBRL(totalAcrescimos);
  pedidoResumoDescontosEl.textContent  = formatarBRL(totalDescontos);

  // lucro = (venda + acresc - desc) - custo
  const vendaAjustada = vendaBase + totalAcrescimos - totalDescontos;
  const lucro = vendaAjustada - custoBase;
  const margem = vendaAjustada > 0 ? (lucro / vendaAjustada) * 100 : 0;

  pedidoResumoLucroEl.textContent =
    `${formatarBRL(lucro)} (${margem.toFixed(0)}%)`;
}

// clique no botão "+ Acréscimo / Desconto"
if (pedidoAddAjusteBtn) {
  pedidoAddAjusteBtn.addEventListener("click", () => {
    const novo = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      descricao: "",
      tipo: "acrescimo",
      valor: 0
    };
    pedidoAjustes.push(novo);
    renderizarAjustes();
    atualizarResumoComAjustes();
  });
}


  const pedidoResumoCusto = document.getElementById("pedido-resumo-custo");
  const pedidoResumoVenda = document.getElementById("pedido-resumo-venda");
  const pedidoResumoLucro = document.getElementById("pedido-resumo-lucro");

  function criarBlocoProdutoPedido() {
    if (!pedidoProdutosContainer) return;

    const bloco = document.createElement("div");
    bloco.classList.add("pedido-produto-bloco");

    bloco.innerHTML = `
      <div class="pedido-produto-header">
        <div class="field-group">
          <label>Produto</label>
          <input type="text" class="pedido-produto-busca" placeholder="Buscar produto">
          <div class="pedido-sugestoes pedido-sugestoes-produto"></div>
        </div>

        <div class="pedido-produto-preco">
          Valor de venda: <strong class="pedido-produto-preco-valor">R$ 0,00</strong>
        </div>

        <button type="button" class="pedido-produto-remove" title="Remover produto">
          –
        </button>
      </div>

      <div class="pedido-produto-mps vazio">
        <table>
          <thead>
            <tr>
              <th>Matéria-prima</th>
              <th>Unidade</th>
              <th>Qtd</th>
              <th>Valor</th>
              <th>Estoque</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" style="text-align:center;color:#999;padding:6px 0;">
                Nenhum produto selecionado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    pedidoProdutosContainer.appendChild(bloco);

    const inputBusca = bloco.querySelector(".pedido-produto-busca");
    const divSugestoes = bloco.querySelector(".pedido-sugestoes-produto");
    const precoSpan = bloco.querySelector(".pedido-produto-preco-valor");
    const tabelaMps = bloco.querySelector(".pedido-produto-mps tbody");
    const btnRemove = bloco.querySelector(".pedido-produto-remove");

    bloco.dataset.produtoIndex = ""; // ainda não selecionado

    function preencherProduto(prod, indexLista) {
      bloco.dataset.produtoIndex = String(indexLista);

      if (precoSpan) {
        const num = lerNumero(prod.preco);
        precoSpan.textContent = formatarReal(num);
      }

      if (tabelaMps) {
        tabelaMps.innerHTML = "";

        if (prod.materiasPrimas && prod.materiasPrimas.length > 0) {
          prod.materiasPrimas.forEach((mp) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${mp.nome || ""}</td>
              <td>${mp.unidade || ""}</td>
              <td>${mp.quantidade ?? ""}</td>
              <td>${formatarReal(lerNumero(mp.valor))}</td>
              <td>—</td>
            `;
            tabelaMps.appendChild(tr);
          });
        } else {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td colspan="5" style="text-align:center;color:#999;padding:6px 0;">
              Produto sem matérias-primas cadastradas.
            </td>
          `;
          tabelaMps.appendChild(tr);
        }
      }

      bloco.querySelector(".pedido-produto-mps")?.classList.remove("vazio");
      recalcularResumoPedido();
    }

    function atualizarSugestoesProdutos() {
      if (!divSugestoes) return;
      divSugestoes.innerHTML = "";

      const termo = (inputBusca?.value || "").trim().toLowerCase();
      if (!termo) return;

      const encontrados = listaProdutos.filter((p) =>
        p.nome && p.nome.toLowerCase().includes(termo)
      );

      encontrados.forEach((prod) => {
        const indexLista = listaProdutos.indexOf(prod);

        const item = document.createElement("div");
        item.classList.add("pedido-sugestao-item");
        item.textContent = prod.nome;
        item.addEventListener("click", () => {
          if (inputBusca) inputBusca.value = prod.nome;
          divSugestoes.innerHTML = "";
          preencherProduto(prod, indexLista);
        });
        divSugestoes.appendChild(item);
      });
    }

    if (inputBusca) {
      inputBusca.addEventListener("input", atualizarSugestoesProdutos);
      inputBusca.addEventListener("focus", atualizarSugestoesProdutos);
    }

    if (btnRemove) {
      btnRemove.addEventListener("click", () => {
        bloco.remove();
        recalcularResumoPedido();
      });
    }
  }

  function recalcularResumoPedido() {
    let custoTotal = 0;
    let vendaTotal = 0;

    if (!pedidoProdutosContainer) return;

    const blocos = pedidoProdutosContainer.querySelectorAll(".pedido-produto-bloco");

    blocos.forEach((bloco) => {
      const idxStr = bloco.dataset.produtoIndex;
      if (!idxStr) return;

      const idx = Number(idxStr);
      const prod = listaProdutos[idx];
      if (!prod) return;

      const custo = typeof prod.custoTotal === "number" ? prod.custoTotal : 0;
      const precoNumero = lerNumero(prod.preco);

      custoTotal += custo;
      vendaTotal += precoNumero;
    });

    const lucro = vendaTotal - custoTotal;
    const perc = vendaTotal > 0 ? (lucro / vendaTotal) * 100 : 0;

    if (pedidoResumoCusto) {
      pedidoResumoCusto.textContent = formatarReal(custoTotal);
      pedidoResumoCusto.style.color = "#cc3b3b";
    }

    if (pedidoResumoVenda) {
      pedidoResumoVenda.textContent = formatarReal(vendaTotal);
      pedidoResumoVenda.style.color = "#333";
    }

    if (pedidoResumoLucro) {
      pedidoResumoLucro.textContent =
        `${formatarReal(lucro)} (${perc.toFixed(1).replace(".", ",")}%)`;

      let cor;
      if (perc < 50) cor = "#cc3b3b";
      else if (perc < 70) cor = "#c9a000";
      else cor = "#2f9d4d";

      pedidoResumoLucro.style.color = cor;
    }
  }

  if (pedidoAddProdutoBtn) {
    pedidoAddProdutoBtn.addEventListener("click", () => {
      criarBlocoProdutoPedido();
    });
    // já começa com um bloco
    criarBlocoProdutoPedido();
  }

  // --- Botões de ação (simples, por enquanto) ---
  const pedidoBtnCancelar = document.getElementById("pedido-btn-cancelar");
  const pedidoBtnLancar = document.getElementById("pedido-btn-lancar");
  const pedidoBtnPrintCliente = document.getElementById("pedido-btn-imprimir-cliente");
  const pedidoBtnPrintLoja = document.getElementById("pedido-btn-imprimir-loja");

  function limparTelaPedido() {
    if (pedidoClienteInput) pedidoClienteInput.value = "";
    if (pedidoClienteSugestoes) pedidoClienteSugestoes.innerHTML = "";
    limparResumoCliente();

    if (pedidoProdutosContainer) {
      pedidoProdutosContainer.innerHTML = "";
      criarBlocoProdutoPedido();
    }
    recalcularResumoPedido();
  }

  if (pedidoBtnCancelar) {
    pedidoBtnCancelar.addEventListener("click", () => {
      limparTelaPedido();
    });
  }

  if (pedidoBtnLancar) {
    pedidoBtnLancar.addEventListener("click", () => {
      alert("Pedido lançado (por enquanto apenas em memória).");
    });
  }

  // versões bem simples de impressão (HTML em nova janela)
  function imprimirConteudoPedido(modoLoja) {
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;

    const cliente = pedidoClienteSelecionado;
    const blocos = pedidoProdutosContainer
      ? Array.from(pedidoProdutosContainer.querySelectorAll(".pedido-produto-bloco"))
      : [];

    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 16px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          h2 { font-size: 16px; margin: 16px 0 6px; }
          table { border-collapse: collapse; width: 100%; font-size: 13px; }
          th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Pedido</h1>
    `;

    if (cliente) {
      html += `
        <h2>Cliente</h2>
        <p><strong>${cliente.nome || ""}</strong></p>
        <p>${cliente.telefone || ""}</p>
        <p>${cliente.endereco || ""}</p>
        <p>${cliente.cidade || ""} ${cliente.estado || ""}</p>
        <hr>
      `;
    }

    html += `<h2>Produtos</h2>`;

    blocos.forEach((bloco) => {
      const idxStr = bloco.dataset.produtoIndex;
      if (!idxStr) return;
      const idx = Number(idxStr);
      const prod = listaProdutos[idx];
      if (!prod) return;

      const precoNumero = lerNumero(prod.preco);
      html += `<p><strong>${prod.nome || ""}</strong> — Valor: ${formatarReal(precoNumero)}</p>`;

      if (modoLoja && prod.materiasPrimas && prod.materiasPrimas.length > 0) {
        html += `<table><thead><tr>
          <th>Matéria-prima</th>
          <th>Unidade</th>
          <th>Qtd</th>
          <th>Valor</th>
        </tr></thead><tbody>`;

        prod.materiasPrimas.forEach((mp) => {
          html += `
            <tr>
              <td>${mp.nome || ""}</td>
              <td>${mp.unidade || ""}</td>
              <td>${mp.quantidade ?? ""}</td>
              <td>${formatarReal(lerNumero(mp.valor))}</td>
            </tr>
          `;
        });

        html += `</tbody></table>`;
      }
    });

    const custoText = pedidoResumoCusto ? pedidoResumoCusto.textContent : "";
    const vendaText = pedidoResumoVenda ? pedidoResumoVenda.textContent : "";
    const lucroText = pedidoResumoLucro ? pedidoResumoLucro.textContent : "";

    html += `
      <hr>
      <h2>Resumo</h2>
      <p>Custo total: ${custoText}</p>
      <p>Valor total: ${vendaText}</p>
      <p>Lucro estimado: ${lucroText}</p>
    `;

    html += `
      </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  if (pedidoBtnPrintCliente) {
    pedidoBtnPrintCliente.addEventListener("click", () => {
      imprimirConteudoPedido(false);
    });
  }

  if (pedidoBtnPrintLoja) {
    pedidoBtnPrintLoja.addEventListener("click", () => {
      imprimirConteudoPedido(true);
    });
  }



});

