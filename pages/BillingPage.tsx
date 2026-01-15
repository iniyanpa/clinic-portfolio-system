
import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill, PaymentMethod, MedicalRecord, Prescription } from '../types';

interface BillingPageProps {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
  bills: Bill[];
  addBill: (b: Bill) => void;
}

const BillingPage: React.FC<BillingPageProps> = ({ patients, appointments, records, prescriptions, bills, addBill }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('UPI');

  // ENGINE: Filter completed but unbilled appointments
  const pendingInvoices = useMemo(() => {
    return appointments.filter(appt => 
      appt.status === 'Completed' && 
      !bills.some(bill => bill.appointmentId === appt.id)
    );
  }, [appointments, bills]);

  const generateClinicalPDF = (patient: Patient, appt: Appointment, record?: MedicalRecord, prescription?: Prescription) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(41, 55, 140); // Primary #29378c
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text('HEALFLOW PREMIUM CLINIC', 20, 20);
    doc.setFontSize(10);
    doc.text('Advanced Outpatient Care | ISO Certified', 20, 30);
    doc.text('GSTIN: 27AAAAA0000A1Z5 | Mumbai, MH', 20, 35);

    // Patient & Appt Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('CLINICAL SUMMARY & PRESCRIPTION (Rx)', 20, 60);
    doc.setDrawColor(41, 186, 237); // Secondary #29baed
    doc.setLineWidth(1);
    doc.line(20, 63, 190, 63);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient: ${patient.firstName} ${patient.lastName}`, 20, 75);
    doc.text(`Patient ID: ${patient.id}`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gender/Age: ${patient.gender} | Blood: ${patient.bloodGroup}`, 20, 85);

    let y = 100;

    // Vitals Section
    if (record) {
      doc.setFillColor(245, 247, 250);
      doc.rect(20, y, 170, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('VITALS:', 25, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(`BP: ${record.vitals.bp || 'N/A'}`, 25, y + 16);
      doc.text(`Temp: ${record.vitals.temp || 'N/A'} °C`, 70, y + 16);
      doc.text(`Pulse: ${record.vitals.pulse || 'N/A'} BPM`, 115, y + 16);
      doc.text(`Weight: ${record.vitals.weight || 'N/A'} KG`, 155, y + 16);
      y += 40;

      doc.setFont('helvetica', 'bold');
      doc.text('CLINICAL ASSESSMENT:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Symptoms: ${record.symptoms || 'None recorded'}`, 20, y + 6, { maxWidth: 170 });
      y += 15;
      doc.setFont('helvetica', 'bold');
      doc.text(`Diagnosis: ${record.diagnosis || 'General OPD'}`, 20, y);
      y += 20;
    }

    // Prescription Section
    if (prescription) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICATIONS (Rx):', 20, y);
      doc.line(20, y + 2, 70, y + 2);
      y += 10;

      prescription.medicines.forEach((med, i) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${med.name}`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Dosage: ${med.dosage} (M-A-E-N) | ${med.duration}`, 25, y + 5);
        doc.text(`Instructions: ${med.instructions}`, 25, y + 10);
        y += 18;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a digitally generated report. Signature not required.', 20, 280);
    doc.text('HealFlow OS - Managed by Clinical Enterprise Suite India', 130, 280);

    doc.save(`HealFlow_Rx_${patient.firstName}_${Date.now()}.pdf`);
  };

  const processPayment = (appt: Appointment) => {
    const p = patients.find(pat => pat.id === appt.patientId);
    if (!p) return;

    const record = records.find(r => r.appointmentId === appt.id);
    const px = prescriptions.find(pres => pres.appointmentId === appt.id);

    const newBill: Bill = {
      id: `BILL-${Date.now().toString().slice(-6)}`,
      patientId: p.id,
      appointmentId: appt.id,
      date: new Date().toISOString().split('T')[0],
      items: [
        { description: `OPD Consultation (${appt.department})`, amount: 500 },
        { description: 'Administration & Facility Fee', amount: 200 }
      ],
      total: 700,
      status: 'Paid',
      paymentMethod: selectedPayment
    };

    addBill(newBill);
    
    // GENERATE PDF
    generateClinicalPDF(p, appt, record, px);
    
    // Simulate WhatsApp/Email Notifications
    alert(`PAYMENT SETTLED - INVOICE ${newBill.id}\n\n1. Prescription PDF Generated & Saved\n2. WhatsApp sent to ${p.phone}\n3. Email sent to ${p.email}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Financial Suite</h2>
          <p className="subheading text-secondary font-bold text-xs tracking-widest">Billing & Revenue Matrix (₹)</p>
        </div>
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Awaiting Checkout {pendingInvoices.length > 0 && `(${pendingInvoices.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Transaction Logs
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {pendingInvoices.map(appt => {
             const p = patients.find(pat => pat.id === appt.patientId);
             return (
               <div key={appt.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-secondary transition-all hover:shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                       <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-colors">
                         {ICONS.Billing}
                       </div>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">Check-out Needed</span>
                    </div>
                    
                    <h4 className="font-heading text-2xl text-slate-800 leading-none mb-2">{p?.firstName} {p?.lastName}</h4>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.3em] mb-8">{appt.department} • OPD</p>

                    <div className="space-y-3 mb-8 bg-slate-50/50 p-6 rounded-[2rem]">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Service</span>
                          <span>Amount</span>
                       </div>
                       <div className="flex justify-between text-xs text-slate-700">
                          <span>Consultation</span>
                          <span className="font-mono">₹500.00</span>
                       </div>
                       <div className="flex justify-between text-xs text-slate-700">
                          <span>Admin Fee</span>
                          <span className="font-mono">₹200.00</span>
                       </div>
                       <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-bold text-primary">
                          <span>TOTAL</span>
                          <span className="font-mono">₹700.00</span>
                       </div>
                    </div>

                    <div className="mb-8">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] block mb-3">Select Terminal</label>
                       <div className="grid grid-cols-3 gap-2">
                          {(['UPI', 'Cash', 'Card'] as PaymentMethod[]).map(m => (
                            <button 
                              key={m}
                              onClick={() => setSelectedPayment(m)}
                              className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${selectedPayment === m ? 'bg-secondary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                              {m}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => processPayment(appt)}
                    className="w-full py-5 bg-primary text-white font-heading text-xl uppercase tracking-[0.2em] rounded-2xl hover:bg-secondary transition-all shadow-xl active:scale-95"
                  >
                    Authorize Payment
                  </button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && (
             <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="text-slate-100 scale-[2] flex justify-center mb-6">{ICONS.Billing}</div>
                <h3 className="text-2xl font-heading text-slate-300 uppercase tracking-widest">No Active Billing Requests</h3>
                <p className="text-slate-400 text-xs mt-2 italic font-medium">All completed patient sessions have been settled.</p>
             </div>
           )}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                 <tr>
                    <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Receipt No</th>
                    <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Recipient</th>
                    <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Total Settled</th>
                    <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Terminal</th>
                    <th className="px-10 py-6 text-right"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {bills.map(bill => {
                   const p = patients.find(pat => pat.id === bill.patientId);
                   return (
                    <tr key={bill.id} className="hover:bg-slate-50/30 transition-colors group">
                       <td className="px-10 py-6 font-mono font-bold text-primary text-xs">#{bill.id.slice(-6)}</td>
                       <td className="px-10 py-6">
                          <p className="font-bold text-slate-800 text-sm">{p?.firstName} {p?.lastName}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{bill.date}</p>
                       </td>
                       <td className="px-10 py-6 font-bold text-slate-700 font-mono text-sm">₹{bill.total.toLocaleString('en-IN')}</td>
                       <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm ${bill.paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                            {bill.paymentMethod || 'Paid'}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-right">
                          <button className="p-3 text-slate-300 hover:text-secondary hover:bg-secondary/10 rounded-2xl transition-all" title="Download Audit PDF">{ICONS.Download}</button>
                       </td>
                    </tr>
                   )
                 })}
                 {bills.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-24 text-center text-slate-300 font-medium italic">Archive repository is empty.</td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
