import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment, MedicalRecord, Prescription, User } from '../types';

interface ConsultationRoomProps {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  clinicName: string;
  currentUser: User | null;
  finalizeConsultation: (record: MedicalRecord, prescription: Prescription) => void;
}

const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ patients, appointments, records, clinicName, currentUser, finalizeConsultation }) => {
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

  const patientHistory = useMemo(() => {
    if (!currentPat) return [];
    return records
      .filter(r => r.patientId === currentPat.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, currentPat]);

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
      <div className="space-y-6 sm:space-y-10 animate-in fade-in">
        <div>
          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-primary uppercase">Doctor's Desk</h2>
          <p className="subheading text-secondary font-bold text-[9px] tracking-widest uppercase">Live Clinical Session</p>
        </div>
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-16 text-center border border-slate-200 shadow-sm">
          <div className="max-w-xl mx-auto space-y-6 sm:space-y-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-700">Patient Queue</h3>
            <div className="divide-y divide-slate-100">
              {appointments.filter(a => a.status === 'Checked-in').map(appt => {
                const p = patients.find(pat => pat.id === appt.patientId);
                return (
                  <div key={appt.id} className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4 sm:gap-6 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4 sm:gap-6 text-left w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg shadow-lg flex-shrink-0">{appt.time}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-bold text-slate-800 truncate">{p?.firstName} {p?.lastName}</h4>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest truncate">{appt.reason}</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveId(appt.id)} className="w-full sm:w-auto px-10 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-primary transition-all shadow-xl uppercase text-[10px]">Attend</button>
                  </div>
                );
              })}
              {appointments.filter(a => a.status === 'Checked-in').length === 0 && (
                <div className="py-20 space-y-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">{ICONS.Patients}</div>
                  <p className="text-slate-300 italic font-bold text-sm">Queue is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-10">
      <div className="bg-primary p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6 sm:gap-10 relative z-10 min-w-0">
           <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 bg-white/10 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-2xl sm:text-4xl font-black font-heading border border-white/20">{currentPat?.firstName[0]}</div>
           <div className="min-w-0">
             <h3 className="text-xl sm:text-4xl font-heading font-bold uppercase tracking-tight truncate">{currentPat?.firstName} {currentPat?.lastName}</h3>
             <p className="font-bold text-secondary uppercase tracking-[0.2em] text-[10px] sm:text-sm mt-1 sm:mt-2 truncate">{currentPat?.id} • {currentPat?.gender}</p>
           </div>
        </div>
        <button onClick={() => setActiveId(null)} className="text-white/30 hover:text-white text-3xl sm:text-5xl transition-colors relative z-10 font-light ml-4">×</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm h-fit space-y-6 sm:space-y-8 order-2 lg:order-1">
           <h4 className="text-xl sm:text-2xl font-bold text-slate-700 border-b border-slate-100 pb-3 sm:pb-4 uppercase tracking-widest">Clinical Snapshot</h4>
           
           {/* ATTACHMENT DISPLAY: Strictly conditional based on current appointment upload */}
           {currentAppt.labRecordBase64 ? (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                   <div className="text-primary">{ICONS.Records}</div>
                   <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Patient Attachment</p>
                </div>
                <a href={currentAppt.labRecordBase64} download={currentAppt.labRecordName || 'patient_record.pdf'} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100 hover:border-primary hover:shadow-md transition-all group">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">{ICONS.Download}</div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-800 block truncate">{currentAppt.labRecordName || 'View Document'}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Appointment Reference File</span>
                  </div>
                </a>
              </div>
           ) : null}

           <div className="grid grid-cols-2 gap-3 sm:gap-4">
             {Object.entries(currentAppt.vitals || {}).map(([key, val]) => (
               <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{key}</span>
                  <span className="font-bold text-primary text-sm sm:text-lg truncate">{val as string}</span>
               </div>
             ))}
           </div>

           <div className="bg-orange-50 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-orange-100">
              <p className="text-[8px] font-bold text-orange-400 uppercase tracking-widest mb-3">Clinical Presentation</p>
              <p className="font-bold text-slate-700 leading-relaxed italic text-xs">"{currentAppt.initialSymptoms || 'No initial symptoms noted.'}"</p>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-1 lg:order-2">
          <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] border border-slate-200 shadow-sm space-y-6 sm:space-y-10">
             <div className="space-y-3">
               <label className="text-[10px] font-bold text-primary uppercase tracking-widest block ml-2">Clinical Diagnosis</label>
               <textarea rows={2} className="w-full p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-[2rem] outline-none font-bold text-slate-800 text-base sm:text-lg focus:ring-4 ring-primary/5 shadow-inner" placeholder="Diagnosis..." value={notes.diagnosis} onChange={e => setNotes({...notes, diagnosis: e.target.value})} />
             </div>
             
             <div className="space-y-4">
               <div className="flex justify-between items-center ml-2">
                 <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Prescription (Rx)</label>
                 <button onClick={() => setMedicines([...medicines, { name: '', duration: '5', instructions: 'After Food', freq: { morning: true, afternoon: false, evening: false, night: true } }])} className="text-[9px] font-bold text-secondary uppercase hover:underline flex items-center gap-1">
                   {ICONS.Plus} Add Med
                 </button>
               </div>
               <div className="space-y-4 sm:space-y-6">
                 {medicines.map((m, idx) => (
                   <div key={idx} className="p-5 sm:p-8 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 space-y-4 sm:space-y-6 relative group transition-all shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="lg:col-span-2">
                          <input className="w-full bg-white p-3 rounded-xl border border-slate-200 font-bold text-sm sm:text-lg" placeholder="Medicine Name" value={m.name} onChange={e => updateMed(idx, { name: e.target.value })} />
                        </div>
                        <div>
                          <input type="number" className="w-full bg-white p-3 rounded-xl border border-slate-200 font-bold text-sm sm:text-lg" placeholder="Days" value={m.duration} onChange={e => updateMed(idx, { duration: e.target.value })} />
                        </div>
                        <div>
                          <select className="w-full bg-white p-3 rounded-xl border border-slate-200 font-bold text-xs outline-none" value={m.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })}>
                            <option value="After Food">After Food</option>
                            <option value="Before Food">Before Food</option>
                            <option value="Empty Stomach">Empty Stomach</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['morning', 'afternoon', 'evening', 'night'].map(t => (
                          <button 
                            key={t} 
                            onClick={() => {
                              const copy = [...medicines];
                              copy[idx].freq[t as keyof typeof m.freq] = !copy[idx].freq[t as keyof typeof m.freq];
                              setMedicines(copy);
                            }} 
                            className={`flex-1 min-w-[60px] py-3 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all ${m.freq[t as keyof typeof m.freq] ? 'bg-primary text-white' : 'bg-white text-slate-300'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {medicines.length > 1 && <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="absolute top-2 right-4 text-slate-300 hover:text-red-500 font-bold text-2xl">×</button>}
                   </div>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 pt-6 sm:pt-10 border-t border-slate-100">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block ml-2">Review Date</label>
                  <input type="date" className="w-full p-3 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-[2rem] outline-none font-bold text-slate-800 text-sm sm:text-lg shadow-inner" value={notes.followUpDate} onChange={e => setNotes({...notes, followUpDate: e.target.value})} />
               </div>
               <div className="flex items-end">
                  <button onClick={handleFinalize} className="w-full py-4 sm:py-6 bg-primary text-white rounded-2xl sm:rounded-[2rem] font-bold font-heading text-lg sm:text-xl shadow-2xl hover:bg-secondary transition-all uppercase">Complete Visit</button>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Patient History Section: Text-only focus */}
      <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] border border-slate-200 shadow-sm space-y-6 sm:space-y-8 mt-6 sm:mt-12">
        <div className="flex items-center gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="p-2 sm:p-3 bg-secondary/10 text-secondary rounded-xl">{ICONS.Records}</div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-700 uppercase">Clinical Timeline</h3>
        </div>
        
        {patientHistory.length === 0 ? (
          <div className="py-10 sm:py-20 text-center">
            <p className="text-slate-300 font-bold italic text-xs sm:text-sm">No clinical records found for this patient node.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {patientHistory.map((rec) => (
              <div key={rec.id} className="p-5 sm:p-8 bg-slate-50 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 hover:border-secondary transition-all shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mb-1">{new Date(rec.date).toLocaleDateString()}</p>
                    <h4 className="text-lg font-bold text-slate-800">{rec.diagnosis}</h4>
                  </div>
                  <div className="flex">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-bold text-slate-400 uppercase">Dr. {currentUser?.name}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observations</h5>
                    <p className="text-[11px] sm:text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 italic">"{rec.notes || 'No specific notes recorded.'}"</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical Vitals</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(rec.vitals || {}).map(([vKey, vVal]) => (
                        <div key={vKey} className="bg-white p-2 rounded-lg border border-slate-100 flex flex-col items-center">
                          <span className="text-[7px] font-bold text-slate-400 uppercase">{vKey}</span>
                          <span className="text-[10px] font-bold text-slate-800 truncate w-full text-center">{vVal as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationRoom;