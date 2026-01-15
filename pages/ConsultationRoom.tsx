
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
  "Cough Syrup (Ascoril)", "Vitamin D3 60K", "B-Complex", "Zincovit", "Telmisartan 40mg",
  "Atorvastatin 10mg", "Clopidogrel 75mg", "Limcee 500mg"
];

const FOOD_INSTRUCTIONS = ["Before Food", "After Food", "With Food", "Empty Stomach"];

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ patients, appointments, finalizeConsultation }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '' });
  const [notes, setNotes] = useState({ symptoms: '', diagnosis: '', general: '' });
  
  const [medicines, setMedicines] = useState([{ 
    name: '', 
    duration: '5', 
    instructions: 'After Food',
    freq: { morning: true, afternoon: false, evening: false, night: true } 
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
        name: m.name || "General Medicine",
        dosage: `${m.freq.morning ? '1' : '0'}-${m.freq.afternoon ? '1' : '0'}-${m.freq.evening ? '1' : '0'}-${m.freq.night ? '1' : '0'}`,
        duration: `${m.duration} Days`,
        instructions: m.instructions
      }))
    };

    finalizeConsultation(record, prescription);
    setActiveId(null);
    resetForm();
  };

  const resetForm = () => {
    setVitals({ bp: '', temp: '', pulse: '', weight: '' });
    setNotes({ symptoms: '', diagnosis: '', general: '' });
    setMedicines([{ name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }]);
  };

  const updateMed = (idx: number, updates: any) => {
    const copy = [...medicines];
    copy[idx] = { ...copy[idx], ...updates };
    setMedicines(copy);
  };

  const toggleFreq = (idx: number, time: keyof typeof medicines[0]['freq']) => {
    const copy = [...medicines];
    copy[idx].freq[time] = !copy[idx].freq[time];
    setMedicines(copy);
  };

  if (!activeId) {
    return (
      <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase">Consultation Hub</h2>
            <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Active Clinical Queue</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 p-6 md:p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center text-primary/10 mb-6 md:mb-8 border-4 border-dashed border-primary/10">
              {ICONS.Records}
            </div>
            <h3 className="text-xl md:text-3xl font-heading text-slate-800 uppercase tracking-widest mb-2 md:mb-4 text-center">Patient Waiting List</h3>
            <p className="text-slate-400 text-xs md:text-sm mb-8 md:mb-12 text-center max-w-sm">Select a patient to begin clinical entry.</p>
            
            <div className="w-full max-w-2xl divide-y divide-slate-100">
              {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').map(appt => {
                const p = patients.find(pat => pat.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex items-center justify-between py-4 md:py-6 group">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary text-white rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-base md:text-lg shadow-lg">
                        {appt.time}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading text-lg md:text-xl text-slate-800 leading-none mb-1 uppercase tracking-wider truncate">{p?.firstName} {p?.lastName}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{appt.department} • {appt.reason}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveId(appt.id)}
                      className="px-4 md:px-8 py-2 md:py-3 bg-primary text-white font-heading text-[10px] md:text-xs tracking-widest uppercase rounded-xl hover:bg-secondary transition-all md:opacity-0 group-hover:opacity-100 shadow-xl ml-2 shrink-0"
                    >
                      Enter
                    </button>
                  </div>
                );
              })}
              {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').length === 0 && (
                <div className="text-center p-8 md:p-12 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest italic">All outpatient queues are empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center bg-primary p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden gap-6">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none scale-[3] hidden md:block">{ICONS.Records}</div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10 text-center md:text-left">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-white border-4 border-white/20 backdrop-blur-md">
            <span className="text-2xl md:text-4xl font-heading uppercase">{currentPat?.firstName[0]}</span>
          </div>
          <div>
            <h3 className="text-2xl md:text-4xl font-heading uppercase tracking-widest leading-none mb-2">{currentPat?.firstName} {currentPat?.lastName}</h3>
            <p className="subheading text-secondary font-bold text-[9px] md:text-[10px] tracking-[0.3em]">{currentPat?.id} • {currentPat?.gender} • BLOOD {currentPat?.bloodGroup}</p>
          </div>
        </div>
        <button onClick={() => setActiveId(null)} className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all text-xl">×</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 md:space-y-8 h-fit lg:sticky lg:top-28">
          <h4 className="font-heading text-lg md:text-xl text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-4">Vitals Engine</h4>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-5">
            {[
              { label: 'Blood Pressure', key: 'bp', placeholder: '120/80', unit: 'mmHg' },
              { label: 'Temperature', key: 'temp', placeholder: '37.0', unit: '°C' },
              { label: 'Pulse Rate', key: 'pulse', placeholder: '72', unit: 'BPM' },
              { label: 'Weight', key: 'weight', placeholder: '70', unit: 'KG' }
            ].map(v => (
              <div key={v.key} className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 subheading">{v.label}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full p-3 md:p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-secondary/10 font-mono text-xs md:text-sm" 
                    placeholder={v.placeholder} 
                    value={(vitals as any)[v.key]} 
                    onChange={e => setVitals({...vitals, [v.key]: e.target.value})} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-300 font-bold uppercase">{v.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 space-y-8 md:space-y-12">
             <section className="space-y-6 md:space-y-8">
                <h4 className="font-heading text-xl md:text-2xl text-slate-700 uppercase tracking-widest">Clinical Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                   <div className="space-y-2 md:space-y-3">
                      <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Chief Symptoms</label>
                      <textarea rows={3} className="w-full p-4 md:p-6 bg-slate-50 border-none rounded-2xl md:rounded-[2rem] outline-none focus:ring-4 focus:ring-secondary/10 text-xs md:text-sm leading-relaxed" placeholder="Detailed symptoms..." value={notes.symptoms} onChange={e => setNotes({...notes, symptoms: e.target.value})} />
                   </div>
                   <div className="space-y-2 md:space-y-3">
                      <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Clinical Diagnosis</label>
                      <textarea rows={3} className="w-full p-4 md:p-6 bg-slate-50 border-none rounded-2xl md:rounded-[2rem] outline-none focus:ring-4 focus:ring-secondary/10 text-xs md:text-sm font-bold text-primary" placeholder="Diagnosis result..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
                   </div>
                </div>
             </section>

             <section className="pt-8 md:pt-10 border-t border-slate-50 space-y-6 md:space-y-8">
                <h4 className="font-heading text-xl md:text-2xl text-slate-700 uppercase tracking-widest">Digital Prescription (Rx)</h4>
                <div className="space-y-4 md:space-y-6">
                   {medicines.map((m, idx) => (
                     <div key={idx} className="p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] relative border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                           <div className="space-y-1">
                              <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Drug Name</label>
                              <select 
                                className="w-full p-3 md:p-4 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/10 text-[10px] md:text-xs font-bold shadow-sm"
                                value={m.name}
                                onChange={e => updateMed(idx, { name: e.target.value })}
                              >
                                <option value="">Select Medication...</option>
                                {COMMON_MEDICINES.map(med => <option key={med} value={med}>{med}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Duration (Days)</label>
                              <input 
                                type="number" 
                                className="w-full p-3 md:p-4 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/10 text-[10px] md:text-xs shadow-sm font-mono" 
                                value={m.duration} 
                                onChange={e => updateMed(idx, { duration: e.target.value })} 
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Food Advice</label>
                              <select 
                                className="w-full p-3 md:p-4 bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/10 text-[10px] md:text-xs shadow-sm"
                                value={m.instructions}
                                onChange={e => updateMed(idx, { instructions: e.target.value })}
                              >
                                {FOOD_INSTRUCTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm">
                           <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading block mb-3 md:mb-4">Schedule:</label>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
                              {[
                                { id: 'morning', label: 'Morning' },
                                { id: 'afternoon', label: 'Afternoon' },
                                { id: 'evening', label: 'Evening' },
                                { id: 'night', label: 'Night' }
                              ].map(time => (
                                <button
                                  key={time.id}
                                  onClick={() => toggleFreq(idx, time.id as any)}
                                  className={`py-2 md:py-3 rounded-xl flex items-center justify-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold uppercase transition-all border-2 ${
                                    m.freq[time.id as keyof typeof m.freq] 
                                      ? 'bg-primary border-primary text-white shadow-md' 
                                      : 'bg-slate-50 border-slate-100 text-slate-400'
                                  }`}
                                >
                                  {m.freq[time.id as keyof typeof m.freq] ? '✓' : ''} {time.label}
                                </button>
                              ))}
                           </div>
                        </div>

                        {medicines.length > 1 && (
                          <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 flex items-center justify-center bg-white text-slate-300 hover:text-red-500 rounded-full shadow-sm">
                            ×
                          </button>
                        )}
                     </div>
                   ))}
                   <button 
                     onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }])} 
                     className="text-[9px] md:text-[10px] font-bold text-secondary uppercase tracking-[0.2em] border-2 border-dashed border-secondary/20 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] w-full hover:bg-secondary/5 transition-all flex items-center justify-center gap-2"
                   >
                     {ICONS.Plus} Add Medicine
                   </button>
                </div>
             </section>

             <div className="flex flex-col sm:flex-row justify-end gap-4 md:gap-6 pt-8 md:pt-10 border-t border-slate-50">
                <button onClick={() => setActiveId(null)} className="px-6 md:px-10 py-3 md:py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest text-[10px] md:text-xs">Defer Session</button>
                <button 
                  onClick={handleFinalize}
                  className="px-8 md:px-14 py-4 md:py-5 bg-primary text-white font-heading tracking-[0.2em] uppercase rounded-xl md:rounded-2xl hover:bg-secondary transition-all shadow-xl text-lg md:text-xl"
                >
                  Finalize
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
