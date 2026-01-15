
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment } from '../types';

interface AppointmentsPageProps {
  patients: Patient[];
  appointments: Appointment[];
  addAppointment: (a: Appointment) => void;
  updateAppointmentStatus: (id: string, s: Appointment['status']) => void;
}

const DEPARTMENTS = ['General Medicine', 'Pediatrics', 'Dermatology', 'Cardiology', 'ENT', 'Orthopedics'];

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ patients, appointments, addAppointment, updateAppointmentStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [newAppt, setNewAppt] = useState({ patientId: '', date: new Date().toISOString().split('T')[0], time: '', reason: '', department: 'General Medicine' });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId) return;
    
    const appt: Appointment = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      patientId: newAppt.patientId,
      doctorId: '1',
      date: newAppt.date,
      time: newAppt.time,
      // Fixed: status 'Waiting' is not assignable to type 'ApptStatus', changed to 'Scheduled'
      status: 'Scheduled',
      reason: newAppt.reason,
      department: newAppt.department
    };
    addAppointment(appt);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Scheduler</h2>
          <p className="subheading text-secondary font-bold text-xs tracking-widest">Daily Clinical Queue</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-sm"
        >
          {ICONS.Plus} Schedule Visit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-heading text-xl text-slate-700 mb-6 uppercase tracking-wider">Scheduled Queue</h3>
            <div className="space-y-3">
              {appointments.filter(a => a.status !== 'Completed').map(appt => {
                const patient = patients.find(p => p.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold font-mono">
                        {appt.time}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{patient?.firstName} {patient?.lastName}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{appt.department} • {appt.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        // Fixed: status 'Waiting' comparison replaced with valid 'Scheduled'
                        appt.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {appt.status}
                      </span>
                      <button onClick={() => updateAppointmentStatus(appt.id, 'Cancelled')} className="text-slate-300 hover:text-red-500 transition-colors">×</button>
                    </div>
                  </div>
                );
              })}
              {appointments.filter(a => a.status !== 'Completed').length === 0 && <p className="text-center py-10 text-slate-400 italic">No pending appointments.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-heading text-lg text-slate-700 mb-4 uppercase tracking-wider text-center">Departmental Queue</h3>
            <div className="space-y-3">
               {DEPARTMENTS.map(dept => {
                 const count = appointments.filter(a => a.department === dept && a.status !== 'Completed').length;
                 if (count === 0) return null;
                 return (
                  <div key={dept} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{dept}</span>
                    <span className="w-6 h-6 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">{count}</span>
                  </div>
                 )
               })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white">
              <h3 className="text-2xl font-heading uppercase tracking-widest text-center">Register OPD Visit</h3>
            </div>
            <form onSubmit={handleBooking} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Select Patient</label>
                <select required className="w-full p-3 border rounded-xl outline-none focus:border-secondary" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                  <option value="">Choose Registered Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.phone})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Department</label>
                <select required className="w-full p-3 border rounded-xl outline-none focus:border-secondary" value={newAppt.department} onChange={e => setNewAppt({...newAppt, department: e.target.value})}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Date</label>
                  <input required type="date" className="w-full p-3 border rounded-xl outline-none" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Slot Time</label>
                  <input required type="time" className="w-full p-3 border rounded-xl outline-none" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Consultation Reason</label>
                <input required type="text" className="w-full p-3 border rounded-xl outline-none" placeholder="e.g. Fever & Headache" value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-xl hover:bg-secondary shadow-lg">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;