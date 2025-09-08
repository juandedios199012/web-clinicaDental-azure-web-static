import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, User, Stethoscope } from 'lucide-react';
import { apiService } from '../services/api';
import { Cita, Servicio } from '../types';
import ModalCancelacion from '../components/ModalCancelacion';

const CitasPage: React.FC = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  
  // Estados para el modal de cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [citaToCancel, setCitaToCancel] = useState<Cita | null>(null);
  const [motivosCancelacion, setMotivosCancelacion] = useState<string[]>([]);

  useEffect(() => {
    loadCitas();
    loadServicios();
    loadMotivosCancelacion();
  }, [dateFilter, showAllAppointments]);

  const loadMotivosCancelacion = async () => {
    try {
      const motivos = await apiService.getMotivosCancelacion();
      setMotivosCancelacion(motivos);
    } catch (error) {
      console.error('Error loading cancellation reasons:', error);
      // Si falla, usar motivos predeterminados
      setMotivosCancelacion([
        'Emergencia médica',
        'Problemas de transporte',
        'Conflicto de horario',
        'Enfermedad del paciente'
      ]);
    }
  };

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
      if (!showAllAppointments && dateFilter) {
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

  // Función para atender una cita
  const handleAtenderCita = async (citaId: string) => {
    try {
      setLoading(true);
      console.log('🩺 Atendiendo cita:', citaId);
      
      // Actualizar el estado de la cita a 'atendida'
      await apiService.updateCitaEstado(citaId, 'atendida');
      
      // Recargar la lista de citas
      await loadCitas();
      
      console.log('✅ Cita atendida exitosamente');
      
      // Aquí podrías agregar una notificación de éxito más elegante
      // Por ahora usamos alert como placeholder
      alert('¡Cita atendida exitosamente!');
      
    } catch (error) {
      console.error('❌ Error al atender la cita:', error);
      alert('Error al atender la cita. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar el proceso de cancelación
  const handleIniciarCancelacion = (cita: Cita) => {
    setCitaToCancel(cita);
    setShowCancelModal(true);
  };

  // Función para confirmar la cancelación con motivo
  const handleConfirmarCancelacion = async (motivo?: string) => {
    if (!citaToCancel) return;
    
    try {
      setLoading(true);
      console.log('❌ Cancelando cita:', citaToCancel.id, 'Motivo:', motivo);
      
      // Actualizar el estado de la cita a 'cancelada' con motivo opcional
      await apiService.updateCitaEstado(citaToCancel.id, 'cancelada', motivo);
      
      // Recargar la lista de citas
      await loadCitas();
      
      // Cerrar modal
      setShowCancelModal(false);
      setCitaToCancel(null);
      
      console.log('✅ Cita cancelada exitosamente');
      alert('Cita cancelada exitosamente.');
      
    } catch (error) {
      console.error('❌ Error al cancelar la cita:', error);
      alert('Error al cancelar la cita. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el modal de cancelación
  const handleCerrarModalCancelacion = () => {
    setShowCancelModal(false);
    setCitaToCancel(null);
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
      case 'atendida':
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              disabled={showAllAppointments}
              className={`w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                showAllAppointments ? 'bg-neutral-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAllAppointments}
                onChange={(e) => setShowAllAppointments(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-neutral-700">
                Mostrar todas las citas
              </span>
            </label>
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
                {/* Botón Atender - Solo para citas confirmadas */}
                {cita.estado === 'confirmada' && (
                  <button 
                    onClick={() => handleAtenderCita(cita.id)}
                    className="btn-primary text-sm flex items-center justify-center"
                    disabled={loading}
                  >
                    <Stethoscope className="h-4 w-4 mr-1" />
                    Atender
                  </button>
                )}
                
                {/* Botón Editar - Para citas pendientes y confirmadas */}
                {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                  <button className="btn-secondary text-sm">
                    Editar
                  </button>
                )}
                
                {/* Botón Cancelar - Para citas pendientes y confirmadas */}
                {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                  <button 
                    onClick={() => handleIniciarCancelacion(cita)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                )}
                
                {/* Estados finales - Solo mostrar información */}
                {(cita.estado === 'atendida' || cita.estado === 'completada') && (
                  <span className="text-green-600 text-sm font-medium">
                    ✅ Atendida
                  </span>
                )}
                
                {cita.estado === 'cancelada' && (
                  <span className="text-red-600 text-sm font-medium">
                    ❌ Cancelada
                  </span>
                )}
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
            {showAllAppointments 
              ? 'No hay citas registradas en el sistema'
              : dateFilter 
                ? `para la fecha ${new Date(dateFilter + 'T00:00:00').toLocaleDateString('es-PE')}` 
                : ''
            }
          </p>
        </div>
      )}

      {/* Modal de Cancelación */}
      {citaToCancel && (
        <ModalCancelacion
          isOpen={showCancelModal}
          onClose={handleCerrarModalCancelacion}
          onConfirm={handleConfirmarCancelacion}
          citaInfo={{
            pacienteNombre: citaToCancel.pacienteNombre,
            fecha: citaToCancel.fecha,
            hora: citaToCancel.hora
          }}
          loading={loading}
          motivosPredefinidos={motivosCancelacion}
        />
      )}
    </div>
  );
};

export default CitasPage;
