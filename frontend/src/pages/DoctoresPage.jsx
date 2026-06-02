import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Stethoscope, X, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllDoctors, createDoctor, updateDoctor } from '../services/DoctorService';
import { getSpecialties } from '../services/SpecialtyService';
import { getDoctorSchedule, createDoctorSchedule } from '../services/DoctorScheduleService';
import { DAYS, DEBOUNCE_MS } from '../constants';
import { useDebounce } from '../utils/debounce';
import { validateFullName } from '../utils/validation';
import TableSkeleton from '../components/Skeleton/TableSkeleton';
import '../styles/DoctoresPage.css';

const EMPTY_FORM = { fullName: '', specialtyId: '', active: true };

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
          <button onClick={onClose} className="schedule-modal-close" aria-label="Cerrar"><X size={18} /></button>
        </div>
        <div className="schedule-modal-body">
          <p className="schedule-modal-desc">Slots disponibles por día de la semana</p>

          {loading ? (
            <div className="schedule-skeleton">
              {DAYS.map(d => (
                <div key={d} className="schedule-skeleton-col">
                  <div className="skeleton" style={{ width: 48, height: 13, borderRadius: 4 }} />
                  {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ width: 80, height: 30, borderRadius: 6 }} />)}
                </div>
              ))}
            </div>
          ) : (
            <table className="schedule-table">
              <thead>
                <tr>{DAYS.map(d => <th key={d}>{d}</th>)}</tr>
              </thead>
              <tbody>
                {maxRows === 0 ? (
                  <tr>
                    <td colSpan={DAYS.length} className="schedule-empty-cell">
                      No hay horarios registrados. Agrega uno con el botón de abajo.
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: maxRows }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {DAYS.map(day => {
                        const slot = slots[day]?.[rowIdx];
                        return (
                          <td key={day} className="schedule-slot-cell">
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
                <label className="schedule-form-label" htmlFor="sched-day">Día</label>
                <select id="sched-day" value={newDay} onChange={e => setNewDay(e.target.value)} className="input schedule-input-sm">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="schedule-form-group">
                <label className="schedule-form-label" htmlFor="sched-start">Inicio</label>
                <input id="sched-start" type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className="input schedule-input-sm" />
              </div>
              <div className="schedule-form-group">
                <label className="schedule-form-label" htmlFor="sched-end">Fin</label>
                <input id="sched-end" type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="input schedule-input-sm" />
              </div>
              <div className="schedule-form-actions">
                <button className="btn btn-primary btn-sm" onClick={addSlot} disabled={saving}>
                  {saving ? 'Guardando...' : 'Agregar'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
        <div className="schedule-modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(v => !v)}>
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
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS.SEARCH);

  async function fetchData() {
    setLoading(true);
    const [docs, specs] = await Promise.allSettled([getAllDoctors(), getSpecialties()]);
    setDoctores(docs.status === 'fulfilled' ? (docs.value || []) : []);
    setEspecialidades(specs.status === 'fulfilled' ? (specs.value || []) : []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function openNew() { setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setIsModalOpen(true); }
  function openEdit(d) { setEditTarget(d); setForm({ fullName: d.fullName || '', specialtyId: d.specialtyId || '', active: d.active !== false }); setErrors({}); setIsModalOpen(true); }
  function closeModal() { setIsModalOpen(false); setErrors({}); }

  async function handleSave() {
    const errs = {};
    const nameErr = validateFullName(form.fullName);
    if (nameErr) errs.fullName = nameErr;
    if (!editTarget && !form.specialtyId) errs.specialtyId = 'La especialidad es obligatoria.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
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
      toast.error(e.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = doctores.filter(d =>
    d.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (d.specialtyName || '').toLowerCase().includes(debouncedSearch.toLowerCase())
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
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar doctor..." className="input search-input search-input--w240" />
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
              <TableSkeleton rows={3} columns={4} />
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
                  <td className="td-primary">{d.fullName}</td>
                  <td>{d.specialtyName || '—'}</td>
                  <td><span className={`badge ${d.active !== false ? 'badge-teal' : 'badge-gray'}`}>{d.active !== false ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm btn-ghost-blue" onClick={() => setScheduleDoctor(d)}>
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
              <button onClick={closeModal} className="modal-close-btn" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {Object.keys(errors).length > 0 && <div className="alert alert-error">Corrige los errores antes de guardar.</div>}
              <div className="form-group">
                <label className="input-label" htmlFor="doctor-name">Nombre completo *</label>
                <input id="doctor-name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className={`input ${errors.fullName ? 'input-error' : ''}`} placeholder="Dr. Juan Pérez" />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              {!editTarget && (
                <div className="form-group">
                  <label className="input-label" htmlFor="doctor-specialty">Especialidad *</label>
                  <select id="doctor-specialty" value={form.specialtyId} onChange={e => setForm({ ...form, specialtyId: e.target.value })}
                    className={`input ${errors.specialtyId ? 'input-error' : ''}`}>
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.specialtyId && <span className="field-error">{errors.specialtyId}</span>}
                </div>
              )}
              {editTarget && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                    Doctor activo
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
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
