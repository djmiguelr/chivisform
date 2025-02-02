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
): Promise<void> {
  console.log('Iniciando manejo de solicitud...');

  // Establecer headers de respuesta
  res.setHeader('Content-Type', 'application/json');
  
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://app.chivisclothes.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin'
  );

  if (req.method === 'OPTIONS') {
    console.log('Respondiendo a OPTIONS request');
    res.status(200).json({ status: 'ok' });
    return;
  }

  if (req.method !== 'POST') {
    console.log('Método no permitido:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Verificando credenciales...');
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error('Falta GOOGLE_CLIENT_EMAIL');
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Falta GOOGLE_PRIVATE_KEY');
    }
    if (!process.env.SPREADSHEET_ID) {
      throw new Error('Falta SPREADSHEET_ID');
    }

    console.log('Credenciales encontradas:', {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      spreadsheetId: process.env.SPREADSHEET_ID,
      has_private_key: !!process.env.GOOGLE_PRIVATE_KEY
    });

    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

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

    console.log('Valores a insertar:', values);

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    console.log('Respuesta de Google Sheets:', JSON.stringify(result.data, null, 2));
    res.status(200).json({ 
      success: true, 
      data: result.data 
    });
  } catch (error: any) {
    console.error('Error detallado:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response?.data,
      config: error.config
    });
    
    res.status(500).json({ 
      error: 'Error al guardar los datos', 
      details: error.message,
      name: error.name,
      googleError: error.response?.data
    });
  }
} 