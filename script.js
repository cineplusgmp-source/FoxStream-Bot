// ================================
// Fox Stream Bot - script.js
// ================================

// Variables globales
let currentStep = 'phone_validation';
let userPhone = '';
let userEmail = '';
let selectedOption = '';

// ⚡ URL de tu Apps Script (NO localhost)
const API_BASE = "https://script.google.com/macros/s/AKfycbzOTYcuXAlT3ke7GqxpO7a6w-T4JShnHT16_bVmE-rDmijXNkgB_7VktHPQYzZeP9Y/exec";

// ================================
// Mostrar mensajes
// ================================
function addMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'bot-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ================================
// Enviar mensaje
// ================================
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, true);
    input.value = "";

    await handleUserMessage(message);
}

// ================================
// Flujo principal
// ================================
async function handleUserMessage(message) {
    if (currentStep === 'phone_validation') {
        await validatePhone(message);
    } else {
        addMessage("⚠️ Aún no hemos configurado el siguiente paso.");
    }
}

// ================================
// Validar número en Google Sheets
// ================================
async function validatePhone(phone) {
    try {
        addMessage("🔎 Validando tu número...");

        const res = await fetch(`${API_BASE}?action=validatePhone&phone=${phone}`);
        const data = await res.json();

        if (data.ok && data.exists) {
            userPhone = phone;
            addMessage("✅ Número verificado. ¡Bienvenido!");
            // Aquí mostramos el menú
            showMainMenu();
            currentStep = "menu";
        } else {
            addMessage("❌ Tu número no está registrado. Contacta con el administrador.");
        }
    } catch (err) {
        console.error("Error validando teléfono:", err);
        addMessage("⚠️ Error de conexión con el servidor.");
    }
}

// ================================
// Mostrar menú principal
// ================================
function showMainMenu() {
    const menu = `
        <div class="options-menu">
            <p>Selecciona una opción para continuar:</p>
            <button class="option-button" onclick="selectOption(1)">1️⃣ Código de acceso temporal</button>
            <button class="option-button" onclick="selectOption(2)">2️⃣ Actualizar tu Hogar</button>
            <button class="option-button" onclick="selectOption(3)">3️⃣ Nueva solicitud de inicio</button>
        </div>
    `;
    addMessage(menu);
}

function selectOption(option) {
    selectedOption = option;
    addMessage(`Has seleccionado la opción ${option}`);
}

// ================================
// Eventos de envío
// ================================
document.getElementById("messageInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});
document.querySelector(".chat-input button").addEventListener("click", sendMessage);
