const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Verificación detallada de variables de entorno
const requiredEnvVars = {
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID: process.env.SPREADSHEET_ID
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Falta la variable de entorno: ${key}`);
    process.exit(1);
  }
});

console.log('Variables de entorno cargadas correctamente');
console.log('Spreadsheet ID:', process.env.SPREADSHEET_ID);
console.log('Client Email:', process.env.GOOGLE_CLIENT_EMAIL);

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.post('/api/submit-form', async (req, res) => {
  console.log('Recibiendo solicitud:', req.body);
  
  try {
    const {
      timestamp,
      compraPreferencia,
      ciudad,
      edad,
      ocupacion,
      estilo,
      experiencia,
      recomendacion,
      sugerencia,
      aceptaTerminos
    } = req.body;

    console.log('Datos a guardar:', {
      timestamp,
      compraPreferencia,
      ciudad,
      edad,
      ocupacion,
      estilo,
      experiencia,
      recomendacion,
      sugerencia,
      aceptaTerminos
    });

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          timestamp,
          compraPreferencia,
          ciudad,
          edad,
          ocupacion,
          estilo,
          experiencia,
          recomendacion,
          sugerencia,
          aceptaTerminos ? 'Sí' : 'No'
        ]],
      },
    });

    console.log('Respuesta de Google Sheets:', result.data);
    res.json({ success: true, data: result.data });

  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      error: 'Error al guardar los datos', 
      details: error.message,
      googleError: error.response?.data
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada no manejada:', error);
}); 