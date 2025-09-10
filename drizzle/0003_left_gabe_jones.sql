CREATE TYPE "public"."component_status" AS ENUM('draft', 'published', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."component_type" AS ENUM('custom', 'npm', 'remote', 'builtin');--> statement-breakpoint
CREATE TABLE "blog_post_components" (
	"blog_post_id" uuid NOT NULL,
	"component_id" uuid NOT NULL,
	"component_version" varchar(20) NOT NULL,
	"usage_count" integer DEFAULT 1,
	"props" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_components_blog_post_id_component_id_pk" PRIMARY KEY("blog_post_id","component_id")
);
--> statement-breakpoint
CREATE TABLE "component_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"version" varchar(20) NOT NULL,
	"compiled_code" text,
	"source_map" text,
	"bundle_hash" varchar(64) NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"version" varchar(20) NOT NULL,
	"source_code" text,
	"props" jsonb,
	"config" jsonb,
	"change_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "source_type" "component_type" DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "source_code" text;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "npm_package" varchar(100);--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "npm_version" varchar(20);--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "remote_url" text;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "version" varchar(20) DEFAULT '1.0.0' NOT NULL;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "status" "component_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "is_published" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "config" jsonb;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "requires_sandbox" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "bundle_size" integer;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "usage_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "component_catalog" ADD COLUMN "last_used_at" timestamp;--> statement-breakpoint
ALTER TABLE "blog_post_components" ADD CONSTRAINT "blog_post_components_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_components" ADD CONSTRAINT "blog_post_components_component_id_component_catalog_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_cache" ADD CONSTRAINT "component_cache_component_id_component_catalog_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_versions" ADD CONSTRAINT "component_versions_component_id_component_catalog_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_component_post_idx" ON "blog_post_components" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "blog_component_component_idx" ON "blog_post_components" USING btree ("component_id");--> statement-breakpoint
CREATE INDEX "cache_component_version_idx" ON "component_cache" USING btree ("component_id","version");--> statement-breakpoint
CREATE INDEX "cache_hash_idx" ON "component_cache" USING btree ("bundle_hash");--> statement-breakpoint
CREATE INDEX "version_component_idx" ON "component_versions" USING btree ("component_id");--> statement-breakpoint
CREATE INDEX "version_version_idx" ON "component_versions" USING btree ("component_id","version");--> statement-breakpoint
CREATE INDEX "component_source_type_idx" ON "component_catalog" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "component_status_idx" ON "component_catalog" USING btree ("status");