import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Search, Clock, DollarSign } from 'lucide-react';
import { apiService } from '../services/api';
import { Servicio } from '../types';

const ServiciosPage: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    duracion: 30,
    precio: 0
  });

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      const data = await apiService.getServicios();
      setServicios(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingServicio) {
        // Actualización pendiente - no implementado en API
        console.log('Update service:', formData);
      } else {
        await apiService.createServicio(formData);
      }
      await loadServicios();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre: servicio.nombre,
      duracion: servicio.duracion,
      precio: servicio.precio
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      duracion: 30,
      precio: 0
    });
    setEditingServicio(null);
    setShowForm(false);
  };

  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-neutral-900">Servicios</h1>
          <p className="text-neutral-600 mt-2">Gestión de servicios médicos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Servicio
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Nombre del Servicio</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="form-input"
                required
                placeholder="Ej: Limpieza dental, Ortodoncia, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Duración (minutos)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  <input
                    type="number"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 0 })}
                    className="form-input pl-10"
                    required
                    min="15"
                    step="15"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Precio (S/)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    className="form-input pl-10"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                {editingServicio ? 'Actualizar' : 'Crear'} Servicio
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
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Lista de Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServicios.map((servicio) => (
          <div key={servicio.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{servicio.nombre}</h3>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-medical-blue" />
                    <span>{servicio.duracion} min</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-medical-green" />
                    <span>S/ {servicio.precio.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleEdit(servicio)}
                className="text-neutral-600 hover:text-primary-600 ml-4"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                servicio.activo 
                  ? 'bg-medical-green text-white' 
                  : 'bg-neutral-200 text-neutral-700'
              }`}>
                {servicio.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredServicios.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-neutral-500">No se encontraron servicios</p>
        </div>
      )}
    </div>
  );
};

export default ServiciosPage;
