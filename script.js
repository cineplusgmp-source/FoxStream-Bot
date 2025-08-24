// ===============================
// Fox Stream Bot - script.js
// ===============================

// Variables globales
let currentStep = 'start';
let selectedOption = '';
let userPhone = '';
let userEmail = '';

const API_BASE = 'https://foxstream-bot.onrender.com'; // Ajustar cuando lo subamos al servidor

// ===============================
// Función para mostrar mensajes
// ===============================
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

// ===============================
// Menú principal
// ===============================
function showMainMenu() {
    const menuContent = `
        <div class="options-menu">
            <p><strong>Hola, bienvenido a Fox Stream Bot 👋</strong></p>
            <p>Selecciona una opción para continuar:</p>
            <button class="option-button" onclick="selectOption(1)">1️⃣ Código de acceso temporal</button>
            <button class="option-button" onclick="selectOption(2)">2️⃣ Actualizar tu Hogar</button>
            <button class="option-button" onclick="selectOption(3)">3️⃣ Nueva solicitud de inicio</button>
            <p><em>Responde solo con el número de la opción que deseas.</em></p>
        </div>
    `;
    addMessage(menuContent);
    currentStep = 'menu_selection';
}

// ===============================
// Seleccionar opción
// ===============================
function selectOption(option) {
    selectedOption = option;
    const optionNames = {
        1: 'Código de acceso temporal',
        2: 'Actualizar tu Hogar',
        3: 'Nueva solicitud de inicio'
    };

    addMessage(option.toString(), true);
    addMessage(`Has seleccionado: ${optionNames[option]}`);

    // Aquí vamos a conectar en el Paso 2 la validación de teléfono
    addMessage('Por favor, ingresa tu número sin espacios:');
    currentStep = 'phone_validation';
}

// ===============================
// Manejar mensajes del usuario
// ===============================
async function handleUserMessage(message) {
    message = message.trim();

    // Inicio del bot con "hola"
    if (message.toLowerCase() === 'hola') {
        addMessage('🦊 Fox Stream Bot está listo para ayudarte...');
        showMainMenu();
        return;
    }

    switch (currentStep) {
        case 'menu_selection':
            if (['1', '2', '3'].includes(message)) {
                selectOption(parseInt(message));
            } else {
                addMessage('❌ Respuesta inválida. Elige 1, 2 o 3.');
            }
            break;

        case 'phone_validation':
            await validatePhone(message);
            break;

        default:
            addMessage('Escribe "hola" para iniciar el bot.');
    }
}

// ===============================
// Validar número (con API backend)
// ===============================
async function validatePhone(phone) {
    try {
        const response = await fetch(`${API_BASE}/validate-phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();

        if (result.valid) {
            userPhone = phone;
            addMessage('✅ Número validado correctamente.');
            addMessage('Ahora ingresa tu correo:');
            currentStep = 'email_input';
        } else {
            addMessage('❌ Número no registrado. Por favor, comunícate con el administrador.');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('⚠️ Error al validar el número. Intenta nuevamente.');
    }
}

// ===============================
// Enviar mensaje desde input
// ===============================
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, true);
    input.value = '';

    await handleUserMessage(message);
}

// ===============================
// Eventos
// ===============================
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
