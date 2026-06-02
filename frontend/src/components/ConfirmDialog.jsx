import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import '../styles/Shared.css';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  // BUG FIX: Se agrega loadingLabel para que el texto "Procesando..." sea genérico
  // y no siempre diga "Eliminando..." cuando se usa para confirmar/marcar no-show de citas.
  loadingLabel,
  variant = 'danger'
}) {
  const [confirming, setConfirming] = useState(false);

  if (!isOpen) return null;

  async function handleConfirm() {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  }

  // Si no se pasa loadingLabel, derivarlo del confirmLabel para mayor claridad
  const activeLoadingLabel = loadingLabel || `${confirmLabel}...`;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !confirming && onClose()}>
      <div className="modal confirm-modal">
        <div className="modal-body confirm-modal-body">
          <div className="confirm-content-wrapper">
            <div className={`confirm-icon-container confirm-icon-container--${variant}`}>
              <AlertTriangle size={20} strokeWidth={2} />
            </div>
            <div className="confirm-text-container">
              <p className="confirm-title">{title}</p>
              <p className="confirm-message">{message}</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={confirming}>Cancelar</button>
          <button
            className={`btn btn-sm ${variant === 'danger' ? 'btn-danger' : 'btn-warning'}`}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? activeLoadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
