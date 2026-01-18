import React from 'react';
import { ICONS } from '../constants';
import { Prescription, Patient } from '../types';

interface PharmacyPageProps {
  prescriptions: Prescription[];
  patients: Patient[];
  clinicName: string;
  onDispense: (pxId: string) => void;
}

const PharmacyPage: React.FC<PharmacyPageProps> = ({ prescriptions, patients, clinicName, onDispense }) => {
  const sortedPrescriptions = [...prescriptions].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-heading text-primary uppercase">Pharmacy Control</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Clinical Fulfillment Node</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedPrescriptions.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold italic text-sm">No medication orders pending in the queue.</p>
          </div>
        ) : (
          sortedPrescriptions.map((px) => {
            const p = patients.find(pat => pat.id === px.patientId);
            return (
              <div key={px.id} className={`bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden transition-all ${px.status === 'Dispensed' ? 'opacity-60 grayscale' : 'hover:border-secondary shadow-md'}`}>
                <div className="flex flex-col md:flex-row">
                  <div className={`p-8 md:w-56 flex flex-col justify-center items-center text-center gap-1.5 ${px.status === 'Dispensed' ? 'bg-slate-100' : 'bg-primary text-white'}`}>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Rx Terminal</span>
                    <span className="font-mono text-xl font-bold">#{px.id.slice(-5)}</span>
                    <span className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest mt-2 ${px.status === 'Dispensed' ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white'}`}>
                      {px.status}
                    </span>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-heading text-2xl text-slate-800 uppercase tracking-tight">{p?.firstName} {p?.lastName}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Reg ID: {p?.id} • Date: {px.date}</p>
                      </div>
                      <div className="hidden sm:block text-slate-100">{ICONS.Staff}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {px.medicines.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner group hover:bg-white hover:border-secondary transition-all">
                          <div>
                            <p className="text-sm font-bold text-slate-700 leading-none">{med.name}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1.5">{med.instructions}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-primary font-mono">{med.dosage}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{med.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {px.status === 'Pending' && (
                      <div className="pt-6 border-t border-slate-50 flex justify-end">
                        <button 
                          onClick={() => {
                            if(window.confirm("Complete pharmaceutical dispensing for this session?")) {
                              onDispense(px.id);
                            }
                          }}
                          className="bg-secondary text-white px-8 py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                        >
                          Settle Dispensing
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PharmacyPage;