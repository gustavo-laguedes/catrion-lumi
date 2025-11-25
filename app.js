// ==============================
// SISTEMA DE VIEWS / NAVEGAÇÃO
// ==============================
const views = document.querySelectorAll(".view");
const header = document.getElementById("app-header");
const bottomNav = document.getElementById("bottom-nav");

function showView(name) {
  views.forEach(v => {
    v.classList.toggle("active", v.dataset.view === name);
  });

  const authViews = ["login", "register"];
  const isAuth = authViews.includes(name);

  // Header e nav só aparecem depois do login
  if (isAuth) {
    header.classList.remove("visible");
    bottomNav.classList.remove("visible");
  } else {
    header.classList.add("visible");
    bottomNav.classList.add("visible");
  }

  // Ativa item da bottom-nav
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.targetView === name);
  });
}

// =================================
// LOGIN / CADASTRO (Troca de telas)
// =================================
document.getElementById("link-cadastro")?.addEventListener("click", () => {
  showView("register");
});

document.getElementById("link-voltar-login")?.addEventListener("click", () => {
  showView("login");
});

// Botão login (ainda sem validação real)
document.getElementById("btn-login")?.addEventListener("click", () => {
  showView("home");
});

// Botão registrar (volta ao login)
document.getElementById("btn-registrar")?.addEventListener("click", () => {
  showView("login");
});

// ==============================
// SHOW/HIDE SENHA (olhinho 👁)
// ==============================
document.querySelectorAll(".toggle-pass").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    target.type = target.type === "password" ? "text" : "password";
  });
});

// =======================================================
// BOTÕES COM data-target-view → troca a view instantânea
// =======================================================
document.querySelectorAll("[data-target-view]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.targetView;
    showView(target);
  });
});

// ======================
// BOTTOM NAVIGATION BAR
// ======================
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.targetView;
    showView(target);
  });
});

// ==========================
// E-MAIL FAKE NAS CONFIGS
// ==========================
const emailConfig = document.getElementById("config-email");
if (emailConfig) {
  emailConfig.textContent = "email@exemplo.com";
}

// ==========================
// AGENDA (placeholder leve)
// ==========================
const agendaGrid = document.getElementById("agenda-grid");
const agendaLabel = document.getElementById("agenda-month-label");
const agendaPrev = document.getElementById("agenda-prev");
const agendaNext = document.getElementById("agenda-next");

const monthNames = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

let today = new Date();
let calMonth = today.getMonth();
let calYear = today.getFullYear();

function renderAgenda() {
  if (!agendaGrid) return;

  agendaGrid.innerHTML = "";
  const firstDay = new Date(calYear, calMonth, 1);
  const startingDay = firstDay.getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  agendaLabel.textContent = `${monthNames[calMonth]} de ${calYear}`;

  for (let i = 0; i < 42; i++) {
    const cell = document.createElement("div");
    cell.classList.add("agenda-day");

    let day, inMonth = true;

    if (i < startingDay) {
      day = prevMonthDays - (startingDay - 1 - i);
      inMonth = false;
    } else if (i >= startingDay + daysInMonth) {
      day = i - (startingDay + daysInMonth) + 1;
      inMonth = false;
    } else {
      day = i - startingDay + 1;
    }

    cell.textContent = day;

    if (!inMonth) cell.classList.add("inactive");

    agendaGrid.appendChild(cell);
  }
}

agendaPrev?.addEventListener("click", () => {
  calMonth--;
  if (calMonth < 0) {
    calMonth = 11;
    calYear--;
  }
  renderAgenda();
});

agendaNext?.addEventListener("click", () => {
  calMonth++;
  if (calMonth > 11) {
    calMonth = 0;
    calYear++;
  }
  renderAgenda();
});

// Render inicial
renderAgenda();
