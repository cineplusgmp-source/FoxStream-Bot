// URL de tu backend (Apps Script con /exec al final)
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzOTYcuXAlT3ke7GqxpO7a6w-T4JShnHT16_bVmE-rDmijXNkgB_7VktHPQYzZeP9Y/exec";

// Elementos del DOM
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Función para mostrar mensajes
function addMessage(text, sender = "bot") {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight; // autoscroll
}

// Enviar mensaje al backend
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user"); // mostrar lo que escribió el cliente
  input.value = ""; // limpiar caja de texto

  try {
    const res = await fetch(`${BACKEND_URL}?q=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (data.ok) {
      addMessage(data.message || "✅ Respuesta recibida.", "bot");
    } else {
      addMessage(`❌ Error: ${data.message}`, "bot");
    }
  } catch (e) {
    addMessage("⚠️ Error: no hay conexión con el servidor.", "bot");
    console.error(e);
  }
}

// Click en botón
sendBtn.addEventListener("click", sendMessage);

// Enter para enviar
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
