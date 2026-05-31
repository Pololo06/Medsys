import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', variant = 'danger' }) {
  if (!isOpen) return null;

  const colors = variant === 'danger'
    ? { bg: 'rgba(244,63,94,0.08)', icon: '#f43f5e', border: 'rgba(244,63,94,0.2)' }
    : { bg: 'rgba(251,191,36,0.08)', icon: '#f59e0b', border: 'rgba(251,191,36,0.2)' };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-body" style={{ padding: '28px 28px 20px' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: colors.bg, border: `1px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color={colors.icon} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>
                {title}
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
          <button
            className={`btn btn-sm ${variant === 'danger' ? 'btn-danger' : ''}`}
            style={variant !== 'danger' ? { background: 'rgba(251,191,36,0.1)', color: '#d97706', border: '1px solid rgba(251,191,36,0.25)' } : {}}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
