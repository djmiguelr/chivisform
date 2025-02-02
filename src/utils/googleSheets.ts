import type { FormData } from '../types';

export class GoogleSheetsService {
  private readonly API_URL = process.env.NODE_ENV === 'production'
    ? 'https://chivisform.vercel.app/api/submit-form'
    : '/api/submit-form';

  async appendData(data: FormData): Promise<{ success: boolean; data?: any }> {
    try {
      console.log('Enviando datos a:', this.API_URL);
      console.log('Datos:', JSON.stringify(data, null, 2));

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://app.chivisclothes.com'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        }),
      });

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear respuesta:', e);
        throw new Error(`Respuesta no válida: ${responseText}`);
      }

      if (!response.ok) {
        const errorMessage = jsonResponse.error?.message || jsonResponse.error || 'Error al enviar los datos';
        throw new Error(errorMessage);
      }

      console.log('Respuesta exitosa:', jsonResponse);
      return jsonResponse;
    } catch (error: any) {
      console.error('Error detallado:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      throw new Error(error.message || 'Error desconocido');
    }
  }
} 