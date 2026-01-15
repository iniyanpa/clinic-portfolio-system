
export enum UserRole {
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  RECEPTIONIST = 'Receptionist',
  PHARMACIST = 'Pharmacist'
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card';
export type ApptStatus = 'Scheduled' | 'Checked-in' | 'In-Consultation' | 'Completed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  specialization?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  guardianName: string;
  fatherSpouseName: string;
  motherName: string;
  history: string[];
  registeredDate: string;
}

export interface Appointment {
  id: string;
  docId?: string; // Firestore internal ID
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  department: string;
  status: ApptStatus;
  reason: string;
  cancellationReason?: string;
  // Pre-consultation data entered at check-in
  vitals?: {
    bp: string;
    temp: string;
    weight: string;
    pulse: string;
  };
  initialSymptoms?: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  vitals: {
    bp: string;
    temp: string;
    weight: string;
    pulse: string;
  };
  notes: string;
  followUpDate?: string;
  aiInsights?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  appointmentId: string;
  date: string;
  status: 'Pending' | 'Dispensed' | 'Cancelled';
  medicines: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>;
}

export interface BillItem {
  id: string;
  description: string;
  amount: number;
}

export interface Bill {
  id: string;
  patientId: string;
  appointmentId: string;
  date: string;
  items: BillItem[];
  total: number;
  paymentMethod?: PaymentMethod;
  status: 'Paid' | 'Unpaid';
}

export interface CommunicationLog {
  id: string;
  patientId: string;
  type: 'WhatsApp' | 'Email';
  content: string;
  sentAt: string;
}
