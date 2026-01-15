
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment, MedicalRecord } from '../types';
import PrescriptionGenerator from '../components/PrescriptionGenerator';

interface ConsultationRoomProps {
  patients: Patient[];
  appointments: Appointment[];
  addRecord: (r: MedicalRecord) => void;
  updateAppointmentStatus: (id: string, s: Appointment['status']) => void;
}

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ patients, appointments, addRecord, updateAppointmentStatus }) => {
  const [activeApptId, setActiveApptId] = useState<string | null>(null);
  const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '' });
  const [notes, setNotes] = useState({ symptoms: '', diagnosis: '', general: '' });
  const [isPrescribing, setIsPrescribing] = useState(false);

  const activeAppt = appointments.find(a => a.id === activeApptId);
  const activePatient = patients.find(p => p.id === activeAppt?.patientId);

  const startConsultation = (id: string) => {
    updateAppointmentStatus(id, 'In-Consultation');
    setActiveApptId(id);
    setIsPrescribing(false);
  };

  const finalizeConsultation = () => {
    if (!activeApptId || !activePatient) return;
    
    const record: MedicalRecord = {
      id: `REC-${Date.now()}`,
      appointmentId: activeApptId,
      patientId: activePatient.id,
      doctorId: '1',
      date: new Date().toISOString(),
      diagnosis: notes.diagnosis,
      symptoms: notes.symptoms,
      vitals,
      notes: notes.general
    };
    
    addRecord(record);
    updateAppointmentStatus(activeApptId, 'Completed');
    setActiveApptId(null);
    setVitals({ bp: '', temp: '', pulse: '', weight: '' });
    setNotes({ symptoms: '', diagnosis: '', general: '' });
  };

  if (!activeApptId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-heading text-primary uppercase">Clinical Hub</h2>
            <p className="subheading text-secondary font-bold text-xs tracking-widest">Doctor's Workspace</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-primary/20 mb-6 border-2 border-dashed border-primary/20">
              {ICONS.Records}
            </div>
            <h3 className="text-2xl font-heading text-slate-800 uppercase tracking-widest mb-2">Patient Waiting Room</h3>
            <p className="text-slate-400 text-sm mb-8">Select a patient from the queue to start their consultation.</p>
            
            <div className="w-full max-w-2xl divide-y divide-slate-100">
              {appointments.filter(a => a.status === 'Waiting').map(appt => {
                const p = patients.find(p => p.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex items-center justify-between py-4 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary text-white rounded-lg flex items-center justify-center font-bold font-mono">
                        {appt.time}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{p?.firstName} {p?.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appt.reason}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => startConsultation(appt.id)}
                      className="px-6 py-2 bg-primary text-white font-heading text-xs tracking-widest uppercase rounded-lg hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 shadow-md"
                    >
                      Call Patient
                    </button>
                  </div>
                );
              })}
              {appointments.filter(a => a.status === 'Waiting').length === 0 && (
                <div className="text-center p-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">All caught up! No patients waiting.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-primary p-6 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white border-2 border-white/40">
            {ICONS.Patients}
          </div>
          <div>
            <h3 className="text-2xl font-heading uppercase tracking-widest">{activePatient?.firstName} {activePatient?.lastName}</h3>
            <p className="subheading text-secondary font-bold text-[10px] tracking-[0.2em]">{activePatient?.id} • {activePatient?.gender} • {activePatient?.bloodGroup}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] subheading uppercase tracking-widest text-white/50">Consultation Time</p>
          <p className="text-2xl font-mono font-bold">{activeAppt.time}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Vitals Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h4 className="font-heading text-lg text-slate-700 uppercase tracking-wider border-b pb-2">Vitals Input</h4>
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Blood Pressure</label>
              <input type="text" className="w-full p-2 border-b outline-none focus:border-secondary transition-all font-mono" placeholder="120/80" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Temperature (°C)</label>
              <input type="text" className="w-full p-2 border-b outline-none focus:border-secondary transition-all font-mono" placeholder="37.0" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pulse Rate (BPM)</label>
              <input type="text" className="w-full p-2 border-b outline-none focus:border-secondary transition-all font-mono" placeholder="72" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Weight (KG)</label>
              <input type="text" className="w-full p-2 border-b outline-none focus:border-secondary transition-all font-mono" placeholder="70" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Consulting Panel */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
           <div className="flex justify-between items-center border-b pb-4">
              <h4 className="font-heading text-lg text-slate-700 uppercase tracking-wider">Medical Assessment</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPrescribing(!isPrescribing)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${isPrescribing ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                   {ICONS.Records} Prescription Tool
                </button>
              </div>
           </div>

           {isPrescribing ? (
             <div className="animate-in slide-in-from-bottom-4 duration-300">
               <PrescriptionGenerator />
               <button onClick={() => setIsPrescribing(false)} className="mt-4 text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-widest">← Back to Clinical Notes</button>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Chief Symptoms</label>
                  <textarea rows={3} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20" placeholder="Patient describes recurring headache..." value={notes.symptoms} onChange={e => setNotes({...notes, symptoms: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Clinical Diagnosis</label>
                  <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold" placeholder="Identify condition..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">General Clinical Notes</label>
                  <textarea rows={4} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 italic" placeholder="Additional observations, diet advice, follow-up..." value={notes.general} onChange={e => setNotes({...notes, general: e.target.value})} />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                   <button onClick={() => setActiveApptId(null)} className="px-8 py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest text-xs">Defer Visit</button>
                   <button onClick={finalizeConsultation} className="px-10 py-3 bg-primary text-white font-heading tracking-widest uppercase rounded-xl hover:bg-secondary transition-all shadow-lg text-sm">Save & Close Visit</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
