// ====== CONFIG ======
const BACKEND_URL =
  "PON_AQUI_TU_URL_GOOGLEUSERCONTENT"; // <- REEMPLAZA ESTA LÍNEA (la que te dio ok:true,version:"0.8")

const CLIENTS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWOkT2EnwWDIEUipuh_CN603Qm9KGk_N1qJrzP7Hy7b-wRrr0De06fE_8WAeUaywhGs2psz8c_fVIj/pub?gid=0&single=true&output=csv"; // <- tu CSV publicado

// ====== ESTADO SENCILLO ======
const state = {
  phase: "ask_phone", // ask_phone -> menu -> ask_email -> waiting_backend
  phoneOk: false,
  action: null, // 1,2,3
  numbers: new Set(), // cache de teléfonos permitidos
};

// ====== HELPERS UI ======
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const composer = document.getElementById("composer");

function addMessage(text, who = "bot") {
  const el = document.createElement("div");
  el.className = `msg msg--${who}`;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function addButtons(options = []) {
  const wrap = document.createElement("div");
  wrap.className = "msg msg--bot";
  const group = document.createElement("div");
  group.style.display = "flex";
  group.style.gap = "8px";
  group.style.flexWrap = "wrap";
  options.forEach((opt) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    b.textContent = opt.label;
    b.addEventListener("click", () => opt.onClick());
    group.appendChild(b);
  });
  wrap.appendChild(group);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function normalizePhone(raw) {
  const d = String(raw || "").replace(/\D/g, ""); // solo dígitos
  if (!d) return "";
  // nos quedamos con los últimos 8-9 dígitos para tolerar el código de país
  if (d.length >= 9) return d.slice(-9);
  if (d.length >= 8) return d.slice(-8);
  return d;
}

// ====== CARGA NÚMEROS PERMITIDOS (CSV) ======
async function loadNumbers() {
  try {
    const res = await fetch(CLIENTS_CSV, { cache: "no-store" });
    const txt = await res.text();
    // Asumimos cabecera: Nombre,Teléfono
    // Tomamos la segunda columna (teléfono)
    const lines = txt.split(/\r?\n/);
    lines.shift(); // header
    lines.forEach((row) => {
      const cols = row.split(",");
      if (cols.length >= 2) {
        const n = normalizePhone(cols[1]);
        if (n) state.numbers.add(n);
      }
    });
  } catch {
    // si falla, dejamos el set vacío y permitirá ninguno
  }
}

// ====== INICIO ======
function start() {
  addMessage("👋 ¡Hola! Escribe tu número de teléfono para validar tu acceso.");
  input.placeholder = 'Escribe tu número de teléfono (solo dígitos)';
  input.value = "";
  input.focus();
  state.phase = "ask_phone";
}

// ====== MENÚ ======
function showMenu() {
  addMessage("Número verificado. ¡Bienvenido!");
  addMessage("Selecciona una opción:");
  addButtons([
    {
      label: "1) Código de acceso temporal",
      onClick: () => selectAction(1),
    },
    { label: "2) Actualizar tu Hogar", onClick: () => selectAction(2) },
    { label: "3) Nueva solicitud de inicio (TV)", onClick: () => selectAction(3) },
  ]);
  state.phase = "menu";
}

function selectAction(n) {
  state.action = String(n);
  addMessage(String(n), "user");
  askEmail();
}

function askEmail() {
  addMessage("Por favor, ingresa tu correo sin espacios:");
  state.phase = "ask_email";
  input.placeholder = "tucorreo@ejemplo.com";
  input.value = "";
  input.focus();
}

// ====== LLAMADA AL BACKEND ======
async function queryBackend(type, email) {
  // BACKEND_URL suele incluir '?user_content_key=...&lib=...', así que usamos '&'
  const sep = BACKEND_URL.includes("?") ? "&" : "?";
  const url = `${BACKEND_URL}${sep}type=${encodeURIComponent(
    type
  )}&email=${encodeURIComponent(email)}`;

  // mostramos un “pensando…”
  addMessage("⏳ Consultando tu correo...", "bot");

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    // Si el backend devuelve { ok:false, message:"..." } lo mostramos tal cual
    if (!data || data.ok === false) {
      addMessage(
        `Error: ${data?.message || "No se pudo obtener respuesta del servidor."}`
      );
      addMessage('Escribe "hola" para volver al menú principal.');
      state.phase = "menu";
      return;
    }

    // RESPUESTAS ESPERADAS
    if (type === "1") {
      // Código de acceso temporal
      if (data.kind === "code" && data.code) {
        addMessage(`Tu código es: ${data.code}\nTienes 15 minutos para ingresarlo.`);
      } else {
        addMessage(
          data.message ||
            "No se encontró ningún código temporal en el último correo."
        );
      }
    } else if (type === "2" || type === "3") {
      // Enlace actualizar hogar / nuova solicitud
      if (data.kind === "link" && data.link) {
        addMessage(`Tu enlace es: ${data.link}\nTienes 15 minutos para ingresarlo.`);
      } else {
        addMessage(
          data.message ||
            "No se encontró ningún enlace en el último correo."
        );
      }
    } else {
      addMessage("Error: Parámetro 'type' inválido. Usa 1, 2 o 3.");
    }

    addMessage('Escribe "hola" para volver al menú principal.');
    state.phase = "menu";
  } catch (e) {
    addMessage("⚠️ Error consultando el servidor.");
    state.phase = "menu";
  }
}

// ====== ENVÍO MENSAJE ======
async function handleSend(e) {
  e?.preventDefault?.();

  const text = input.value.trim();
  if (!text) return;

  // Mostrar lo que escribió el usuario
  addMessage(text, "user");
  input.value = "";

  // reset rápido con "hola"
  if (/^hola$/i.test(text)) {
    start();
    return;
  }

  if (state.phase === "ask_phone") {
    const phone = normalizePhone(text);
    if (!phone || phone.length < 6) {
      addMessage("Por favor, escribe solo dígitos (mínimo 6).");
      return;
    }
    // validación contra CSV
    if (!state.numbers.size) {
      await loadNumbers();
    }
    const exists = [...state.numbers].some((n) => n.endsWith(phone));
    if (!exists) {
      addMessage(
        "❌ Tu número no está registrado. Por favor, contáctate con el administrador."
      );
      addMessage('Escribe "hola" para volver al menú principal.');
      state.phase = "menu";
      return;
    }
    state.phoneOk = true;
    showMenu();
    return;
  }

  if (state.phase === "menu") {
    // el usuario puede escribir 1 / 2 / 3 en vez de tocar botón
    if (/^[123]$/.test(text)) {
      selectAction(Number(text));
    } else {
      addMessage("Respuesta inválida. Elige 1, 2 o 3.");
    }
    return;
  }

  if (state.phase === "ask_email") {
    const email = text.toLowerCase();
    const ok =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/\s/.test(email || "");
    if (!ok) {
      addMessage("Formato de correo inválido. Inténtalo de nuevo.");
      return;
    }
    state.phase = "waiting_backend";
    await queryBackend(state.action, email);
    return;
  }
}

// ====== EVENTOS ======
composer.addEventListener("submit", handleSend);
sendBtn.addEventListener("click", handleSend);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend(e);
});

// ====== BOOT ======
start();
