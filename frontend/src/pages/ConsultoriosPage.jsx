import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Building2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOffices, createOffice, updateOffice } from '../services/OfficeService';

const EMPTY_FORM = { name: '', location: '', status: 'AVAILABLE' };
const STATUS_OPTS = [
  { value: 'AVAILABLE',   label: 'Disponible',    bg: '#dcfce7', text: '#15803d' },
  { value: 'OCCUPIED',    label: 'Ocupado',        bg: '#dbeffe', text: '#1d7fe9' },
  { value: 'MAINTENANCE', label: 'Mantenimiento',  bg: '#ffedd5', text: '#c2410c' },
];

export default function ConsultoriosPage() {
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [error, setError]               = useState('');
  const [saving, setSaving]             = useState(false);

  async function fetchData() {
    setLoading(true);
    try { setConsultorios(await getOffices() || []); }
    catch { toast.error('No se pudieron cargar los consultorios.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  function openNew()  { setEditTarget(null); setForm(EMPTY_FORM); setError(''); setIsModalOpen(true); }
  function openEdit(c){ setEditTarget(c); setForm({ name: c.name||'', location: c.location||'', status: c.status||'AVAILABLE' }); setError(''); setIsModalOpen(true); }
  function closeModal(){ setIsModalOpen(false); setError(''); }

  async function handleSave() {
    if (!form.name.trim() || !form.location.trim()) { setError('Nombre y ubicación son obligatorios.'); return; }
    setSaving(true); setError('');
    try {
      if (editTarget) { await updateOffice(editTarget.id, form.name, form.location, form.status); toast.success('Consultorio actualizado.'); }
      else { await createOffice(form.name, form.location); toast.success('Consultorio creado.'); }
      await fetchData();
      closeModal();
    } catch (e) { setError(e.message || 'Error al guardar.'); }
    finally { setSaving(false); }
  }

  const filtered = consultorios.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-bar">
        <div>
          <h1 className="page-title">Consultorios</h1>
          <p className="page-subtitle">{consultorios.length} consultorios registrados</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar consultorio..." className="input search-input" style={{ width: 220 }} />
          </div>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Nuevo Consultorio</button>
        </div>
      </div>

      <div className="table-container">
        <table className="medsys-table">
          <thead><tr>{['Nombre', 'Ubicación', 'Estado', 'Acciones'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? [1,2,3].map(i => (
              <tr key={i}>{[160,130,80,60].map((w,j) => <td key={j} style={{ padding: '13px 16px' }}><div className="skeleton" style={{ height: 14, width: w, borderRadius: 4 }} /></td>)}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={4}><div className="empty-state"><div className="empty-state-icon"><Building2 size={24} /></div><p className="empty-state-text">No hay consultorios registrados.</p></div></td></tr>
            ) : filtered.map(c => {
              const st = STATUS_OPTS.find(o => o.value === c.status) || STATUS_OPTS[0];
              return (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>{c.location}</td>
                  <td><span className="badge badge-gray">{st.label}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><Pencil size={13} /> Editar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><h3 className="modal-title">{editTarget ? 'Editar Consultorio' : 'Nuevo Consultorio'}</h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex" }}><X size={18} /></button></div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
              <div className="form-group">
                <label className="input-label">Nombre *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Consultorio 101" />
              </div>
              <div className="form-group">
                <label className="input-label">Ubicación / Piso *</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input" placeholder="Piso 2, Ala Norte" />
              </div>
              {editTarget && (
                <div className="form-group">
                  <label className="input-label">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input">
                    {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Guardando...</> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
