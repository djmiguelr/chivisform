const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'https://app.chivisclothes.com',
  credentials: true
}));

app.use(express.json());

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.post('/submit-form', async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          new Date().toISOString(),
          req.body.compraPreferencia || '',
          req.body.ciudad || '',
          req.body.edad || '',
          req.body.ocupacion || '',
          req.body.estilo || '',
          req.body.experiencia || '',
          req.body.recomendacion || '',
          req.body.sugerencia || '',
          req.body.aceptaTerminos ? 'Sí' : 'No'
        ]],
      },
    });

    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error al guardar los datos', 
      details: error.message 
    });
  }
});

module.exports = app; 