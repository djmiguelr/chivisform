const express = require('express');
const path = require('path');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://tudominio.com', // Reemplaza con tu dominio
  methods: ['POST', 'GET'],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// API endpoint
app.post('/api/submit-form', async (req, res) => {
  try {
    console.log('Recibiendo datos:', req.body);
    
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          req.body.timestamp,
          req.body.compraPreferencia,
          req.body.ciudad,
          req.body.edad,
          req.body.ocupacion,
          req.body.estilo,
          req.body.experiencia,
          req.body.recomendacion,
          req.body.sugerencia,
          req.body.aceptaTerminos ? 'Sí' : 'No'
        ]],
      },
    });

    console.log('Datos guardados exitosamente');
    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error al guardar los datos', 
      details: error.message 
    });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 