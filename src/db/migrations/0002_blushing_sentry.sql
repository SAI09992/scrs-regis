CREATE TABLE "exam_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"score" integer,
	"warnings_count" integer DEFAULT 0 NOT NULL,
	"violation_logs" jsonb DEFAULT '[]'::jsonb,
	"answers" jsonb DEFAULT '{}'::jsonb,
	"started_at" timestamp,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "exam_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_index" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"warning_limit" integer DEFAULT 3 NOT NULL,
	"duration_minutes" integer DEFAULT 25 NOT NULL,
	"exam_active" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_statements" (
	"id" text PRIMARY KEY NOT NULL,
	"slot_number" integer NOT NULL,
	"title" text NOT NULL,
	"document_url" text,
	"max_teams" integer DEFAULT 7 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snacks_distribution" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"slot" integer DEFAULT 1 NOT NULL,
	"slot_name" text DEFAULT 'Snack Round 1' NOT NULL,
	"distributed_at" timestamp DEFAULT now() NOT NULL,
	"scanned_by" text
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"registration_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_registration_id_unique" UNIQUE("registration_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"team_name" text DEFAULT '' NOT NULL,
	"team_lead_registration_id" text,
	"problem_statement_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_marked_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "event_settings" ALTER COLUMN "registration_open" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "team_portal_visible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "ps_selection_visible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snacks_distribution" ADD CONSTRAINT "snacks_distribution_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exam_attempts_reg_id_idx" ON "exam_attempts" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "exam_attempts_status_idx" ON "exam_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exam_questions_order_idx" ON "exam_questions" USING btree ("order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "ps_slot_number_idx" ON "problem_statements" USING btree ("slot_number");--> statement-breakpoint
CREATE INDEX "snacks_reg_id_idx" ON "snacks_distribution" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "snacks_slot_idx" ON "snacks_distribution" USING btree ("slot");--> statement-breakpoint
CREATE UNIQUE INDEX "snacks_reg_slot_unique_idx" ON "snacks_distribution" USING btree ("registration_id","slot");--> statement-breakpoint
CREATE INDEX "team_members_team_id_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_reg_id_idx" ON "team_members" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "teams_name_idx" ON "teams" USING btree ("team_name");