import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Stethoscope, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllDoctors, createDoctor, updateDoctor } from '../services/DoctorService';
import { getSpecialties } from '../services/SpecialtyService';

const EMPTY_FORM = { fullName: '', specialtyId: '', active: true };

export default function DoctoresPage() {
  const [doctores, setDoctores]         = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [error, setError]               = useState('');
  const [saving, setSaving]             = useState(false);

  async function fetchData() {
    setLoading(true);
    const [docs, specs] = await Promise.allSettled([getAllDoctors(), getSpecialties()]);
    setDoctores(docs.status === 'fulfilled' ? (docs.value || []) : []);
    setEspecialidades(specs.status === 'fulfilled' ? (specs.value || []) : []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function openNew()  { setEditTarget(null); setForm(EMPTY_FORM); setError(''); setIsModalOpen(true); }
  function openEdit(d){ setEditTarget(d); setForm({ fullName: d.fullName||'', specialtyId: d.specialtyId||'', active: d.active !== false }); setError(''); setIsModalOpen(true); }
  function closeModal(){ setIsModalOpen(false); setError(''); }

  async function handleSave() {
    if (!form.fullName.trim() || (!editTarget && !form.specialtyId)) {
      setError('Nombre y especialidad son obligatorios.'); return;
    }
    setSaving(true); setError('');
    try {
      if (editTarget) {
        await updateDoctor(editTarget.id, form.fullName, form.active);
        toast.success('Doctor actualizado correctamente.');
      } else {
        await createDoctor(form.fullName, form.specialtyId);
        toast.success('Doctor creado correctamente.');
      }
      await fetchData();
      closeModal();
    } catch (e) {
      setError(e.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = doctores.filter(d =>
    d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialtyName||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-bar">
        <div>
          <h1 className="page-title">Doctores</h1>
          <p className="page-subtitle">{doctores.length} médicos registrados</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar doctor..." className="input search-input" style={{ width: 240 }} />
          </div>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Nuevo Doctor</button>
        </div>
      </div>

      <div className="table-container">
        <table className="medsys-table">
          <thead>
            <tr>{['Nombre', 'Especialidad', 'Estado', 'Acciones'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? [1,2,3].map(i => (
              <tr key={i}>{[200,140,70,60].map((w,j) => <td key={j} style={{ padding: '13px 16px' }}><div className="skeleton" style={{ height: 14, width: w, borderRadius: 4 }} /></td>)}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={4}><div className="empty-state"><div className="empty-state-icon"><Stethoscope size={24} /></div><p className="empty-state-text">{search ? 'Sin resultados.' : 'No hay doctores registrados.'}</p></div></td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.fullName}</td>
                <td>{d.specialtyName || '—'}</td>
                <td>
                  <span className="badge">
                    {d.active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}><Pencil size={13} /> Editar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header"><h3 className="modal-title">{editTarget ? 'Editar Doctor' : 'Nuevo Doctor'}</h3><button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}><X size={18} /></button></div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
              <div className="form-group">
                <label className="input-label">Nombre completo *</label>
                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="input" placeholder="Dr. Juan Pérez" />
              </div>
              {!editTarget && (
                <div className="form-group">
                  <label className="input-label">Especialidad *</label>
                  <select value={form.specialtyId} onChange={e => setForm({...form, specialtyId: e.target.value})} className="input">
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {editTarget && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} style={{ width: 16, height: 16 }} />
                    Doctor activo
                  </label>
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
