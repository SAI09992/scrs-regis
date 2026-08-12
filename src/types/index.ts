export type UserRole = 'admin' | 'participant';

export type CreditType = 'UE_CSE' | 'PEOPLE_OTHER';

export type RegistrationStatus = 'registered' | 'cancelled';

export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'requires_attention';

export type AttendanceStatus = 'present' | 'absent';

export type AnnouncementPriority = 'normal' | 'important' | 'critical';

export type AnnouncementAudience = 'all' | 'UE_CSE' | 'PEOPLE_OTHER';

export type CertificateStatus = 'valid' | 'revoked';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: UserRole;
}

export interface RegistrationData {
  id: string;
  registrationId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  registerNumber: string;
  department: string;
  year: string;
  section: string;
  college: string;
  creditType: CreditType;
  customFields?: Record<string, any>;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  payment?: PaymentData | null;
  attendance?: AttendanceData[];
}

export interface PaymentData {
  id: string;
  registrationId: string;
  userId: string;
  utr: string;
  amount: number;
  expectedAmount: number;
  screenshotUrl: string;
  ocrUtr?: string | null;
  ocrAmount?: number | null;
  ocrDate?: string | null;
  ocrConfidence?: number | null;
  status: PaymentStatus;
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  submittedAt: string;
}

export interface AttendanceData {
  id: string;
  registrationId: string;
  day: number;
  session: string;
  status: AttendanceStatus;
  timestamp: string;
  markedBy?: string | null;
  method: 'qr_scan' | 'manual_override';
}

export interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  published: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  day: number;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  speaker?: string;
  orderIndex: number;
}

export interface CertificateData {
  id: string;
  registrationId: string;
  certificateId: string;
  issuedAt: string;
  verificationStatus: CertificateStatus;
  metadata?: Record<string, any>;
}

export interface AuditLogData {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EventSettingsData {
  id: string;
  eventName: string;
  tagline: string;
  dates: string;
  venue: string;
  registrationFee: number;
  totalCapacity: number;
  registrationOpen: boolean;
  paymentUpiId: string;
  paymentQrUrl: string;
  contactPhone: string;
  contactEmail: string;
  termsVersion: string;
  countdownTarget?: string;
  updatedAt: string;
}

export interface LiveStats {
  totalRegistered: number;
  totalCapacity: number;
  paymentsVerified: number;
  paymentsPending: number;
  day1Attendance: number;
  day2Attendance: number;
  countdownTarget?: string;
}
