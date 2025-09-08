import React, { useState, useEffect } from 'react';
import { Calendar, User, Stethoscope, Clock, FileText, Activity, Building2 } from 'lucide-react';
import { apiService } from '../services/api';
import { Doctor, Servicio, Sucursal } from '../types';
import CustomSelect from '../components/CustomSelect';

const AgendarCitaPage: React.FC = () => {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    pacienteNombre: '',
    doctorId: '',
    servicioId: '',
    sucursalId: '',
    fecha: '',
    hora: '',
    notas: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.doctorId && formData.fecha && selectedDoctor) {
      loadDisponibilidad();
    } else {
      setHorariosDisponibles([]);
    }
  }, [formData.doctorId, formData.fecha, selectedDoctor]);

  const loadInitialData = async () => {
    console.log('🔍 Cargando datos iniciales...');
    try {
      console.log('📡 Llamando a API doctores...');
      const doctoresData = await apiService.getDoctores();
      console.log('👨‍⚕️ Doctores recibidos:', doctoresData.length);
      
      console.log('📡 Llamando a API servicios...');
      const serviciosData = await apiService.getServicios();
      console.log('🦷 Servicios recibidos:', serviciosData.length);
      
      console.log('📡 Llamando a API sucursales...');
      const sucursalesData = await apiService.getSucursales();
      console.log('🏢 Sucursales recibidas:', sucursalesData.length);
      
      setDoctores(doctoresData);
      setServicios(serviciosData);
      setSucursales(sucursalesData);
      
      console.log('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      console.error('🔍 Detalles del error:', (error as any).response?.data || (error as Error).message);
    }
  };

  const loadDisponibilidad = async () => {
    if (!formData.doctorId || !formData.fecha || !selectedDoctor) {
      setHorariosDisponibles([]);
      return;
    }
    
    try {
      // Usar los horarios del doctor directamente
      if (selectedDoctor.horario && Array.isArray(selectedDoctor.horario)) {
        setHorariosDisponibles(selectedDoctor.horario);
        console.log('✅ Horarios disponibles:', selectedDoctor.horario);
      } else {
        console.log('⚠️ No hay horarios definidos para este doctor');
        setHorariosDisponibles([]);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      setHorariosDisponibles([]);
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctores.find(d => d.id === doctorId);
    setSelectedDoctor(doctor || null);
    setFormData({ 
      ...formData, 
      doctorId,
      hora: '' // Reset hora when changing doctor
    });
  };

  const handleServiceChange = (servicioId: string) => {
    setFormData({ 
      ...formData, 
      servicioId 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiService.createCita({
        pacienteNombre: formData.pacienteNombre,
        doctorId: formData.doctorId,
        servicioId: formData.servicioId,
        sucursalId: formData.sucursalId,
        fecha: formData.fecha,
        hora: formData.hora,
        notas: formData.notas || undefined
      });
      
      // Reset form
      setFormData({
        pacienteNombre: '',
        doctorId: '',
        servicioId: '',
        sucursalId: '',
        fecha: '',
        hora: '',
        notas: ''
      });
      setSelectedDoctor(null);
      setHorariosDisponibles([]);
      
      alert('Cita agendada exitosamente');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Agendar Cita</h1>
        <p className="text-neutral-600 mt-2">Complete el formulario para agendar una nueva cita</p>
      </div>

      <div className="card shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del Paciente */}
          <div className="space-y-2">
            <label className="form-label flex items-center">
              <User className="h-4 w-4 mr-2 text-primary-600" />
              Nombre Completo del Paciente
            </label>
            <input
              type="text"
              value={formData.pacienteNombre}
              onChange={(e) => setFormData({ ...formData, pacienteNombre: e.target.value })}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-neutral-900 placeholder-neutral-500"
              required
              placeholder="Ej: María García López"
            />
          </div>

          {/* Selección de Doctor */}
          <div className="space-y-2">
            <label className="form-label flex items-center">
              <Stethoscope className="h-4 w-4 mr-2 text-medical-blue" />
              Doctor Especialista
            </label>
            <CustomSelect
              options={doctores.map(doctor => ({
                value: doctor.id,
                label: `${doctor.nombre} - ${doctor.especialidad}`
              }))}
              value={formData.doctorId}
              onChange={handleDoctorChange}
              placeholder="Seleccione el doctor de su preferencia"
            />
            
            {selectedDoctor && (
              <div className="mt-2 p-3 bg-medical-blue bg-opacity-10 rounded-lg border border-medical-blue border-opacity-20">
                <p className="text-sm text-neutral-700">
                  <strong>Especialidad:</strong> {selectedDoctor.especialidad}
                </p>
                <p className="text-sm text-neutral-700">
                  <strong>Horarios de Atención:</strong> {selectedDoctor.horario && selectedDoctor.horario.length > 0 
                    ? `${selectedDoctor.horario[0]} - ${selectedDoctor.horario[selectedDoctor.horario.length - 1]}` 
                    : 'Consultar disponibilidad'
                  }
                </p>
                <p className="text-xs text-medical-blue mt-1">
                  💡 Seleccione una fecha para ver horarios disponibles específicos
                </p>
              </div>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <label className="form-label flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-medical-teal" />
              Fecha de la Cita
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value, hora: '' })}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-neutral-900 font-medium text-base"
              required
              min={today}
              style={{ colorScheme: 'light' }}
            />
            <p className="text-sm text-neutral-600 flex items-center">
              <span className="text-medical-teal mr-1">ℹ️</span>
              Seleccione la fecha para verificar disponibilidad
            </p>
          </div>

          {/* Selección de Servicio */}
          <div className="space-y-2">
            <label className="form-label flex items-center">
              <Activity className="h-4 w-4 mr-2 text-medical-blue" />
              Servicio Médico
            </label>
            <CustomSelect
              options={servicios.map(servicio => ({
                value: servicio.id,
                label: `${servicio.nombre} - S/ ${servicio.precio}`
              }))}
              value={formData.servicioId}
              onChange={handleServiceChange}
              placeholder="Seleccione el servicio médico"
            />
          </div>

          {/* Selección de Sucursal */}
          <div className="space-y-2">
            <label className="form-label flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-green-600" />
              Sucursal
            </label>
            <CustomSelect
              options={sucursales.map(sucursal => ({
                value: sucursal.id,
                label: `${sucursal.nombre} - ${sucursal.ciudad}`
              }))}
              value={formData.sucursalId}
              onChange={(value) => setFormData({ ...formData, sucursalId: value })}
              placeholder="Seleccione la sucursal"
            />
            
            {formData.sucursalId && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                {(() => {
                  const sucursalSeleccionada = sucursales.find(s => s.id === formData.sucursalId);
                  return sucursalSeleccionada ? (
                    <div className="text-sm text-green-800">
                      <p><strong>📍 Dirección:</strong> {sucursalSeleccionada.direccion}</p>
                      <p><strong>🏙️ Ciudad:</strong> {sucursalSeleccionada.ciudad}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* Hora */}
          {formData.doctorId && formData.fecha && (
            <div>
              <label className="form-label flex items-center">
                <Clock className="h-4 w-4 mr-2 text-medical-green" />
                Horarios Disponibles
              </label>
              {horariosDisponibles.length > 0 ? (
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {horariosDisponibles.map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        onClick={() => setFormData({ ...formData, hora })}
                        className={`p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                          formData.hora === hora
                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Seleccione el horario que mejor le convenga
                  </p>
                </div>
              ) : (
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    ❌ No hay horarios disponibles para esta fecha
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Por favor seleccione otra fecha o consulte con el doctor
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <label className="form-label flex items-center">
              <FileText className="h-4 w-4 mr-2 text-neutral-600" />
              Notas Adicionales (Opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-neutral-900 resize-none placeholder-neutral-500"
              rows={4}
              placeholder="Ej: Dolor en muela, preferencia de horario matutino, alergias..."
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-600">
                💡 Comparta información relevante para su cita
              </p>
              <p className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                {formData.notas.length}/500
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-neutral-100">
            <button
              type="submit"
              disabled={loading || !formData.hora}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Procesando Cita...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  📅 Confirmar y Agendar Cita
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  pacienteNombre: '',
                  doctorId: '',
                  servicioId: '',
                  sucursalId: '',
                  fecha: '',
                  hora: '',
                  notas: ''
                });
                setSelectedDoctor(null);
                setHorariosDisponibles([]);
              }}
              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🔄 Limpiar Formulario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendarCitaPage;
