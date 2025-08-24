// ==============================
// Fox Stream Bot - script.js
// ==============================

// Estado inicial
let currentStep = "start";
let selectedOption = "";
let userPhone = "";
let userEmail = "";

const API_BASE = "https://script.google.com/macros/s/AKfycbzOTYcuXAlT3ke7GqxpO7a6w-T4JShnHT16_bVmE-rDmijXNkgB_7VktHPQYzZeP9Y/exec"; 
// 👆 Ojo: aquí va la URL de tu Apps Script (la misma que usas para validar)

// Función para mostrar mensajes en el chat
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

// Enviar mensaje desde input
async function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, true);
    input.value = "";

    await handleUserMessage(message);
}

// Manejo del flujo del bot
async function handleUserMessage(message) {
    if (currentStep === "start") {
        if (message.toLowerCase() === "hola") {
            addMessage(`
                👋 Hola, bienvenido a Fox Stream Bot<br><br>
                Selecciona una opción para continuar:<br><br>
                1️⃣ Código de acceso temporal<br>
                2️⃣ Actualizar tu Hogar<br>
                3️⃣ Nueva solicitud de inicio<br><br>
                <em>Responde solo con el número de la opción que deseas.</em>
            `);
            currentStep = "menu_selection";
        } else {
            addMessage("Por favor escribe 'hola' para comenzar.");
        }
    }

    else if (currentStep === "menu_selection") {
        if (["1", "2", "3"].includes(message)) {
            selectedOption = message;
            addMessage(`Has seleccionado la opción ${message}.`);
            addMessage("Por favor, ingresa tu número de teléfono sin espacios:");
            currentStep = "phone_validation";
        } else {
            addMessage("❌ Respuesta inválida. Debes elegir 1, 2 o 3.");
        }
    }

    else {
        addMessage("⚠️ Aún no implementamos los siguientes pasos (validación, correo y TV).");
    }
}

// Permitir enviar con Enter
document.getElementById("messageInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});
