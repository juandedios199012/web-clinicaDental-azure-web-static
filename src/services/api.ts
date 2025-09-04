import axios from 'axios';
import type { Doctor, Servicio, Cita, Disponibilidad, CreateDoctorForm, CreateServicioForm, CreateCitaForm } from '../types';

// URL base del API - cambiar por tu URL de producción
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
    
    // Generar disponibilidades para los próximos 30 días
    const today = new Date();
    const disponibilidades = [];
    
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(today);
      fecha.setDate(today.getDate() + i);
      
      // Solo días laborables (lunes a viernes)
      if (fecha.getDay() >= 1 && fecha.getDay() <= 5) {
        disponibilidades.push({
          fecha: fecha.toISOString().split('T')[0],
          horariosDisponibles: [...horario]
        });
      }
    }
    
    const data = {
      ...doctorData,
      horario,
      disponibilidades,
      type: 'doctor',
      activo: true
    };
    
    console.log('🔍 Datos enviados al backend para crear doctor:', data);
    console.log('📅 Horarios generados:', horario);
    console.log('📅 Disponibilidades generadas:', disponibilidades);
    
    const response = await apiClient.post('/doctors', data);
    console.log('✅ Respuesta del backend:', response.data);
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

export const serviciosApi = {
  // Obtener todos los servicios
  getAll: async (): Promise<Servicio[]> => {
    const response = await apiClient.get('/services');
    return response.data;
  },

  // Crear un nuevo servicio
  create: async (servicio: CreateServicioForm): Promise<Servicio> => {
    const response = await apiClient.post('/services', servicio);
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
  
  // Disponibilidad
  getDisponibilidad: disponibilidadApi.get,
};

export default apiService;
