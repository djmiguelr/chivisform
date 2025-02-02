import type { FormData } from '../types';

export class GoogleSheetsService {
  private readonly API_URL = '/api/submit-form';

  async appendData(data: FormData): Promise<{ success: boolean; data?: any }> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });

      // Si la respuesta no es JSON, captura el texto
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error('Respuesta del servidor no válida');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar los datos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al escribir en Google Sheets:', error);
      throw error;
    }
  }
} 