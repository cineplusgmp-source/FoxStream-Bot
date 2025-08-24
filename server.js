// ============================
// Fox Stream Bot - server.js
// ============================

const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database');
const netflixAutomation = require('./netflix-automation');
const gmailIntegration = require('./gmail-integration');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ============================
// Servir el frontend
// ============================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================
// Validar número de teléfono
// ============================
app.post('/api/validate-phone', async (req, res) => {
    try {
        const { phone } = req.body;
        const isValid = await database.validatePhone(phone);
        res.json({ valid: isValid });
    } catch (error) {
        console.error('❌ Error validando teléfono:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================
// Activar Netflix (con código de TV)
// ============================
app.post('/api/activate-netflix', async (req, res) => {
    try {
        const { code, email, phone } = req.body;

        const accountData = await database.getAccountData(phone);

        if (!accountData) {
            return res.json({ success: false, error: 'Datos de cuenta no encontrados' });
        }

        const result = await netflixAutomation.activateDevice(code, accountData);

        await database.logActivation(phone, email, code, result.success);

        res.json(result);
    } catch (error) {
        console.error('❌ Error activando Netflix:', error);
        res.status(500).json({ success: false, error: 'Error en la activación' });
    }
});

// ============================
// Obtener código temporal de Gmail
// ============================
app.post('/api/get-temp-code', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await gmailIntegration.getTempCode(email);
        res.json(result);
    } catch (error) {
        console.error('❌ Error obteniendo código temporal:', error);
        res.status(500).json({ success: false, error: 'Error al acceder al correo' });
    }
});

// ============================
// Iniciar servidor
// ============================
app.listen(PORT, () => {
    console.log(`🦊 Fox Stream Bot corriendo en http://localhost:${PORT}`);
});
