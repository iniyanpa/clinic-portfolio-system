import React, { useState, useEffect } from 'react';
import { onSnapshot, query, where, getDocs } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import { ICONS } from '../constants';
import { Patient, Appointment, MedicalRecord, Prescription, User } from '../types';
import { clinicalCollections } from '../firebase';

interface ConsultationRoomProps {
  patients: Patient[];
  appointments: Appointment[];
  clinicName: string;
  currentUser: User | null;
  finalizeConsultation: (record: MedicalRecord, prescription: Prescription) => void;
}

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ patients, appointments, clinicName, currentUser, finalizeConsultation }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (activeId) {
      setNotes(n => ({ ...n, followUpDate: getDefaultFollowUp() }));
    }
  }, [activeId]);

  const handleFinalize = () => {
    if (!activeId || !currentPat || !currentAppt) return;
    const recordId = `REC-${Date.now()}`;
    const record: MedicalRecord = {
      id: recordId, tenantId: currentPat.tenantId,
      appointmentId: activeId, patientId: currentPat.id,
      doctorId: currentUser?.id || '1', date: new Date().toISOString(),
      diagnosis: notes.diagnosis || "General Consult",
      symptoms: currentAppt.initialSymptoms || "Nil",
      vitals: { ...currentAppt.vitals } as any,
      notes: notes.remarks || "", 
      followUpDate: notes.followUpDate
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
          <h2 className="text-4xl font-heading font-bold text-primary uppercase">Doctor's Desk</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Live Clinical Session</p>
        </div>
        <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-200 shadow-sm">
          <div className="max-w-xl mx-auto space-y-8">
            <h3 className="text-2xl font-bold text-slate-700">Patient Queue</h3>
            {appointments.filter(a => a.status === 'Checked-in').map(appt => {
              const p = patients.find(pat => pat.id === appt.patientId);
              return (
                <div key={appt.id} className="flex items-center justify-between py-6 border-b border-slate-100 last:border-none hover:bg-slate-50 p-6 rounded-2xl transition-all">
                  <div className="flex items-center gap-6 text-left">
                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">{appt.time}</div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{p?.firstName} {p?.lastName}</h4>
                      <p className="text-xs font-bold text-secondary uppercase tracking-widest">{appt.reason}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveId(appt.id)} className="px-10 py-4 bg-secondary text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-xl">Attend</button>
                </div>
              );
            })}
            {appointments.filter(a => a.status === 'Checked-in').length === 0 && (
              <div className="py-20 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">{ICONS.Patients}</div>
                <p className="text-slate-300 italic font-bold">Queue is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-10">
      <div className="bg-primary p-12 rounded-[4rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-10 relative z-10">
           <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-4xl font-black font-heading border border-white/20">{currentPat?.firstName[0]}</div>
           <div>
             <h3 className="text-4xl font-heading font-bold uppercase tracking-tight">{currentPat?.firstName} {currentPat?.lastName}</h3>
             <p className="font-bold text-secondary uppercase tracking-[0.3em] text-sm mt-2">{currentPat?.id} • {currentPat?.gender}</p>
           </div>
        </div>
        <button onClick={() => setActiveId(null)} className="text-white/30 hover:text-white text-5xl transition-colors relative z-10 font-light">×</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm h-fit space-y-8">
           <h4 className="text-2xl font-bold text-slate-700 border-b border-slate-100 pb-4">Vitals</h4>
           <div className="grid grid-cols-2 gap-4">
             {Object.entries(currentAppt.vitals || {}).map(([key, val]) => (
               <div key={key} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key}</span>
                  <span className="font-bold text-primary text-lg">{val as string}</span>
               </div>
             ))}
           </div>
           
           {currentAppt.labRecordBase64 && (
              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Attached Lab Record</p>
                <a href={currentAppt.labRecordBase64} download={currentAppt.labRecordName || 'lab_record.pdf'} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                  <div className="text-primary">{ICONS.Download}</div>
                  <span className="text-[10px] font-bold text-slate-700 truncate">{currentAppt.labRecordName || 'Download Record'}</span>
                </a>
              </div>
           )}

           <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-3">Chief Complaint</p>
              <p className="font-bold text-slate-700 leading-relaxed italic">"{currentAppt.initialSymptoms || 'No primary symptoms noted.'}"</p>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-10">
             <div className="space-y-4">
               <label className="text-sm font-bold text-primary uppercase tracking-widest block ml-2">Clinical Diagnosis</label>
               <textarea rows={2} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-slate-800 text-lg focus:ring-4 ring-primary/5 shadow-inner" placeholder="Diagnosis..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
             </div>
             
             <div className="space-y-6">
               <div className="flex justify-between items-center ml-2">
                 <label className="text-sm font-bold text-primary uppercase tracking-widest">Prescription (Rx)</label>
                 <button onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }])} className="text-xs font-bold text-secondary uppercase hover:underline flex items-center gap-2">
                   {ICONS.Plus} Add Medicine
                 </button>
               </div>
               <div className="space-y-6">
                 {medicines.map((m, idx) => (
                   <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-6 relative group hover:border-secondary transition-all shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                          <input className="w-full bg-white p-4 rounded-2xl border border-slate-200 font-bold text-lg" placeholder="Medicine Name" value={m.name} onChange={e => updateMed(idx, { name: e.target.value })} />
                        </div>
                        <div>
                          <input type="number" className="w-full bg-white p-4 rounded-2xl border border-slate-200 font-bold text-lg" placeholder="Days" value={m.duration} onChange={e => updateMed(idx, { duration: e.target.value })} />
                        </div>
                        <div>
                          <select className="w-full bg-white p-4 rounded-2xl border border-slate-200 font-bold text-sm outline-none" value={m.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })}>
                            <option value="After Food">After Food</option>
                            <option value="Before Food">Before Food</option>
                            <option value="Empty Stomach">Empty Stomach</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {['morning', 'afternoon', 'evening', 'night'].map(t => (
                          <button 
                            key={t} 
                            onClick={() => {
                              const copy = [...medicines];
                              copy[idx].freq[t as keyof typeof m.freq] = !copy[idx].freq[t as keyof typeof m.freq];
                              setMedicines(copy);
                            }} 
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all ${m.freq[t as keyof typeof m.freq] ? 'bg-primary text-white scale-105' : 'bg-white text-slate-300'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {medicines.length > 1 && <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 font-bold text-2xl">×</button>}
                   </div>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
               <div className="space-y-4">
                  <label className="text-sm font-bold text-orange-600 uppercase tracking-widest block ml-2">Follow-up Review</label>
                  <input type="date" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-slate-800 text-lg shadow-inner" value={notes.followUpDate} onChange={e => setNotes({...notes, followUpDate: e.target.value})} />
                  <p className="text-[10px] font-bold text-slate-300 uppercase ml-2 tracking-widest">(Default: +7 Days)</p>
               </div>
               <div className="flex items-end">
                  <button onClick={handleFinalize} className="w-full py-6 bg-primary text-white rounded-[2rem] font-bold font-heading text-2xl shadow-2xl hover:bg-secondary hover:scale-[1.02] transition-all">Complete Visit</button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;