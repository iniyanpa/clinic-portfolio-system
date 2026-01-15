
import React, { useState, useMemo } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment, ApptStatus, User } from '../types';

interface AppointmentsPageProps {
  patients: Patient[];
  staff: User[];
  appointments: Appointment[];
  addAppointment: (a: Appointment) => void;
  updateAppointmentStatus: (id: string, s: ApptStatus, reason?: string) => void;
}

const DEPARTMENTS = ['General Medicine', 'Pediatrics', 'Dermatology', 'Cardiology', 'ENT', 'Orthopedics'];

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ patients, staff, appointments, addAppointment, updateAppointmentStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [cancellingAppt, setCancellingAppt] = useState<{id: string, reason: string} | null>(null);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApptStatus | ''>('');
  const [filterDoctor, setFilterDoctor] = useState('');
  
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

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchesDept = filterDept ? a.department === filterDept : true;
      const matchesStatus = filterStatus ? a.status === filterStatus : true;
      const matchesDoctor = filterDoctor ? a.doctorId === filterDoctor : true;
      return matchesDept && matchesStatus && matchesDoctor;
    });
  }, [appointments, filterDept, filterStatus, filterDoctor]);

  const confirmCancellation = () => {
    if (cancellingAppt) {
       updateAppointmentStatus(cancellingAppt.id, 'Cancelled', cancellingAppt.reason);
       setCancellingAppt(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase">OPD Scheduler</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Active Queue Management</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-xs"
        >
          {ICONS.Plus} Schedule Visit
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
         <div className="flex flex-col gap-1">
           <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Specialty</label>
           <select className="p-3 border-none bg-slate-50 rounded-xl text-xs outline-none" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
             <option value="">All Departments</option>
             {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
         </div>
         <div className="flex flex-col gap-1">
           <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Physician</label>
           <select className="p-3 border-none bg-slate-50 rounded-xl text-xs outline-none" value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
             <option value="">All Doctors</option>
             {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
           </select>
         </div>
         <div className="flex flex-col gap-1">
           <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Visit Status</label>
           <select className="p-3 border-none bg-slate-50 rounded-xl text-xs outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
             <option value="">All Statuses</option>
             <option value="Scheduled">Scheduled</option>
             <option value="Checked-in">Checked-in</option>
             <option value="In-Consultation">In-Consultation</option>
             <option value="Completed">Completed</option>
             <option value="Cancelled">Cancelled</option>
           </select>
         </div>
         <button onClick={() => { setFilterDept(''); setFilterStatus(''); setFilterDoctor(''); }} className="mt-4 text-[9px] font-bold text-secondary uppercase hover:underline">Reset Filters</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(appt => {
          const patient = patients.find(p => p.id === appt.patientId);
          const doc = staff.find(s => s.id === appt.doctorId);
          return (
            <div key={appt.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border rounded-3xl gap-4 hover:border-secondary transition-all shadow-sm ${appt.status === 'Cancelled' ? 'opacity-50 grayscale bg-slate-50' : 'border-slate-100'}`}>
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold font-mono text-base border ${appt.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-primary border-slate-100'}`}>
                  {appt.time}
                </div>
                <div>
                  <p className="font-heading text-xl text-slate-800 leading-none mb-1 uppercase tracking-widest">{patient?.firstName} {patient?.lastName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{appt.department} • Dr. {doc?.name || 'Assigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                  appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {appt.status}
                </span>
                {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                  <button onClick={() => setCancellingAppt({id: appt.id, reason: ''})} className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-bold uppercase hover:bg-red-50 hover:text-red-500 transition-all">Cancel</button>
                )}
                {appt.status === 'Cancelled' && appt.cancellationReason && (
                  <div className="max-w-[150px] overflow-hidden">
                    <p className="text-[8px] text-red-400 italic truncate">Ref: {appt.cancellationReason}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
            <p className="text-slate-300 italic">No appointments scheduled for the selected criteria.</p>
          </div>
        )}
      </div>

      {/* Cancellation Protocol Modal */}
      {cancellingAppt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-heading text-primary uppercase tracking-widest text-center">Visit Revocation</h3>
            <p className="text-center text-[10px] text-slate-400 uppercase font-bold tracking-widest">Reason for Cancellation Required</p>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-red-100" 
              placeholder="e.g. Patient called to reschedule, Doctor unavailable..." 
              rows={3} 
              value={cancellingAppt.reason}
              onChange={e => setCancellingAppt({...cancellingAppt, reason: e.target.value})}
            />
            <div className="flex gap-4">
              <button onClick={() => setCancellingAppt(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px]">Abandon</button>
              <button 
                onClick={confirmCancellation} 
                disabled={!cancellingAppt.reason} 
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-heading uppercase tracking-widest text-xs disabled:opacity-50 shadow-lg active:scale-95 transition-all"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white text-center">
              <h3 className="text-xl font-heading uppercase tracking-widest">Appointment Booking</h3>
            </div>
            <form onSubmit={handleBooking} className="p-8 space-y-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Patient Profile</label>
                 <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                   <option value="">Select Patient...</option>
                   {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                 <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" value={newAppt.department} onChange={e => setNewAppt({...newAppt, department: e.target.value})}>
                   {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Physician</label>
                 <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" value={newAppt.doctorId} onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})}>
                   <option value="">Select Doctor...</option>
                   {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time Slot</label>
                  <input required type="time" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clinical Reason</label>
                 <input required type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Reason for visit" value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold text-[10px] uppercase">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-2xl text-xs shadow-lg hover:bg-secondary transition-all">Register Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
