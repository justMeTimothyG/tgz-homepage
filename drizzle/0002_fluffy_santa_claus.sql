ALTER TABLE "blog_posts" ADD COLUMN "content_blocks" jsonb;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "editor_version" varchar(10) DEFAULT 'classic';