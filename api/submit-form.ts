import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
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

    return res.status(200).json({ 
      success: true, 
      data: result.data 
    });

  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al guardar los datos', 
      details: error.message 
    });
  }
} 