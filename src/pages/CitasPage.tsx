import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, User, Stethoscope } from 'lucide-react';
import { apiService } from '../services/api';
import { Cita, Servicio } from '../types';

const CitasPage: React.FC = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadCitas();
    loadServicios();
  }, [dateFilter]);

  const loadServicios = async () => {
    try {
      const data = await apiService.getServicios();
      setServicios(data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadCitas = async () => {
    try {
      const filters: any = {};
      if (dateFilter) {
        filters.fecha = dateFilter;
      }
      const data = await apiService.getCitas(filters);
      console.log('🔍 Citas cargadas:', data);
      console.log('📋 Primera cita (ejemplo):', data[0]);
      setCitas(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función helper para obtener el nombre del servicio
  const getServicioNombre = (cita: Cita): string => {
    // Primero intentar el campo servicioNombre del backend
    if (cita.servicioNombre) {
      return cita.servicioNombre;
    }
    
    // Si no existe, buscar en la lista de servicios cargados
    const servicio = servicios.find(s => s.id === cita.servicioId);
    if (servicio) {
      return servicio.nombre;
    }
    
    return 'No especificado';
  };

  const filteredCitas = citas.filter(cita =>
    cita.pacienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cita.doctorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getServicioNombre(cita).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-medical-green text-white';
      case 'pendiente':
        return 'bg-yellow-500 text-white';
      case 'cancelada':
        return 'bg-red-500 text-white';
      case 'completada':
        return 'bg-medical-blue text-white';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:MM format
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Citas</h1>
          <p className="text-neutral-600 mt-2">Gestión de citas médicas</p>
        </div>
        <button 
          onClick={() => navigate('/agendar')}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Cita
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por paciente, doctor o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="space-y-4">
        {filteredCitas.map((cita) => (
          <div key={cita.id} className="card hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary-600" />
                      {cita.pacienteNombre}
                    </h3>
                    <div className="mt-1 space-y-1 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2 text-medical-blue" />
                        <span>{cita.doctorNombre} - {cita.especialidad}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-medical-teal" />
                        <span>{new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-PE')} a las {formatTime(cita.hora)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cita.estado)} capitalize`}>
                      {cita.estado}
                    </span>
                  </div>
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-neutral-700">Servicio:</p>
                  </div>
                  <p className="text-sm text-neutral-900 font-medium">
                    {getServicioNombre(cita)}
                  </p>
                  {/* Debug temporal */}
                  <div className="text-xs text-gray-500 mt-1 p-2 bg-yellow-50 rounded">
                    <strong>Debug:</strong> servicioNombre: "{cita.servicioNombre}", servicioId: "{cita.servicioId}"
                  </div>
                  {cita.notas && (
                    <>
                      <p className="text-sm font-medium text-neutral-700 mt-3">Notas:</p>
                      <p className="text-sm text-neutral-600">{cita.notas}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                <button className="btn-secondary text-sm">
                  Editar
                </button>
                <button className="text-red-600 hover:text-red-800 text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCitas.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 text-lg">No se encontraron citas</p>
          <p className="text-neutral-400 text-sm mt-1">
            {dateFilter ? `para la fecha ${new Date(dateFilter + 'T00:00:00').toLocaleDateString('es-PE')}` : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default CitasPage;
