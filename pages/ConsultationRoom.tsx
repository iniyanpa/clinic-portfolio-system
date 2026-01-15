
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
  const [notes, setNotes] = useState({ symptoms: '', diagnosis: '', general: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
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
        contents: `Analyze these symptoms for a ${currentPat?.gender} patient: "${notes.symptoms}". Vitals: BP ${vitals.bp}, Temp ${vitals.temp}, Pulse ${vitals.pulse}. Suggest potential differential diagnoses and red flags. Format as brief bullet points.`,
        config: {
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      setAiResponse(response.text || "AI analysis completed.");
    } catch (error) {
      console.error(error);
      setAiResponse("AI service temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleMedicalSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for recent clinical data or drug interactions for: ${searchQuery}`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      setSearchResults(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
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
    setNotes({ symptoms: '', diagnosis: '', general: '' });
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
            
            <div className="w-full max-w-2xl divide-y divide-slate-100">
              {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').map(appt => {
                const p = patients.find(pat => pat.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex items-center justify-between py-6 group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                        {appt.time}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading text-xl text-slate-800 leading-none mb-1 uppercase tracking-wider truncate">{p?.firstName} {p?.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{appt.department} • {appt.reason}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveId(appt.id)}
                      className="px-8 py-3 bg-primary text-white font-heading text-xs tracking-widest uppercase rounded-xl hover:bg-secondary transition-all md:opacity-0 group-hover:opacity-100 shadow-xl ml-2 shrink-0"
                    >
                      Enter
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center bg-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden gap-6">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center text-white border-4 border-white/20 backdrop-blur-md">
            <span className="text-4xl font-heading uppercase">{currentPat?.firstName[0]}</span>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-4xl font-heading uppercase tracking-widest leading-none mb-2">{currentPat?.firstName} {currentPat?.lastName}</h3>
            <p className="subheading text-secondary font-bold text-[10px] tracking-[0.3em]">{currentPat?.id} • {currentPat?.gender} • BLOOD {currentPat?.bloodGroup}</p>
          </div>
        </div>
        <button onClick={() => setActiveId(null)} className="relative z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all text-xl">×</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 h-fit lg:sticky lg:top-28">
            <h4 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-4">Vitals Engine</h4>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-5">
              {[
                { label: 'Blood Pressure', key: 'bp', placeholder: '120/80', unit: 'mmHg' },
                { label: 'Temperature', key: 'temp', placeholder: '37.0', unit: '°C' },
                { label: 'Pulse Rate', key: 'pulse', placeholder: '72', unit: 'BPM' },
                { label: 'Weight', key: 'weight', placeholder: '70', unit: 'KG' }
              ].map(v => (
                <div key={v.key} className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">{v.label}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-4 focus:ring-secondary/10 font-mono text-sm" 
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

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
             <h4 className="font-heading text-xl text-slate-700 uppercase tracking-widest">Research Tool</h4>
             <div className="relative">
               <input 
                 type="text" 
                 className="w-full p-4 bg-slate-50 border-none rounded-xl outline-none text-xs"
                 placeholder="Search drugs or side effects..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleMedicalSearch()}
               />
               <button 
                 onClick={handleMedicalSearch}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-secondary"
               >
                 {isSearching ? '...' : ICONS.Search}
               </button>
             </div>
             <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {searchResults.map((chunk: any, i) => (
                  <a key={i} href={chunk.web?.uri} target="_blank" className="block p-2 bg-slate-50 rounded-lg text-[10px] text-blue-500 hover:underline truncate">
                    {chunk.web?.title || chunk.web?.uri}
                  </a>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-12">
             <section className="space-y-8">
                <div className="flex justify-between items-center">
                  <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Clinical Assessment</h4>
                  <button 
                    onClick={getAiDiagnosisSuggestions}
                    disabled={aiLoading || !notes.symptoms}
                    className="px-5 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl font-bold uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-secondary hover:text-white transition-all disabled:opacity-50"
                  >
                    {aiLoading ? 'Analyzing...' : 'AI Differential'}
                  </button>
                </div>
                
                {aiResponse && (
                  <div className="p-6 bg-slate-50 border-l-4 border-secondary rounded-2xl animate-in fade-in slide-in-from-top-2">
                     <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Gemini 3 Pro Insights</span>
                        <button onClick={() => setAiResponse(null)} className="text-slate-300 hover:text-red-400">×</button>
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap italic font-medium">{aiResponse}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Chief Symptoms</label>
                      <textarea rows={3} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-secondary/10 text-sm leading-relaxed" placeholder="Detailed symptoms..." value={notes.symptoms} onChange={e => setNotes({...notes, symptoms: e.target.value})} />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Diagnosis Result</label>
                      <textarea rows={3} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-secondary/10 text-sm font-bold text-primary" placeholder="Enter findings..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
                   </div>
                </div>
             </section>

             <section className="pt-10 border-t border-slate-50 space-y-8">
                <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Digital Prescription (Rx)</h4>
                <div className="space-y-6">
                   {medicines.map((m, idx) => (
                     <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] relative border border-slate-100">
                        <div className="grid grid-cols-3 gap-6 mb-8">
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Drug Name</label>
                              <select 
                                className="w-full p-4 bg-white border-none rounded-xl outline-none text-xs font-bold"
                                value={m.name}
                                onChange={e => updateMed(idx, { name: e.target.value })}
                              >
                                <option value="">Select Medication...</option>
                                {COMMON_MEDICINES.map(med => <option key={med} value={med}>{med}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Duration (Days)</label>
                              <input type="number" className="w-full p-4 bg-white border-none rounded-xl text-xs font-mono" value={m.duration} onChange={e => updateMed(idx, { duration: e.target.value })} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Food Advice</label>
                              <select className="w-full p-4 bg-white border-none rounded-xl text-xs" value={m.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })}>
                                {FOOD_INSTRUCTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading block mb-4">Schedule (M-A-E-N):</label>
                           <div className="grid grid-cols-4 gap-4">
                              {[
                                { id: 'morning', label: 'Morning' },
                                { id: 'afternoon', label: 'Afternoon' },
                                { id: 'evening', label: 'Evening' },
                                { id: 'night', label: 'Night' }
                              ].map(time => (
                                <button
                                  key={time.id}
                                  onClick={() => toggleFreq(idx, time.id as any)}
                                  className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                                    m.freq[time.id as keyof typeof m.freq] 
                                      ? 'bg-primary border-primary text-white' 
                                      : 'bg-slate-50 border-slate-100 text-slate-400'
                                  }`}
                                >
                                  {time.label}
                                </button>
                              ))}
                           </div>
                        </div>

                        {medicines.length > 1 && (
                          <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-white text-slate-300 hover:text-red-500 rounded-full">×</button>
                        )}
                     </div>
                   ))}
                   <button 
                     onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }])} 
                     className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] border-2 border-dashed border-secondary/20 p-6 rounded-[2.5rem] w-full hover:bg-secondary/5 transition-all"
                   >
                     + Add Medication
                   </button>
                </div>
             </section>

             <div className="flex justify-end gap-6 pt-10 border-t border-slate-50">
                <button onClick={() => setActiveId(null)} className="px-10 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button 
                  onClick={handleFinalize}
                  className="px-14 py-5 bg-primary text-white font-heading tracking-[0.2em] uppercase rounded-2xl hover:bg-secondary transition-all shadow-xl text-xl"
                >
                  Authorize Rx & Bill
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
