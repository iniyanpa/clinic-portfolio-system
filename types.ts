
export enum UserRole {
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  RECEPTIONIST = 'Receptionist',
  PHARMACIST = 'Pharmacist'
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card';
export type ApptStatus = 'Scheduled' | 'Checked-in' | 'In-Consultation' | 'Completed' | 'Cancelled';

export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  createdAt: string;
  ownerId: string;
}

export interface User {
  id: string;
  tenantId: string; // Scoping identifier
  name: string;
  email: string;
  password?: string; // Stored in DB as requested
  role: UserRole;
  avatar: string;
  specialization?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  tenantId: string;
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
  tenantId: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  department: string;
  status: ApptStatus;
  reason: string;
  cancellationReason?: string;
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
  tenantId: string;
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
  tenantId: string;
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
  tenantId: string;
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
  tenantId: string;
  patientId: string;
  type: 'WhatsApp' | 'Email';
  content: string;
  sentAt: string;
}
