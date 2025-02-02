import { useState } from 'react';
import { GoogleSheetsService } from '../utils/googleSheets';

const TuComponente = () => {
  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const sheetsService = new GoogleSheetsService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await sheetsService.appendData([
        datos.nombre,
        datos.email,
        datos.mensaje,
        new Date().toISOString()
      ]);
      
      alert('Datos guardados correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los datos');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tus campos de formulario aquí */}
    </form>
  );
};

export default TuComponente; 