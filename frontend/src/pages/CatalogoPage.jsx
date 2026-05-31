import { useState, useEffect } from 'react';
import { Plus, FlaskConical, ClipboardList, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSpecialties, createSpecialty } from '../services/SpecialtyService';
import { getAppointmentTypes, createAppointmentType } from '../services/AppointmentTypeService';

export default function CatalogoPage() {
  const [tab, setTab]           = useState('especialidades');
  const [specialties, setSpecialties] = useState([]);
  const [types, setTypes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm]         = useState({ name: '', durationMinutes: 30 });
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  async function fetchData() {
    setLoading(true);
    const [s, t] = await Promise.allSettled([getSpecialties(), getAppointmentTypes()]);
    setSpecialties(s.status === 'fulfilled' ? (s.value || []) : []);
    setTypes(t.status === 'fulfilled' ? (t.value || []) : []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function openNew() { setForm({ name: '', durationMinutes: 30 }); setError(''); setIsModalOpen(true); }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError('');
    try {
      if (tab === 'especialidades') {
        await createSpecialty(form.name);
        toast.success('Especialidad creada correctamente.');
      } else {
        await createAppointmentType(form.name, Number(form.durationMinutes));
        toast.success('Tipo de cita creado correctamente.');
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (e) {
      setError(e.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  const items = tab === 'especialidades' ? specialties : types;
  const isEsp = tab === 'especialidades';

  return (
    <div>
      {/* Page header */}
      <div className="page-bar">
        <div>
          <h1 className="page-title">Catálogo</h1>
          <p className="page-subtitle">Especialidades y tipos de cita del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} />
          {isEsp ? 'Nueva Especialidad' : 'Nuevo Tipo'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        {[
          { id: 'especialidades', label: 'Especialidades', icon: FlaskConical },
          { id: 'tipos',          label: 'Tipos de Cita',  icon: ClipboardList },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700,
              background: 'transparent',
              borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color var(--transition)',
              marginBottom: -1,
            }}
          >
            <Icon size={15} />
            {label}
            <span style={{
              background: tab === id ? 'var(--brand-100)' : 'var(--bg-hover)',
              color:      tab === id ? 'var(--teal-700)' : 'var(--text-muted)',
              borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
              padding: '1px 7px', lineHeight: '18px',
            }}>
              {id === 'especialidades' ? specialties.length : types.length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card" style={{ padding: 20, height: 110 }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              {isEsp ? <FlaskConical size={24} /> : <ClipboardList size={24} />}
            </div>
            <p className="empty-state-text">
              No hay {isEsp ? 'especialidades' : 'tipos de cita'} registrados.
            </p>
            <button className="btn btn-primary btn-sm" onClick={openNew}>
              <Plus size={14} />
              Agregar el primero
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ padding: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: isEsp ? '#dbeffe' : '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12, flexShrink: 0,
              }}>
                {isEsp
                  ? <FlaskConical size={18} color="var(--teal-700)" />
                  : <ClipboardList size={18} color="#7c3aed" />
                }
              </div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', margin: '0 0 4px' }}>
                {item.name}
              </p>
              {item.durationMinutes && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <Clock size={12} />
                  {item.durationMinutes} min
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 className="modal-title">
                {isEsp ? 'Nueva Especialidad' : 'Nuevo Tipo de Cita'}
              </h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex" }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
              <div className="form-group">
                <label className="input-label">
                  {isEsp ? 'Nombre de la especialidad *' : 'Nombre del tipo *'}
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder={isEsp ? 'Ej. Cardiología' : 'Ej. Consulta general'}
                  autoFocus
                />
              </div>
              {!isEsp && (
                <div className="form-group">
                  <label className="input-label">Duración (minutos) *</label>
                  <input
                    type="number" min="5" max="180" step="5"
                    value={form.durationMinutes}
                    onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                    className="input"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Guardando...</>
                  : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
