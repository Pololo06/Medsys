import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Users, X, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllPatients, createPatient, updatePatient } from '../services/PatientService';
import { PATIENT_STATUS_MAP } from '../constants';
import { useDebounce } from '../utils/debounce';
import { validateFullName, validateEmail, validatePhone } from '../utils/validation';
import TableSkeleton from '../components/Skeleton/TableSkeleton';

const EMPTY_FORM = { fullName: '', email: '', phone: '' };

function PatientDetailModal({ patient, onClose, onEdit }) {
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
            <DetailRow icon={<Mail size={15} />} label="CORREO" value={patient.email || '—'} />
            <DetailRow icon={<Phone size={15} />} label="TELÉFONO" value={patient.phone || '—'} mono />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onEdit(patient); }}>
            <Pencil size={13} /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

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

export default function PacientesPage() {
  const [pacientes, setPacientes]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [errors, setErrors]             = useState({});
  const [saving, setSaving]             = useState(false);
  const [detailPatient, setDetailPatient] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  async function fetchPacientes() {
    setLoading(true);
    try { setPacientes(await getAllPatients() || []); }
    catch { toast.error('No se pudieron cargar los pacientes.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { fetchPacientes(); }, []);

  function openNew()   { setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setIsModalOpen(true); }
  function openEdit(p) { setEditTarget(p); setForm({ fullName: p.fullName||'', email: p.email||'', phone: p.phone||'' }); setErrors({}); setIsModalOpen(true); }
  function closeModal(){ setIsModalOpen(false); setErrors({}); }

  async function handleSave() {
    const errs = {};
    const nameErr = validateFullName(form.fullName);
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    if (nameErr) errs.fullName = nameErr;
    if (emailErr) errs.email = emailErr;
    if (phoneErr) errs.phone = phoneErr;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      if (editTarget) { await updatePatient(editTarget.id, form.fullName, form.email, form.phone, editTarget.status); toast.success('Paciente actualizado.'); }
      else { await createPatient(form.fullName, form.email, form.phone); toast.success('Paciente creado.'); }
      await fetchPacientes(); closeModal();
    } catch (e) { toast.error(e.message || 'Error al guardar.'); }
    finally { setSaving(false); }
  }

  const filtered = pacientes.filter(p =>
    p.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div>
      <div className="page-bar">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{pacientes.length} registros en el sistema</p>
        </div>
        <div className="page-actions">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar paciente..." className="input search-input search-input--w240" />
          </div>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={15} /> Nuevo Paciente
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="medsys-table">
          <thead>
            <tr>{['Nombre completo', 'Correo electrónico', 'Teléfono', 'Estado', 'Acciones'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} columns={5} /> : filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-state-icon"><Users size={22} /></div>
                  <p className="empty-state-text">{search ? 'Sin resultados para esa búsqueda.' : 'No hay pacientes registrados.'}</p>
                  {!search && <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Crear el primero</button>}
                </div>
              </td></tr>
            ) : filtered.map(p => {
              const st = PATIENT_STATUS_MAP[p.status] || PATIENT_STATUS_MAP.ACTIVE;
              return (
                <tr key={p.id} className="table-row-clickable" onClick={() => setDetailPatient(p)}>
                  <td className="td-primary">{p.fullName}</td>
                  <td>{p.email}</td>
                  <td className="td-mono">{p.phone || '—'}</td>
                  <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openEdit(p); }}>
                      <Pencil size={12} /> Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailPatient && (
        <PatientDetailModal patient={detailPatient} onClose={() => setDetailPatient(null)} onEdit={p => { setDetailPatient(null); openEdit(p); }} />
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
              <button onClick={closeModal} className="modal-close-btn" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-error">Corrige los errores antes de guardar.</div>
              )}
              <div className="form-group">
                <label className="input-label" htmlFor="patient-name">Nombre completo *</label>
                <input id="patient-name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                  className={`input ${errors.fullName ? 'input-error' : ''}`} placeholder="Ej. María García López" />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label className="input-label" htmlFor="patient-email">Correo electrónico *</label>
                <input id="patient-email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="correo@ejemplo.com" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="input-label" htmlFor="patient-phone">Teléfono *</label>
                <input id="patient-phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  type="tel" className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="+57 300 000 0000" />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
