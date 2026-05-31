import { useState, useEffect } from 'react';
import { Search, Clock, CalendarDays, X } from 'lucide-react';
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
      // GET /api/availability/doctors/{doctorId}?date=YYYY-MM-DD&durationMinutes=N
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">Disponibilidad</h1>
        <p className="page-subtitle">Consulta los horarios disponibles de los doctores</p>
      </div>

      {/* Filter panel */}
      <div className="card" style={{ padding: 24 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 16 }}>
          Parámetros de búsqueda
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="input-label">Doctor</label>
            <select
              value={filters.doctorId}
              onChange={e => setFilters({ ...filters, doctorId: e.target.value })}
              className="input"
            >
              <option value="">Selecciona un doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.fullName}{d.specialtyName ? ` — ${d.specialtyName}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label className="input-label">Fecha</label>
            <input
              type="date" value={filters.date} min={today}
              onChange={e => setFilters({ ...filters, date: e.target.value })}
              className="input"
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label className="input-label">Tipo de cita</label>
            <select
              value={filters.durationMinutes}
              onChange={e => setFilters({ ...filters, durationMinutes: e.target.value })}
              className="input"
            >
              <option value="">Selecciona tipo</option>
              {types.map(t => (
                <option key={t.id} value={t.durationMinutes}>
                  {t.name} ({t.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
            style={{ flexShrink: 0, alignSelf: 'flex-end' }}
          >
            {loading ? (
              <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Buscando...</>
            ) : (
              <><Search size={15} /> Buscar slots</>
            )}
          </button>
        </div>
        {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}
      </div>

      {/* Results */}
      {!searched && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><CalendarDays size={24} /></div>
            <p className="empty-state-text">Selecciona doctor, fecha y tipo de cita para ver la disponibilidad</p>
          </div>
        </div>
      )}

      {searched && (
        <div className="card" style={{ padding: 24 }}>
          {/* Summary */}
          {selectedDoctor && (
            <div style={{
              display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20,
              padding: '12px 16px', background: 'var(--bg-hover)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                🩺 <strong>{selectedDoctor.fullName}</strong>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} /> {selectedType?.name || `${filters.durationMinutes} min`}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                📅 {filters.date}
              </span>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
              {[1,2,3,4,5,6,8].map(i => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon"><Clock size={24} /></div>
              <p className="empty-state-text">No hay slots disponibles para este día.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prueba con otra fecha o doctor.</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14 }}>
                {slots.length} horario{slots.length !== 1 ? 's' : ''} disponible{slots.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                {slots.map((slot, i) => {
                  const start = slot.startTime ? new Date(slot.startTime) : null;
                  const end   = slot.endTime   ? new Date(slot.endTime)   : null;
                  const label = start
                    ? start.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                    : JSON.stringify(slot);
                  const endLabel = end
                    ? end.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div
                      key={i}
                      style={{
                        background: 'var(--brand-50)', border: '1px solid var(--brand-200)',
                        borderRadius: 10, padding: '12px 10px', textAlign: 'center',
                        cursor: 'pointer', transition: 'all var(--transition)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--accent)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(29,127,233,0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--brand-50)';
                        e.currentTarget.style.color = '';
                        e.currentTarget.style.borderColor = 'var(--brand-200)';
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'inherit', lineHeight: 1 }}>{label}</p>
                      {endLabel && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'inherit', opacity: 0.7 }}>{endLabel}</p>
                      )}
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
