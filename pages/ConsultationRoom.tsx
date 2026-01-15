
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment, MedicalRecord, Prescription } from '../types';

interface ConsultationRoomProps {
  patients: Patient[];
  appointments: Appointment[];
  finalizeConsultation: (record: MedicalRecord, prescription: Prescription) => void;
}

const COMMON_MEDICINES = [
  "Paracetamol 500mg", "Amoxicillin 500mg", "Cetirizine 10mg", "Azithromycin 500mg",
  "Pantoprazole 40mg", "Metformin 500mg", "Amlodipine 5mg", "Ibuprofen 400mg",
  "Cough Syrup (Ascoril)", "Vitamin D3 60K", "B-Complex", "Zincovit"
];

const FOOD_INSTRUCTIONS = ["Before Food", "After Food", "With Food", "Empty Stomach"];

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ patients, appointments, finalizeConsultation }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '' });
  const [notes, setNotes] = useState({ symptoms: '', diagnosis: '', general: '' });
  
  // Structured medicine state
  const [medicines, setMedicines] = useState([{ 
    name: '', 
    duration: '5', 
    instructions: 'After Food',
    freq: { m: true, a: false, e: false, n: true } 
  }]);

  const currentAppt = appointments.find(a => a.id === activeId);
  const currentPat = patients.find(p => p.id === currentAppt?.patientId);

  const handleFinalize = () => {
    if (!activeId || !currentPat) return;

    const record: MedicalRecord = {
      id: `REC-${Date.now()}`,
      appointmentId: activeId,
      patientId: currentPat.id,
      doctorId: '1',
      date: new Date().toISOString(),
      diagnosis: notes.diagnosis,
      symptoms: notes.symptoms,
      vitals,
      notes: notes.general
    };

    const prescription: Prescription = {
      id: `RX-${Date.now()}`,
      patientId: currentPat.id,
      appointmentId: activeId,
      date: new Date().toISOString().split('T')[0],
      medicines: medicines.map(m => ({
        name: m.name || "N/A",
        dosage: `${m.freq.m ? '1' : '0'}-${m.freq.a ? '1' : '0'}-${m.freq.e ? '1' : '0'}-${m.freq.n ? '1' : '0'}`,
        duration: `${m.duration} Days`,
        instructions: m.instructions
      }))
    };

    finalizeConsultation(record, prescription);
    setActiveId(null);
    setVitals({ bp: '', temp: '', pulse: '', weight: '' });
    setNotes({ symptoms: '', diagnosis: '', general: '' });
    setMedicines([{ name: '', duration: '5', instructions: 'After Food', freq: { m: true, a: false, e: false, n: true } }]);
  };

  const updateMed = (idx: number, updates: any) => {
    const copy = [...medicines];
    copy[idx] = { ...copy[idx], ...updates };
    setMedicines(copy);
  };

  const toggleFreq = (idx: number, time: 'm' | 'a' | 'e' | 'n') => {
    const copy = [...medicines];
    copy[idx].freq[time] = !copy[idx].freq[time];
    setMedicines(copy);
  };

  if (!activeId) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-heading text-primary uppercase">Consultation Hub</h2>
            <p className="subheading text-secondary font-bold text-xs tracking-widest">Active Clinical Queue</p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-primary/10 mb-8 border-4 border-dashed border-primary/10">
              {ICONS.Records}
            </div>
            <h3 className="text-3xl font-heading text-slate-800 uppercase tracking-widest mb-4">Patient Waiting List</h3>
            <p className="text-slate-400 text-sm mb-12 text-center max-w-sm">Select a checked-in patient to start their clinical assessment.</p>
            
            <div className="w-full max-w-2xl divide-y divide-slate-100">
              {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').map(appt => {
                const p = patients.find(pat => pat.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex items-center justify-between py-6 group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                        {appt.time}
                      </div>
                      <div>
                        <p className="font-heading text-xl text-slate-800 leading-none mb-1 uppercase tracking-wider">{p?.firstName} {p?.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appt.department} • {appt.reason}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveId(appt.id)}
                      className="px-8 py-3 bg-primary text-white font-heading text-xs tracking-widest uppercase rounded-xl hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                    >
                      Start Session
                    </button>
                  </div>
                );
              })}
              {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').length === 0 && (
                <div className="text-center p-12 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">All outpatient queues are empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-center bg-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none scale-[3]">{ICONS.Records}</div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center text-white border-4 border-white/20 backdrop-blur-md">
            <span className="text-4xl font-heading uppercase">{currentPat?.firstName[0]}</span>
          </div>
          <div>
            <h3 className="text-4xl font-heading uppercase tracking-widest leading-none mb-2">{currentPat?.firstName} {currentPat?.lastName}</h3>
            <p className="subheading text-secondary font-bold text-[10px] tracking-[0.4em]">{currentPat?.id} • {currentPat?.gender} • BLOOD {currentPat?.bloodGroup}</p>
          </div>
        </div>
        <div className="text-right relative z-10">
          <p className="text-[10px] subheading uppercase tracking-widest text-white/50 mb-1">Session Active</p>
          <p className="text-4xl font-mono font-bold tracking-tighter">{currentAppt?.time}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <h4 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-4">Vitals Engine</h4>
          <div className="space-y-6">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 subheading">Blood Pressure</label>
              <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-secondary/10 font-mono text-sm" placeholder="120/80" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 subheading">Temp (°C)</label>
              <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-secondary/10 font-mono text-sm" placeholder="37.0" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 subheading">Pulse (BPM)</label>
              <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-secondary/10 font-mono text-sm" placeholder="72" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 subheading">Weight (KG)</label>
              <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-secondary/10 font-mono text-sm" placeholder="70" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
             <section className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                   <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Clinical Assessment</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Chief Symptoms</label>
                      <textarea rows={4} className="w-full p-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-secondary/10 text-sm" placeholder="Describe clinical symptoms..." value={notes.symptoms} onChange={e => setNotes({...notes, symptoms: e.target.value})} />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Clinical Diagnosis</label>
                      <textarea rows={4} className="w-full p-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-secondary/10 text-sm font-bold text-primary" placeholder="State condition..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
                   </div>
                </div>
             </section>

             <section className="pt-10 border-t border-slate-50 space-y-8">
                <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Digital Prescription (Rx)</h4>
                <div className="space-y-6">
                   {medicines.map((m, idx) => (
                     <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] relative border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Drug Name</label>
                              <select 
                                className="w-full p-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/10 text-xs font-bold"
                                value={m.name}
                                onChange={e => updateMed(idx, { name: e.target.value })}
                              >
                                <option value="">Select Medicine...</option>
                                {COMMON_MEDICINES.map(med => <option key={med} value={med}>{med}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Duration (Days)</label>
                              <input 
                                type="number" 
                                className="w-full p-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/10 text-xs" 
                                value={m.duration} 
                                onChange={e => updateMed(idx, { duration: e.target.value })} 
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Instructions</label>
                              <select 
                                className="w-full p-3 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/10 text-xs"
                                value={m.instructions}
                                onChange={e => updateMed(idx, { instructions: e.target.value })}
                              >
                                {FOOD_INSTRUCTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading min-w-[100px]">Frequency (M-A-E-N):</label>
                           <div className="flex gap-2">
                              {(['m', 'a', 'e', 'n'] as const).map(time => (
                                <button
                                  key={time}
                                  onClick={() => toggleFreq(idx, time)}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold uppercase transition-all ${
                                    m.freq[time] ? 'bg-secondary text-white shadow-md' : 'bg-white text-slate-300'
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                           </div>
                        </div>

                        {medicines.length > 1 && (
                          <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                            <span className="text-xl">×</span>
                          </button>
                        )}
                     </div>
                   ))}
                   <button onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { m: true, a: false, e: false, n: true } }])} className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] border-2 border-dashed border-secondary/20 p-5 rounded-[2rem] w-full hover:bg-secondary/5 transition-all">Add Medicine Entry</button>
                </div>
             </section>

             <div className="flex justify-end gap-6 pt-10 border-t border-slate-50">
                <button onClick={() => setActiveId(null)} className="px-10 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs">Defer Session</button>
                <button 
                  onClick={handleFinalize}
                  className="px-14 py-4 bg-primary text-white font-heading tracking-[0.2em] uppercase rounded-2xl hover:bg-secondary transition-all shadow-2xl active:scale-95 text-lg"
                >
                  Finalize & Push to Billing
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
