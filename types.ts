
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
  motherName: string;
  history: string[];
  registeredDate: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  department: string;
  status: ApptStatus;
  reason: string;
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
}

export interface Prescription {
  id: string;
  patientId: string;
  appointmentId: string;
  date: string;
  medicines: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>;
}

export interface Bill {
  id: string;
  patientId: string;
  appointmentId: string;
  date: string;
  items: Array<{ description: string; amount: number }>;
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
