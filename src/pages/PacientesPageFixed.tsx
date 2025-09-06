import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import { apiService } from '../services/api';
import CustomSelect from '../components/CustomSelect';
import type { Paciente, CreatePacienteForm, Pais, Ciudad } from '../types';

const PacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreatePacienteForm>({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
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
      console.log('🔄 Iniciando carga de datos iniciales...');
      
      // Consultar API optimizada
      console.log('📡 Consultando API optimizada de países...');
      const paisesFromAPI = await apiService.getPaises();
      console.log('🌍 Países recibidos desde API:', paisesFromAPI);
      console.log('📊 Cantidad de países:', paisesFromAPI?.length || 0);
      
      if (paisesFromAPI && paisesFromAPI.length > 0) {
        console.log('✅ API funcionó correctamente, usando sus datos');
        setPaises(paisesFromAPI);
      } else {
        console.log('⚠️ API no devolvió datos válidos');
        setPaises([]);
      }
      
      // Cargar pacientes
      console.log('� Llamando a apiService.getPacientes()...');
      const pacientesData = await apiService.getPacientes();
      console.log('📦 Pacientes cargados:', pacientesData?.length || 0);
      setPacientes(pacientesData);
      
      console.log('✅ Carga inicial completada');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      // Asegurar que al menos tengamos datos de fallback para países
      if (paises.length === 0) {
        console.log('🔄 Usando datos de fallback para países...');
        const fallbackPaises = [
          { codigo: 'PE', nombre: 'Perú' },
          { codigo: 'CO', nombre: 'Colombia' },
          { codigo: 'EC', nombre: 'Ecuador' },
          { codigo: 'BO', nombre: 'Bolivia' },
          { codigo: 'MX', nombre: 'México' }
        ];
        setPaises(fallbackPaises);
      }
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
      alert('Debe aceptar las políticas de privacidad');
      return;
    }

    try {
      if (editingId) {
        await apiService.updatePaciente(editingId, formData);
      } else {
        await apiService.createPaciente(formData);
      }
      
      await loadInitialData();
      resetForm();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error al guardar el paciente');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      correoElectronico: '',
      numeroTelefono: '',
      pais: '',
      ciudad: '',
      direccion: '',
      aceptaPoliticas: false
    });
    setEditingId(null);
    setShowForm(false);
    setCiudades([]);
  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-neutral-600">Cargando pacientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary-600" />
              Gestión de Pacientes - FORMULARIO COMPLETO
            </h1>
            <p className="mt-2 text-neutral-600">Administra la información de los pacientes de la clínica</p>
            <p className="text-xs text-neutral-400">Actualizado: {new Date().toLocaleTimeString()}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4 sm:mt-0 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar pacientes por nombre, apellido o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-900">
            Pacientes Registrados ({filteredPacientes.length})
          </h2>
        </div>
        
        {filteredPacientes.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No hay pacientes</h3>
            <p className="text-neutral-600">
              {searchTerm ? 'No se encontraron pacientes con esos criterios de búsqueda.' : 'Comienza agregando tu primer paciente.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fecha Nacimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredPacientes.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {paciente.nombre} {paciente.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{paciente.correoElectronico}</div>
                      <div className="text-sm text-neutral-500">{paciente.numeroTelefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{paciente.ciudad}</div>
                      <div className="text-sm text-neutral-500">{paciente.pais}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(paciente.fechaNacimiento).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* handleEdit(paciente) */}}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* handleDelete(paciente.id) */}}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulario - Mejorado para móviles */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  {editingId ? 'Editar Paciente' : 'Nuevo Paciente'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Información Personal */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="form-label text-sm sm:text-base">Nombre *</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="form-input text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label text-sm sm:text-base">Apellido *</label>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="form-input text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-sm sm:text-base">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                      className="form-input text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                    Información de Contacto
                  </h3>
                  
                  <div>
                    <label className="form-label">Correo Electrónico *</label>
                    <input
                      type="email"
                      value={formData.correoElectronico}
                      onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Número de Teléfono *</label>
                    <input
                      type="tel"
                      value={formData.numeroTelefono}
                      onChange={(e) => setFormData({ ...formData, numeroTelefono: e.target.value })}
                      className="form-input"
                      placeholder="+51 999 999 999"
                      required
                    />
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
                        onChange={handlePaisChange}
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
                        placeholder={
                          formData.pais 
                            ? (ciudades.length > 0 ? "Seleccione una ciudad" : "No hay ciudades disponibles")
                            : "Primero seleccione un país"
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Dirección *</label>
                    <textarea
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="form-input"
                      rows={3}
                      placeholder="Dirección completa"
                      required
                    />
                  </div>
                </div>

                {/* Políticas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                    Consentimientos
                  </h3>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="aceptaPoliticas"
                      checked={formData.aceptaPoliticas}
                      onChange={(e) => setFormData({ ...formData, aceptaPoliticas: e.target.checked })}
                      className="mt-1"
                      required
                    />
                    <label htmlFor="aceptaPoliticas" className="text-sm text-neutral-600">
                      Acepto las políticas de privacidad y el tratamiento de mis datos personales de acuerdo 
                      con la normativa vigente. *
                    </label>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacientesPage;
