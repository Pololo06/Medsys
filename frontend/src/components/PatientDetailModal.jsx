import { Mail, Phone, X, Pencil, IdCard } from 'lucide-react';
import { PATIENT_STATUS_MAP } from '../constants';

function DetailRow({ icon, label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-row-icon">{icon}</span>
      <div>
        <p className="detail-row-label">{label}</p>
        <p className={`detail-row-value ${mono ? 'detail-row-value--mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

export default function PatientDetailModal({ patient, onClose, onEdit }) {
  if (!patient) return null;
  const st = PATIENT_STATUS_MAP[patient.status] || PATIENT_STATUS_MAP.ACTIVE;
  const initials = patient.fullName
    ? patient.fullName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-detail">
        <div className="modal-header">
          <h3 className="modal-title">Detalle del paciente</h3>
          <button onClick={onClose} className="modal-close-btn" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-avatar-row">
            <div className="detail-avatar">{initials}</div>
            <div className="detail-name-section">
              <p className="detail-name">{patient.fullName}</p>
              <span className={`badge ${st.badge}`}>{st.label}</span>
            </div>
          </div>
          <div className="divider" />
          <div className="detail-fields">
            <DetailRow icon={<IdCard size={15} />} label="DOCUMENTO" value={patient.documentId || '—'} mono />
            <DetailRow icon={<Mail size={15} />} label="CORREO" value={patient.email || '—'} />
            <DetailRow icon={<Phone size={15} />} label="TELÉFONO" value={patient.phone || '—'} mono />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
          {onEdit && (
            <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onEdit(patient); }}>
              <Pencil size={13} /> Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
