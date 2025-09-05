import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, User, Mail, Phone, MapPin, UserPlus } from 'lucide-react';
import { apiService } from '../services/api';
import { Paciente, CreatePacienteForm, Pais, Ciudad } from '../types';
import CustomSelect from '../components/CustomSelect';

const PacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);

  const [formData, setFormData] = useState<CreatePacienteForm>({
    nombre: '',
    apellido: '',
    correoElectronico: '',
    numeroTelefono: '',
    pais: '',
    ciudad: '',
    direccion: '',
    aceptaPoliticas: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [pacientesData, paisesData] = await Promise.all([
        apiService.getPacientes(),
        apiService.getPaises()
      ]);
      
      setPacientes(pacientesData);
      setPaises(paisesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaisChange = async (paisCodigo: string) => {
    setFormData({ ...formData, pais: paisCodigo, ciudad: '' });
    
    if (paisCodigo) {
      try {
        const ciudadesData = await apiService.getCiudades(paisCodigo);
        setCiudades(ciudadesData);
      } catch (error) {
        console.error('Error loading cities:', error);
        setCiudades([]);
      }
    } else {
      setCiudades([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aceptaPoliticas) {
      alert('Debe aceptar la política de privacidad de datos');
      return;
    }

    setLoading(true);
    try {
      if (editingPaciente) {
        await apiService.updatePaciente(editingPaciente.id, formData);
      } else {
        await apiService.createPaciente(formData);
      }
      await loadInitialData();
      resetForm();
      alert(editingPaciente ? 'Paciente actualizado exitosamente' : 'Paciente registrado exitosamente');
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error al guardar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setFormData({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      correoElectronico: paciente.correoElectronico,
      numeroTelefono: paciente.numeroTelefono,
      pais: paciente.pais,
      ciudad: paciente.ciudad,
      direccion: paciente.direccion,
      aceptaPoliticas: paciente.aceptaPoliticas
    });
    
    // Cargar ciudades del país del paciente
    if (paciente.pais) {
      handlePaisChange(paciente.pais);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este paciente?')) {
      try {
        await apiService.deletePaciente(id);
        await loadInitialData();
        alert('Paciente eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error al eliminar el paciente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correoElectronico: '',
      numeroTelefono: '',
      pais: '',
      ciudad: '',
      direccion: '',
      aceptaPoliticas: false
    });
    setEditingPaciente(null);
    setShowForm(false);
    setCiudades([]);
  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && pacientes.length === 0) {
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
          <h1 className="text-3xl font-bold text-neutral-900">Pacientes</h1>
          <p className="text-neutral-600 mt-2">Gestión del registro de pacientes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Paciente
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
            <UserPlus className="h-6 w-6 mr-2 text-primary-600" />
            {editingPaciente ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="form-input"
                    required
                    placeholder="Ingrese el nombre"
                  />
                </div>
                <div>
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="form-input"
                    required
                    placeholder="Ingrese el apellido"
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                    <input
                      type="email"
                      value={formData.correoElectronico}
                      onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
                      className="form-input pl-10"
                      required
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Número de Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={formData.numeroTelefono}
                      onChange={(e) => setFormData({ ...formData, numeroTelefono: e.target.value })}
                      className="form-input pl-10"
                      required
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Ubicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                Información de Ubicación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">País *</label>
                  <CustomSelect
                    options={paises.map(pais => ({ value: pais.codigo, label: pais.nombre }))}
                    value={formData.pais}
                    onChange={(value) => handlePaisChange(value)}
                    placeholder="Seleccione un país"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Ciudad *</label>
                  <CustomSelect
                    options={ciudades.map(ciudad => ({ value: ciudad.codigo, label: ciudad.nombre }))}
                    value={formData.ciudad}
                    onChange={(value) => setFormData({ ...formData, ciudad: value })}
                    placeholder="Seleccione una ciudad"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Dirección *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-neutral-400 h-5 w-5" />
                  <textarea
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="form-input pl-10 resize-none"
                    rows={3}
                    required
                    placeholder="Ingrese la dirección completa"
                  />
                </div>
              </div>
            </div>

            {/* Política de Privacidad */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="politica"
                  checked={formData.aceptaPoliticas}
                  onChange={(e) => setFormData({ ...formData, aceptaPoliticas: e.target.checked })}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  required
                />
                <label htmlFor="politica" className="ml-3 text-sm text-neutral-700">
                  <span className="font-medium">Acepto la política de privacidad de datos *</span>
                  <p className="text-neutral-600 mt-1">
                    Autorizo el tratamiento de mis datos personales de acuerdo con la política de privacidad 
                    de la clínica dental para fines médicos, administrativos y de comunicación.
                  </p>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-4 pt-6 border-t border-neutral-200">
              <button 
                type="submit" 
                className="btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {editingPaciente ? 'Actualizar' : 'Registrar'} Paciente
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
            placeholder="Buscar por nombre, apellido o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="space-y-4">
        {filteredPacientes.map((paciente) => (
          <div key={paciente.id} className="card hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary-600" />
                      {paciente.nombre} {paciente.apellido}
                    </h3>
                    
                    <div className="mt-2 space-y-1 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-medical-blue" />
                        <span>{paciente.correoElectronico}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-medical-green" />
                        <span>{paciente.numeroTelefono}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-medical-teal" />
                        <span>{paciente.ciudad}, {paciente.pais}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      paciente.activo 
                        ? 'bg-medical-green text-white' 
                        : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {paciente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-sm text-neutral-600">
                    <strong>Dirección:</strong> {paciente.direccion}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    <strong>Registrado:</strong> {new Date(paciente.fechaRegistro).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                <button 
                  onClick={() => handleEdit(paciente)}
                  className="btn-secondary text-sm flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(paciente.id)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredPacientes.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserPlus className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 text-lg">No se encontraron pacientes</p>
          <p className="text-neutral-400 text-sm mt-1">
            {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience registrando el primer paciente'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PacientesPage;
