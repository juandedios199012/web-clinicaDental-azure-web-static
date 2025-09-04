import React, { useState, useEffect } from 'react';
import { Calendar, User, Stethoscope, Clock, FileText } from 'lucide-react';
import { apiService } from '../services/api';
import { Doctor, Servicio } from '../types';

const AgendarCitaPage: React.FC = () => {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    pacienteNombre: '',
    doctorId: '',
    servicioId: '',
    fecha: '',
    hora: '',
    notas: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.doctorId && formData.fecha) {
      loadDisponibilidad();
    } else {
      setHorariosDisponibles([]);
    }
  }, [formData.doctorId, formData.fecha]);

  const loadInitialData = async () => {
    try {
      const [doctoresData, serviciosData] = await Promise.all([
        apiService.getDoctores(),
        apiService.getServicios()
      ]);
      setDoctores(doctoresData);
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadDisponibilidad = async () => {
    if (!formData.doctorId || !formData.fecha) return;
    
    try {
      const disponibilidad = await apiService.getDisponibilidad(formData.doctorId, formData.fecha);
      setHorariosDisponibles(disponibilidad.horariosDisponibles || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiService.createCita({
        pacienteNombre: formData.pacienteNombre,
        doctorId: formData.doctorId,
        servicioId: formData.servicioId,
        fecha: formData.fecha,
        hora: formData.hora,
        notas: formData.notas || undefined
      });
      
      // Reset form
      setFormData({
        pacienteNombre: '',
        doctorId: '',
        servicioId: '',
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
            <select
              value={formData.doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-neutral-900"
              required
            >
              <option value="">Seleccione el doctor de su preferencia</option>
              {doctores.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.nombre} - {doctor.especialidad}
                </option>
              ))}
            </select>
            
            {selectedDoctor && (
              <div className="mt-2 p-3 bg-medical-blue bg-opacity-10 rounded-lg">
                <p className="text-sm text-neutral-700">
                  <strong>Especialidad:</strong> {selectedDoctor.especialidad}
                </p>
                <p className="text-sm text-neutral-700">
                  <strong>Horario:</strong> {selectedDoctor.horarioInicio} - {selectedDoctor.horarioFin}
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
              <Stethoscope className="h-4 w-4 mr-2 text-medical-green" />
              Servicio Requerido
            </label>
            <select
              value={formData.servicioId}
              onChange={(e) => setFormData({ ...formData, servicioId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-neutral-900"
              required
            >
              <option value="">Seleccione el servicio dental</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre} - {servicio.duracion}min - S/ {servicio.precio}
                </option>
              ))}
            </select>
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
