import { google } from 'googleapis';

export const config = {
  runtime: 'edge',
  unstable_allowDynamic: [
    '/node_modules/googleapis/**',
  ],
};

interface VercelRequest {
  method: string;
  body: any;
}

interface VercelResponse {
  status: number;
  json: (data: any) => Response;
}

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'https://app.chivisclothes.com',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin',
};

export default async function handler(
  req: Request
) {
  // Establecer headers CORS para todas las respuestas
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
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

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const body = await req.json();

    const values = [
      new Date().toISOString(),
      body.compraPreferencia || '',
      body.ciudad || '',
      body.edad || '',
      body.ocupacion || '',
      body.estilo || '',
      body.experiencia || '',
      body.recomendacion || '',
      body.sugerencia || '',
      body.aceptaTerminos ? 'Sí' : 'No'
    ];

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Respuestas!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    return new Response(
      JSON.stringify({ success: true, data: result.data }), 
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error al guardar los datos', 
        details: error.message 
      }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 