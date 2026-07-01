import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  real,
} from 'drizzle-orm/pg-core';

// --- Better Auth Schema Tables ---

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Lingua Loop Custom Tables ---

export const liveSessions = pgTable('live_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull().defaultNow(),
  durationSeconds: integer('duration_seconds').notNull(),
  mode: text('mode').notNull(),
  scenarioId: text('scenario_id'),
  overallScore: integer('overall_score'),
  grammarScore: integer('grammar_score'),
  pronunciationScore: integer('pronunciation_score'),
  fluencyScore: integer('fluency_score'),
  summaryVi: text('summary_vi'),
  transcript: jsonb('transcript').notNull(), // Array of LiveMessage: { role: string, text: string }[]
  mistakes: jsonb('mistakes'), // Raw array of mistakes/alternatives
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const learningItems = pgTable('learning_items', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'vocabulary' | 'grammar' | 'pronunciation'
  originalText: text('original_text').notNull(), // user mistake or vietnamese definition
  correctedText: text('corrected_text').notNull(), // upgraded native phrasing
  explanationVi: text('explanation_vi'),
  liveSessionId: text('live_session_id').references(() => liveSessions.id, {
    onDelete: 'set null',
  }),
  // SM-2 fields
  interval: integer('interval').notNull().default(1),
  easeFactor: real('ease_factor').notNull().default(2.5),
  repetitions: integer('repetitions').notNull().default(0),
  nextReviewAt: timestamp('next_review_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
