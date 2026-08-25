ALTER TABLE "event_settings" ALTER COLUMN "dates" SET DEFAULT 'August 29 – 30, 2026';--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "coordinators" jsonb;--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "whatsapp_group_link" text;--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "whatsapp_group_qr_url" text;--> statement-breakpoint
ALTER TABLE "event_settings" ADD COLUMN "registration_count_boost" integer DEFAULT 0 NOT NULL;