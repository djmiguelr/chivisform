interface FormData {
  timestamp: string;
  compraPreferencia: string;
  ciudad: string;
  ciudadOtra?: string;
  edad: string;
  ocupacion: string;
  estilo: string;
  estiloOtro?: string;
  experiencia: string;
  recomendacion: string;
  sugerencia: string;
  aceptaTerminos: boolean;
}

export class GoogleSheetsService {
  private readonly API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.chivisclothes.com/api/submit-form'  // URL de producción
    : 'http://localhost:3000/api/submit-form';         // URL de desarrollo

  async appendData(data: FormData) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://app.chivisclothes.com'
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

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