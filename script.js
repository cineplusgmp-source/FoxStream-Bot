// ================================
// Fox Stream Bot - script.js
// ================================

// Variables globales
let currentStep = 'start';
let selectedOption = '';
let userPhone = '';
let userEmail = '';

// 🔹 API BASE (Render)
const API_BASE = 'https://foxstream-bot.onrender.com/api';

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
// Mostrar menú principal
// ================================
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

// ================================
// Selección de opción
// ================================
function selectOption(option) {
    selectedOption = option;
    const optionNames = {
        1: 'Código de acceso temporal',
        2: 'Actualizar tu Hogar',
        3: 'Nueva solicitud de inicio'
    };

    addMessage(`Has seleccionado: ${optionNames[option]}`);

    // Paso siguiente: pedir número
    addMessage('📱 Por favor, ingresa tu número sin espacios:');
    currentStep = 'phone_validation';
}

// ================================
// Enviar mensaje desde input
// ================================
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, true);
    input.value = '';

    await handleUserMessage(message);
}

// ================================
// Manejo de flujo de conversación
// ================================
async function handleUserMessage(message) {
    try {
        switch (currentStep) {
            case 'start':
                if (message.toLowerCase() === 'hola') {
                    showMainMenu();
                } else {
                    addMessage('👋 Escribe "hola" para comenzar.');
                }
                break;

            case 'phone_validation':
                await validatePhone(message);
                break;

            case 'email_input':
                userEmail = message;
                addMessage(`📧 Correo registrado: ${userEmail}`);
                if (selectedOption === 2 || selectedOption === 3) {
                    addMessage('🔑 Ingresa el código de 8 dígitos que aparece en tu TV:');
                    currentStep = 'tv_code';
                }
                break;

            case 'tv_code':
                await handleTVCode(message);
                break;

            case 'gmail_access':
                await handleGmailAccess(message);
                break;

            default:
                addMessage('⚠️ No entendí, por favor sigue las instrucciones.');
        }
    } catch (error) {
        console.error(error);
        addMessage('❌ Error interno, inténtalo nuevamente.');
    }
}

// ================================
// Validación de número
// ================================
async function validatePhone(phone) {
    try {
        const response = await fetch(`${API_BASE}/validate-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();

        if (result.valid) {
            userPhone = phone;
            addMessage('✅ Número validado correctamente.');
            addMessage('Ahora ingresa tu correo:');
            currentStep = 'email_input';
        } else {
            addMessage('❌ Tu número no está registrado. Contacta con el administrador.');
            currentStep = 'start';
        }
    } catch (error) {
        addMessage('⚠️ Error al validar el número.');
    }
}

// ================================
// Activación con código de TV
// ================================
async function handleTVCode(code) {
    addMessage('🔄 Procesando activación en Netflix...');

    try {
        const response = await fetch(`${API_BASE}/activate-netflix`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, email: userEmail, phone: userPhone })
        });

        const result = await response.json();

        if (result.success) {
            addMessage('✅ ¡Activación exitosa! Vuelve a ingresar a Netflix y configura tu perfil.');
        } else {
            addMessage('❌ Error en la activación, verifica el código.');
        }
    } catch (error) {
        addMessage('⚠️ Error al procesar la activación.');
    }
}

// ================================
// Buscar código temporal en Gmail
// ================================
async function handleGmailAccess(email) {
    addMessage('🔍 Buscando código temporal en Gmail...');

    try {
        const response = await fetch(`${API_BASE}/get-temp-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (result.success) {
            addMessage(`✅ Código temporal encontrado: ${result.code}`);
        } else {
            addMessage('❌ No se encontró ningún código en tu correo.');
        }
    } catch (error) {
        addMessage('⚠️ Error al acceder al correo.');
    }
}

// ================================
// Listener para Enter
// ================================
document.getElementById('messageInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});
