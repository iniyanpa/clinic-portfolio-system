
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill } from '../types';

interface BillingPageProps {
  patients: Patient[];
  appointments: Appointment[];
  bills: Bill[];
  addBill: (b: Bill) => void;
}

const BillingPage: React.FC<BillingPageProps> = ({ patients, appointments, bills, addBill }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingBilling = appointments.filter(a => a.status === 'Completed' && !bills.some(b => b.patientId === a.patientId && b.date.includes(a.date)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Financials</h2>
          <p className="subheading text-secondary font-bold text-xs tracking-widest">Accounts & Invoicing</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border p-1">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Pending {pendingBilling.length > 0 && `(${pendingBilling.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Bill History
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingBilling.map(appt => {
            const p = patients.find(p => p.id === appt.patientId);
            return (
              <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-secondary transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      {ICONS.Billing}
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Unbilled Visit</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">{p?.firstName} {p?.lastName}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">{appt.date} • {appt.reason}</p>
                </div>
                <button 
                  className="w-full py-3 bg-secondary text-white font-heading uppercase tracking-widest rounded-xl hover:bg-primary transition-all shadow-md mt-4"
                  onClick={() => alert('Generating Invoice for: ' + p?.firstName)}
                >
                  Create Invoice
                </button>
              </div>
            );
          })}
          {pendingBilling.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <p className="text-slate-400 italic">No pending bills. All completed consultations have been invoiced.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                 <tr>
                    <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Invoice #</th>
                    <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {bills.map(bill => {
                   const p = patients.find(p => p.id === bill.patientId);
                   return (
                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4 font-mono font-bold text-primary">{bill.id}</td>
                       <td className="px-6 py-4">
                          <p className="font-bold">{p?.firstName} {p?.lastName}</p>
                          <p className="text-[10px] text-slate-400">{bill.date}</p>
                       </td>
                       <td className="px-6 py-4 font-bold">${bill.total.toFixed(2)}</td>
                       <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-widest rounded-full">Paid</span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="text-secondary hover:text-primary transition-colors">{ICONS.Download}</button>
                       </td>
                    </tr>
                   )
                 })}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
