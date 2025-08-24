// 1) Pega aquí la URL del backend CONVERSACIONAL v0.8 (la que responde ok:true con ?ping=1)
const BACKEND_URL = "PEGAR_AQUI_TU_URL_DEL_BACKEND_V08";

// 2) DOM
const chatBox = document.getElementById("chat-box");
const input   = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// 3) Utilidad para añadir mensajes
function addMessage(text, who = "bot", extra = "") {
  const div = document.createElement("div");
  div.className = `msg msg--${who} ${extra}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 4) Envío al backend (conv ersacional v0.8 usa ?q=)
async function sendMessage() {
  const text = (input.value || "").trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";

  try {
    const res  = await fetch(`${BACKEND_URL}?q=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (data && data.ok) {
      addMessage(data.message || "✅ Listo.", "bot", "msg--ok");
    } else {
      addMessage(`❌ ${data?.message || "Error"}`, "bot", "msg--error");
    }
  } catch (e) {
    console.error(e);
    addMessage("⚠️ Error de conexión con el servidor.", "bot", "msg--error");
  }
}

// 5) Eventos (clic y Enter)
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
