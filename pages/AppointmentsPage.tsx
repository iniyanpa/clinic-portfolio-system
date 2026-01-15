
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
    addAppointment({
      id: `APP-${Date.now().toString().slice(-4)}`,
      patientId: newAppt.patientId,
      doctorId: '1',
      date: newAppt.date,
      time: newAppt.time,
      status: 'Scheduled',
      reason: newAppt.reason,
      department: newAppt.department
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase">Scheduler</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Daily OPD Queue</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-xs md:text-sm"
        >
          {ICONS.Plus} New Visit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-heading text-lg md:text-xl text-slate-700 mb-4 md:mb-6 uppercase tracking-wider">Scheduled Today</h3>
            <div className="space-y-3">
              {appointments.filter(a => a.status !== 'Completed').map(appt => {
                const patient = patients.find(p => p.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold font-mono text-sm md:text-base">
                        {appt.time}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm md:text-base truncate">{patient?.firstName} {patient?.lastName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold truncate">{appt.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700">
                        {appt.status}
                      </span>
                      <button onClick={() => updateAppointmentStatus(appt.id, 'Cancelled')} className="p-1.5 text-slate-300 hover:text-red-500">×</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-heading text-lg text-slate-700 mb-4 uppercase tracking-wider text-center">Department Split</h3>
          <div className="space-y-2">
            {DEPARTMENTS.map(dept => {
              const count = appointments.filter(a => a.department === dept && a.status !== 'Completed').length;
              if (count === 0) return null;
              return (
                <div key={dept} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{dept}</span>
                  <span className="w-5 h-5 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white text-center">
              <h3 className="text-xl font-heading uppercase tracking-widest">Register OPD Visit</h3>
            </div>
            <form onSubmit={handleBooking} className="p-6 md:p-8 space-y-4">
              <select required className="w-full p-3 border rounded-xl text-sm" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                <option value="">Select Patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
              <select required className="w-full p-3 border rounded-xl text-sm" value={newAppt.department} onChange={e => setNewAppt({...newAppt, department: e.target.value})}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="p-3 border rounded-xl text-sm" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                <input required type="time" className="p-3 border rounded-xl text-sm" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
              </div>
              <input required type="text" className="w-full p-3 border rounded-xl text-sm" placeholder="Reason for visit" value={newAppt.reason} onChange={e => setNewAppt({...newAppt, reason: e.target.value})} />
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-heading tracking-widest uppercase rounded-xl text-xs">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
