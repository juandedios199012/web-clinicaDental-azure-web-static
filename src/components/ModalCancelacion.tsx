import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalCancelacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo?: string) => void;
  citaInfo: {
    pacienteNombre: string;
    fecha: string;
    hora: string;
  };
  loading?: boolean;
  motivosPredefinidos: string[];
}

const ModalCancelacion: React.FC<ModalCancelacionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  citaInfo,
  loading = false,
  motivosPredefinidos = []
}) => {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState('');

  // Resetear el motivo cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setMotivoSeleccionado('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const motivoFinal = motivoSeleccionado && motivoSeleccionado !== '' ? motivoSeleccionado : undefined;
    onConfirm(motivoFinal);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Cancelar Cita
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Información de la cita */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-orange-800 mb-2">
              Cita a cancelar:
            </h4>
            <div className="text-sm text-orange-700 space-y-1">
              <p><strong>Paciente:</strong> {citaInfo.pacienteNombre}</p>
              <p><strong>Fecha:</strong> {new Date(citaInfo.fecha + 'T00:00:00').toLocaleDateString('es-PE')}</p>
              <p><strong>Hora:</strong> {citaInfo.hora}</p>
            </div>
          </div>

          {/* Selector de motivo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Motivo de cancelación (opcional)
            </label>
            <select
              value={motivoSeleccionado}
              onChange={(e) => setMotivoSeleccionado(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Sin motivo específico --</option>
              {motivosPredefinidos.map(motivo => (
                <option key={motivo} value={motivo}>
                  {motivo}
                </option>
              ))}
            </select>
          </div>

          {/* Advertencia */}
          <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
            <p className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              Esta acción no se puede deshacer. La cita será marcada como cancelada permanentemente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn-primary px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelando...
              </>
            ) : (
              'Confirmar Cancelación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCancelacion;
