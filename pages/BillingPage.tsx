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
    { id: '2', description: 'Registration & Admin Fee', amount: 200 }
  ]);

  const pendingInvoices = useMemo(() => {
    return appointments.filter(appt => appt.status === 'Completed' && !bills.some(bill => bill.appointmentId === appt.id));
  }, [appointments, bills]);

  // Updated: Professional PDF Receipt Generator for Indian context
  const generatePDF = (patient: Patient, appt: Appointment, bill: Bill) => {
    const doc = new jsPDF();
    
    // Header Style
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicName.toUpperCase(), 20, 28);
    doc.setFontSize(10);
    doc.text('GST TAX INVOICE & CLINICAL RECEIPT', 20, 40);

    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Patient Name: ${patient.firstName} ${patient.lastName}`, 20, 65);
    doc.text(`Patient ID: ${patient.id}`, 20, 72);
    doc.text(`Invoice Date: ${new Date(bill.date).toLocaleDateString('en-IN')}`, 150, 65);
    doc.text(`Invoice No: ${bill.id}`, 150, 72);

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 80, 190, 80);

    // Table Header
    doc.setFont('helvetica', 'bold');
    doc.text('Description of Services', 20, 90);
    doc.text('Amount (INR)', 150, 90);
    doc.line(20, 95, 190, 95);
    doc.setFont('helvetica', 'normal');

    // Items
    let y = 105;
    bill.items.forEach(item => {
      doc.text(item.description, 20, y);
      doc.text(`Rs. ${item.amount.toFixed(2)}`, 150, y);
      y += 10;
    });

    // Footer Total
    doc.line(20, y, 190, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('GRAND TOTAL PAID:', 20, y + 15);
    doc.text(`Rs. ${bill.total.toFixed(2)}`, 150, y + 15);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Payment Mode: ' + bill.paymentMethod, 20, y + 30);
    doc.text('Thank you for choosing ' + clinicName, 105, 280, { align: 'center' });
    
    // Auto Download
    doc.save(`Invoice_${bill.id}_${patient.firstName}.pdf`);
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
          <h2 className="text-4xl font-heading font-bold text-primary">Billing & GST Accounts</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Payment Settlement & Invoicing</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-[1.5rem] flex gap-2 font-bold shadow-inner">
          <button onClick={() => setActiveTab('pending')} className={`px-8 py-3 rounded-2xl text-xs uppercase transition-all ${activeTab === 'pending' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}>Unpaid ({pendingInvoices.length})</button>
          <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-2xl text-xs uppercase transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}>Paid History</button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {pendingInvoices.map(appt => {
             const p = patients.find(pat => pat.id === appt.patientId);
             return (
               <div key={appt.id} className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-8 group hover:border-primary transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-3xl font-bold text-slate-800">{p?.firstName} {p?.lastName}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Reg ID: {p?.id} • Case: {appt.id}</p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Settlement Ready</div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 shadow-inner">
                    {editingItems.map(item => (
                      <div key={item.id} className="flex justify-between text-lg font-bold">
                        <span className="text-slate-400 font-medium">{item.description}</span>
                        <span className="text-slate-800 font-mono">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-primary font-heading text-2xl">Total Invoice</span>
                      <span className="text-primary font-mono text-4xl font-black italic">₹{editingItems.reduce((s,i) => s + i.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-4 block">Choose Payment Method</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['UPI', 'Cash', 'Card'].map(m => (
                        <button key={m} onClick={() => setSelectedPayment(m as any)} className={`py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${selectedPayment === m ? 'bg-secondary text-white scale-105' : 'bg-white text-slate-300 border border-slate-100'}`}>{m}</button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => processPayment(appt)} className="w-full py-6 bg-primary text-white rounded-[2rem] font-bold font-heading text-2xl shadow-2xl hover:bg-secondary hover:scale-[1.02] active:scale-95 transition-all">Settle & Print Receipt</button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && (
             <div className="lg:col-span-2 py-32 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">{ICONS.Billing}</div>
                <p className="text-slate-300 font-bold italic text-lg">No pending settlements found.</p>
             </div>
           )}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                 <tr>
                    <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Inv #</th>
                    <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Records</th>
                    <th className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Settled Amount</th>
                    <th className="px-10 py-6 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {bills.sort((a,b) => b.id.localeCompare(a.id)).map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-10 py-6 font-mono font-bold text-primary">#{bill.id.split('-')[1]}</td>
                       <td className="px-10 py-6">
                          <p className="font-bold text-slate-800 text-lg">{patients.find(p => p.id === bill.patientId)?.firstName} {patients.find(p => p.id === bill.patientId)?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bill.date} • {bill.paymentMethod}</p>
                       </td>
                       <td className="px-10 py-6 font-bold text-primary text-center font-mono text-xl">₹{bill.total.toFixed(2)}</td>
                       <td className="px-10 py-6 text-right">
                          <button onClick={() => {
                            const p = patients.find(pat => pat.id === bill.patientId);
                            const a = appointments.find(ap => ap.id === bill.appointmentId);
                            if (p && a) generatePDF(p, a, bill);
                          }} className="px-6 py-2 bg-slate-100 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-xs uppercase tracking-widest shadow-sm">Download PDF</button>
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
