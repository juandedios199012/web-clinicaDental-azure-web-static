// Tipos para el API de clínica dental
export interface Doctor {
  id: string;
  type: 'doctor';
  nombre: string;
  especialidad: string;
  telefono: string;
  email: string;
  horario: string[];
  horarioInicio: string;
  horarioFin: string;
  activo: boolean;
  createdAt: string;
}

export interface Servicio {
  id: string;
  type: 'service';
  nombre: string;
  duracion: number; // en minutos
  precio: number;
  activo: boolean;
  createdAt: string;
}

export interface Cita {
  id: string;
  type: 'appointment';
  pacienteNombre: string;
  doctorId: string;
  servicioId: string;
  doctorNombre: string;
  servicioNombre: string;
  especialidad: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  notas?: string;
  createdAt: string;
}

export interface Disponibilidad {
  doctorId: string;
  fecha: string;
  doctorNombre: string;
  especialidad: string;
  horarioCompleto: string[];
  horasOcupadas: string[];
  horariosDisponibles: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Formularios
export interface CreateDoctorForm {
  nombre: string;
  especialidad: string;
  telefono: string;
  email: string;
  horarioInicio: string;
  horarioFin: string;
  fechasDisponibles?: string[];
}

export interface CreateServicioForm {
  nombre: string;
  duracion: number;
  precio: number;
}

export interface CreateCitaForm {
  pacienteNombre: string;
  doctorId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  notas?: string;
}
