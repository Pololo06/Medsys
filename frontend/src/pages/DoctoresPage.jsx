import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Stethoscope, X, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllDoctors, createDoctor, updateDoctor } from '../services/DoctorService';
import { getSpecialties } from '../services/SpecialtyService';
import { getDoctorSchedule, createDoctorSchedule } from '../services/DoctorScheduleService';
import SkeletonLoader from '../components/SkeletonLoader';
import { debounce } from '../utils/debounce';
import { validateFullName } from '../utils/validation';
import { DEBOUNCE_DELAY } from '../constants';
import '../styles/DoctoresPage.css';

const EMPTY_FORM = { fullName: '', specialtyId: '', active: true };
const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function ScheduleModal({ doctor, onClose }) {
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDay, setNewDay] = useState('LUN');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('08:30');
  const [saving, setSaving] = useState(false);

  async function loadSchedule() {
    setLoading(true);
    try {
      const data = await getDoctorSchedule(doctor.id);
      setSlots(data);
    } catch {
      toast.error('No se pudo cargar el horario.');
      const empty = {};
      DAYS.forEach(d => { empty[d] = []; });
      setSlots(empty);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSchedule(); }, [doctor.id]);

  async function addSlot() {
    if (!newStart || !newEnd) return;
    if (newEnd <= newStart) {
      toast.error('La hora de fin debe ser mayor a la de inicio.');
      return;
    }
    setSaving(true);
    try {
      await createDoctorSchedule(doctor.id, newDay, newStart, newEnd);
      toast.success('Horario agregado.');
      await loadSchedule();
      setShowAdd(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al guardar el horario.');
    } finally {
      setSaving(false);
    }
  }

  const maxRows = Math.max(...DAYS.map(d => slots[d]?.length || 0), 0);

  return (
    <div className="schedule-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="schedule-modal">
        <div className="schedule-modal-header">
          <h3 className="schedule-modal-title">Horario — {doctor.fullName}</h3>
          <button onClick={onClose} className="schedule-modal-close">
            <X size={18} />
          </button>
        </div>

        <div className="schedule-modal-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Slots disponibles por día de la semana
          </p>

          {loading ? (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '32px 0' }}>
              {DAYS.map(d => (
                <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 48, height: 13, borderRadius: 4 }} />
                  {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ width: 80, height: 30, borderRadius: 6 }} />)}
                </div>
              ))}
            </div>
          ) : (
            <table className="schedule-table">
              <thead>
                <tr>
                  {DAYS.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {maxRows === 0 ? (
                  <tr>
                    <td colSpan={DAYS.length} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No hay horarios registrados. Agrega uno con el botón de abajo.
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: maxRows }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {DAYS.map(day => {
                        const slot = slots[day]?.[rowIdx];
                        return (
                          <td key={day} style={{ textAlign: 'center', paddingBottom: 6 }}>
                            {slot ? <span className="schedule-slot">{slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)}</span> : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {showAdd && (
            <div className="schedule-add-form">
              <div className="schedule-form-group">
                <label className="schedule-form-label">Día</label>
                <select value={newDay} onChange={e => setNewDay(e.target.value)} className="input" style={{ width: 90, padding: '5px 8px', fontSize: '0.84rem' }}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="schedule-form-group">
                <label className="schedule-form-label">Inicio</label>
                <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className="input" style={{ width: 120, padding: '5px 8px', fontSize: '0.84rem' }} />
              </div>
              <div className="schedule-form-group">
                <label className="schedule-form-label">Fin</label>
                <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="input" style={{ width: 120, padding: '5px 8px', fontSize: '0.84rem' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={addSlot} disabled={saving}>
                  {saving ? 'Guardando...' : 'Agregar'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        <div className="schedule-modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Agregar horario
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function DoctoresPage() {
  const [doctores, setDoctores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);

  async function fetchData() {
    setLoading(true);
    const [docs, specs] = await Promise.allSettled([getAllDoctors(), getSpecialties()]);
    setDoctores(docs.status === 'fulfilled' ? (docs.value || []) : []);
    setEspecialidades(specs.status === 'fulfilled' ? (specs.value || []) : []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const debouncedSearch = debounce((value) => {
    setSearch(value);
  }, DEBOUNCE_DELAY);

  function openNew() { setEditTarget(null); setForm(EMPTY_FORM); setError(''); setIsModalOpen(true); }
  function openEdit(d) { setEditTarget(d); setForm({ fullName: d.fullName || '', specialtyId: d.specialtyId || '', active: d.active !== false }); setError(''); setIsModalOpen(true); }
  function closeModal() { setIsModalOpen(false); setError(''); }

  async function handleSave() {
    if (!validateFullName(form.fullName)) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (!editTarget && !form.specialtyId) {
      setError('La especialidad es obligatoria.');
      return;
    }
    setSaving(true);
    setError('');
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
    (d.specialtyName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-bar">
        <div>
          <h1 className="page-title">Doctores</h1>
          <p className="page-subtitle">{doctores.length} médicos registrados</p>
        </div>
        <div className="page-actions">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              onChange={e => debouncedSearch(e.target.value)}
              placeholder="Buscar doctor..."
              className="input search-input"
              style={{ width: 240 }}
            />
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
            {loading ? (
              <SkeletonLoader rows={3} />
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4}>
                <div className="empty-state">
                  <div className="empty-state-icon"><Stethoscope size={24} /></div>
                  <p className="empty-state-text">{search ? 'Sin resultados.' : 'No hay doctores registrados.'}</p>
                </div>
              </td></tr>
            ) : (
              filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.fullName}</td>
                  <td>{d.specialtyName || '—'}</td>
                  <td><span className={`badge ${d.active !== false ? 'badge-teal' : 'badge-gray'}`}>{d.active !== false ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setScheduleDoctor(d)} style={{ color: 'var(--color-blue, #2563eb)' }}>
                        <CalendarDays size={13} /> Horario
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>
                        <Pencil size={13} /> Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {scheduleDoctor && <ScheduleModal doctor={scheduleDoctor} onClose={() => setScheduleDoctor(null)} />}

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? 'Editar Doctor' : 'Nuevo Doctor'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
              <div className="form-group">
                <label className="input-label">Nombre completo *</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input" placeholder="Dr. Juan Pérez" />
              </div>
              {!editTarget && (
                <div className="form-group">
                  <label className="input-label">Especialidad *</label>
                  <select value={form.specialtyId} onChange={e => setForm({ ...form, specialtyId: e.target.value })} className="input">
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {editTarget && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 16, height: 16 }} />
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
