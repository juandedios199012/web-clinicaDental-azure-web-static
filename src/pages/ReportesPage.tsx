import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Users, DollarSign, Filter, Download, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import { Cita, Servicio, Sucursal } from '../types';
import CustomSelect from '../components/CustomSelect';

interface ReportFilters {
  sucursal: string;
  tipoServicio: string;
  publicoObjetivo: string;
  fechaInicio: string;
  fechaFin: string;
}

interface AppointmentStats {
  atendidas: number;
  canceladas: number;
  total: number;
  porcentajeAtendidas: number;
}

interface ServiceStats {
  servicio: string;
  especializacion: string;
  cantidad: number;
  ingresos: number;
}

interface MonthlyStats {
  mes: string;
  atendidas: number;
  canceladas: number;
  ingresos: number;
}

const ReportesPage: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    sucursal: '',
    tipoServicio: '',
    publicoObjetivo: '',
    fechaInicio: '',
    fechaFin: ''
  });

  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Estados para los reportes calculados
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    atendidas: 0,
    canceladas: 0,
    total: 0,
    porcentajeAtendidas: 0
  });

  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [citas, servicios, filters]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('🔄 [REPORTES] Iniciando carga de datos...');
      
      const [citasData, serviciosData, sucursalesData] = await Promise.all([
        apiService.getCitas(),
        apiService.getServicios(),
        apiService.getSucursales()
      ]);
      
      console.log('📊 [REPORTES] Datos cargados:', {
        citas: citasData?.length || 0,
        servicios: serviciosData?.length || 0,
        sucursales: sucursalesData?.length || 0
      });
      
      setCitas(citasData);
      
      console.log('🧪 [REPORTES] Servicios detallados recibidos:', serviciosData);
      console.log('🧪 [REPORTES] Servicios disponibles para filtro:', 
        serviciosData?.map(s => ({ 
          id: s.id,
          nombre: s.nombre,
          precio: s.precio
        })) || []
      );
      
      setServicios(serviciosData);
      setSucursales(sucursalesData);
      setLastUpdated(new Date());
      
      console.log('✅ [REPORTES] Carga de datos completada exitosamente');
    } catch (error) {
      console.error('❌ [REPORTES] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const filteredCitas = applyFilters(citas);
    
    // Estadísticas de citas
    const atendidas = filteredCitas.filter(cita => cita.estado === 'completada').length;
    const canceladas = filteredCitas.filter(cita => cita.estado === 'cancelada').length;
    const total = filteredCitas.length;
    const porcentajeAtendidas = total > 0 ? Math.round((atendidas / total) * 100) : 0;

    setAppointmentStats({ atendidas, canceladas, total, porcentajeAtendidas });

    // Estadísticas por servicio (simplificado sin especialidades confusas)
    const serviceStatsMap = new Map<string, ServiceStats>();
    
    filteredCitas.forEach(cita => {
      if (cita.estado === 'completada') {
        const servicio = servicios.find(s => s.id === cita.servicioId);
        if (servicio) {
          const key = servicio.nombre;
          const existing = serviceStatsMap.get(key) || {
            servicio: servicio.nombre,
            especializacion: `$${servicio.precio}`, // Mostrar precio en lugar de especialidad
            cantidad: 0,
            ingresos: 0
          };
          
          serviceStatsMap.set(key, {
            ...existing,
            cantidad: existing.cantidad + 1,
            ingresos: existing.ingresos + servicio.precio
          });
        }
      }
    });

    setServiceStats(Array.from(serviceStatsMap.values()).sort((a, b) => b.cantidad - a.cantidad));

    // Estadísticas mensuales
    const monthlyStatsMap = new Map<string, MonthlyStats>();
    
    filteredCitas.forEach(cita => {
      const fecha = new Date(cita.fecha);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesNombre = fecha.toLocaleDateString('es-PE', { year: 'numeric', month: 'long' });
      
      const existing = monthlyStatsMap.get(mesKey) || {
        mes: mesNombre,
        atendidas: 0,
        canceladas: 0,
        ingresos: 0
      };

      if (cita.estado === 'completada') {
        const servicio = servicios.find(s => s.id === cita.servicioId);
        existing.atendidas += 1;
        existing.ingresos += servicio?.precio || 0;
      } else if (cita.estado === 'cancelada') {
        existing.canceladas += 1;
      }

      monthlyStatsMap.set(mesKey, existing);
    });

    const sortedMonthlyStats = Array.from(monthlyStatsMap.values())
      .sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());
    
    setMonthlyStats(sortedMonthlyStats);
  };

  const applyFilters = (citasToFilter: Cita[]): Cita[] => {
    return citasToFilter.filter(cita => {
      // Filtro por sucursal (simulado - todas las citas son de la misma sucursal por ahora)
      if (filters.sucursal && filters.sucursal !== 'principal') {
        return false;
      }

      // Filtro por tipo de servicio (usar nombre del servicio directamente)
      if (filters.tipoServicio) {
        const servicio = servicios.find(s => s.id === cita.servicioId);
        if (!servicio || servicio.nombre !== filters.tipoServicio) {
          return false;
        }
      }

      // Filtro por público objetivo (simulado basado en horario)
      if (filters.publicoObjetivo) {
        const hora = new Date(cita.fecha).getHours();
        if (filters.publicoObjetivo === 'adultos' && (hora < 9 || hora > 17)) {
          return false;
        }
        if (filters.publicoObjetivo === 'niños' && (hora < 15 || hora > 18)) {
          return false;
        }
      }

      // Filtro por fecha
      if (filters.fechaInicio) {
        const fechaCita = new Date(cita.fecha);
        const fechaInicio = new Date(filters.fechaInicio);
        if (fechaCita < fechaInicio) {
          return false;
        }
      }

      if (filters.fechaFin) {
        const fechaCita = new Date(cita.fecha);
        const fechaFin = new Date(filters.fechaFin);
        if (fechaCita > fechaFin) {
          return false;
        }
      }

      return true;
    });
  };

  const resetFilters = () => {
    setFilters({
      sucursal: '',
      tipoServicio: '',
      publicoObjetivo: '',
      fechaInicio: '',
      fechaFin: ''
    });
  };

  const exportData = () => {
    const data = {
      filtros: filters,
      estadisticas: {
        citas: appointmentStats,
        servicios: serviceStats,
        mensuales: monthlyStats
      },
      fechaGeneracion: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-clinica-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard de Reportes</h1>
          <p className="text-neutral-600 mt-2">Análisis y métricas para toma de decisiones operativas</p>
          <p className="text-sm text-neutral-500 mt-1">
            Última actualización: {lastUpdated.toLocaleString('es-PE')}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={loadInitialData}
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={exportData}
            className="btn-primary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-8">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 mr-2 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-900">Filtros de Análisis</h2>
        </div>
        
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="form-label">Sucursal</label>
            <CustomSelect
              options={[
                { value: '', label: 'Todas las sucursales' },
                ...sucursales.map(sucursal => ({ value: sucursal.id, label: sucursal.nombre }))
              ]}
              value={filters.sucursal}
              onChange={(value) => setFilters({ ...filters, sucursal: value })}
              placeholder="Seleccione sucursal"
            />
          </div>

          <div>
            <label className="form-label">Tipo de Servicio</label>
            <CustomSelect
              options={(() => {
                console.log('🔍 [REPORTES-DROPDOWN] Estado actual:', {
                  loading,
                  totalServicios: servicios.length,
                  serviciosDisponibles: servicios.map(s => s.nombre)
                });
                
                if (loading) {
                  console.log('🔄 [REPORTES-DROPDOWN] Mostrando loading...');
                  return [{ value: 'loading', label: 'Cargando servicios...' }];
                } else {
                  const opcionesServicios = servicios.map(servicio => ({ 
                    value: servicio.nombre, 
                    label: servicio.nombre 
                  }));
                  console.log('✅ [REPORTES-DROPDOWN] Mostrando servicios directos:', opcionesServicios);
                  return [
                    { value: '', label: 'Todos los servicios' },
                    ...opcionesServicios
                  ];
                }
              })()}
              value={filters.tipoServicio}
              onChange={(value) => setFilters({ ...filters, tipoServicio: value })}
              placeholder="Seleccione servicio"
            />
          </div>

          <div>
            <label className="form-label">Público Objetivo</label>
            <CustomSelect
              options={[
                { value: '', label: 'Todos los públicos' },
                { value: 'adultos', label: 'Adultos' },
                { value: 'niños', label: 'Niños' },
                { value: 'tercera-edad', label: 'Tercera Edad' }
              ]}
              value={filters.publicoObjetivo}
              onChange={(value) => setFilters({ ...filters, publicoObjetivo: value })}
              placeholder="Seleccione público"
            />
          </div>

          <div>
            <label className="form-label">Fecha Inicio</label>
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Fecha Fin</label>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={resetFilters} className="btn-secondary text-sm">
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-medical-blue to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Citas</p>
              <p className="text-3xl font-bold">{appointmentStats.total}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-medical-green to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Citas Atendidas</p>
              <p className="text-3xl font-bold">{appointmentStats.atendidas}</p>
              <p className="text-green-200 text-sm">{appointmentStats.porcentajeAtendidas}% del total</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Citas Canceladas</p>
              <p className="text-3xl font-bold">{appointmentStats.canceladas}</p>
              <p className="text-red-200 text-sm">{appointmentStats.total > 0 ? Math.round((appointmentStats.canceladas / appointmentStats.total) * 100) : 0}% del total</p>
            </div>
            <Users className="h-12 w-12 text-red-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-medical-teal to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Ingresos Totales</p>
              <p className="text-3xl font-bold">
                S/ {serviceStats.reduce((sum, stat) => sum + stat.ingresos, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-teal-200" />
          </div>
        </div>
      </div>

      {/* Gráficos y Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Procedimientos por Especialización */}
        <div className="card">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Procedimientos por Especialización</h3>
          </div>
          
          <div className="space-y-4">
            {serviceStats.slice(0, 6).map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-neutral-700">{stat.servicio}</span>
                    <span className="text-sm text-neutral-600">{stat.cantidad} citas</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>{stat.especializacion}</span>
                    <span>S/ {stat.ingresos.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-medical-blue to-medical-teal h-2 rounded-full"
                      style={{ 
                        width: `${Math.max((stat.cantidad / Math.max(...serviceStats.map(s => s.cantidad))) * 100, 5)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análisis de Costos vs Ingresos */}
        <div className="card">
          <div className="flex items-center mb-6">
            <PieChart className="h-6 w-6 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Análisis de Rendimiento</h3>
          </div>
          
          <div className="space-y-6">
            {/* Tasa de Éxito */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-700">Tasa de Citas Completadas</span>
                <span className="text-sm font-bold text-medical-green">{appointmentStats.porcentajeAtendidas}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-medical-green to-green-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${appointmentStats.porcentajeAtendidas}%` }}
                ></div>
              </div>
            </div>

            {/* Especialización más Rentable */}
            {serviceStats.length > 0 && (
              <div className="bg-gradient-to-br from-medical-blue/10 to-medical-teal/10 rounded-lg p-4">
                <h4 className="font-medium text-neutral-800 mb-2">Especialización más Rentable</h4>
                <p className="text-lg font-bold text-medical-blue">{serviceStats[0].especializacion}</p>
                <p className="text-sm text-neutral-600">
                  {serviceStats[0].cantidad} procedimientos - S/ {serviceStats[0].ingresos.toLocaleString()}
                </p>
              </div>
            )}

            {/* Promedio por Cita */}
            <div className="bg-gradient-to-br from-medical-green/10 to-green-400/10 rounded-lg p-4">
              <h4 className="font-medium text-neutral-800 mb-2">Ingreso Promedio por Cita</h4>
              <p className="text-lg font-bold text-medical-green">
                S/ {appointmentStats.atendidas > 0 ? 
                  Math.round(serviceStats.reduce((sum, stat) => sum + stat.ingresos, 0) / appointmentStats.atendidas)
                  .toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tendencias Mensuales */}
      {monthlyStats.length > 0 && (
        <div className="card mt-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Tendencias Mensuales</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Mes</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-700">Atendidas</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-700">Canceladas</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-700">Ingresos</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-700">Tasa Éxito</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((stat, index) => {
                  const total = stat.atendidas + stat.canceladas;
                  const tasaExito = total > 0 ? Math.round((stat.atendidas / total) * 100) : 0;
                  
                  return (
                    <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-medium text-neutral-900">{stat.mes}</td>
                      <td className="py-3 px-4 text-right text-medical-green font-medium">{stat.atendidas}</td>
                      <td className="py-3 px-4 text-right text-red-600">{stat.canceladas}</td>
                      <td className="py-3 px-4 text-right font-medium">S/ {stat.ingresos.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tasaExito >= 80 ? 'bg-green-100 text-green-800' :
                          tasaExito >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tasaExito}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
            <span className="text-lg">Actualizando datos...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesPage;
