export interface FormData {
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

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: 'welcome' | 'select' | 'select-other' | 'textarea' | 'terms' | 'thanks';
  question?: string;
  description?: string;
  options?: Option[];
  content?: React.ReactNode;
} 