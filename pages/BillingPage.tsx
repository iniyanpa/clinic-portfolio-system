import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill, PaymentMethod, MedicalRecord, Prescription, BillItem } from '../types';

interface BillingPageProps {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
  bills: Bill[];
  clinicName: string;
  addBill: (b: Bill) => void;
}

const BillingPage: React.FC<BillingPageProps> = ({ patients, appointments, records, prescriptions, bills, clinicName, addBill }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('UPI');
  
  const [editingItems, setEditingItems] = useState<BillItem[]>([
    { id: '1', description: 'Consultation Charges', amount: 500 },
    { id: '2', description: 'Admin & Facility Fee', amount: 200 }
  ]);

  const pendingInvoices = useMemo(() => {
    return appointments.filter(appt => appt.status === 'Completed' && !bills.some(bill => bill.appointmentId === appt.id));
  }, [appointments, bills]);

  const generatePDF = (patient: Patient, appt: Appointment, bill: Bill) => {
    const doc = new jsPDF();
    doc.setFillColor(41, 55, 140);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicName.toUpperCase(), 20, 28);
    doc.setFontSize(10);
    doc.text('GST TAX INVOICE', 20, 40);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Patient: ${patient.firstName} ${patient.lastName}`, 20, 65);
    doc.text(`Invoice No: ${bill.id}`, 150, 65);
    doc.line(20, 80, 190, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('Service', 20, 90);
    doc.text('Amount (INR)', 150, 90);
    doc.setFont('helvetica', 'normal');
    let y = 100;
    bill.items.forEach(item => {
      doc.text(item.description, 20, y);
      doc.text(`Rs. ${item.amount.toFixed(2)}`, 150, y);
      y += 10;
    });
    doc.line(20, y, 190, y);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 20, y + 10);
    doc.text(`Rs. ${bill.total.toFixed(2)}`, 150, y + 10);
    doc.save(`Invoice_${bill.id}.pdf`);
  };

  const processPayment = (appt: Appointment) => {
    const p = patients.find(pat => pat.id === appt.patientId);
    if (!p) return;
    const total = editingItems.reduce((acc, item) => acc + item.amount, 0);
    const bill: Bill = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      tenantId: p.tenantId, patientId: p.id,
      appointmentId: appt.id, date: new Date().toISOString().split('T')[0],
      items: [...editingItems], total,
      status: 'Paid', paymentMethod: selectedPayment
    };
    addBill(bill);
    generatePDF(p, appt, bill);
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading font-bold text-primary">Billing & Payments</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Payment Settlement Node</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-[1.5rem] flex gap-2 font-bold shadow-inner">
          <button onClick={() => setActiveTab('pending')} className={`px-8 py-3 rounded-2xl text-xs uppercase ${activeTab === 'pending' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}>Pending ({pendingInvoices.length})</button>
          <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-2xl text-xs uppercase ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}>History</button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {pendingInvoices.map(appt => {
             const p = patients.find(pat => pat.id === appt.patientId);
             return (
               <div key={appt.id} className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-8">
                  <h4 className="text-3xl font-bold text-slate-800">{p?.firstName} {p?.lastName}</h4>
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 shadow-inner">
                    {editingItems.map(item => (
                      <div key={item.id} className="flex justify-between text-lg font-bold">
                        <span className="text-slate-400">{item.description}</span>
                        <span className="text-slate-800">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-primary font-heading text-2xl">Total</span>
                      <span className="text-primary font-black text-3xl italic">₹{editingItems.reduce((s,i) => s + i.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {['UPI', 'Cash', 'Card'].map(m => (
                      <button key={m} onClick={() => setSelectedPayment(m as any)} className={`py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedPayment === m ? 'bg-secondary text-white scale-105 shadow-md' : 'bg-white text-slate-300 border border-slate-100'}`}>{m}</button>
                    ))}
                  </div>
                  <button onClick={() => processPayment(appt)} className="w-full py-6 bg-primary text-white rounded-[2rem] font-bold font-heading text-2xl shadow-2xl hover:bg-secondary transition-all">Confirm & Download</button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && <p className="lg:col-span-2 text-center py-32 text-slate-300 font-bold italic">All invoices are settled.</p>}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead className="bg-slate-50">
                 <tr>
                    <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Inv #</th>
                    <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Amount</th>
                    <th className="px-10 py-6 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {bills.map(bill => (
                    <tr key={bill.id}>
                       <td className="px-10 py-6 font-mono font-bold text-primary">#{bill.id.slice(-6)}</td>
                       <td className="px-10 py-6">
                          <p className="font-bold text-slate-800">{patients.find(p => p.id === bill.patientId)?.firstName} {patients.find(p => p.id === bill.patientId)?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{bill.date} • {bill.paymentMethod}</p>
                       </td>
                       <td className="px-10 py-6 font-bold text-primary text-center">₹{bill.total.toFixed(2)}</td>
                       <td className="px-10 py-6 text-right">
                          <button onClick={() => {
                             const p = patients.find(pat => pat.id === bill.patientId);
                             const a = appointments.find(ap => ap.id === bill.appointmentId);
                             if (p && a) generatePDF(p, a, bill);
                          }} className="text-secondary font-bold hover:underline text-xs uppercase tracking-widest">Receipt</button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default BillingPage;