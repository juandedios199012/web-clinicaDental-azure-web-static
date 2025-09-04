import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  minDate?: Date;
  maxDays?: number;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ 
  selectedDates, 
  onDatesChange, 
  minDate = new Date(),
  maxDays = 30 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Obtener el primer día del mes y el último
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Generar días del calendario
  const daysInMonth = lastDayOfMonth.getDate();
  const daysArray = [];

  // Días vacíos al inicio
  for (let i = 0; i < firstDayWeekday; i++) {
    daysArray.push(null);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  const formatDate = (day: number): string => {
    const date = new Date(currentYear, currentMonthIndex, day);
    return date.toISOString().split('T')[0];
  };

  const isDateSelectable = (day: number): boolean => {
    const date = new Date(currentYear, currentMonthIndex, day);
    const dayOfWeek = date.getDay();
    
    // Solo días laborables (lunes a viernes) y después de minDate
    return dayOfWeek >= 1 && dayOfWeek <= 5 && date >= minDate;
  };

  const isDateSelected = (day: number): boolean => {
    const dateStr = formatDate(day);
    return selectedDates.includes(dateStr);
  };

  const handleDateClick = (day: number) => {
    if (!isDateSelectable(day)) return;

    const dateStr = formatDate(day);
    let newSelectedDates = [...selectedDates];

    if (newSelectedDates.includes(dateStr)) {
      // Remover fecha si ya está seleccionada
      newSelectedDates = newSelectedDates.filter(date => date !== dateStr);
    } else {
      // Agregar fecha si no está seleccionada y no excede el límite
      if (newSelectedDates.length < maxDays) {
        newSelectedDates.push(dateStr);
      }
    }

    // Ordenar fechas
    newSelectedDates.sort();
    onDatesChange(newSelectedDates);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h3 className="text-lg font-semibold text-neutral-900">
          {monthNames[currentMonthIndex]} {currentYear}
        </h3>
        
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-neutral-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2"></div>;
          }

          const selectable = isDateSelectable(day);
          const selected = isDateSelected(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={!selectable}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105
                ${selected 
                  ? 'bg-primary-600 text-white font-semibold shadow-md' 
                  : selectable 
                    ? 'hover:bg-primary-50 text-neutral-900 border border-transparent hover:border-primary-200' 
                    : 'text-neutral-300 cursor-not-allowed'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
            <span>Fechas seleccionadas: {selectedDates.length}</span>
          </div>
          <div className="text-xs">
            Solo días laborables
          </div>
        </div>
        
        {selectedDates.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-neutral-500 mb-1">Fechas disponibles:</p>
            <div className="flex flex-wrap gap-1">
              {selectedDates.slice(0, 5).map(date => (
                <span key={date} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-PE', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </span>
              ))}
              {selectedDates.length > 5 && (
                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                  +{selectedDates.length - 5} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPicker;
