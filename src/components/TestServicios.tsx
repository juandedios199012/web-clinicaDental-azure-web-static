import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Servicio } from '../types';
import CustomSelect from './CustomSelect';

const TestServicios: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    const testServiciosAPI = async () => {
      console.log('🧪 [TEST] Iniciando prueba de servicios...');
      setLoading(true);
      setError(null);
      
      try {
        console.log('🧪 [TEST] Llamando a apiService.getServicios()...');
        const serviciosData = await apiService.getServicios();
        
        console.log('🧪 [TEST] Respuesta recibida:', serviciosData);
        console.log('🧪 [TEST] Tipo de datos:', typeof serviciosData);
        console.log('🧪 [TEST] Es array?:', Array.isArray(serviciosData));
        console.log('🧪 [TEST] Cantidad:', serviciosData?.length || 0);
        
        if (serviciosData && serviciosData.length > 0) {
          serviciosData.forEach((servicio, index) => {
            console.log(`🧪 [TEST] Servicio ${index + 1}:`, {
              id: servicio.id,
              nombre: servicio.nombre,
              especialidad: servicio.especialidad,
              precio: servicio.precio,
              activo: servicio.activo
            });
          });
          
          const especialidades = [...new Set(serviciosData.map(s => s.especialidad).filter(Boolean))];
          console.log('🧪 [TEST] Especialidades únicas:', especialidades);
        }
        
        setServicios(serviciosData || []);
        console.log('✅ [TEST] Servicios guardados en estado');
        
      } catch (err) {
        console.error('❌ [TEST] Error en la prueba:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    testServiciosAPI();
  }, []);

  const especialidades = [...new Set(servicios.map(s => s.especialidad).filter(Boolean))];

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800">Probando API de Servicios...</h3>
        <p className="text-blue-600">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error en la Prueba</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800">Prueba de API de Servicios</h3>
      
      {/* Dropdown de prueba */}
      <div className="mt-4 max-w-xs">
        <label className="block text-sm font-medium text-green-700 mb-2">
          Dropdown de Prueba - Tipo de Servicio:
        </label>
        <CustomSelect
          options={[
            { value: '', label: 'Todos los servicios' },
            ...especialidades.map(especialidad => ({ value: especialidad, label: especialidad }))
          ]}
          value={selectedService}
          onChange={setSelectedService}
          placeholder="Seleccione tipo de servicio"
        />
        <p className="text-xs text-green-600 mt-1">
          Seleccionado: {selectedService || 'Ninguno'}
        </p>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-green-700">Servicios Cargados ({servicios.length}):</h4>
        <ul className="mt-2 space-y-2">
          {servicios.map(servicio => (
            <li key={servicio.id} className="p-2 bg-white rounded border">
              <div className="font-medium">{servicio.nombre}</div>
              <div className="text-sm text-gray-600">
                Especialidad: <span className="font-mono bg-gray-100 px-1 rounded">{servicio.especialidad}</span> | Precio: ${servicio.precio}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="font-medium text-green-700">Especialidades Únicas ({especialidades.length}):</h4>
        <ul className="mt-2">
          {especialidades.map(especialidad => (
            <li key={especialidad} className="inline-block px-2 py-1 bg-white rounded border mr-2 mb-2">
              <span className="font-mono">{especialidad}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TestServicios;
