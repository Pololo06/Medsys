import { AlertTriangle } from 'lucide-react';
import '../styles/Shared.css';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', variant = 'danger' }) {
  if (!isOpen) return null;

  const colors = variant === 'danger'
      ? { bg: 'rgba(244,63,94,0.08)', icon: '#f43f5e', border: 'rgba(244,63,94,0.2)' }
      : { bg: 'rgba(251,191,36,0.08)', icon: '#f59e0b', border: 'rgba(251,191,36,0.2)' };

  return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal confirm-modal">
          <div className="modal-body confirm-modal-body">
            <div className="confirm-content-wrapper">
              {/* Categoría B: Colores dependientes del 'variant' */}
              <div
                  className="confirm-icon-container"
                  style={{ background: colors.bg, borderColor: colors.border }}
              >
                <AlertTriangle size={20} color={colors.icon} strokeWidth={2} />
              </div>
              <div className="confirm-text-container">
                <p className="confirm-title">{title}</p>
                <p className="confirm-message">{message}</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
            <button
                className={`btn btn-sm ${variant === 'danger' ? 'btn-danger' : 'btn-warning'}`}
                onClick={() => { onConfirm(); onClose(); }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
  );
}