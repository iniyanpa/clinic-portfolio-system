import React, { useState, useEffect } from 'react';
import { onSnapshot, query, where, getDocs } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import { ICONS } from '../constants';
// Added User type to imports from types.ts
import { Patient, Appointment, MedicalRecord, Prescription, User } from '../types';
import { clinicalCollections } from '../firebase';

interface ConsultationRoomProps {
  patients: Patient[];
  appointments: Appointment[];
  clinicName: string;
  // Added currentUser prop definition
  currentUser: User | null;
  finalizeConsultation: (record: MedicalRecord, prescription: Prescription) => void;
}

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ patients, appointments, clinicName, currentUser, finalizeConsultation }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  
  const getDefaultFollowUp = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [notes, setNotes] = useState({ diagnosis: '', remarks: '', followUpDate: getDefaultFollowUp() });
  const [medicines, setMedicines] = useState([{ 
    name: '', duration: '5', instructions: 'After Food',
    freq: { morning: true, afternoon: false, evening: false, night: true } 
  }]);

  const currentAppt = appointments.find(a => a.id === activeId);
  const currentPat = patients.find(p => p.id === currentAppt?.patientId);

  const handleFinalize = () => {
    if (!activeId || !currentPat || !currentAppt) return;
    const recordId = `REC-${Date.now()}`;
    const record: MedicalRecord = {
      id: recordId, tenantId: currentPat.tenantId,
      appointmentId: activeId, patientId: currentPat.id,
      // Fixed: Now using the currentUser prop passed from the parent component
      doctorId: currentUser?.id || '1', date: new Date().toISOString(),
      diagnosis: notes.diagnosis || "General Consult",
      symptoms: currentAppt.initialSymptoms || "Nil",
      vitals: { ...currentAppt.vitals } as any,
      notes: notes.remarks || "", followUpDate: notes.followUpDate,
      aiInsights: aiResponse || undefined
    };

    const prescription: Prescription = {
      id: `RX-${Date.now()}`, tenantId: currentPat.tenantId,
      patientId: currentPat.id, appointmentId: activeId,
      date: new Date().toISOString().split('T')[0], status: 'Pending',
      medicines: medicines.filter(m => m.name).map(m => ({
        name: m.name,
        dosage: `${m.freq.morning ? '1' : '0'}-${m.freq.afternoon ? '1' : '0'}-${m.freq.evening ? '1' : '0'}-${m.freq.night ? '1' : '0'}`,
        duration: `${m.duration} Days`,
        instructions: m.instructions
      }))
    };

    finalizeConsultation(record, prescription);
    setActiveId(null);
    setNotes({ diagnosis: '', remarks: '', followUpDate: getDefaultFollowUp() });
    setMedicines([{ name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }]);
    setAiResponse(null);
  };

  const updateMed = (idx: number, updates: any) => {
    const copy = [...medicines];
    copy[idx] = { ...copy[idx], ...updates };
    setMedicines(copy);
  };

  if (!activeId) {
    return (
      <div className="space-y-10 animate-in fade-in">
        <div>
          <h2 className="text-4xl font-heading font-bold text-primary">Doctor's Consultation Room</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Live Clinical Sessions</p>
        </div>
        <div className="bg-white rounded-[3rem] p-12 text-center border border-slate-200">
          {appointments.filter(a => a.status === 'Checked-in').map(appt => {
            const p = patients.find(pat => pat.id === appt.patientId);
            return (
              <div key={appt.id} className="flex items-center justify-between py-6 border-b border-slate-100 last:border-none">
                <div className="flex items-center gap-6 text-left">
                  <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg">{appt.time}</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">{p?.firstName} {p?.lastName}</h4>
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest">{appt.reason}</p>
                  </div>
                </div>
                <button onClick={() => setActiveId(appt.id)} className="px-10 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-primary transition-all">Start Consultation</button>
              </div>
            );
          })}
          {appointments.filter(a => a.status === 'Checked-in').length === 0 && <p className="py-20 text-slate-300 italic font-bold">Waiting hall is currently empty.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-10">
      <div className="bg-primary p-10 rounded-[3rem] text-white flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-8">
           <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-3xl font-bold font-heading">{currentPat?.firstName[0]}</div>
           <div>
             <h3 className="text-3xl font-heading font-bold uppercase">{currentPat?.firstName} {currentPat?.lastName}</h3>
             <p className="font-bold text-secondary uppercase tracking-widest text-sm mt-1">{currentPat?.id} • {currentPat?.gender}</p>
           </div>
        </div>
        <button onClick={() => setActiveId(null)} className="text-4xl hover:text-red-400 transition-colors">×</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-fit space-y-6">
           <h4 className="text-xl font-bold text-slate-700 border-b pb-4 mb-4">Patient Vitals</h4>
           {Object.entries(currentAppt.vitals || {}).map(([key, val]) => (
             <div key={key} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{key}</span>
                <span className="font-bold text-primary">{val as string}</span>
             </div>
           ))}
           <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">Primary Complaints</p>
              <p className="font-bold text-slate-700 italic">"{currentAppt.initialSymptoms}"</p>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
             <div className="space-y-4">
               <label className="text-sm font-bold text-primary uppercase tracking-widest block">Diagnosis & Findings</label>
               <textarea rows={2} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:ring-4 ring-primary/5" placeholder="Enter clinical diagnosis..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
             </div>
             
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <label className="text-sm font-bold text-primary uppercase tracking-widest">Prescription (Rx Medicines)</label>
                 <button onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }])} className="text-xs font-bold text-secondary uppercase hover:underline">+ Add Medicine</button>
               </div>
               <div className="space-y-4">
                 {medicines.map((m, idx) => (
                   <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <input className="bg-white p-3 rounded-xl border border-slate-200 font-bold text-sm flex-1" placeholder="Medicine Name" value={m.name} onChange={e => updateMed(idx, { name: e.target.value })} />
                        <input type="number" className="bg-white p-3 rounded-xl border border-slate-200 font-bold text-sm w-full" placeholder="Days" value={m.duration} onChange={e => updateMed(idx, { duration: e.target.value })} />
                        <select className="bg-white p-3 rounded-xl border border-slate-200 font-bold text-xs" value={m.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })}>
                          <option value="After Food">After Food</option>
                          <option value="Before Food">Before Food</option>
                          <option value="Empty Stomach">Empty Stomach</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        {['morning', 'afternoon', 'evening', 'night'].map(t => (
                          <button 
                            key={t} 
                            onClick={() => {
                              const copy = [...medicines];
                              copy[idx].freq[t as keyof typeof m.freq] = !copy[idx].freq[t as keyof typeof m.freq];
                              setMedicines(copy);
                            }} 
                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase ${m.freq[t as keyof typeof m.freq] ? 'bg-primary text-white' : 'bg-white text-slate-300'}`}
                          >
                            {t[0]}
                          </button>
                        ))}
                      </div>
                      {medicines.length > 1 && <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 font-bold">×</button>}
                   </div>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
               <div className="space-y-4">
                  <label className="text-sm font-bold text-orange-600 uppercase tracking-widest block">Next Review Visit (Follow-up)</label>
                  <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800" value={notes.followUpDate} onChange={e => setNotes({...notes, followUpDate: e.target.value})} />
               </div>
               <div className="flex items-end">
                  <button onClick={handleFinalize} className="w-full py-5 bg-primary text-white rounded-2xl font-bold font-heading text-xl shadow-xl hover:bg-secondary transition-all active:scale-95">Complete Consultation</button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;