
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment } from '../types';

interface AppointmentsPageProps {
  patients: Patient[];
  appointments: Appointment[];
  addAppointment: (a: Appointment) => void;
  updateAppointmentStatus: (id: string, s: Appointment['status']) => void;
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ patients, appointments, addAppointment, updateAppointmentStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', time: '', reason: '' });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId) return;
    
    const appt: Appointment = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      patientId: newAppt.patientId,
      doctorId: '1',
      date: newAppt.date,
      time: newAppt.time,
      status: 'Waiting',
      reason: newAppt.reason
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
            <h3 className="font-heading text-xl text-slate-700 mb-6 uppercase tracking-wider">Scheduled Today</h3>
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
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{appt.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        appt.status === 'Waiting' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {appt.status}
                      </span>
                      <button onClick={() => updateAppointmentStatus(appt.id, 'Cancelled')} className="text-slate-300 hover:text-red-500 transition-colors">×</button>
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && <p className="text-center py-10 text-slate-400 italic">No appointments booked for today.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-heading text-lg text-slate-700 mb-4 uppercase tracking-wider">Queue Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] subheading text-primary/60 font-bold uppercase tracking-widest mb-1">Waiting</p>
                <p className="text-2xl font-bold text-primary">{appointments.filter(a => a.status === 'Waiting').length}</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                <p className="text-[10px] subheading text-secondary/60 font-bold uppercase tracking-widest mb-1">Consulting</p>
                <p className="text-2xl font-bold text-secondary">{appointments.filter(a => a.status === 'In-Consultation').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white">
              <h3 className="text-2xl font-heading uppercase tracking-widest">Book Appointment</h3>
            </div>
            <form onSubmit={handleBooking} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Select Patient</label>
                <select required className="w-full p-3 border rounded-xl outline-none focus:border-secondary" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                  <option value="">Choose Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Date</label>
                  <input required type="date" className="w-full p-3 border rounded-xl outline-none" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Preferred Time</label>
                  <input required type="time" className="w-full p-3 border rounded-xl outline-none" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Reason for Visit</label>
                <input required type="text" className="w-full p-3 border rounded-xl outline-none" placeholder="e.g. Annual Checkup" value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-xl hover:bg-secondary shadow-lg">Confirm Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
