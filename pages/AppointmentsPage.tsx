
import React, { useState, useMemo } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment, ApptStatus, User } from '../types';

interface AppointmentsPageProps {
  patients: Patient[];
  staff: User[];
  appointments: Appointment[];
  addAppointment: (a: Appointment) => void;
  updateAppointmentStatus: (id: string, s: ApptStatus, extraData?: any) => void;
}

const DEPARTMENTS = ['General Medicine', 'Pediatrics', 'Dermatology', 'Cardiology', 'ENT', 'Orthopedics'];

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ patients, staff, appointments, addAppointment, updateAppointmentStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [checkingInApptId, setCheckingInApptId] = useState<string | null>(null);
  const [cancellingAppt, setCancellingAppt] = useState<{id: string, reason: string} | null>(null);
  
  const [checkInVitals, setCheckInVitals] = useState({ bp: '', temp: '', pulse: '', weight: '', symptoms: '' });
  const [newAppt, setNewAppt] = useState({ 
    patientId: '', 
    doctorId: '',
    date: new Date().toISOString().split('T')[0], 
    time: '', 
    reason: '', 
    department: 'General Medicine' 
  });

  const doctors = staff.filter(u => u.role === 'Doctor');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId || !newAppt.doctorId) return;
    addAppointment({
      id: `APP-${Date.now().toString().slice(-4)}`,
      patientId: newAppt.patientId,
      doctorId: newAppt.doctorId,
      date: newAppt.date,
      time: newAppt.time,
      status: 'Scheduled',
      reason: newAppt.reason,
      department: newAppt.department
    });
    setShowModal(false);
    setNewAppt({ patientId: '', doctorId: '', date: new Date().toISOString().split('T')[0], time: '', reason: '', department: 'General Medicine' });
  };

  const handleCheckIn = () => {
    if (checkingInApptId) {
      updateAppointmentStatus(checkingInApptId, 'Checked-in', {
        vitals: {
          bp: checkInVitals.bp || 'N/A',
          temp: checkInVitals.temp || 'N/A',
          pulse: checkInVitals.pulse || 'N/A',
          weight: checkInVitals.weight || 'N/A'
        },
        initialSymptoms: checkInVitals.symptoms || 'None recorded'
      });
      setCheckingInApptId(null);
      setCheckInVitals({ bp: '', temp: '', pulse: '', weight: '', symptoms: '' });
    }
  };

  const filtered = useMemo(() => {
    return appointments.sort((a, b) => b.id.localeCompare(a.id));
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase">OPD Scheduler</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Master Appointment Hub</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-xs"
        >
          {ICONS.Plus} New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(appt => {
          const patient = patients.find(p => p.id === appt.patientId);
          const doc = staff.find(s => s.id === appt.doctorId);
          return (
            <div key={appt.id} className={`flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border rounded-[2rem] gap-4 hover:border-secondary transition-all shadow-sm ${appt.status === 'Cancelled' ? 'opacity-50 grayscale' : 'border-slate-100'}`}>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 text-primary border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-sm">
                  {appt.time}
                </div>
                <div>
                  <p className="font-heading text-xl text-slate-800 leading-none mb-1 uppercase tracking-widest">{patient?.firstName} {patient?.lastName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{appt.department} • Dr. {doc?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                  appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  appt.status === 'Checked-in' ? 'bg-blue-100 text-blue-700' :
                  appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {appt.status}
                </span>
                
                {appt.status === 'Scheduled' && (
                  <button 
                    onClick={() => setCheckingInApptId(appt.id)}
                    className="px-6 py-2 bg-secondary text-white rounded-xl text-[9px] font-bold uppercase hover:bg-primary transition-all shadow-lg"
                  >
                    Check-in (Triage)
                  </button>
                )}

                {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                  <button onClick={() => setCancellingAppt({id: appt.id, reason: ''})} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                    {ICONS.Close}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Check-in Modal (Vitals Entry) */}
      {checkingInApptId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-auto">
             <div className="bg-secondary p-10 text-white text-center">
                <h3 className="text-2xl font-heading uppercase tracking-widest">Front Desk Check-in</h3>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Initial Clinical Triage</p>
             </div>
             <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BP (mmHg)</label>
                      <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-xs" placeholder="120/80" value={checkInVitals.bp} onChange={e => setCheckInVitals({...checkInVitals, bp: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Temp (°F)</label>
                      <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-xs" placeholder="98.6" value={checkInVitals.temp} onChange={e => setCheckInVitals({...checkInVitals, temp: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pulse (BPM)</label>
                      <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-xs" placeholder="72" value={checkInVitals.pulse} onChange={e => setCheckInVitals({...checkInVitals, pulse: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weight (KG)</label>
                      <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-xs" placeholder="70" value={checkInVitals.weight} onChange={e => setCheckInVitals({...checkInVitals, weight: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Primary Symptoms (Findings)</label>
                   <textarea rows={3} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none text-xs" placeholder="Patient reports..." value={checkInVitals.symptoms} onChange={e => setCheckInVitals({...checkInVitals, symptoms: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setCheckingInApptId(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px]">Abandon</button>
                   <button onClick={handleCheckIn} className="flex-1 py-4 bg-primary text-white rounded-2xl font-heading tracking-widest uppercase text-xs shadow-xl">Push to Doctor</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-8 text-white text-center">
              <h3 className="text-xl font-heading uppercase tracking-widest leading-none">New Visit Booking</h3>
            </div>
            <form onSubmit={handleBooking} className="p-10 space-y-4">
              <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                <option value="">Choose Patient Registry Entry...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>)}
              </select>
              <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" value={newAppt.department} onChange={e => setNewAppt({...newAppt, department: e.target.value})}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" value={newAppt.doctorId} onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})}>
                <option value="">Assign Physician...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                <input required type="time" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
              </div>
              <input required type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Clinical Reason..." value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold text-[10px] uppercase">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-2xl text-xs shadow-lg">Commit Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
