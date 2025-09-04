import React from 'react';
import { Calendar, Users, Stethoscope, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Panel de Control</h1>
        <p className="text-neutral-600 mt-2">Gestión integral de clínica dental</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-medical-blue rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Doctores</p>
              <p className="text-2xl font-bold text-neutral-900">8</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-medical-green rounded-lg p-3">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Servicios</p>
              <p className="text-2xl font-bold text-neutral-900">12</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-medical-teal rounded-lg p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Citas Hoy</p>
              <p className="text-2xl font-bold text-neutral-900">24</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-primary-600 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Esta Semana</p>
              <p className="text-2xl font-bold text-neutral-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full btn-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 mr-2" />
              Agendar Nueva Cita
            </button>
            <button className="w-full btn-secondary flex items-center justify-center">
              <Users className="h-5 w-5 mr-2" />
              Registrar Doctor
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Próximas Citas</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">María García</p>
                <p className="text-sm text-neutral-600">Dr. Juan Pérez - Limpieza</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-600">10:00</p>
                <p className="text-xs text-neutral-500">Hoy</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">Carlos López</p>
                <p className="text-sm text-neutral-600">Dra. Ana Ruiz - Ortodoncia</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-600">14:30</p>
                <p className="text-xs text-neutral-500">Hoy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
