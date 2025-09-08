CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."series_type" AS ENUM('university', 'personal', 'professional');--> statement-breakpoint
CREATE TABLE "blog_post_skills" (
	"blog_post_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"relevance_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_skills_blog_post_id_skill_id_pk" PRIMARY KEY("blog_post_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "blog_post_tags" (
	"blog_post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_tags_blog_post_id_tag_id_pk" PRIMARY KEY("blog_post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "blog_post_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"change_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"components" jsonb,
	"featured_image_url" text,
	"status" "content_status" DEFAULT 'draft',
	"published_at" timestamp,
	"views" integer DEFAULT 0,
	"meta_title" varchar(160),
	"meta_description" text,
	"og_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid,
	"podcast_id" uuid,
	"parent_id" uuid,
	"author_name" varchar(100) NOT NULL,
	"author_email" varchar(255) NOT NULL,
	"author_website" varchar(255),
	"content" text NOT NULL,
	"is_approved" boolean DEFAULT false,
	"is_spam" boolean DEFAULT false,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50),
	"props" jsonb,
	"example_code" text,
	"thumbnail_url" text,
	"is_interactive" boolean DEFAULT true,
	"dependencies" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "component_catalog_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "podcast_tags" (
	"podcast_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "podcast_tags_podcast_id_tag_id_pk" PRIMARY KEY("podcast_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "podcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid,
	"episode_number" integer NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"audio_url" text NOT NULL,
	"duration" integer NOT NULL,
	"transcript" text,
	"ai_model" varchar(100),
	"ai_prompt_hash" varchar(64),
	"published_at" timestamp,
	"status" "content_status" DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "podcasts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" uuid,
	"podcast_id" uuid,
	"comment_id" uuid,
	"reaction_type" varchar(20) DEFAULT 'like' NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "series_type" DEFAULT 'personal' NOT NULL,
	"cover_image_url" text,
	"is_active" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"category" varchar(100),
	"proficiency_level" numeric(3, 2),
	"description" text,
	"icon_url" text,
	"is_public" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"path" varchar(500) NOT NULL,
	"parent_id" uuid,
	"level" integer DEFAULT 0 NOT NULL,
	"color" varchar(7),
	"icon" varchar(50),
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_post_skills" ADD CONSTRAINT "blog_post_skills_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_skills" ADD CONSTRAINT "blog_post_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_versions" ADD CONSTRAINT "blog_post_versions_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_tags" ADD CONSTRAINT "podcast_tags_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_tags" ADD CONSTRAINT "podcast_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcasts" ADD CONSTRAINT "podcasts_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_tag_post_idx" ON "blog_post_tags" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "blog_tag_tag_idx" ON "blog_post_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "version_blog_post_idx" ON "blog_post_versions" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "version_number_idx" ON "blog_post_versions" USING btree ("blog_post_id","version");--> statement-breakpoint
CREATE INDEX "blog_slug_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_podcast_idx" ON "blog_posts" USING btree ("podcast_id");--> statement-breakpoint
CREATE INDEX "blog_published_idx" ON "blog_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "blog_status_idx" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comment_blog_idx" ON "comments" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "comment_podcast_idx" ON "comments" USING btree ("podcast_id");--> statement-breakpoint
CREATE INDEX "comment_approved_idx" ON "comments" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "component_name_idx" ON "component_catalog" USING btree ("name");--> statement-breakpoint
CREATE INDEX "component_category_idx" ON "component_catalog" USING btree ("category");--> statement-breakpoint
CREATE INDEX "podcast_tag_podcast_idx" ON "podcast_tags" USING btree ("podcast_id");--> statement-breakpoint
CREATE INDEX "podcast_tag_tag_idx" ON "podcast_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "podcast_slug_idx" ON "podcasts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "podcast_series_idx" ON "podcasts" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "podcast_published_idx" ON "podcasts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "reaction_blog_idx" ON "reactions" USING btree ("blog_post_id");--> statement-breakpoint
CREATE INDEX "reaction_podcast_idx" ON "reactions" USING btree ("podcast_id");--> statement-breakpoint
CREATE INDEX "reaction_session_idx" ON "reactions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "unique_reaction_idx" ON "reactions" USING btree ("blog_post_id","podcast_id","comment_id","session_id","reaction_type");--> statement-breakpoint
CREATE INDEX "series_slug_idx" ON "series" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "skill_slug_idx" ON "skills" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tag_path_idx" ON "tags" USING btree ("path");--> statement-breakpoint
CREATE INDEX "tag_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tag_parent_idx" ON "tags" USING btree ("parent_id");