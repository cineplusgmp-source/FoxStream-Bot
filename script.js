// Conexión con el backend (Google Apps Script)
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzOTYcuXAlT3ke7GqxpO7a6w-T4JShnHT16_bVmE-rDmijXNkgB_7VktHPQYzZeP9Y/exec";

const chatBox = document.querySelector("#chat");
const input = document.querySelector("#user-input");
const sendBtn = document.querySelector("#send-btn");

// Función para agregar mensajes en pantalla
function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "bot" ? "msg bot" : "msg user";
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enviar mensaje al backend
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  try {
    const res = await fetch(`${BACKEND_URL}?q=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (data.ok) {
      addMessage(data.message || "✅ Respuesta recibida", "bot");
    } else {
      addMessage("❌ Error: " + data.message, "bot");
    }
  } catch (e) {
    addMessage("⚠️ Error de conexión con el servidor", "bot");
    console.error(e);
  }
}

// Botón enviar
sendBtn.addEventListener("click", sendMessage);

// Enter para enviar
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Mensaje inicial
addMessage("👋 ¡Hola! Escribe tu número de teléfono para validar tu acceso.");
