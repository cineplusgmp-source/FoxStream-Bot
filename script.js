// ================================
// Fox Stream Bot - script.js
// ================================

// Variables globales
let currentStep = "start";
let selectedOption = "";
let userPhone = "";
let userEmail = "";

const API_BASE = "https://foxstream-bot.onrender.com/api";

// ================================
// Función para mostrar mensajes
// ================================
function addMessage(content, isUser = false) {
  const messagesContainer = document.getElementById("chatMessages");

  if (!messagesContainer) {
    console.error("⚠️ No se encontró el contenedor de mensajes (#chatMessages)");
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = isUser ? "user-message" : "bot-message";

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.innerHTML = content;

  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ================================
// Mensaje inicial con botón Start
// ================================
function showStartMessage() {
  addMessage(`
    👋 Bienvenido a Fox Stream Bot <br>
    <button class="option-button" onclick="startBot()">🎟️ Presiona aquí para comenzar</button>
  `);
}

function startBot() {
  addMessage("Por favor, ingresa tu número sin espacios para validar tu acceso:");
  currentStep = "phone_validation";
}

// ================================
// Menú principal
// ================================
function showMainMenu() {
  const menuContent = `
    <div class="options-menu">
      <p><strong>Selecciona una opción para continuar:</strong></p>
      <button class="option-button" onclick="selectOption(1)">1️⃣ Código de acceso temporal</button>
      <button class="option-button" onclick="selectOption(2)">2️⃣ Actualizar tu Hogar</button>
      <button class="option-button" onclick="selectOption(3)">3️⃣ Nueva solicitud de inicio</button>
      <p><em>Responde solo con el número de la opción que deseas.</em></p>
    </div>
  `;
  addMessage(menuContent);
}

// ================================
// Manejo de opciones
// ================================
function selectOption(option) {
  selectedOption = option;
  const optionNames = {
    1: "Código de acceso temporal",
    2: "Actualizar tu Hogar",
    3: "Nueva solicitud de inicio"
  };

  addMessage(option.toString(), true);
  addMessage(`Has seleccionado la opción ${option}: ${optionNames[option]}`);

  // aquí podrías continuar con los siguientes pasos
}

// ================================
// Envío de mensajes
// ================================
async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (!message) return;

  addMessage(message, true);
  input.value = "";

  await handleUserMessage(message);
}

// ================================
// Manejo de flujo
// ================================
async function handleUserMessage(message) {
  try {
    switch (currentStep) {
      case "start":
        if (message.toLowerCase() === "/start" || message.toLowerCase() === "hola") {
          startBot();
        } else {
          showStartMessage();
        }
        break;

      case "phone_validation":
        await validatePhone(message);
        break;

      case "menu":
        if (["1", "2", "3"].includes(message)) {
          selectOption(parseInt(message));
        } else {
          addMessage("❌ Opción inválida. Por favor escribe 1, 2 o 3.");
        }
        break;

      default:
        addMessage("Por favor, sigue las instrucciones del menú.");
    }
  } catch (error) {
    console.error("Error:", error);
    addMessage("Ha ocurrido un error. Por favor, intenta nuevamente.");
  }
}

// ================================
// Validar número
// ================================
async function validatePhone(phone) {
  addMessage("🔎 Validando tu número...");

  try {
    const response = await fetch(`${API_BASE}/validate-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    const result = await response.json();

    if (result.valid) {
      userPhone = phone;
      addMessage("✅ Número verificado. ¡Bienvenido!");
      showMainMenu();
      currentStep = "menu";
    } else {
      addMessage("❌ Tu número no está registrado. Contacta con el administrador.");
    }
  } catch (error) {
    console.error("Error en validación:", error);
    addMessage("Error al validar el número. Intenta nuevamente.");
  }
}

// ================================
// Event listener para Enter
// ================================
document.addEventListener("DOMContentLoaded", () => {
  showStartMessage();

  document.getElementById("messageInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});
