// ===============================
// Paso 1: Inicio del bot con "hola"
// ===============================
let currentStep = 'start';
let selectedOption = '';
let userPhone = '';
let userEmail = '';

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

// Detectar mensaje "hola"
async function handleUserMessage(message) {
    message = message.toLowerCase();

    if (message === 'hola') {
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

        default:
            addMessage('Escribe "hola" para iniciar el bot.');
    }
}
