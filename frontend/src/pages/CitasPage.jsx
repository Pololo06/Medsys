import { useState, useEffect } from 'react';
import { Plus, CalendarCheck, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointments, createAppointment, confirmAppointment, cancelAppointment, completeAppointment, setAsNoShowAppointment } from '../services/AppointmentService';
import { getAllPatients } from '../services/PatientService';
import { getAllDoctors } from '../services/DoctorService';
import { getOffices } from '../services/OfficeService';
import { getAppointmentTypes } from '../services/AppointmentTypeService';
import { STATUS_MAP } from '../constants';
import ConfirmDialog from '../components/ConfirmDialog';
import TableSkeleton from '../components/Skeleton/TableSkeleton';

export default function CitasPage() {
  const [citas, setCitas]           = useState([]);
  const [patients, setPatients]     = useState([]);
  const [doctors, setDoctors]       = useState([]);
  const [offices, setOffices]       = useState([]);
  const [types, setTypes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModal, setIsCancelModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [form, setForm]             = useState({ patientId: '', doctorId: '', officeId: '', appointmentTypeId: '', startTime: '' });
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  async function fetchData() {
    setLoading(true);
    const [c, p, d, o, t] = await Promise.allSettled([getAppointments(), getAllPatients(), getAllDoctors(), getOffices(), getAppointmentTypes()]);
    setCitas(c.status === 'fulfilled' ? (c.value || []) : []);
    setPatients(p.status === 'fulfilled' ? (p.value || []) : []);
    setDoctors(d.status === 'fulfilled' ? (d.value || []) : []);
    setOffices(o.status === 'fulfilled' ? (o.value || []) : []);
    setTypes(t.status === 'fulfilled' ? (t.value || []) : []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);
  function closeModal(){ setIsModalOpen(false); setError(''); }

  async function handleAction(type, cita) {
    try {
      if (type === 'confirm') { await confirmAppointment(cita.id); toast.success('Cita confirmada.'); }
      else if (type === 'complete') { await completeAppointment(cita.id, ''); toast.success('Cita completada.'); }
      else if (type === 'noshow') { await setAsNoShowAppointment(cita.id); toast.success('Marcada como no asistió.'); }
      await fetchData();
    } catch (e) { toast.error(e.message || 'Error al actualizar la cita.'); }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) { toast.error('El motivo de cancelación es obligatorio.'); return; }
    try {
      await cancelAppointment(selectedCita.id, cancelReason);
      toast.success('Cita cancelada.');
      setIsCancelModal(false);
      await fetchData();
    } catch (e) { toast.error(e.message || 'Error al cancelar.'); }
  }

  async function handleCreate() {
    if (!form.patientId || !form.doctorId || !form.officeId || !form.appointmentTypeId || !form.startTime) {
      setError('Todos los campos son obligatorios.'); return;
    }
    setSaving(true); setError('');
    try {
      const startTime = form.startTime.length === 16 ? form.startTime + ':00' : form.startTime;
      await createAppointment({ ...form, startTime });
      toast.success('Cita creada exitosamente.');
      await fetchData();
      setIsModalOpen(false);
    } catch (e) {
      setError(e.message || 'Error al crear la cita.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = citas.filter(c => !filterStatus || c.status === filterStatus);

  return (
    <div>
      <div className="page-bar">
        <div>
          <h1 className="page-title">Citas</h1>
          <p className="page-subtitle">{citas.length} citas en total</p>
        </div>
        <div className="page-actions">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input input-select">
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm({ patientId: '', doctorId: '', officeId: '', appointmentTypeId: '', startTime: '' }); setError(''); setIsModalOpen(true); }}>
            <Plus size={16} /> Nueva Cita
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="medsys-table">
          <thead>
            <tr>{['Paciente', 'Doctor', 'Tipo', 'Fecha y hora', 'Estado', 'Acciones'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={4} columns={6} /> : filtered.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon"><CalendarCheck size={24} /></div><p className="empty-state-text">{filterStatus ? 'No hay citas con ese estado.' : 'No hay citas registradas.'}</p></div></td></tr>
            ) : filtered.map(c => {
              const fecha = c.startTime ? new Date(c.startTime) : null;
              const st = STATUS_MAP[c.status] || { badge: 'badge-gray', label: c.status };
              return (
                <tr key={c.id}>
                  <td className="td-primary">{c.patientName || '—'}</td>
                  <td>{c.doctorName || '—'}</td>
                  <td>{c.appointmentTypeName || '—'}</td>
                  <td className="td-mono td-secondary">
                    {fecha ? fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td><span className={`badge ${st.badge || 'badge-gray'}`}>{st.label}</span></td>
                  <td>
                    <div className="table-actions">
                      {c.status === 'SCHEDULED' && <>
                        <button className="btn btn-sm btn-action btn-action-confirm" onClick={() => setConfirmAction({ type: 'confirm', cita: c })}>Confirmar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => { setSelectedCita(c); setCancelReason(''); setIsCancelModal(true); }}>Cancelar</button>
                      </>}
                      {c.status === 'CONFIRMED' && <>
                        <button className="btn btn-sm btn-action btn-action-complete" onClick={() => setConfirmAction({ type: 'complete', cita: c })}>Completar</button>
                        <button className="btn btn-sm btn-action btn-action-noshow" onClick={() => setConfirmAction({ type: 'noshow', cita: c })}>No asistió</button>
                        <button className="btn btn-sm btn-danger" onClick={() => { setSelectedCita(c); setCancelReason(''); setIsCancelModal(true); }}>Cancelar</button>
                      </>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Nueva Cita</h3>
              <button onClick={closeModal} className="modal-close-btn" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="input-label" htmlFor="cita-patient">Paciente *</label>
                <select id="cita-patient" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input">
                  <option value="">Selecciona un paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label" htmlFor="cita-doctor">Doctor *</label>
                <select id="cita-doctor" value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="input">
                  <option value="">Selecciona un doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}{d.specialtyName ? ` — ${d.specialtyName}` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label" htmlFor="cita-type">Tipo de cita *</label>
                <select id="cita-type" value={form.appointmentTypeId} onChange={e => setForm({...form, appointmentTypeId: e.target.value})} className="input">
                  <option value="">Selecciona tipo</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label" htmlFor="cita-office">Consultorio *</label>
                <select id="cita-office" value={form.officeId} onChange={e => setForm({...form, officeId: e.target.value})} className="input">
                  <option value="">Selecciona consultorio</option>
                  {offices.map(o => <option key={o.id} value={o.id}>{o.name}{o.location ? ` — ${o.location}` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label" htmlFor="cita-datetime">Fecha y hora *</label>
                <input id="cita-datetime" type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Guardando...' : 'Crear Cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCancelModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsCancelModal(false)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3 className="modal-title">Cancelar Cita</h3>
              <button onClick={closeModal} className="modal-close-btn" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="cancel-message">
                ¿Estás seguro de cancelar la cita de <strong>{selectedCita?.patientName}</strong>?
              </p>
              <div className="form-group">
                <label className="input-label" htmlFor="cancel-reason">Motivo de cancelación *</label>
                <textarea id="cancel-reason" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="input" rows={3} placeholder="Describe el motivo..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCancelModal(false)}>Volver</button>
              <button className="btn btn-danger" onClick={handleCancel}>Confirmar cancelación</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleAction(confirmAction?.type, confirmAction?.cita)}
        title={confirmAction?.type === 'confirm' ? 'Confirmar cita' : confirmAction?.type === 'complete' ? 'Completar cita' : 'Marcar como no asistió'}
        message={`¿Deseas ${confirmAction?.type === 'confirm' ? 'confirmar' : confirmAction?.type === 'complete' ? 'completar' : 'marcar como no asistió'} la cita de ${confirmAction?.cita?.patientName}?`}
        confirmLabel={confirmAction?.type === 'confirm' ? 'Confirmar' : confirmAction?.type === 'complete' ? 'Completar' : 'No asistió'}
        variant="warning"
      />
    </div>
  );
}
