import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllPatients, createPatient, updatePatient } from '../services/PatientService';

const EMPTY_FORM = { fullName: '', email: '', phone: '' };
const STATUS_MAP = {
  ACTIVE:   { badge: 'badge-teal',  label: 'Activo'   },
  INACTIVE: { badge: 'badge-gray',  label: 'Inactivo' },
};

export default function PacientesPage() {
  const [pacientes, setPacientes]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [error, setError]             = useState('');
  const [saving, setSaving]           = useState(false);

  async function fetchPacientes() {
    setLoading(true);
    try { setPacientes(await getAllPatients() || []); }
    catch { toast.error('No se pudieron cargar los pacientes.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { fetchPacientes(); }, []);

  function openNew()   { setEditTarget(null);  setForm(EMPTY_FORM); setError(''); setIsModalOpen(true); }
  function openEdit(p) { setEditTarget(p); setForm({ fullName: p.fullName||'', email: p.email||'', phone: p.phone||'' }); setError(''); setIsModalOpen(true); }
  function closeModal(){ setIsModalOpen(false); setError(''); }

  async function handleSave() {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) { setError('Nombre, correo y teléfono son obligatorios.'); return; }
    setSaving(true); setError('');
    try {
      if (editTarget) { await updatePatient(editTarget.id, form.fullName, form.email, form.phone, editTarget.status); toast.success('Paciente actualizado.'); }
      else { await createPatient(form.fullName, form.email, form.phone); toast.success('Paciente creado.'); }
      await fetchPacientes(); closeModal();
    } catch (e) { setError(e.message || 'Error al guardar.'); }
    finally { setSaving(false); }
  }

  const filtered = pacientes.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-bar">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{pacientes.length} registros en el sistema</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar paciente..." className="input search-input" style={{ width: 240 }} />
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
            {loading ? [1,2,3,4,5].map(i => (
              <tr key={i}>{[200,200,120,80,70].map((w,j) => (
                <td key={j} style={{ padding: '12px 16px' }}>
                  <div className="skeleton" style={{ height: 13, width: w, borderRadius: 4 }} />
                </td>
              ))}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-state-icon"><Users size={22} /></div>
                  <p className="empty-state-text">{search ? 'Sin resultados para esa búsqueda.' : 'No hay pacientes registrados.'}</p>
                  {!search && <p className="empty-state-sub">Crea el primer paciente con el botón de arriba.</p>}
                </div>
              </td></tr>
            ) : filtered.map(p => {
              const st = STATUS_MAP[p.status] || STATUS_MAP.ACTIVE;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.fullName}</td>
                  <td>{p.email}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.81rem' }}>{p.phone || '—'}</td>
                  <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                      <Pencil size={12} /> Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-group">
                <label className="input-label">Nombre completo *</label>
                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="input" placeholder="Ej. María García López" />
              </div>
              <div className="form-group">
                <label className="input-label">Correo electrónico *</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" className="input" placeholder="correo@ejemplo.com" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Teléfono *</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel" className="input" placeholder="+57 300 000 0000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Guardando...</> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
