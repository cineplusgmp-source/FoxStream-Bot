// URL de tu backend (Apps Script con /exec al final)
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzOTYcuXAlT3ke7GqxpO7a6w-T4JShnHT16_bVmE-rDmijXNkgB_7VktHPQYzZeP9Y/exec";

// DOM
const chatBox = document.getElementById("chat-box");
const input   = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Pintar mensajes
function addMessage(text, sender = "bot", extraClass = "") {
  const div = document.createElement("div");
  div.className = `msg msg--${sender} ${extraClass}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Envío al backend
async function sendMessage() {
  const text = (input.value || "").trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  try {
    const res  = await fetch(`${BACKEND_URL}?q=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (data.ok) {
      addMessage(data.message || "✅ Respuesta recibida.", "bot", "msg--ok");
    } else {
      addMessage(`❌ ${data.message || "Error desconocido"}`, "bot", "msg--error");
    }
  } catch (err) {
    console.error(err);
    addMessage("⚠️ Error de conexión con el servidor.", "bot", "msg--error");
  }
}

// Eventos
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
