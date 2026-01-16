
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
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Pharmacy Depot</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Medical Fulfillment Center</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
             <span className="text-xl font-bold text-amber-500">{prescriptions.filter(p => p.status === 'Pending').length}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Completed</span>
             <span className="text-xl font-bold text-green-500">{prescriptions.filter(p => p.status === 'Dispensed').length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prescriptions.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-medium italic">No medication orders in the current session.</p>
          </div>
        ) : (
          prescriptions.map((px) => {
            const p = patients.find(pat => pat.id === px.patientId);
            return (
              <div key={px.id} className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all ${px.status === 'Dispensed' ? 'opacity-60 grayscale-[0.5]' : 'hover:border-secondary'}`}>
                <div className="flex flex-col md:flex-row">
                  <div className={`p-8 md:w-64 flex flex-col justify-center items-center text-center gap-2 ${px.status === 'Dispensed' ? 'bg-slate-100' : 'bg-primary text-white'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rx Token</span>
                    <span className="font-mono text-xl font-bold">#{px.id.slice(-6)}</span>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] mt-2 ${px.status === 'Dispensed' ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white'}`}>
                      {px.status}
                    </span>
                  </div>
                  <div className="flex-1 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-heading text-xl text-slate-800 uppercase tracking-widest">{p?.firstName} {p?.lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Patient ID: {p?.id}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{px.date}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {px.medicines.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{med.name}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{med.instructions}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-primary">{med.dosage}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{med.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {px.status === 'Pending' && (
                      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
                        <button 
                          onClick={() => onDispense(px.id)}
                          className="bg-secondary text-white px-10 py-3 rounded-xl font-heading text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                        >
                          Confirm & Dispense
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
