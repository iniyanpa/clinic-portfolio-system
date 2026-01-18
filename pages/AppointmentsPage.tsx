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

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ patients, staff, appointments, addAppointment, updateAppointmentStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [checkingInApptId, setCheckingInApptId] = useState<string | null>(null);
  
  const [checkInVitals, setCheckInVitals] = useState({ bp: '', temp: '', pulse: '', weight: '', spo2: '', sugar: '', symptoms: '' });
  
  // Updated: Returns the precise current time in HH:mm format for the Indian Registry context
  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const [newAppt, setNewAppt] = useState({ 
    patientId: '', doctorId: '',
    date: new Date().toISOString().split('T')[0], 
    time: getCurrentTime(), 
    reason: '', department: 'General Medicine' 
  });

  const doctors = staff.filter(u => u.role === 'Doctor');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId || !newAppt.doctorId) return;
    addAppointment({
      id: `APP-${Date.now().toString().slice(-4)}`,
      tenantId: '', patientId: newAppt.patientId,
      doctorId: newAppt.doctorId, date: newAppt.date,
      time: newAppt.time || getCurrentTime(), 
      status: 'Scheduled',
      reason: newAppt.reason, department: newAppt.department
    });
    setShowModal(false);
    // Resetting with current time for next entry
    setNewAppt({ patientId: '', doctorId: '', date: new Date().toISOString().split('T')[0], time: getCurrentTime(), reason: '', department: 'General Medicine' });
  };

  const handleCheckIn = () => {
    if (checkingInApptId) {
      updateAppointmentStatus(checkingInApptId, 'Checked-in', {
        vitals: {
          bp: checkInVitals.bp || 'N/A',
          temp: checkInVitals.temp || 'N/A',
          pulse: checkInVitals.pulse || 'N/A',
          weight: checkInVitals.weight || 'N/A',
          spo2: checkInVitals.spo2 || 'N/A',
          sugarLevel: checkInVitals.sugar || 'N/A'
        },
        initialSymptoms: checkInVitals.symptoms || 'None recorded'
      });
      setCheckingInApptId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">OPD Scheduler</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Daily Patient Appointments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold hover:bg-secondary transition-all">
          {ICONS.Plus} New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.sort((a,b) => b.id.localeCompare(a.id)).map(appt => {
          const patient = patients.find(p => p.id === appt.patientId);
          const doc = staff.find(s => s.id === appt.doctorId);
          return (
            <div key={appt.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-slate-50 text-primary border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center font-bold shadow-inner">
                  <span className="text-[10px] uppercase opacity-40">Time</span>
                  <span className="text-xl">{appt.time}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800">{patient?.firstName} {patient?.lastName}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{appt.department} • Dr. {doc?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  appt.status === 'Checked-in' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {appt.status}
                </span>
                {appt.status === 'Scheduled' && (
                  <button onClick={() => setCheckingInApptId(appt.id)} className="bg-secondary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-primary transition-all shadow-md">Triage Start</button>
                )}
              </div>
            </div>
          );
        })}
        {appointments.length === 0 && <div className="p-20 text-center text-slate-300 italic font-bold">No appointments scheduled for today.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="bg-primary p-10 text-white text-center">
              <h3 className="text-2xl font-bold font-heading">Book OPD Visit</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mt-1">Clinic Booking Engine</p>
            </div>
            <form onSubmit={handleBooking} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-4">Select Patient</label>
                <select required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold text-lg" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                  <option value="">Search Registered Patients...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (#{p.id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-4">Date</label>
                  <input required type="date" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-4">Time</label>
                  <input required type="time" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-4">Assign Doctor</label>
                <select required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={newAppt.doctorId} onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})}>
                  <option value="">Choose Physician...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-4">Visit Reason</label>
                <input required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" placeholder="e.g. Regular Checkup, Fever, etc." value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Close</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-[2rem] font-bold shadow-xl hover:bg-secondary transition-all">Book Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkingInApptId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden">
             <div className="bg-secondary p-8 text-white text-center">
                <h3 className="text-2xl font-bold font-heading">Vital Signs (Triage)</h3>
             </div>
             <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-200" placeholder="BP (e.g. 120/80)" value={checkInVitals.bp} onChange={e => setCheckInVitals({...checkInVitals, bp: e.target.value})} />
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-200" placeholder="Temp (°F)" value={checkInVitals.temp} onChange={e => setCheckInVitals({...checkInVitals, temp: e.target.value})} />
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-200" placeholder="Pulse (BPM)" value={checkInVitals.pulse} onChange={e => setCheckInVitals({...checkInVitals, pulse: e.target.value})} />
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-200" placeholder="Weight (kg)" value={checkInVitals.weight} onChange={e => setCheckInVitals({...checkInVitals, weight: e.target.value})} />
                </div>
                <textarea rows={3} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none border border-slate-200" placeholder="Primary Patient Complaints..." value={checkInVitals.symptoms} onChange={e => setCheckInVitals({...checkInVitals, symptoms: e.target.value})} />
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setCheckingInApptId(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Back</button>
                   <button onClick={handleCheckIn} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl hover:bg-secondary transition-all">Submit to Doctor</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
