import axios from 'axios';
import type { Doctor, Servicio, Cita, Disponibilidad, CreateDoctorForm, CreateServicioForm, CreateCitaForm, Paciente, CreatePacienteForm, Pais, Ciudad, Sucursal } from '../types';

// URL base del API - usar tu API real
const API_BASE_URL = 'https://clinicadentalfunctions-aeezbtb0gva9fhbn.canadacentral-01.azurewebsites.net/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API Service para la clínica dental
const doctoresApi = {
  getAll: async (): Promise<Doctor[]> => {
    const response = await apiClient.get('/doctors');
    return response.data;
  },
  
  create: async (doctorData: CreateDoctorForm): Promise<Doctor> => {
    // Convertir los horarios de inicio y fin a array de horarios
    const horario = generateHorarioArray(doctorData.horarioInicio, doctorData.horarioFin);
    
    // Crear disponibilidades para las fechas seleccionadas
    const disponibilidades = doctorData.fechasDisponibles ? 
      doctorData.fechasDisponibles.map(fecha => ({
        fecha,
        horariosDisponibles: [...horario]
      })) : [];
    
    const data = {
      ...doctorData,
      horario,
      disponibilidades,
      type: 'doctor',
      activo: true
    };
    
    const response = await apiClient.post('/doctors', data);
    return response.data;
  },
  
  update: async (id: string, doctorData: Partial<CreateDoctorForm>): Promise<Doctor> => {
    let updateData: any = { ...doctorData };
    if (doctorData.horarioInicio && doctorData.horarioFin) {
      updateData.horario = generateHorarioArray(doctorData.horarioInicio, doctorData.horarioFin);
    }
    const response = await apiClient.put(`/doctors/${id}`, updateData);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/doctors/${id}`);
  }
};

// Función helper para generar array de horarios
const generateHorarioArray = (inicio: string, fin: string): string[] => {
  const horarios: string[] = [];
  const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
  const [horaFin, minutoFin] = fin.split(':').map(Number);
  
  const inicioMinutos = horaInicio * 60 + minutoInicio;
  const finMinutos = horaFin * 60 + minutoFin;
  
  for (let minutos = inicioMinutos; minutos < finMinutos; minutos += 30) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    const horaStr = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    horarios.push(horaStr);
  }
  
  return horarios;
};

// Función helper para mapear especialidades basadas en el nombre del servicio
const mapearEspecialidad = (nombreServicio: string): string => {
  const servicioLower = nombreServicio.toLowerCase();
  
  if (servicioLower.includes('limpieza') || servicioLower.includes('profilaxis')) {
    return 'Higiene Dental';
  } else if (servicioLower.includes('extracción') || servicioLower.includes('cirugía')) {
    return 'Cirugía Oral';
  } else if (servicioLower.includes('endodoncia') || servicioLower.includes('conducto')) {
    return 'Endodoncia';
  } else if (servicioLower.includes('blanqueamiento') || servicioLower.includes('estética')) {
    return 'Estética Dental';
  } else if (servicioLower.includes('ortodoncia') || servicioLower.includes('brackets')) {
    return 'Ortodoncia';
  } else if (servicioLower.includes('implante') || servicioLower.includes('prótesis')) {
    return 'Implantología';
  } else if (servicioLower.includes('periodoncia') || servicioLower.includes('encías')) {
    return 'Periodoncia';
  } else {
    return 'Odontología General';
  }
};

export const serviciosApi = {
  // Obtener todos los servicios con especialidades mapeadas
  getAll: async (): Promise<Servicio[]> => {
    try {
      const response = await apiClient.get('/services');
      const servicios = response.data;
      
      // Mapear especialidades basadas en el nombre del servicio para reportes
      const serviciosConEspecialidad = servicios.map((servicio: any) => ({
        ...servicio,
        especialidad: mapearEspecialidad(servicio.nombre)
      }));
      
      return serviciosConEspecialidad;
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      return [];
    }
  },

  // Crear un nuevo servicio
  create: async (servicio: CreateServicioForm): Promise<Servicio> => {
    const servicioConEspecialidad = {
      ...servicio,
      especialidad: mapearEspecialidad(servicio.nombre)
    };
    const response = await apiClient.post('/services', servicioConEspecialidad);
    return response.data;
  },
};

export const citasApi = {
  // Obtener todas las citas o filtradas
  getAll: async (filters?: { fecha?: string; doctorId?: string }): Promise<Cita[]> => {
    const params = new URLSearchParams();
    if (filters?.fecha) params.append('fecha', filters.fecha);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    
    const response = await apiClient.get(`/appointments?${params}`);
    return response.data;
  },

  // Crear una nueva cita
  create: async (cita: CreateCitaForm): Promise<Cita> => {
    const response = await apiClient.post('/appointments', cita);
    return response.data;
  },
};

export const pacientesApi = {
  // Obtener todos los pacientes
  getAll: async (): Promise<Paciente[]> => {
    const response = await apiClient.get('/patients');
    return response.data;
  },

  // Crear un nuevo paciente
  create: async (paciente: CreatePacienteForm): Promise<Paciente> => {
    const response = await apiClient.post('/patients', paciente);
    return response.data;
  },

  // Obtener paciente por ID
  getById: async (id: string): Promise<Paciente> => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },

  // Actualizar paciente
  update: async (id: string, paciente: Partial<CreatePacienteForm>): Promise<Paciente> => {
    const response = await apiClient.put(`/patients/${id}`, paciente);
    return response.data;
  },

  // Eliminar paciente
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/patients/${id}`);
  },
};

export const configuracionApi = {
  // Obtener países - usando endpoint real
  getPaises: async (): Promise<Pais[]> => {
    try {
      const response = await apiClient.get('/config/countries');
      return response.data;
    } catch (error) {
      console.error('Error al obtener países:', error);
      // Fallback con países comunes
      return [
        { codigo: 'PE', nombre: 'Perú' },
        { codigo: 'CO', nombre: 'Colombia' },
        { codigo: 'EC', nombre: 'Ecuador' },
        { codigo: 'BO', nombre: 'Bolivia' },
        { codigo: 'MX', nombre: 'México' },
        { codigo: 'AR', nombre: 'Argentina' },
        { codigo: 'CL', nombre: 'Chile' },
        { codigo: 'VE', nombre: 'Venezuela' },
        { codigo: 'US', nombre: 'Estados Unidos' },
        { codigo: 'ES', nombre: 'España' }
      ];
    }
  },

  // Obtener ciudades por país - usando endpoint real
  getCiudades: async (pais: string): Promise<Ciudad[]> => {
    try {
      const response = await apiClient.get(`/config/cities?pais=${pais}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      // Fallback con ciudades según el país
      return getCiudadesFallback(pais);
    }
  },

  // Obtener sucursales - usando endpoint real
  getSucursales: async (): Promise<Sucursal[]> => {
    try {
      const response = await apiClient.get('/config/sucursales');
      return response.data;
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
      // Fallback con sucursales de ejemplo
      return [
        {
          id: '1',
          nombre: 'Sucursal Principal',
          direccion: 'Av. Principal 123',
          ciudad: 'Lima',
          telefono: '+51 999 999 999',
          activa: true
        },
        {
          id: '2',
          nombre: 'Sucursal Norte',
          direccion: 'Av. Norte 456',
          ciudad: 'Lima',
          telefono: '+51 888 888 888',
          activa: true
        }
      ];
    }
  }
};

// Función helper para ciudades fallback
const getCiudadesFallback = (pais: string): Ciudad[] => {
  const ciudadesPorPais: Record<string, Ciudad[]> = {
    'PE': [
      { codigo: 'LIM', nombre: 'Lima', pais: 'PE' },
      { codigo: 'ARE', nombre: 'Arequipa', pais: 'PE' },
      { codigo: 'TRU', nombre: 'Trujillo', pais: 'PE' },
      { codigo: 'CHI', nombre: 'Chiclayo', pais: 'PE' }
    ],
    'CO': [
      { codigo: 'BOG', nombre: 'Bogotá', pais: 'CO' },
      { codigo: 'MED', nombre: 'Medellín', pais: 'CO' },
      { codigo: 'CAL', nombre: 'Cali', pais: 'CO' },
      { codigo: 'BAR', nombre: 'Barranquilla', pais: 'CO' }
    ]
  };
  
  return ciudadesPorPais[pais] || [];
};

export const disponibilidadApi = {
  // Obtener disponibilidad por doctor y fecha
  get: async (doctorId: string, fecha: string): Promise<Disponibilidad> => {
    const response = await apiClient.get(`/availability?doctorId=${doctorId}&fecha=${fecha}`);
    return response.data;
  },
};

// Export del servicio API
export const apiService = {
  // Doctores
  getDoctores: doctoresApi.getAll,
  createDoctor: doctoresApi.create,
  updateDoctor: doctoresApi.update,
  deleteDoctor: doctoresApi.delete,
  
  // Servicios  
  getServicios: serviciosApi.getAll,
  createServicio: serviciosApi.create,
  
  // Citas
  getCitas: citasApi.getAll,
  createCita: citasApi.create,
  
  // Pacientes
  getPacientes: pacientesApi.getAll,
  createPaciente: pacientesApi.create,
  getPacienteById: pacientesApi.getById,
  updatePaciente: pacientesApi.update,
  deletePaciente: pacientesApi.delete,
  
  // Configuración
  getPaises: configuracionApi.getPaises,
  getCiudades: configuracionApi.getCiudades,
  getSucursales: configuracionApi.getSucursales,
  
  // Disponibilidad
  getDisponibilidad: disponibilidadApi.get,
};

export default apiService;
