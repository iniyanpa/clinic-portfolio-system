
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
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
  const [notes, setNotes] = useState({ symptoms: '', diagnosis: '', general: '', followUpDate: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  
  const [medicines, setMedicines] = useState([{ 
    name: '', 
    duration: '5', 
    instructions: 'After Food',
    freq: { morning: true, afternoon: false, evening: false, night: true } 
  }]);

  const currentAppt = appointments.find(a => a.id === activeId);
  const currentPat = patients.find(p => p.id === currentAppt?.patientId);

  const getAiDiagnosisSuggestions = async () => {
    if (!notes.symptoms) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze these symptoms for a ${currentPat?.gender} patient: "${notes.symptoms}". Suggest potential diagnoses.`,
      });
      setAiResponse(response.text || "AI analysis completed.");
    } catch (error) {
      setAiResponse("AI service temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

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
      notes: notes.general,
      followUpDate: notes.followUpDate || undefined,
      aiInsights: aiResponse || undefined
    };

    const prescription: Prescription = {
      id: `RX-${Date.now()}`,
      patientId: currentPat.id,
      appointmentId: activeId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
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
    setNotes({ symptoms: '', diagnosis: '', general: '', followUpDate: '' });
    setAiResponse(null);
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
      <div className="space-y-10 animate-in fade-in">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Clinical Hub</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Active Consultation Queue</p>
        </div>
        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 text-center">
          {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').map(appt => {
            const p = patients.find(pat => pat.id === appt.patientId);
            return (
              <div key={appt.id} className="flex items-center justify-between py-6 border-b border-slate-50 last:border-none group">
                <div className="flex items-center gap-6 text-left">
                  <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-heading text-xl shadow-lg">{appt.time}</div>
                  <div>
                    <h4 className="font-heading text-xl text-slate-800 uppercase tracking-widest">{p?.firstName} {p?.lastName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appt.reason}</p>
                  </div>
                </div>
                <button onClick={() => setActiveId(appt.id)} className="px-10 py-3 bg-secondary text-white font-heading text-xs tracking-widest uppercase rounded-xl hover:bg-primary shadow-xl transition-all">Start Session</button>
              </div>
            );
          })}
          {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').length === 0 && (
            <p className="py-20 italic text-slate-300">Consultation queue is empty.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8">
      <div className="bg-primary p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
         <div className="flex items-center gap-8">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-heading">{currentPat?.firstName[0]}</div>
           <div>
             <h3 className="text-3xl font-heading uppercase tracking-widest">{currentPat?.firstName} {currentPat?.lastName}</h3>
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{currentPat?.id} • {currentPat?.gender} • Blood {currentPat?.bloodGroup}</p>
           </div>
         </div>
         <button onClick={() => setActiveId(null)} className="text-white/50 hover:text-white text-3xl">×</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 space-y-8 h-fit lg:sticky lg:top-24">
           <h4 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4">Vitals Monitor</h4>
           {['bp', 'temp', 'pulse', 'weight'].map(v => (
             <div key={v} className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">{v === 'bp' ? 'BP' : v.charAt(0).toUpperCase() + v.slice(1)}</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-mono" 
                  placeholder="--" 
                  value={(vitals as any)[v]} 
                  onChange={e => setVitals({...vitals, [v]: e.target.value})} 
                />
             </div>
           ))}
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-10">
             <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Assessment Findings</h4>
                  <button onClick={getAiDiagnosisSuggestions} disabled={aiLoading || !notes.symptoms} className="text-[9px] font-bold uppercase tracking-widest bg-secondary/10 text-secondary px-4 py-2 rounded-lg border border-secondary/20 hover:bg-secondary hover:text-white transition-all">AI Insight</button>
                </div>
                {aiResponse && <div className="p-6 bg-slate-50 border-l-4 border-secondary text-xs italic text-slate-600 rounded-2xl whitespace-pre-wrap">{aiResponse}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Symptomatology</label>
                      <textarea rows={3} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] outline-none text-sm" placeholder="Patient reported..." value={notes.symptoms} onChange={e => setNotes({...notes, symptoms: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Clinical Diagnosis</label>
                      <textarea rows={3} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] outline-none text-sm font-bold text-primary" placeholder="Diagnosis..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
                   </div>
                </div>
                <div className="pt-6 border-t border-slate-50">
                   <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest subheading block mb-2">Schedule Follow-up</label>
                   <input type="date" className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" value={notes.followUpDate} onChange={e => setNotes({...notes, followUpDate: e.target.value})} />
                </div>
             </section>

             <section className="pt-10 border-t border-slate-50 space-y-8">
                <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Medication Order (Rx)</h4>
                <div className="space-y-6">
                   {medicines.map((m, idx) => (
                     <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] relative">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                           <select className="p-4 bg-white rounded-xl text-xs font-bold border-none" value={m.name} onChange={e => updateMed(idx, { name: e.target.value })}>
                              <option value="">Select Drug...</option>
                              {COMMON_MEDICINES.map(med => <option key={med} value={med}>{med}</option>)}
                           </select>
                           <input type="number" className="p-4 bg-white rounded-xl text-xs font-mono border-none" placeholder="Days" value={m.duration} onChange={e => updateMed(idx, { duration: e.target.value })} />
                           <select className="p-4 bg-white rounded-xl text-xs border-none" value={m.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })}>
                              {FOOD_INSTRUCTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                           {['morning', 'afternoon', 'evening', 'night'].map(t => (
                             <button key={t} onClick={() => toggleFreq(idx, t as any)} className={`py-3 rounded-xl text-[9px] font-bold uppercase transition-all ${m.freq[t as keyof typeof m.freq] ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-300'}`}>{t}</button>
                           ))}
                        </div>
                        {medicines.length > 1 && <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 text-xl">×</button>}
                     </div>
                   ))}
                   <button onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }])} className="w-full py-6 border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase tracking-widest text-xs hover:border-secondary hover:text-secondary rounded-[2.5rem] transition-all">+ Add Medication</button>
                </div>
             </section>

             <div className="flex justify-end pt-10 border-t border-slate-50">
                <button onClick={handleFinalize} className="px-16 py-5 bg-primary text-white font-heading text-xl uppercase tracking-widest rounded-[2rem] hover:bg-secondary transition-all shadow-2xl active:scale-95">Complete Consultation</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
