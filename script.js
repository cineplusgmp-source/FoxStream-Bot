// ================================
// Fox Stream Bot - script.js
// ================================

// Variables globales
let currentStep = 'start';
let selectedOption = '';
let userPhone = '';
let userEmail = '';

// ✅ URL actualizada a Render
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
// Menú principal
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
// Opción seleccionada
// ================================
function selectOption(option) {
    selectedOption = option;
    const optionNames = {
        1: 'Código de acceso temporal',
        2: 'Actualizar tu Hogar',
        3: 'Nueva solicitud de inicio'
    };

    addMessage(option.toString(), true);
    addMessage(`Has seleccionado: ${optionNames[option]}`);

    if (option === 1) {
        addMessage('Por favor, ingresa tu correo de Gmail para buscar el código temporal:');
        currentStep = 'gmail_access';
    } else {
        addMessage('Ahora ingresa tu correo de la cuenta Netflix:');
        currentStep = 'email_input';
    }
}

// ================================
// Enviar mensaje
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
// Manejar flujo de usuario
// ================================
async function handleUserMessage(message) {
    try {
        if (message.toLowerCase() === '/start') {
            addMessage("👋 Bienvenido a Fox Stream Bot<br>Selecciona una opción:");
            showMainMenu();
            return;
        }

        switch (currentStep) {
            case 'phone_validation':
                await validatePhone(message);
                break;

            case 'email_input':
                userEmail = message;
                await handleEmailInput();
                break;

            case 'gmail_access':
                await handleGmailAccess(message);
                break;

            case 'tv_code':
                await handleTVCode(message);
                break;

            default:
                addMessage('ℹ️ Escribe /start para comenzar.');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('❌ Ha ocurrido un error. Intenta nuevamente.');
    }
}

// ================================
// Validar teléfono
// ================================
async function validatePhone(phone) {
    try {
        addMessage("🔍 Validando tu número...");
        const response = await fetch(`${API_BASE}/validate-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();

        if (result.valid) {
            userPhone = phone;
            addMessage('✅ Número validado correctamente.');
            showMainMenu();
        } else {
            addMessage('❌ Tu número no está registrado. Contacta con el administrador.');
        }
    } catch (error) {
        addMessage('⚠️ Error al validar el número.');
    }
}

// ================================
// Manejo de correo ingresado
// ================================
async function handleEmailInput() {
    addMessage(`📧 Correo registrado: ${userEmail}`);

    if (selectedOption === 2 || selectedOption === 3) {
        addMessage('🔢 Ingresa el código de 8 dígitos que aparece en tu TV:');
        currentStep = 'tv_code';
    } else {
        addMessage('⏳ Procesando tu solicitud...');
    }
}

// ================================
// Manejo de código TV
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
            addMessage('✅ ¡Activación exitosa!');
            addMessage('1. Vuelve a ingresar a Netflix<br>2. Configura tu perfil y PIN<br>🎬 ¡Disfruta del contenido!');
        } else {
            addMessage('❌ Error en la activación. Verifica el código e inténtalo nuevamente.');
        }
    } catch (error) {
        addMessage('⚠️ Error en el proceso de activación.');
    }
}

// ================================
// Manejo de Gmail (código temporal)
// ================================
async function handleGmailAccess(email) {
    addMessage('🔍 Buscando código temporal en tu Gmail...');

    try {
        const response = await fetch(`${API_BASE}/get-temp-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (result.success) {
            addMessage(`✅ Código temporal encontrado: <b>${result.code}</b>`);
        } else {
            addMessage('❌ No se encontró ningún código temporal reciente.');
        }
    } catch (error) {
        addMessage('⚠️ Error al acceder al correo.');
    }
}

// ================================
// Event Listeners
// ================================
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});
