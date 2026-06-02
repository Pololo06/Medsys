import { useState, useEffect } from 'react';
import { Search, Clock, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvailabilitySlots } from '../services/AvailabilityService';
import { getAllDoctors } from '../services/DoctorService';
import { getAppointmentTypes } from '../services/AppointmentTypeService';

export default function DisponibilidadPage() {
  const [doctors, setDoctors]   = useState([]);
  const [types, setTypes]       = useState([]);
  const [filters, setFilters]   = useState({ doctorId: '', date: '', durationMinutes: '' });
  const [slots, setSlots]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    async function init() {
      const [d, t] = await Promise.allSettled([getAllDoctors(), getAppointmentTypes()]);
      setDoctors(d.status === 'fulfilled' ? (d.value || []) : []);
      setTypes(t.status  === 'fulfilled' ? (t.value  || []) : []);
    }
    init();
  }, []);

  async function handleSearch() {
    if (!filters.doctorId || !filters.date || !filters.durationMinutes) {
      toast.error('Selecciona doctor, fecha y tipo de cita.');
      return;
    }
    setError(''); setLoading(true); setSearched(true);
    try {
      const data = await getAvailabilitySlots(filters.doctorId, filters.date, filters.durationMinutes);
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error al consultar disponibilidad.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  const selectedDoctor = doctors.find(d => String(d.id) === String(filters.doctorId));
  const selectedType   = types.find(t  => String(t.durationMinutes) === String(filters.durationMinutes));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="availability-page">
      <div className="availability-header">
        <h1 className="page-title">Disponibilidad</h1>
        <p className="page-subtitle">Consulta los horarios disponibles de los doctores</p>
      </div>

      <div className="card availability-filter-card">
        <p className="availability-filter-title">Parámetros de búsqueda</p>
        <div className="availability-filter-row">
          <div className="availability-filter-field">
            <label className="input-label" htmlFor="avail-doctor">Doctor</label>
            <select id="avail-doctor" value={filters.doctorId} onChange={e => setFilters({ ...filters, doctorId: e.target.value })} className="input">
              <option value="">Selecciona un doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.fullName}{d.specialtyName ? ` — ${d.specialtyName}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="availability-filter-field">
            <label className="input-label" htmlFor="avail-date">Fecha</label>
            <input id="avail-date" type="date" value={filters.date} min={today}
              onChange={e => setFilters({ ...filters, date: e.target.value })} className="input" />
          </div>
          <div className="availability-filter-field">
            <label className="input-label" htmlFor="avail-type">Tipo de cita</label>
            <select id="avail-type" value={filters.durationMinutes} onChange={e => setFilters({ ...filters, durationMinutes: e.target.value })} className="input">
              <option value="">Selecciona tipo</option>
              {types.map(t => (
                <option key={t.id} value={t.durationMinutes}>{t.name} ({t.durationMinutes} min)</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary availability-search-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Buscando...' : <><Search size={15} /> Buscar slots</>}
          </button>
        </div>
        {error && <div className="alert alert-error availability-error">{error}</div>}
      </div>

      {!searched && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><CalendarDays size={24} /></div>
            <p className="empty-state-text">Selecciona doctor, fecha y tipo de cita para ver la disponibilidad</p>
          </div>
        </div>
      )}

      {searched && (
        <div className="card availability-results-card">
          {selectedDoctor && (
            <div className="availability-summary">
              <span className="availability-summary-item">
                <strong>{selectedDoctor.fullName}</strong>
              </span>
              <span className="availability-summary-item">
                <Clock size={13} /> {selectedType?.name || `${filters.durationMinutes} min`}
              </span>
              <span className="availability-summary-item">
                {filters.date}
              </span>
            </div>
          )}

          {loading ? (
            <div className="availability-slots-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Clock size={24} /></div>
              <p className="empty-state-text">No hay slots disponibles para este día.</p>
              <p className="empty-state-hint">Prueba con otra fecha o doctor.</p>
            </div>
          ) : (
            <>
              <p className="availability-count">
                {slots.length} horario{slots.length !== 1 ? 's' : ''} disponible{slots.length !== 1 ? 's' : ''}
              </p>
              <div className="availability-slots-grid">
                {slots.map((slot, i) => {
                  const start = slot.startTime ? new Date(slot.startTime) : null;
                  const end   = slot.endTime   ? new Date(slot.endTime)   : null;
                  const label = start
                    ? start.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const endLabel = end
                    ? end.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div key={i} className="availability-slot">
                      <p className="availability-slot-time">{label}</p>
                      {endLabel && <p className="availability-slot-end">{endLabel}</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
