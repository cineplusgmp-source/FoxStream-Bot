// ===============================
// Fox Stream Bot - script.js
// ===============================

let currentStep = "start";
let selectedOption = "";
let userPhone = "";
let userEmail = "";

// Aquí pones la URL de Apps Script (exec)
const API_BASE = "https://script.google.com/macros/s/AKfycbzOTYcuXAlT3ke7GqxpO7a6w-T4JShnHT16_bVmE-rDmijXNkgB_7VktHPQYzZeP9Y/exec";

// ===============================
// Función para mostrar mensajes
// ===============================
function addMessage(content, isUser = false) {
  const messagesContainer = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = isUser ? "user-message" : "bot-message";

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.innerHTML = content;

  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ===============================
// Flujo del bot
// ===============================
async function handleUserMessage(message) {
  if (currentStep === "start") {
    if (message.toLowerCase() === "/start" || message.toLowerCase() === "hola") {
      addMessage("👋 Hola, bienvenido a Fox Stream Bot<br><br>Selecciona una opción para continuar:<br><br>1️⃣ Código de acceso temporal<br>2️⃣ Actualizar tu Hogar<br>3️⃣ Nueva solicitud de inicio<br><br><em>Responde solo con el número de la opción que deseas.</em>");
      currentStep = "menu";
    } else {
      addMessage("Por favor escribe <b>/start</b> para comenzar.");
    }
    return;
  }

  if (currentStep === "menu") {
    if (["1", "2", "3"].includes(message)) {
      selectedOption = message;
      addMessage(`Has seleccionado la opción ${message}.`);
      addMessage("Por favor, ingresa tu número de teléfono sin espacios:");
      currentStep = "phone";
    } else {
      addMessage("❌ Opción inválida. Escribe 1, 2 o 3.");
    }
    return;
  }

  if (currentStep === "phone") {
    userPhone = message;
    addMessage("🔎 Validando tu número...");

    try {
      const res = await fetch(`${API_BASE}?action=validate-phone&phone=${userPhone}`);
      const data = await res.json();

      if (data.valid) {
        addMessage("✅ Número verificado. ¡Bienvenido!");
        addMessage("Ahora ingresa tu correo o elige activación por código de TV.");
        currentStep = "email_or_code";
      } else {
        addMessage("❌ Tu número no está registrado. Contacta con el administrador.");
        currentStep = "start";
      }
    } catch (e) {
      addMessage("⚠️ Error de conexión con el servidor.");
      console.error(e);
    }
    return;
  }

  if (currentStep === "email_or_code") {
    addMessage("📩 Aquí procesaremos correo o código de TV (falta implementar).");
    // Aquí puedes continuar el flujo...
    return;
  }
}

// ===============================
// Enviar mensaje
// ===============================
async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, true);
  input.value = "";

  await handleUserMessage(message);
}

// ===============================
// Eventos
// ===============================
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("messageInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});
