import React from 'react';
import { Heart } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Clínica Dental</h1>
            <p className="text-sm text-neutral-600">Sistema de Gestión de Citas</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-900">Dr. Admin</p>
            <p className="text-xs text-neutral-600">Administrador</p>
          </div>
          <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">DA</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
