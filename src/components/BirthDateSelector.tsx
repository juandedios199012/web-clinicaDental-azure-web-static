import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface BirthDateSelectorProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  required?: boolean;
  className?: string;
}

const BirthDateSelector: React.FC<BirthDateSelectorProps> = ({
  value,
  onChange,
  required = false,
  className = ''
}) => {
  // Parsear la fecha actual y mantener estado interno
  const parseDate = (dateString: string) => {
    if (!dateString) return { day: '', month: '', year: '' };
    const [year, month, day] = dateString.split('-');
    return { day: day || '', month: month || '', year: year || '' };
  };

  const [internalDate, setInternalDate] = useState(() => parseDate(value));

  // Actualizar estado interno cuando cambie el valor externo
  useEffect(() => {
    setInternalDate(parseDate(value));
  }, [value]);

  const { day, month, year } = internalDate;

  // Generar opciones para días (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    return { value: dayNum.toString().padStart(2, '0'), label: dayNum.toString() };
  });

  // Meses del año
  const monthOptions = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Generar años (rango más razonable: últimos 100 años)
  const currentYear = new Date().getFullYear();

  // Función para calcular la edad
  const calculateAge = (birthYear: string) => {
    if (!birthYear) return '';
    const age = currentYear - parseInt(birthYear);
    return `(${age} años)`;
  };

  // Función para actualizar campos individuales
  const updateField = (field: 'day' | 'month' | 'year', newValue: string) => {
    const newDate = { ...internalDate, [field]: newValue };
    setInternalDate(newDate);
    
    // Si todos los campos están completos, validar y emitir la fecha
    if (newDate.day && newDate.month && newDate.year) {
      const yearNum = parseInt(newDate.year);
      
      // Validaciones básicas
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        onChange('');
        return;
      }
      
      // Validar que no sea fecha futura
      const selectedDate = new Date(yearNum, parseInt(newDate.month) - 1, parseInt(newDate.day));
      const today = new Date();
      
      if (selectedDate > today) {
        onChange('');
        return;
      }
      
      // Formatear fecha válida
      const formattedDate = `${newDate.year}-${newDate.month.padStart(2, '0')}-${newDate.day.padStart(2, '0')}`;
      onChange(formattedDate);
    } else {
      // Si algún campo está vacío, emitir string vacío
      onChange('');
    }
  };

  // Verificar si la fecha seleccionada es futura o inválida
  const getDateValidation = () => {
    if (!internalDate.day || !internalDate.month || !internalDate.year) return { isValid: true, message: '' };
    
    const yearNum = parseInt(internalDate.year);
    if (yearNum < 1900 || yearNum > currentYear) {
      return { isValid: false, message: `El año debe estar entre 1900 y ${currentYear}` };
    }
    
    const selectedDate = new Date(yearNum, parseInt(internalDate.month) - 1, parseInt(internalDate.day));
    const today = new Date();
    
    if (selectedDate > today) {
      return { isValid: false, message: 'La fecha de nacimiento no puede ser una fecha futura' };
    }
    
    return { isValid: true, message: '' };
  };

  // Validar días según el mes y año seleccionados
  const getValidDays = () => {
    if (!internalDate.month || !internalDate.year) return dayOptions;
    
    const daysInMonth = new Date(parseInt(internalDate.year), parseInt(internalDate.month), 0).getDate();
    return dayOptions.slice(0, daysInMonth);
  };

  const validDayOptions = getValidDays();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Calendar className="h-4 w-4 text-neutral-500" />
        <span className="text-sm text-neutral-600">Selecciona tu fecha de nacimiento</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Día */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Día {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={day}
            onChange={(e) => updateField('day', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            required={required}
          >
            <option value="">Día</option>
            {validDayOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mes */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Mes {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={month}
            onChange={(e) => updateField('month', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            required={required}
          >
            <option value="">Mes</option>
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Año */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Año {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => updateField('year', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            placeholder="AAAA"
            min={1900}
            max={currentYear}
            required={required}
          />
          <div className="mt-1 text-xs text-neutral-500">
            Ejemplo: 1990, 1985, 2000
          </div>
        </div>
      </div>

      {/* Mostrar fecha seleccionada como feedback */}
      {internalDate.day && internalDate.month && internalDate.year && getDateValidation().isValid && (
        <div className="mt-2 p-3 bg-primary-50 rounded-md border border-primary-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-primary-700 font-medium">
              Fecha seleccionada: {parseInt(internalDate.day)} de {monthOptions.find(m => m.value === internalDate.month)?.label} de {internalDate.year}
            </p>
            <p className="text-sm text-primary-600">
              {calculateAge(internalDate.year)}
            </p>
          </div>
        </div>
      )}

      {/* Error para fechas inválidas */}
      {internalDate.day && internalDate.month && internalDate.year && !getDateValidation().isValid && (
        <div className="mt-2 p-3 bg-red-50 rounded-md border border-red-200">
          <p className="text-sm text-red-700 font-medium">
            ⚠️ {getDateValidation().message}
          </p>
        </div>
      )}

      {/* Validación visual */}
      {required && (!internalDate.day || !internalDate.month || !internalDate.year) && (
        <p className="text-xs text-neutral-500 mt-1">
          Por favor selecciona día, mes y año
        </p>
      )}
    </div>
  );
};

export default BirthDateSelector;
