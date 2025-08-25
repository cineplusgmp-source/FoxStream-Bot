// ================================
// Fox Stream Bot - script.js
// ================================

// Variables globales
let currentStep = 'start';
let selectedOption = '';
let userPhone = '';
let userEmail = '';

const API_BASE = 'https://foxstream-bot.onrender.com/api'; // Render URL

// ================================
// Función para mostrar mensajes
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
// Indicador de escritura
// ================================
function showTyping(callback, delay = 1200) {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            Fox Stream Bot está escribiendo
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
        typingDiv.remove();
        if (callback) callback();
    }, delay);
}

// ================================
// Botón iniciar
// ================================
function startBot() {
    showTyping(() => {
        addMessage("Por favor, ingresa tu número sin espacios para validar tu acceso:");
        currentStep = 'phone_validation';
    });
}

// ================================
// Opciones del menú
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
    showTyping(() => addMessage(menuContent));
}

function selectOption(option) {
    selectedOption = option;
    const optionNames = {
        1: 'Código de acceso temporal',
        2: 'Actualizar tu Hogar',
        3: 'Nueva solicitud de inicio'
    };

    // Mostrar solo la opción seleccionada (sin duplicidad extra)
    addMessage(`Has seleccionado la opción ${option}: ${optionNames[option]}`);

    showTyping(() => {
        addMessage("Por favor, ingresa tu correo de la cuenta Netflix:");
        currentStep = 'email_input';
    });
}

// ================================
// Validar teléfono
// ================================
async function validatePhone(phone) {
    addMessage("🔍 Validando tu número...");
    try {
        const response = await fetch(`${API_BASE}/validate-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();

        if (result.valid) {
            userPhone = phone;
            showTyping(() => {
                addMessage("✅ Número verificado. ¡Bienvenido!");
                showMainMenu();
                currentStep = 'menu_selection';
            });
        } else {
            showTyping(() => {
                addMessage("❌ Tu número no está registrado. Contacta con el administrador.");
            });
        }
    } catch (error) {
        addMessage("⚠️ Error al validar el número. Intenta nuevamente.");
    }
}

// ================================
// Manejo del input del usuario
// ================================
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, true);
    input.value = '';
    await handleUserMessage(message);
}

async function handleUserMessage(message) {
    switch (currentStep) {
        case 'phone_validation':
            await validatePhone(message);
            break;
        case 'email_input':
            userEmail = message;
            showTyping(() => addMessage(`Correo registrado: ${userEmail}`));
            break;
        default:
            addMessage("Lo siento, no entiendo. Por favor, sigue las instrucciones.");
    }
}

// ================================
// Listeners
// ================================
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});
