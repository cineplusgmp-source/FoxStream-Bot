// ==============================
// Fox Stream Bot - server.js
// ==============================

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Endpoint de prueba (para ver si Render responde)
app.get('/ping', (req, res) => {
    res.json({ ok: true, message: "🦊 Fox Stream Bot backend activo" });
});

// Validar número de teléfono (ejemplo simple)
app.post('/api/validate-phone', (req, res) => {
    const { phone } = req.body;
    if (phone === "995602221") { // ⚠️ aquí solo es ejemplo
        return res.json({ valid: true });
    }
    res.json({ valid: false });
});

// Activar Netflix (ejemplo de respuesta)
app.post('/api/activate-netflix', (req, res) => {
    res.json({ success: true, message: "Cuenta activada con éxito" });
});

// Obtener código temporal (ejemplo de respuesta)
app.post('/api/get-temp-code', (req, res) => {
    res.json({ success: true, code: "1234" });
});

app.listen(PORT, () => {
    console.log(`🦊 Fox Stream Bot backend corriendo en puerto ${PORT}`);
});
