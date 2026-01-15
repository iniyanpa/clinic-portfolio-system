
export enum UserRole {
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  RECEPTIONIST = 'Receptionist'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
  history: string[];
  registeredDate: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'Waiting' | 'In-Consultation' | 'Completed' | 'Cancelled';
  reason: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  symptoms: string;
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
  date: string;
  items: Array<{ description: string; amount: number }>;
  total: number;
  status: 'Paid' | 'Unpaid';
}
