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
  
  const [editingBillApptId, setEditingBillApptId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<BillItem[]>([
    { id: '1', description: 'Doctor Consultation Fee', amount: 500 },
    { id: '2', description: 'Clinic Facility Charges', amount: 200 }
  ]);

  const pendingInvoices = useMemo(() => {
    return appointments.filter(appt => appt.status === 'Completed' && !bills.some(bill => bill.appointmentId === appt.id));
  }, [appointments, bills]);

  const generatePDF = (patient: Patient, appt: Appointment, bill: Bill) => {
    const doc = new jsPDF();
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicName.toUpperCase(), 20, 25);
    doc.setFontSize(10);
    doc.text('GST TAX INVOICE & CLINICAL RECEIPT', 20, 35);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Patient Name: ${patient.firstName} ${patient.lastName}`, 20, 60);
    doc.text(`Patient ID: ${patient.id}`, 20, 65);
    doc.text(`Invoice Date: ${bill.date}`, 150, 60);
    doc.text(`Invoice ID: ${bill.id}`, 150, 65);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 75, 190, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, 85);
    doc.text('Amount (INR)', 150, 85);
    doc.setFont('helvetica', 'normal');

    let y = 95;
    bill.items.forEach(item => {
      doc.text(item.description, 20, y);
      doc.text(`₹${item.amount.toFixed(2)}`, 150, y);
      y += 10;
    });

    doc.line(20, y, 190, y);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT PAID:', 20, y + 10);
    doc.text(`₹${bill.total.toFixed(2)}`, 150, y + 10);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated tax invoice. No signature required.', 105, 280, { align: 'center' });
    
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
    setEditingBillApptId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">Billing & Payments</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Settle Invoices & Print Receipts</p>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 font-bold">
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-2 rounded-lg text-xs uppercase ${activeTab === 'pending' ? 'bg-primary text-white' : 'text-slate-400'}`}>Unpaid ({pendingInvoices.length})</button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-xs uppercase ${activeTab === 'history' ? 'bg-primary text-white' : 'text-slate-400'}`}>History</button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {pendingInvoices.map(appt => {
             const p = patients.find(pat => pat.id === appt.patientId);
             return (
               <div key={appt.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800">{p?.firstName} {p?.lastName}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case ID: {appt.id}</p>
                    </div>
                    <div className="bg-green-50 text-green-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase">Ready to Bill</div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl space-y-3 font-bold">
                    {editingItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-500">{item.description}</span>
                        <span className="text-slate-800 font-mono">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-200 flex justify-between">
                      <span className="text-primary font-heading text-xl">Total Payable</span>
                      <span className="text-primary font-mono text-2xl font-bold">₹{editingItems.reduce((s,i) => s + i.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['UPI', 'Cash', 'Card'].map(m => (
                      <button key={m} onClick={() => setSelectedPayment(m as any)} className={`py-4 rounded-xl text-[10px] font-bold uppercase transition-all ${selectedPayment === m ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>{m}</button>
                    ))}
                  </div>

                  <button onClick={() => processPayment(appt)} className="w-full py-5 bg-primary text-white rounded-2xl font-bold font-heading text-xl shadow-xl hover:bg-secondary transition-all">Settle & Download Invoice</button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && <p className="lg:col-span-2 text-center py-20 text-slate-300 font-bold italic">No pending bills to settle.</p>}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50">
                 <tr>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice ID</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Name</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Amount</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {bills.sort((a,b) => b.id.localeCompare(a.id)).map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-5 font-mono font-bold text-primary text-sm">#{bill.id.split('-')[1]}</td>
                       <td className="px-8 py-5">
                          <p className="font-bold text-slate-800">{patients.find(p => p.id === bill.patientId)?.firstName} {patients.find(p => p.id === bill.patientId)?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bill.date} • {bill.paymentMethod}</p>
                       </td>
                       <td className="px-8 py-5 font-bold text-slate-700 text-center font-mono">₹{bill.total.toFixed(2)}</td>
                       <td className="px-8 py-5 text-right">
                          <button onClick={() => {
                            const p = patients.find(pat => pat.id === bill.patientId);
                            const a = appointments.find(ap => ap.id === bill.appointmentId);
                            if (p && a) generatePDF(p, a, bill);
                          }} className="text-secondary font-bold hover:underline text-sm uppercase tracking-widest">Download Copy</button>
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