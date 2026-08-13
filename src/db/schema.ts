import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users Table
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    googleId: text('google_id').unique(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    profileImage: text('profile_image'),
    role: text('role', { enum: ['admin', 'participant'] }).notNull().default('participant'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    uniqueIndex('users_google_id_idx').on(table.googleId),
  ]
);

// 2. Terms Acceptances
export const termsAcceptances = pgTable(
  'terms_acceptances',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    termsVersion: text('terms_version').notNull().default('v1.0'),
    acceptedAt: timestamp('accepted_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
  },
  (table) => [
    index('terms_user_id_idx').on(table.userId),
  ]
);

// 3. Registrations Table
export const registrations = pgTable(
  'registrations',
  {
    id: text('id').primaryKey(),
    registrationId: text('registration_id').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    registerNumber: text('register_number').notNull().unique(),
    department: text('department').notNull(),
    year: text('year').notNull(),
    section: text('section').notNull(),
    college: text('college').notNull(),
    creditType: text('credit_type', { enum: ['UE_CSE', 'PEOPLE_OTHER'] }).notNull(),
    customFields: jsonb('custom_fields'),
    status: text('status', { enum: ['registered', 'cancelled'] }).notNull().default('registered'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('registrations_reg_id_idx').on(table.registrationId),
    uniqueIndex('registrations_user_id_idx').on(table.userId),
    uniqueIndex('registrations_reg_num_idx').on(table.registerNumber),
    index('registrations_credit_type_idx').on(table.creditType),
    index('registrations_department_idx').on(table.department),
    index('registrations_created_at_idx').on(table.createdAt),
  ]
);

// 4. Payments Table
export const payments = pgTable(
  'payments',
  {
    id: text('id').primaryKey(),
    registrationId: text('registration_id')
      .notNull()
      .unique()
      .references(() => registrations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    utr: text('utr').notNull().unique(),
    amount: integer('amount').notNull(),
    expectedAmount: integer('expected_amount').notNull(),
    screenshotUrl: text('screenshot_url').notNull(),
    ocrUtr: text('ocr_utr'),
    ocrAmount: integer('ocr_amount'),
    ocrDate: text('ocr_date'),
    ocrConfidence: integer('ocr_confidence'),
    status: text('status', {
      enum: ['pending', 'verified', 'rejected', 'requires_attention'],
    })
      .notNull()
      .default('pending'),
    rejectionReason: text('rejection_reason'),
    verifiedBy: text('verified_by').references(() => users.id),
    verifiedAt: timestamp('verified_at'),
    submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('payments_utr_idx').on(table.utr),
    uniqueIndex('payments_reg_id_idx').on(table.registrationId),
    index('payments_status_idx').on(table.status),
    index('payments_submitted_at_idx').on(table.submittedAt),
  ]
);

// 5. Attendance Table
export const attendance = pgTable(
  'attendance',
  {
    id: text('id').primaryKey(),
    registrationId: text('registration_id')
      .notNull()
      .references(() => registrations.id, { onDelete: 'cascade' }),
    day: integer('day').notNull(), // 1 or 2
    session: text('session').notNull().default('morning'),
    status: text('status', { enum: ['present', 'absent'] }).notNull().default('present'),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    markedBy: text('marked_by').references(() => users.id),
    method: text('method', { enum: ['qr_scan', 'manual_override'] }).notNull().default('qr_scan'),
  },
  (table) => [
    index('attendance_reg_id_idx').on(table.registrationId),
    index('attendance_day_idx').on(table.day),
  ]
);

// 6. Announcements Table
export const announcements = pgTable(
  'announcements',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    priority: text('priority', { enum: ['normal', 'important', 'critical'] })
      .notNull()
      .default('normal'),
    audience: text('audience', { enum: ['all', 'UE_CSE', 'PEOPLE_OTHER'] })
      .notNull()
      .default('all'),
    published: boolean('published').notNull().default(true),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('announcements_published_idx').on(table.published),
    index('announcements_created_at_idx').on(table.createdAt),
  ]
);

// 7. Schedules Table
export const schedules = pgTable(
  'schedules',
  {
    id: text('id').primaryKey(),
    day: integer('day').notNull(),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    speaker: text('speaker'),
    orderIndex: integer('order_index').notNull().default(0),
  },
  (table) => [
    index('schedules_day_idx').on(table.day),
  ]
);

// 8. Certificates Table
export const certificates = pgTable(
  'certificates',
  {
    id: text('id').primaryKey(),
    registrationId: text('registration_id')
      .notNull()
      .unique()
      .references(() => registrations.id, { onDelete: 'cascade' }),
    certificateId: text('certificate_id').notNull().unique(),
    issuedAt: timestamp('issued_at').notNull().defaultNow(),
    verificationStatus: text('verification_status', { enum: ['valid', 'revoked'] })
      .notNull()
      .default('valid'),
    metadata: jsonb('metadata'),
  },
  (table) => [
    uniqueIndex('certificates_cert_id_idx').on(table.certificateId),
    uniqueIndex('certificates_reg_id_idx').on(table.registrationId),
  ]
);

// 9. Audit Logs Table
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    adminId: text('admin_id').notNull(),
    adminEmail: text('admin_email').notNull(),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    metadata: jsonb('metadata'),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
  },
  (table) => [
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_timestamp_idx').on(table.timestamp),
    index('audit_logs_admin_id_idx').on(table.adminId),
  ]
);

// 10. Event Settings Table
export const eventSettings = pgTable('event_settings', {
  id: text('id').primaryKey(),
  eventName: text('event_name').notNull().default('NEXTGEN SOC'),
  tagline: text('tagline').notNull().default('Detect. Defend. Respond.'),
  dates: text('dates').notNull().default('August 22 - 23, 2026'),
  venue: text('venue').notNull().default('Main Cyber Range Auditorium & SOC Lab 4'),
  registrationFeeUe: integer('registration_fee_ue').notNull().default(300),
  registrationFeeOther: integer('registration_fee_other').notNull().default(450),
  totalCapacity: integer('total_capacity').notNull().default(500),
  ueCapacity: integer('ue_capacity').notNull().default(200),
  peopleCapacity: integer('people_capacity').notNull().default(300),
  registrationOpen: boolean('registration_open').notNull().default(true),
  paymentUpiId: text('payment_upi_id').notNull().default('nextgensoc.dept@upi'),
  paymentQrUrl: text('payment_qr_url'),
  contactPhone: text('contact_phone').notNull().default('+91 98765 43210'),
  contactEmail: text('contact_email').notNull().default('soc-support@nextgensoc.io'),
  termsVersion: text('terms_version').notNull().default('v1.0'),
  coordinators: jsonb('coordinators'),
  whatsappGroupLink: text('whatsapp_group_link'),
  whatsappGroupQrUrl: text('whatsapp_group_qr_url'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  registration: one(registrations, {
    fields: [users.id],
    references: [registrations.userId],
  }),
  payments: many(payments),
  termsAcceptances: many(termsAcceptances),
  announcements: many(announcements),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id],
  }),
  payment: one(payments, {
    fields: [registrations.id],
    references: [payments.registrationId],
  }),
  attendance: many(attendance),
  certificate: one(certificates, {
    fields: [registrations.id],
    references: [certificates.registrationId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  registration: one(registrations, {
    fields: [payments.registrationId],
    references: [registrations.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [payments.verifiedBy],
    references: [users.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  registration: one(registrations, {
    fields: [attendance.registrationId],
    references: [registrations.id],
  }),
  marker: one(users, {
    fields: [attendance.markedBy],
    references: [users.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  registration: one(registrations, {
    fields: [certificates.registrationId],
    references: [registrations.id],
  }),
}));
