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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [checkInVitals, setCheckInVitals] = useState({ bp: '', temp: '', pulse: '', weight: '', spo2: '', sugar: '', symptoms: '' });
  
  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const [newAppt, setNewAppt] = useState({ 
    patientId: '', doctorId: '',
    date: new Date().toISOString().split('T')[0], 
    time: getCurrentTime(), 
    reason: '', department: 'General Medicine',
    labRecordBase64: '',
    labRecordName: ''
  });

  const doctors = staff.filter(u => u.role === 'Doctor');

  const filteredAndSortedAppts = useMemo(() => {
    return appointments
      .filter(a => a.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAppt({
          ...newAppt,
          labRecordBase64: reader.result as string,
          labRecordName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId || !newAppt.doctorId) return;
    addAppointment({
      id: `APP-${Date.now().toString().slice(-4)}`,
      tenantId: '', patientId: newAppt.patientId,
      doctorId: newAppt.doctorId, date: newAppt.date,
      time: newAppt.time || getCurrentTime(), 
      status: 'Scheduled',
      reason: newAppt.reason, department: newAppt.department,
      labRecordBase64: newAppt.labRecordBase64,
      labRecordName: newAppt.labRecordName
    });
    setShowModal(false);
    setNewAppt({ patientId: '', doctorId: '', date: new Date().toISOString().split('T')[0], time: getCurrentTime(), reason: '', department: 'General Medicine', labRecordBase64: '', labRecordName: '' });
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

  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i - 1)); // Show yesterday, today, and next 5 days
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary uppercase">OPD Schedule</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Clinical Calendar Control</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-bold hover:bg-secondary transition-all text-[10px] uppercase">
          {ICONS.Plus} Create Appointment
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {dateTabs.map(date => {
          const isToday = date === new Date().toISOString().split('T')[0];
          const isActive = date === selectedDate;
          const displayDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          return (
            <button 
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                isActive ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-primary'
              }`}
            >
              {isToday ? 'Today' : displayDate}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedAppts.map(appt => {
          const patient = patients.find(p => p.id === appt.patientId);
          const doc = staff.find(s => s.id === appt.doctorId);
          return (
            <div key={appt.id} className="p-6 bg-white border border-slate-200 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 text-primary border border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center font-bold shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="text-[8px] uppercase opacity-40">Time</span>
                  <span className="text-lg leading-none">{appt.time}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 leading-tight">{patient?.firstName} {patient?.lastName}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dr. {doc?.name} • {appt.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                  appt.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                  appt.status === 'Checked-in' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {appt.status}
                </span>
                {appt.status === 'Scheduled' && (
                  <button onClick={() => setCheckingInApptId(appt.id)} className="bg-secondary text-white px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase hover:bg-primary transition-all shadow-lg active:scale-95">Start Triage</button>
                )}
              </div>
            </div>
          );
        })}
        {filteredAndSortedAppts.length === 0 && (
          <div className="p-20 text-center bg-white border border-slate-100 rounded-[2.5rem]">
            <p className="text-slate-300 font-bold italic text-sm">No clinical appointments scheduled for this date.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="bg-primary p-6 text-white text-center shadow-lg">
              <h3 className="text-lg font-bold font-heading uppercase tracking-widest">Book OPD Visit</h3>
            </div>
            <form onSubmit={handleBooking} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Select Patient</label>
                <select required className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none font-bold text-sm shadow-inner" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                  <option value="">Choose Registry...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (#{p.id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Date</label>
                  <input required type="date" className="bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none font-bold text-sm shadow-inner font-mono" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Time</label>
                  <input required type="time" className="bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none font-bold text-sm shadow-inner font-mono" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Assign Physician</label>
                <select required className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none font-bold text-sm shadow-inner" value={newAppt.doctorId} onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})}>
                  <option value="">Doctor Selection...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Reason for OPD</label>
                <input required className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none font-bold text-sm shadow-inner" placeholder="Complaint summary..." value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Attach Lab Record (Optional)</label>
                <input type="file" className="w-full bg-slate-50 p-2 rounded-xl border border-slate-100 outline-none font-bold text-[10px] shadow-inner" onChange={handleFileChange} />
                {newAppt.labRecordName && <p className="text-[8px] text-primary mt-1 truncate">Attached: {newAppt.labRecordName}</p>}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold uppercase tracking-widest text-[9px]">Discard</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-xl hover:bg-secondary transition-all uppercase text-[9px] tracking-widest">Commit Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkingInApptId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
             <div className="bg-secondary p-6 text-white text-center shadow-lg">
                <h3 className="text-lg font-bold font-heading uppercase tracking-widest">Capture Node Vitals</h3>
             </div>
             <div className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                   <input className="bg-slate-50 p-3 rounded-xl font-bold outline-none border border-slate-100 text-sm shadow-inner" placeholder="BP (120/80)" value={checkInVitals.bp} onChange={e => setCheckInVitals({...checkInVitals, bp: e.target.value})} />
                   <input className="bg-slate-50 p-3 rounded-xl font-bold outline-none border border-slate-100 text-sm shadow-inner" placeholder="Temp (°F)" value={checkInVitals.temp} onChange={e => setCheckInVitals({...checkInVitals, temp: e.target.value})} />
                   <input className="bg-slate-50 p-3 rounded-xl font-bold outline-none border border-slate-100 text-sm shadow-inner" placeholder="Pulse BPM" value={checkInVitals.pulse} onChange={e => setCheckInVitals({...checkInVitals, pulse: e.target.value})} />
                   <input className="bg-slate-50 p-3 rounded-xl font-bold outline-none border border-slate-100 text-sm shadow-inner" placeholder="Weight KG" value={checkInVitals.weight} onChange={e => setCheckInVitals({...checkInVitals, weight: e.target.value})} />
                </div>
                <textarea rows={3} className="w-full bg-slate-50 p-3 rounded-xl font-bold outline-none border border-slate-100 text-sm shadow-inner" placeholder="Patient detailed complaints..." value={checkInVitals.symptoms} onChange={e => setCheckInVitals({...checkInVitals, symptoms: e.target.value})} />
                <div className="flex gap-4 pt-2">
                   <button onClick={() => setCheckingInApptId(null)} className="flex-1 py-3 text-slate-400 font-bold uppercase tracking-widest text-[9px]">Cancel</button>
                   <button onClick={handleCheckIn} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-xl hover:bg-secondary transition-all uppercase text-[9px] tracking-widest">Push to Doctor</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;