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

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'https://app.chivisclothes.com',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Establecer headers CORS para todas las respuestas
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Manejar preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Establecer Content-Type para respuestas JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error('Falta GOOGLE_CLIENT_EMAIL');
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Falta GOOGLE_PRIVATE_KEY');
    }
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('Falta SPREADSHEET_ID');
    }

    const values = [
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
    ];

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    res.status(200).json({ 
      success: true, 
      data: result.data 
    });
  } catch (error: any) {
    console.error('Error:', error);
    
    res.status(500).json({ 
      error: 'Error al guardar los datos', 
      details: error.message
    });
  }
} 