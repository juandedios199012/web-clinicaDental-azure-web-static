import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { apiService } from '../services/api';
import { Doctor } from '../types';
import CalendarPicker from '../components/CalendarPicker';

const DoctoresPage: React.FC = () => {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    telefono: '',
    email: '',
    horarioInicio: '08:00',
    horarioFin: '17:00',
    fechasDisponibles: [] as string[]
  });

  useEffect(() => {
    loadDoctores();
  }, []);

  const loadDoctores = async () => {
    try {
      const data = await apiService.getDoctores();
      setDoctores(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await apiService.updateDoctor(editingDoctor.id, formData);
      } else {
        await apiService.createDoctor(formData);
      }
      await loadDoctores();
      resetForm();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este doctor?')) {
      try {
        await apiService.deleteDoctor(id);
        await loadDoctores();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      nombre: doctor.nombre,
      especialidad: doctor.especialidad,
      telefono: doctor.telefono,
      email: doctor.email,
      horarioInicio: doctor.horarioInicio,
      horarioFin: doctor.horarioFin,
      fechasDisponibles: [] // TODO: cargar fechas existentes del doctor
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      especialidad: '',
      telefono: '',
      email: '',
      horarioInicio: '08:00',
      horarioFin: '17:00',
      fechasDisponibles: []
    });
    setEditingDoctor(null);
    setShowForm(false);
  };

  const filteredDoctores = doctores.filter(doctor =>
    doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-neutral-900">Doctores</h1>
          <p className="text-neutral-600 mt-2">Gestión de profesionales médicos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Doctor
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            {editingDoctor ? 'Editar Doctor' : 'Nuevo Doctor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Especialidad</label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Horario Inicio</label>
                <input
                  type="time"
                  value={formData.horarioInicio}
                  onChange={(e) => setFormData({ ...formData, horarioInicio: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Horario Fin</label>
                <input
                  type="time"
                  value={formData.horarioFin}
                  onChange={(e) => setFormData({ ...formData, horarioFin: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Calendario de disponibilidad */}
            <div className="space-y-2">
              <label className="form-label">Fechas de Disponibilidad</label>
              <p className="text-sm text-neutral-600 mb-3">
                📅 Seleccione las fechas en las que el doctor estará disponible para atender pacientes.
              </p>
              <CalendarPicker
                selectedDates={formData.fechasDisponibles}
                onDatesChange={(dates) => setFormData({ ...formData, fechasDisponibles: dates })}
                minDate={new Date()}
                maxDays={60}
              />
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                {editingDoctor ? 'Actualizar' : 'Crear'} Doctor
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Búsqueda */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar doctores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Lista de Doctores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctores.map((doctor) => (
          <div key={doctor.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{doctor.nombre}</h3>
                <p className="text-medical-blue font-medium">{doctor.especialidad}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(doctor)}
                  className="text-neutral-600 hover:text-primary-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(doctor.id)}
                  className="text-neutral-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-neutral-600">
              <p>{doctor.email}</p>
              <p>{doctor.telefono}</p>
              <p>Horario: {doctor.horarioInicio} - {doctor.horarioFin}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctores.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-neutral-500">No se encontraron doctores</p>
        </div>
      )}
    </div>
  );
};

export default DoctoresPage;
