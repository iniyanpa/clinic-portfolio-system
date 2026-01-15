
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ICONS } from '../constants';
import { Patient, Appointment, MedicalRecord, Prescription } from '../types';
import { clinicalCollections } from '../firebase';
import { query, where, onSnapshot } from 'firebase/firestore';

interface ConsultationRoomProps {
  patients: Patient[];
  appointments: Appointment[];
  finalizeConsultation: (record: MedicalRecord, prescription: Prescription) => void;
}

const COMMON_MEDICINES = [
  "Paracetamol 500mg", "Amoxicillin 500mg", "Cetirizine 10mg", "Azithromycin 500mg",
  "Pantoprazole 40mg", "Metformin 500mg", "Amlodipine 5mg", "Ibuprofen 400mg",
  "Cough Syrup (Ascoril)", "Vitamin D3 60K", "Zincovit", "Telmisartan 40mg",
  "Atorvastatin 10mg", "Clopidogrel 75mg", "Limcee 500mg"
];

const FOOD_INSTRUCTIONS = ["Before Food", "After Food", "With Food", "Empty Stomach"];

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ patients, appointments, finalizeConsultation }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState({ diagnosis: '', remarks: '', followUpDate: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [pastRecords, setPastRecords] = useState<MedicalRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<MedicalRecord | null>(null);
  
  const [medicines, setMedicines] = useState([{ 
    name: '', 
    duration: '5', 
    instructions: 'After Food',
    freq: { morning: true, afternoon: false, evening: false, night: true } 
  }]);

  const currentAppt = appointments.find(a => a.id === activeId);
  const currentPat = patients.find(p => p.id === currentAppt?.patientId);

  useEffect(() => {
    if (currentPat?.id) {
      setIsLoadingHistory(true);
      const q = query(
        clinicalCollections.records,
        where("patientId", "==", currentPat.id)
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MedicalRecord));
        const sorted = fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPastRecords(sorted);
        setIsLoadingHistory(false);
      }, (err) => {
        console.error("History retrieval error:", err);
        setIsLoadingHistory(false);
      });
      return () => unsub();
    }
  }, [currentPat?.id]);

  const getAiDiagnosisSuggestions = async () => {
    if (!currentAppt?.initialSymptoms) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze these symptoms for a ${currentPat?.gender} patient: "${currentAppt.initialSymptoms}". Potential past history includes: ${pastRecords.map(r => r.diagnosis).join(', ')}. Provide potential current diagnoses.`,
      });
      setAiResponse(response.text || "AI analysis completed.");
    } catch (error) {
      setAiResponse("AI service offline.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFinalize = () => {
    if (!activeId || !currentPat || !currentAppt) return;

    const record: any = {
      id: `REC-${Date.now()}`,
      appointmentId: activeId,
      patientId: currentPat.id,
      doctorId: '1', 
      date: new Date().toISOString(),
      diagnosis: notes.diagnosis || "Consultation complete - observation only",
      symptoms: currentAppt.initialSymptoms || "No symptoms recorded",
      vitals: {
        bp: currentAppt.vitals?.bp || "N/A",
        temp: currentAppt.vitals?.temp || "N/A",
        pulse: currentAppt.vitals?.pulse || "N/A",
        weight: currentAppt.vitals?.weight || "N/A"
      },
      notes: notes.remarks || ""
    };

    if (notes.followUpDate) record.followUpDate = notes.followUpDate;
    if (aiResponse) record.aiInsights = aiResponse;

    const prescription: Prescription = {
      id: `RX-${Date.now()}`,
      patientId: currentPat.id,
      appointmentId: activeId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      medicines: medicines.filter(m => m.name).map(m => ({
        name: m.name,
        dosage: `${m.freq.morning ? '1' : '0'}-${m.freq.afternoon ? '1' : '0'}-${m.freq.evening ? '1' : '0'}-${m.freq.night ? '1' : '0'}`,
        duration: `${m.duration} Days`,
        instructions: m.instructions
      }))
    };

    if (prescription.medicines.length === 0) {
      prescription.medicines = [{ name: "Review in 2 Days", dosage: "N/A", duration: "2 Days", instructions: "Watch for fever" }];
    }

    finalizeConsultation(record as MedicalRecord, prescription);
    setActiveId(null);
    resetForm();
  };

  const resetForm = () => {
    setNotes({ diagnosis: '', remarks: '', followUpDate: '' });
    setAiResponse(null);
    setMedicines([{ name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }]);
    setPastRecords([]);
    setSelectedHistoryRecord(null);
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
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-heading text-primary uppercase">Physician Terminal</h2>
            <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Live Consultation Desk</p>
          </div>
        </div>
        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 text-center shadow-sm">
          {appointments.filter(a => a.status === 'Checked-in').map(appt => {
            const p = patients.find(pat => pat.id === appt.patientId);
            return (
              <div key={appt.id} className="flex items-center justify-between py-6 border-b border-slate-50 last:border-none group">
                <div className="flex items-center gap-6 text-left">
                  <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-heading text-xl shadow-lg">{appt.time}</div>
                  <div>
                    <h4 className="font-heading text-xl text-slate-800 uppercase tracking-widest leading-none mb-1">{p?.firstName} {p?.lastName}</h4>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Waitlisted • {appt.reason}</p>
                  </div>
                </div>
                <button onClick={() => setActiveId(appt.id)} className="px-10 py-3 bg-secondary text-white font-heading text-xs tracking-widest uppercase rounded-xl hover:bg-primary shadow-xl transition-all">Summon Patient</button>
              </div>
            );
          })}
          {appointments.filter(a => a.status === 'Checked-in').length === 0 && (
            <div className="py-20 flex flex-col items-center gap-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  {ICONS.Patients}
               </div>
               <p className="italic text-slate-300 text-sm">Waiting area is clear. No checked-in cases.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8">
      <div className="bg-primary p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            {ICONS.Records}
         </div>
         <div className="flex items-center gap-8 relative z-10">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-heading">{currentPat?.firstName[0]}</div>
           <div>
             <h3 className="text-3xl font-heading uppercase tracking-widest">{currentPat?.firstName} {currentPat?.lastName}</h3>
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{currentPat?.id} • {currentPat?.gender} • Case Ref: {currentAppt.id}</p>
           </div>
         </div>
         <button onClick={() => setActiveId(null)} className="text-white/50 hover:text-white text-3xl transition-colors relative z-10">×</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* LEFT COLUMN: Current Vitals & Triage & History Side Pane */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4 mb-6">Current Triage</h4>
            <div className="space-y-4">
                {[
                  { label: 'BP', val: currentAppt.vitals?.bp, unit: 'mmHg' },
                  { label: 'Temp', val: currentAppt.vitals?.temp, unit: '°F' },
                  { label: 'Pulse', val: currentAppt.vitals?.pulse, unit: 'BPM' },
                  { label: 'Weight', val: currentAppt.vitals?.weight, unit: 'KG' }
                ].map(v => (
                  <div key={v.label} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{v.label}</p>
                    <p className="font-mono text-sm font-bold text-slate-800">{v.val || '--'} <span className="text-[9px] opacity-30">{v.unit}</span></p>
                  </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-50">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-2">Patient's Chief Complaint</p>
                <p className="text-[11px] text-slate-600 italic leading-relaxed">"{currentAppt.initialSymptoms || 'No primary symptoms noted.'}"</p>
            </div>
          </div>

          {/* PAST MEDICAL HISTORY SIDE PANE */}
          <div className="bg-primary/5 p-8 rounded-[3rem] border border-primary/10 shadow-sm max-h-[600px] overflow-hidden flex flex-col">
            <h4 className="font-heading text-xl text-primary uppercase tracking-widest border-b border-primary/10 pb-4 mb-6 flex justify-between items-center">
              Past Visits
              <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-full">{pastRecords.length}</span>
            </h4>
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
               {isLoadingHistory ? (
                 <div className="py-10 text-center text-[9px] font-bold text-primary/30 uppercase tracking-[0.2em] animate-pulse">Syncing Cloud...</div>
               ) : pastRecords.length === 0 ? (
                 <p className="text-center py-10 text-slate-400 italic text-[11px]">No previous records found.</p>
               ) : (
                 pastRecords.map(rec => (
                   <button 
                    key={rec.id} 
                    onClick={() => setSelectedHistoryRecord(rec)}
                    className="w-full text-left p-4 bg-white rounded-2xl border border-primary/10 shadow-sm group hover:border-secondary hover:shadow-md transition-all active:scale-95"
                   >
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[8px] font-bold text-primary uppercase">{rec.date.split('T')[0]}</p>
                        <span className="text-[8px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity">View Full Note →</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 line-clamp-1 group-hover:line-clamp-none transition-all">{rec.diagnosis}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="text-[8px] font-mono text-slate-400">{rec.vitals.weight}kg • {rec.vitals.bp}</span>
                      </div>
                   </button>
                 ))
               )}
            </div>
          </div>
        </div>

        {/* MIDDLE/RIGHT: Main Consultation Terminal */}
        <div className="lg:col-span-9 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-10 shadow-sm">
             <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Active Evaluation</h4>
                  <button onClick={getAiDiagnosisSuggestions} disabled={aiLoading || !currentAppt.initialSymptoms} className="text-[9px] font-bold uppercase tracking-widest bg-primary text-white px-6 py-2.5 rounded-xl shadow-lg hover:bg-secondary transition-all disabled:opacity-30">AI Differential Diagnosis</button>
                </div>
                {aiResponse && <div className="p-6 bg-slate-50 border-l-4 border-primary text-[11px] italic text-slate-600 rounded-2xl whitespace-pre-wrap animate-in fade-in slide-in-from-left-2 shadow-inner">{aiResponse}</div>}
                
                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest subheading">Final Diagnosis</label>
                      <textarea rows={2} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none text-sm font-bold text-slate-800 focus:ring-4 ring-primary/5 transition-all" placeholder="Enter clinical conclusion..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Clinical Remarks & Recommendations</label>
                      <textarea rows={3} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none text-sm" placeholder="Additional observations, general notes..." value={notes.remarks} onChange={e => setNotes({...notes, remarks: e.target.value})} />
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row md:items-center gap-6">
                   <div className="flex-1">
                      <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest subheading block mb-2">Schedule Review Visit</label>
                      <input type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" value={notes.followUpDate} onChange={e => setNotes({...notes, followUpDate: e.target.value})} />
                   </div>
                   <div className="flex-1 text-[10px] text-slate-300 font-medium italic">
                      Automated follow-up alerts will be dispatched to the patient registry upon finalization.
                   </div>
                </div>
             </section>

             <section className="pt-10 border-t border-slate-50 space-y-8">
                <div className="flex justify-between items-center">
                   <h4 className="font-heading text-2xl text-slate-700 uppercase tracking-widest">Medication Order (Rx)</h4>
                </div>
                <div className="space-y-6">
                   {medicines.map((m, idx) => (
                     <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group hover:border-secondary transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                           <select className="p-4 bg-white rounded-xl text-xs font-bold border-none shadow-sm" value={m.name} onChange={e => updateMed(idx, { name: e.target.value })}>
                              <option value="">Choose Medication...</option>
                              {COMMON_MEDICINES.map(med => <option key={med} value={med}>{med}</option>)}
                           </select>
                           <div className="flex items-center gap-3">
                              <input type="number" className="flex-1 p-4 bg-white rounded-xl text-xs font-mono border-none shadow-sm" placeholder="Qty" value={m.duration} onChange={e => updateMed(idx, { duration: e.target.value })} />
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Days</span>
                           </div>
                           <select className="p-4 bg-white rounded-xl text-xs border-none shadow-sm" value={m.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })}>
                              {FOOD_INSTRUCTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {['morning', 'afternoon', 'evening', 'night'].map(t => (
                             <button key={t} onClick={() => toggleFreq(idx, t as any)} className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase transition-all shadow-sm ${m.freq[t as keyof typeof m.freq] ? 'bg-primary text-white' : 'bg-white text-slate-300'}`}>{t}</button>
                           ))}
                        </div>
                        {medicines.length > 1 && <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 text-xl transition-colors">×</button>}
                     </div>
                   ))}
                   <button onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }])} className="w-full py-8 border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase tracking-widest text-xs hover:border-secondary hover:text-secondary rounded-[2.5rem] transition-all bg-slate-50/30">+ Add Rx Line</button>
                </div>
             </section>

             <div className="flex justify-end pt-10 border-t border-slate-50">
                <button onClick={handleFinalize} className="px-16 py-6 bg-primary text-white font-heading text-xl uppercase tracking-widest rounded-[2rem] hover:bg-secondary transition-all shadow-2xl active:scale-95 flex items-center gap-4">
                  Commit Consultation
                  <span className="text-secondary opacity-50">→</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL RECORD FULL MODAL */}
      {selectedHistoryRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
           <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setSelectedHistoryRecord(null)}></div>
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
              <div className="bg-primary p-10 text-white flex justify-between items-center shadow-xl">
                 <div>
                    <h3 className="text-3xl font-heading uppercase tracking-widest leading-none">Archive Record</h3>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-2">Historical Physician Notes • {selectedHistoryRecord.date.split('T')[0]}</p>
                 </div>
                 <button onClick={() => setSelectedHistoryRecord(null)} className="text-4xl text-white/50 hover:text-white transition-colors leading-none">×</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 {/* GRID: Vitals & Core Meta */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Weight', val: selectedHistoryRecord.vitals.weight, unit: 'kg' },
                      { label: 'BP', val: selectedHistoryRecord.vitals.bp, unit: 'mmHg' },
                      { label: 'Temp', val: selectedHistoryRecord.vitals.temp, unit: '°F' },
                      { label: 'Pulse', val: selectedHistoryRecord.vitals.pulse, unit: 'bpm' }
                    ].map(v => (
                      <div key={v.label} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest subheading mb-1">{v.label}</p>
                         <p className="text-xl font-bold text-primary font-mono">{v.val} <span className="text-[9px] text-slate-300 font-sans">{v.unit}</span></p>
                      </div>
                    ))}
                 </div>

                 {/* Diagnosis & Narrative */}
                 <div className="space-y-8">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                       <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest subheading mb-4">Final Clinical Diagnosis</h4>
                       <p className="text-xl font-bold text-slate-800 tracking-wide uppercase font-heading">{selectedHistoryRecord.diagnosis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Symptom History</h4>
                          <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedHistoryRecord.symptoms}"</p>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Physician Remarks</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{selectedHistoryRecord.notes || 'No extended remarks provided.'}</p>
                       </div>
                    </div>

                    {selectedHistoryRecord.aiInsights && (
                       <div className="p-8 bg-secondary/5 rounded-[2.5rem] border border-secondary/10">
                          <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest subheading mb-4">Past AI Insights</h4>
                          <div className="text-[11px] text-slate-500 italic whitespace-pre-wrap leading-relaxed">{selectedHistoryRecord.aiInsights}</div>
                       </div>
                    )}

                    {selectedHistoryRecord.followUpDate && (
                       <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center">
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Follow-up was scheduled for</p>
                          <p className="text-sm font-bold text-amber-900">{selectedHistoryRecord.followUpDate}</p>
                       </div>
                    )}
                 </div>
              </div>
              
              <div className="p-10 border-t border-slate-50 flex justify-end">
                 <button onClick={() => setSelectedHistoryRecord(null)} className="px-12 py-4 bg-slate-100 text-slate-400 font-heading uppercase text-xs tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all">Close Archive</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRoom;
