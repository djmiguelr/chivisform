export const config = {
  runtime: 'edge'
};

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'https://app.chivisclothes.com',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin',
};

async function getAccessToken() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: generateJWT(credentials),
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function appendToSheet(values: string[], accessToken: string) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Respuestas!A:J:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    }
  );

  return response.json();
}

export default async function handler(
  req: Request
) {
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

    const accessToken = await getAccessToken();
    const result = await appendToSheet(values, accessToken);

    return new Response(
      JSON.stringify({ success: true, data: result }), 
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

function generateJWT(credentials: { client_email?: string; private_key?: string }) {
  const now = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60;
  const expiry = now + oneHour;

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: credentials.private_key
  };

  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Claim = btoa(JSON.stringify(claim));

  // Nota: Esta es una implementación simplificada.
  // En producción, deberías usar una biblioteca de JWT segura
  const signature = signRS256(`${base64Header}.${base64Claim}`, credentials.private_key || '');
  
  return `${base64Header}.${base64Claim}.${signature}`;
}

function signRS256(input: string, privateKey: string): string {
  // Aquí deberías implementar la firma RS256
  // Por seguridad, te recomiendo usar una biblioteca de JWT en lugar de esta implementación
  return 'signature';
} 