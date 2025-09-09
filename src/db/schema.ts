import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, uuid, index, primaryKey, decimal, pgEnum, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const contentStatusEnum = pgEnum('content_status', ['draft', 'published', 'archived']);
export const seriesTypeEnum = pgEnum('series_type', ['university', 'personal', 'professional']);

// ============================================
// AUTHENTICATION TABLES (Better Auth)
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// CORE CONTENT TABLES
// ============================================

// Series/Modules for organizing podcast episodes
export const series = pgTable('series', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: seriesTypeEnum('type').notNull().default('personal'),
  coverImageUrl: text('cover_image_url'),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0), // for manual ordering
  metadata: jsonb('metadata'), // flexible field for extra data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('series_slug_idx').on(table.slug),
  };
});

// Podcast episodes
export const podcasts = pgTable('podcasts', {
  id: uuid('id').defaultRandom().primaryKey(),
  seriesId: uuid('series_id').references(() => series.id, { onDelete: 'set null' }),
  episodeNumber: integer('episode_number').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  audioUrl: text('audio_url').notNull(),
  duration: integer('duration').notNull(), // in seconds
  transcript: text('transcript'),
  aiModel: varchar('ai_model', { length: 100 }), // track which AI generated it
  aiPromptHash: varchar('ai_prompt_hash', { length: 64 }), // track prompt version
  publishedAt: timestamp('published_at'),
  status: contentStatusEnum('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('podcast_slug_idx').on(table.slug),
    seriesIdx: index('podcast_series_idx').on(table.seriesId),
    publishedIdx: index('podcast_published_idx').on(table.publishedAt),
  };
});

// Blog posts with MDX content
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  podcastId: uuid('podcast_id').references(() => podcasts.id, { onDelete: 'set null' }), // optional link to podcast
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(), // MDX content
  components: jsonb('components'), // ['MatrixVisualizer', 'SortingAnimation'] etc.
  featuredImageUrl: text('featured_image_url'),
  status: contentStatusEnum('status').default('draft'),
  publishedAt: timestamp('published_at'),
  views: integer('views').default(0),
  
  // SEO fields
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: text('meta_description'),
  ogImageUrl: text('og_image_url'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('blog_slug_idx').on(table.slug),
    podcastIdx: index('blog_podcast_idx').on(table.podcastId),
    publishedIdx: index('blog_published_idx').on(table.publishedAt),
    statusIdx: index('blog_status_idx').on(table.status),
  };
});

// Version history for blog posts (simple implementation)
export const blogPostVersions = pgTable('blog_post_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  blogPostId: uuid('blog_post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  changeNote: text('change_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    blogPostIdx: index('version_blog_post_idx').on(table.blogPostId),
    versionIdx: index('version_number_idx').on(table.blogPostId, table.version),
  };
});

// ============================================
// CATEGORIZATION & TAGGING
// ============================================

// Hierarchical tags using materialized path pattern
export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(), // e.g., "university/statistics/regression"
  parentId: uuid('parent_id'),
  level: integer('level').notNull().default(0), // depth in hierarchy
  color: varchar('color', { length: 7 }), // hex color for UI
  icon: varchar('icon', { length: 50 }), // icon name for UI
  description: text('description'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pathIdx: index('tag_path_idx').on(table.path),
    slugIdx: index('tag_slug_idx').on(table.slug),
    parentIdx: index('tag_parent_idx').on(table.parentId),
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete('cascade'),
  };
});

// Many-to-many relationship tables
export const blogPostTags = pgTable('blog_post_tags', {
  blogPostId: uuid('blog_post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  isPrimary: boolean('is_primary').default(false), // mark main tag
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.blogPostId, table.tagId] }),
    blogPostIdx: index('blog_tag_post_idx').on(table.blogPostId),
    tagIdx: index('blog_tag_tag_idx').on(table.tagId),
  };
});

export const podcastTags = pgTable('podcast_tags', {
  podcastId: uuid('podcast_id').notNull().references(() => podcasts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.podcastId, table.tagId] }),
    podcastIdx: index('podcast_tag_podcast_idx').on(table.podcastId),
    tagIdx: index('podcast_tag_tag_idx').on(table.tagId),
  };
});

// ============================================
// ENGAGEMENT & INTERACTION
// ============================================

// Simple comments system
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  blogPostId: uuid('blog_post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  podcastId: uuid('podcast_id').references(() => podcasts.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // for nested comments
  
  // Guest commenting (no auth required for MVP)
  authorName: varchar('author_name', { length: 100 }).notNull(),
  authorEmail: varchar('author_email', { length: 255 }).notNull(),
  authorWebsite: varchar('author_website', { length: 255 }),
  
  content: text('content').notNull(),
  isApproved: boolean('is_approved').default(false), // moderation
  isSpam: boolean('is_spam').default(false),
  
  // Optional fields for anti-spam
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    blogPostIdx: index('comment_blog_idx').on(table.blogPostId),
    podcastIdx: index('comment_podcast_idx').on(table.podcastId),
    approvedIdx: index('comment_approved_idx').on(table.isApproved),
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete('cascade'),
  };
});

// Likes/reactions (simple, no auth required)
export const reactions = pgTable('reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  blogPostId: uuid('blog_post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  podcastId: uuid('podcast_id').references(() => podcasts.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  
  reactionType: varchar('reaction_type', { length: 20 }).notNull().default('like'), // like, love, insightful, etc.
  
  // Track by session/fingerprint for now (no auth)
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    blogPostIdx: index('reaction_blog_idx').on(table.blogPostId),
    podcastIdx: index('reaction_podcast_idx').on(table.podcastId),
    sessionIdx: index('reaction_session_idx').on(table.sessionId),
    uniqueReaction: index('unique_reaction_idx').on(
      table.blogPostId, 
      table.podcastId, 
      table.commentId, 
      table.sessionId, 
      table.reactionType
    ),
  };
});

// ============================================
// LEARNING & PROGRESS TRACKING
// ============================================

// Skills/topics for manual progress tracking (future feature)
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 100 }),
  proficiencyLevel: decimal('proficiency_level', { precision: 3, scale: 2 }), // 0.00 to 1.00
  description: text('description'),
  iconUrl: text('icon_url'),
  isPublic: boolean('is_public').default(true),
  metadata: jsonb('metadata'), // flexible field for charts, milestones, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('skill_slug_idx').on(table.slug),
  };
});

// Link skills to content
export const blogPostSkills = pgTable('blog_post_skills', {
  blogPostId: uuid('blog_post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  relevanceScore: decimal('relevance_score', { precision: 3, scale: 2 }), // 0.00 to 1.00
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.blogPostId, table.skillId] }),
  };
});

// ============================================
// COMPONENTS CATALOG (for Storybook-like interface)
// ============================================

export const componentCatalog = pgTable('component_catalog', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // e.g., 'MatrixVisualizer'
  displayName: varchar('display_name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }), // 'math', 'algorithms', 'data-viz'
  props: jsonb('props'), // prop definitions for documentation
  exampleCode: text('example_code'),
  thumbnailUrl: text('thumbnail_url'),
  isInteractive: boolean('is_interactive').default(true),
  dependencies: jsonb('dependencies'), // ['recharts', 'framer-motion']
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('component_name_idx').on(table.name),
    categoryIdx: index('component_category_idx').on(table.category),
  };
});

// ============================================
// RELATIONS (for Drizzle ORM)
// ============================================

export const seriesRelations = relations(series, ({ many }) => ({
  podcasts: many(podcasts),
}));

export const podcastsRelations = relations(podcasts, ({ one, many }) => ({
  series: one(series, {
    fields: [podcasts.seriesId],
    references: [series.id],
  }),
  blogPost: one(blogPosts),
  tags: many(podcastTags),
  comments: many(comments),
  reactions: many(reactions),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  podcast: one(podcasts, {
    fields: [blogPosts.podcastId],
    references: [podcasts.id],
  }),
  tags: many(blogPostTags),
  versions: many(blogPostVersions),
  comments: many(comments),
  reactions: many(reactions),
  skills: many(blogPostSkills),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  parent: one(tags, {
    fields: [tags.parentId],
    references: [tags.id],
  }),
  children: many(tags),
  blogPosts: many(blogPostTags),
  podcasts: many(podcastTags),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  blogPost: one(blogPosts, {
    fields: [comments.blogPostId],
    references: [blogPosts.id],
  }),
  podcast: one(podcasts, {
    fields: [comments.podcastId],
    references: [podcasts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
  reactions: many(reactions),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  blogPosts: many(blogPostSkills),
}));

// ============================================
// AUTHENTICATION RELATIONS (Better Auth)
// ============================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

