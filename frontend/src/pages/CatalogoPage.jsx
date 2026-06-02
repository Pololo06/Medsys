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
  function closeModal(){ setIsModalOpen(false); setError(''); }

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

      <div className="catalog-tabs">
        {[
          { id: 'especialidades', label: 'Especialidades', icon: FlaskConical },
          { id: 'tipos',          label: 'Tipos de Cita',  icon: ClipboardList },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`catalog-tab ${tab === id ? 'catalog-tab--active' : ''}`}
          >
            <Icon size={15} />
            {label}
            <span className="catalog-tab-count">
              {id === 'especialidades' ? specialties.length : types.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="catalog-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card catalog-card">
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
              <Plus size={14} /> Agregar el primero
            </button>
          </div>
        </div>
      ) : (
        <div className="catalog-grid">
          {items.map(item => (
            <div key={item.id} className="card catalog-card">
              <div className={`catalog-card-icon catalog-card-icon--${isEsp ? 'specialty' : 'type'}`}>
                {isEsp
                  ? <FlaskConical size={18} />
                  : <ClipboardList size={18} />
                }
              </div>
              <p className="catalog-card-name">{item.name}</p>
              {item.durationMinutes && (
                <p className="catalog-card-duration">
                  <Clock size={12} /> {item.durationMinutes} min
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3 className="modal-title">{isEsp ? 'Nueva Especialidad' : 'Nuevo Tipo de Cita'}</h3>
              <button onClick={closeModal} className="modal-close-btn" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="input-label" htmlFor="catalog-name">
                  {isEsp ? 'Nombre de la especialidad *' : 'Nombre del tipo *'}
                </label>
                <input
                  id="catalog-name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder={isEsp ? 'Ej. Cardiología' : 'Ej. Consulta general'}
                  autoFocus
                />
              </div>
              {!isEsp && (
                <div className="form-group">
                  <label className="input-label" htmlFor="catalog-duration">Duración (minutos) *</label>
                  <input
                    id="catalog-duration"
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
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
