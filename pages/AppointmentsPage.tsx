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
  
  const [checkInVitals, setCheckInVitals] = useState({ 
    bp: '', temp: '', pulse: '', weight: '', spo2: '', sugar: '', rr: '', symptoms: '' 
  });
  
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
      .sort((a, b) => b.time.localeCompare(a.time));
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
          sugarLevel: checkInVitals.sugar || 'N/A',
          rr: checkInVitals.rr || 'N/A'
        },
        initialSymptoms: checkInVitals.symptoms || 'None recorded'
      });
      setCheckingInApptId(null);
      setCheckInVitals({ bp: '', temp: '', pulse: '', weight: '', spo2: '', sugar: '', rr: '', symptoms: '' });
    }
  };

  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i - 1));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary uppercase">OPD Schedule</h2>
          <p className="subheading text-secondary font-bold text-[9px] tracking-widest uppercase">Clinical Calendar Control</p>
        </div>
        <button onClick={() => setShowModal(true)} className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold hover:bg-secondary transition-all text-[10px] uppercase">
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
              className={`px-5 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                isActive ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-primary'
              }`}
            >
              {isToday ? 'Today' : displayDate}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {filteredAndSortedAppts.map(appt => {
          const patient = patients.find(p => p.id === appt.patientId);
          const doc = staff.find(s => s.id === appt.doctorId);
          return (
            <div key={appt.id} className="p-5 sm:p-6 bg-white border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-slate-50 text-primary border border-slate-100 rounded-2xl flex flex-col items-center justify-center font-bold shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="text-[7px] uppercase opacity-40">Time</span>
                  <span className="text-base sm:text-lg leading-none">{appt.time}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold text-slate-800 leading-tight truncate">{patient?.firstName} {patient?.lastName}</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">Dr. {doc?.name} • {appt.department}</p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${
                  appt.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                  appt.status === 'Checked-in' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {appt.status}
                </span>
                {appt.status === 'Scheduled' && (
                  <button onClick={() => setCheckingInApptId(appt.id)} className="bg-secondary text-white px-5 py-2 rounded-xl text-[8px] font-bold uppercase hover:bg-primary transition-all shadow-lg active:scale-95">Triage</button>
                )}
              </div>
            </div>
          );
        })}
        {filteredAndSortedAppts.length === 0 && (
          <div className="p-16 text-center bg-white border border-slate-100 rounded-[2rem]">
            <p className="text-slate-300 font-bold italic text-sm">No appointments scheduled.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/20 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in my-auto">
            <div className="bg-primary p-6 text-white text-center shadow-lg sticky top-0 z-10">
              <h3 className="text-base font-bold font-heading uppercase tracking-widest">Book OPD Visit</h3>
            </div>
            <form onSubmit={handleBooking} className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Patient</label>
                <select required className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-100 outline-none font-bold text-xs shadow-inner" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                  <option value="">Choose Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Date</label>
                  <input required type="date" className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-100 outline-none font-bold text-xs shadow-inner font-mono" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Time</label>
                  <input required type="time" className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-100 outline-none font-bold text-xs shadow-inner font-mono" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Assign Doctor</label>
                <select required className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-100 outline-none font-bold text-xs shadow-inner" value={newAppt.doctorId} onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})}>
                  <option value="">Selection...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Reason</label>
                <input required className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-100 outline-none font-bold text-xs shadow-inner" placeholder="Complaint..." value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold uppercase tracking-widest text-[9px]">Discard</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-xl hover:bg-secondary transition-all uppercase text-[9px] tracking-widest">Commit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkingInApptId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/20 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 my-auto">
             <div className="bg-secondary p-5 text-white text-center shadow-lg sticky top-0 z-10">
                <h3 className="text-base font-bold font-heading uppercase tracking-widest">Vitals Node</h3>
             </div>
             <div className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">BP (mm Hg)</label>
                      <input className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.bp} onChange={e => setCheckInVitals({...checkInVitals, bp: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">Temp (°F)</label>
                      <input className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.temp} onChange={e => setCheckInVitals({...checkInVitals, temp: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">Pulse</label>
                      <input className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.pulse} onChange={e => setCheckInVitals({...checkInVitals, pulse: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">Resp Rate</label>
                      <input className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.rr} onChange={e => setCheckInVitals({...checkInVitals, rr: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">SpO2 (%)</label>
                      <input className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.spo2} onChange={e => setCheckInVitals({...checkInVitals, spo2: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">Weight</label>
                      <input className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.weight} onChange={e => setCheckInVitals({...checkInVitals, weight: e.target.value})} />
                   </div>
                   <div className="col-span-2 space-y-1">
                      <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">Sugar Level</label>
                      <input className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.sugar} onChange={e => setCheckInVitals({...checkInVitals, sugar: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-slate-400 uppercase ml-1">Symptoms</label>
                  <textarea rows={2} className="w-full bg-slate-50 p-2.5 rounded-xl font-bold outline-none border border-slate-100 text-xs shadow-inner" value={checkInVitals.symptoms} onChange={e => setCheckInVitals({...checkInVitals, symptoms: e.target.value})} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white">
                   <button onClick={() => setCheckingInApptId(null)} className="flex-1 py-3 text-slate-400 font-bold uppercase tracking-widest text-[8px]">Discard</button>
                   <button onClick={handleCheckIn} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-xl hover:bg-secondary transition-all uppercase text-[8px] tracking-widest">Push to Doctor</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
