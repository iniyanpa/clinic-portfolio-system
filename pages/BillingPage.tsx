import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill, PaymentMethod, MedicalRecord, Prescription, BillItem, Tenant } from '../types';

interface BillingPageProps {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
  bills: Bill[];
  clinicName: string;
  addBill: (b: Bill) => void;
  tenantSettings: Tenant | null;
}

const BillingPage: React.FC<BillingPageProps> = ({ patients, appointments, records, prescriptions, bills, clinicName, addBill, tenantSettings }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('UPI');
  
  const [editingItems, setEditingItems] = useState<BillItem[]>([]);

  useEffect(() => {
    if (tenantSettings) {
      setEditingItems([
        { id: '1', description: 'Doctor Consultation Fee', amount: tenantSettings.consultationFee || 500 },
        { id: '2', description: 'Platform & Clinic Maintenance', amount: tenantSettings.platformFee || 200 }
      ]);
    }
  }, [tenantSettings]);

  const pendingInvoices = useMemo(() => {
    return appointments.filter(appt => appt.status === 'Completed' && !bills.some(bill => bill.appointmentId === appt.id));
  }, [appointments, bills]);

  const generatePDF = (patient: Patient, appt: Appointment, bill: Bill) => {
    const doc = new jsPDF();
    const record = records.find(r => r.appointmentId === appt.id);
    const prescription = prescriptions.find(p => p.appointmentId === appt.id);
    
    // Header Style
    doc.setFillColor(41, 55, 140);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicName.toUpperCase(), 20, 28);
    doc.setFontSize(10);
    doc.text('COMPREHENSIVE MEDICAL REPORT & INVOICE', 20, 40);

    // Patient & Invoice Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT PROFILE', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient.firstName} ${patient.lastName} (${patient.gender})`, 20, 72);
    doc.text(`ID: ${patient.id}`, 20, 77);
    doc.text(`Phone: ${patient.phone}`, 20, 82);

    doc.setFont('helvetica', 'bold');
    doc.text('BILLING DETAILS', 140, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(bill.date).toLocaleDateString('en-IN')}`, 140, 72);
    doc.text(`Invoice: ${bill.id}`, 140, 77);

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 88, 190, 88);

    // Vitals Section
    let y = 98;
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICAL VITALS', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    if (appt.vitals) {
        doc.text(`BP: ${appt.vitals.bp} | Temp: ${appt.vitals.temp} | Pulse: ${appt.vitals.pulse} | Weight: ${appt.vitals.weight}`, 20, y);
    } else {
        doc.text('Vitals not recorded.', 20, y);
    }
    y += 12;

    // Consultation Summary
    doc.setFont('helvetica', 'bold');
    doc.text('CONSULTATION SUMMARY', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    doc.text(`Diagnosis: ${record?.diagnosis || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Doctor's Notes: ${record?.notes || 'No specific notes.'}`, 20, y, { maxWidth: 170 });
    y += 15;

    // Pharmacy / Medicines
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION (Rx)', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    if (prescription && prescription.medicines.length > 0) {
        prescription.medicines.forEach(med => {
            doc.text(`- ${med.name}: ${med.dosage} (${med.duration}) - ${med.instructions}`, 20, y);
            y += 6;
        });
    } else {
        doc.text('No medication prescribed.', 20, y);
        y += 6;
    }
    y += 10;

    // Billing Table
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Service Description', 20, y);
    doc.text('Amount (INR)', 150, y);
    y += 4;
    doc.line(20, y, 190, y);
    doc.setFont('helvetica', 'normal');
    y += 10;

    bill.items.forEach(item => {
      doc.text(item.description, 20, y);
      doc.text(`Rs. ${item.amount.toFixed(2)}`, 150, y);
      y += 8;
    });

    doc.line(20, y, 190, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL PAYABLE:', 20, y + 12);
    doc.text(`Rs. ${bill.total.toFixed(2)}`, 150, y + 12);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing ' + clinicName, 105, 280, { align: 'center' });
    
    doc.save(`Medical_Report_${bill.id}_${patient.firstName}.pdf`);
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
          <h2 className="text-4xl font-heading font-bold text-primary">Billing & GST</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Visit Settlement</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-[1rem] flex gap-2 font-bold shadow-inner">
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-2 rounded-lg text-xs uppercase transition-all ${activeTab === 'pending' ? 'bg-primary text-white' : 'text-slate-400'}`}>Pending ({pendingInvoices.length})</button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-xs uppercase transition-all ${activeTab === 'history' ? 'bg-primary text-white' : 'text-slate-400'}`}>History</button>
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
                    <div className="bg-green-50 text-green-600 px-4 py-1 rounded-full text-[10px] font-bold">READY</div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                    {editingItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm font-bold">
                        <span className="text-slate-500">{item.description}</span>
                        <span className="text-slate-800 font-mono">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-primary font-heading text-xl">Total</span>
                      <span className="text-primary font-black text-3xl font-mono">₹{editingItems.reduce((s,i) => s + i.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['UPI', 'Cash', 'Card'].map(m => (
                      <button key={m} onClick={() => setSelectedPayment(m as any)} className={`py-4 rounded-xl text-[10px] font-bold uppercase transition-all ${selectedPayment === m ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>{m}</button>
                    ))}
                  </div>

                  <button onClick={() => processPayment(appt)} className="w-full py-5 bg-primary text-white rounded-2xl font-bold font-heading text-xl shadow-xl hover:bg-secondary transition-all">Settle & Download Report</button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && <p className="lg:col-span-2 text-center py-20 text-slate-300 font-bold italic">No pending bills to settle.</p>}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead className="bg-slate-50">
                 <tr>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Inv #</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Amount</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {bills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-5 font-mono font-bold text-primary">#{bill.id.split('-')[1]}</td>
                       <td className="px-8 py-5">
                          <p className="font-bold text-slate-800">{patients.find(p => p.id === bill.patientId)?.firstName} {patients.find(p => p.id === bill.patientId)?.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{bill.date} • {bill.paymentMethod}</p>
                       </td>
                       <td className="px-8 py-5 font-bold text-slate-700 text-center font-mono">₹{bill.total.toFixed(2)}</td>
                       <td className="px-8 py-5 text-right">
                          <button onClick={() => {
                            const p = patients.find(pat => pat.id === bill.patientId);
                            const a = appointments.find(ap => ap.id === bill.appointmentId);
                            if (p && a) generatePDF(p, a, bill);
                          }} className="text-secondary font-bold hover:underline text-xs uppercase tracking-widest">Download Copy</button>
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