// === Configura tu backend aquí ===
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzOTYcuXAlT3ke7GqxpO7a6w-T4JShnHT16_bVmE-rDmijXNkgB_7VktHPQYzZeP9Y/exec";

// Referencias al DOM
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Función para agregar mensajes al chat
function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
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
      addMessage(`❌ Error: ${data.message}`, "bot");
    }
  } catch (e) {
    addMessage("⚠️ Error: no hay conexión con el servidor.", "bot");
    console.error(e);
  }
}

// Evento para botón
sendBtn.addEventListener("click", sendMessage);

// Evento para Enter
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
