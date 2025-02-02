import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Recibiendo datos:', req.body);

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
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
    return res.status(200).json({ 
      success: true, 
      data: result.data 
    });

  } catch (error: any) {
    console.error('Error detallado:', error);
    return res.status(500).json({ 
      error: 'Error al guardar los datos', 
      details: error.message 
    });
  }
} 