CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"audience" text DEFAULT 'all' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"day" integer NOT NULL,
	"session" text DEFAULT 'morning' NOT NULL,
	"status" text DEFAULT 'present' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"marked_by" text,
	"method" text DEFAULT 'qr_scan' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"certificate_id" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"verification_status" text DEFAULT 'valid' NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "certificates_registration_id_unique" UNIQUE("registration_id"),
	CONSTRAINT "certificates_certificate_id_unique" UNIQUE("certificate_id")
);
--> statement-breakpoint
CREATE TABLE "event_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"event_name" text DEFAULT 'NEXTGEN SOC' NOT NULL,
	"tagline" text DEFAULT 'Detect. Defend. Respond.' NOT NULL,
	"dates" text DEFAULT 'August 22 - 23, 2026' NOT NULL,
	"venue" text DEFAULT 'Main Cyber Range Auditorium & SOC Lab 4' NOT NULL,
	"registration_fee_ue" integer DEFAULT 300 NOT NULL,
	"registration_fee_other" integer DEFAULT 450 NOT NULL,
	"total_capacity" integer DEFAULT 500 NOT NULL,
	"ue_capacity" integer DEFAULT 200 NOT NULL,
	"people_capacity" integer DEFAULT 300 NOT NULL,
	"registration_open" boolean DEFAULT true NOT NULL,
	"payment_upi_id" text DEFAULT 'nextgensoc.dept@upi' NOT NULL,
	"payment_qr_url" text,
	"contact_phone" text DEFAULT '+91 98765 43210' NOT NULL,
	"contact_email" text DEFAULT 'soc-support@nextgensoc.io' NOT NULL,
	"terms_version" text DEFAULT 'v1.0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"user_id" text NOT NULL,
	"utr" text NOT NULL,
	"amount" integer NOT NULL,
	"expected_amount" integer NOT NULL,
	"screenshot_url" text NOT NULL,
	"ocr_utr" text,
	"ocr_amount" integer,
	"ocr_date" text,
	"ocr_confidence" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"verified_by" text,
	"verified_at" timestamp,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_registration_id_unique" UNIQUE("registration_id"),
	CONSTRAINT "payments_utr_unique" UNIQUE("utr")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"register_number" text NOT NULL,
	"department" text NOT NULL,
	"year" text NOT NULL,
	"section" text NOT NULL,
	"college" text NOT NULL,
	"credit_type" text NOT NULL,
	"custom_fields" jsonb,
	"status" text DEFAULT 'registered' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_registration_id_unique" UNIQUE("registration_id"),
	CONSTRAINT "registrations_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "registrations_register_number_unique" UNIQUE("register_number")
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"day" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"speaker" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terms_acceptances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"terms_version" text DEFAULT 'v1.0' NOT NULL,
	"accepted_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"google_id" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"profile_image" text,
	"role" text DEFAULT 'participant' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terms_acceptances" ADD CONSTRAINT "terms_acceptances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_published_idx" ON "announcements" USING btree ("published");--> statement-breakpoint
CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "attendance_reg_id_idx" ON "attendance" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "attendance_day_idx" ON "attendance" USING btree ("day");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_cert_id_idx" ON "certificates" USING btree ("certificate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_reg_id_idx" ON "certificates" USING btree ("registration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_utr_idx" ON "payments" USING btree ("utr");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_reg_id_idx" ON "payments" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_submitted_at_idx" ON "payments" USING btree ("submitted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_reg_id_idx" ON "registrations" USING btree ("registration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_user_id_idx" ON "registrations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_reg_num_idx" ON "registrations" USING btree ("register_number");--> statement-breakpoint
CREATE INDEX "registrations_credit_type_idx" ON "registrations" USING btree ("credit_type");--> statement-breakpoint
CREATE INDEX "registrations_department_idx" ON "registrations" USING btree ("department");--> statement-breakpoint
CREATE INDEX "registrations_created_at_idx" ON "registrations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "schedules_day_idx" ON "schedules" USING btree ("day");--> statement-breakpoint
CREATE INDEX "terms_user_id_idx" ON "terms_acceptances" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");