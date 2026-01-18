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

const DEPARTMENTS = ['General Medicine', 'Pediatrics', 'ENT', 'Cardiology', 'Orthopedics', 'Dental'];

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ patients, staff, appointments, addAppointment, updateAppointmentStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [checkingInApptId, setCheckingInApptId] = useState<string | null>(null);
  
  const [checkInVitals, setCheckInVitals] = useState({ bp: '', temp: '', pulse: '', weight: '', spo2: '', sugar: '', symptoms: '' });
  
  const getCurrentTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

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
      time: newAppt.time, status: 'Scheduled',
      reason: newAppt.reason, department: newAppt.department
    });
    setShowModal(false);
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
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">OPD Scheduler</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Manage Appointments & Triage</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-8 py-3 rounded-2xl shadow-lg flex items-center gap-3 font-bold hover:bg-secondary transition-all">
          {ICONS.Plus} Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.sort((a,b) => b.id.localeCompare(a.id)).map(appt => {
          const patient = patients.find(p => p.id === appt.patientId);
          const doc = staff.find(s => s.id === appt.doctorId);
          return (
            <div key={appt.id} className="p-6 bg-white border border-slate-200 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 text-primary border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner">
                  {appt.time}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{patient?.firstName} {patient?.lastName}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.department} • Dr. {doc?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  appt.status === 'Checked-in' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {appt.status}
                </span>
                {appt.status === 'Scheduled' && (
                  <button onClick={() => setCheckingInApptId(appt.id)} className="bg-secondary text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-primary transition-all">Triage / Check-in</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="bg-primary p-8 text-white text-center">
              <h3 className="text-2xl font-bold font-heading">New OPD Booking</h3>
            </div>
            <form onSubmit={handleBooking} className="p-10 space-y-4">
              <select required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                <option value="">Select Registered Patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (#{p.id})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                <input required type="time" className="bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
              </div>
              <select required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" value={newAppt.doctorId} onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})}>
                <option value="">Assign Doctor...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
              </select>
              <input required className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none font-bold" placeholder="Reason for visit..." value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl hover:bg-secondary transition-all">Confirm Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkingInApptId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden">
             <div className="bg-secondary p-8 text-white text-center">
                <h3 className="text-2xl font-bold font-heading">Front-Desk Triage</h3>
             </div>
             <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none" placeholder="BP (120/80)" value={checkInVitals.bp} onChange={e => setCheckInVitals({...checkInVitals, bp: e.target.value})} />
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none" placeholder="Temp (°F)" value={checkInVitals.temp} onChange={e => setCheckInVitals({...checkInVitals, temp: e.target.value})} />
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none" placeholder="Pulse" value={checkInVitals.pulse} onChange={e => setCheckInVitals({...checkInVitals, pulse: e.target.value})} />
                   <input className="bg-slate-50 p-4 rounded-xl font-bold outline-none" placeholder="Weight (kg)" value={checkInVitals.weight} onChange={e => setCheckInVitals({...checkInVitals, weight: e.target.value})} />
                </div>
                <textarea rows={3} className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none" placeholder="Chief Complaints..." value={checkInVitals.symptoms} onChange={e => setCheckInVitals({...checkInVitals, symptoms: e.target.value})} />
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setCheckingInApptId(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Back</button>
                   <button onClick={handleCheckIn} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl hover:bg-secondary transition-all">Send to Doctor</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;