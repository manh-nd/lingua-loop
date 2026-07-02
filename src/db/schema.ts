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

// --- Correction Workspace & Memory Tables ---

export const correctionSessions = pgTable('correction_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  originalText: text('original_text').notNull(),
  improvedText: text('improved_text').notNull(),
  changes: jsonb('changes').notNull(), // List of changes: { original: string, improved: string, reason: string, category: string }[]
  preset: text('preset').notNull(), // 'quick_message' | 'email' | 'pr_jira_comment' | 'documentation' | 'explanation_spec'
  context: jsonb('context').notNull(), // Tone, audience, custom instructions, etc.
  parentSessionId: text('parent_session_id'), // App-managed self reference for refinement histories
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const memoryCandidates = pgTable('memory_candidates', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'mistake' | 'reusable_phrase' | 'vocabulary' | 'tone_pattern'
  status: text('status').notNull().default('pending'), // 'pending' | 'saved' | 'ignored'
  sourceSessionId: text('source_session_id'), // App-managed reference to correctionSessions.id
  title: text('title').notNull(), // Friendly title
  explanation: text('explanation').notNull(), // Coaching explanation
  sourceText: text('source_text'), // Sub-optimal text if applicable (wrongText/phrase/trapText)
  suggestedText: text('suggested_text'), // Target correct text if applicable (correctText/interpretation)
  confidence: real('confidence'), // AI confidence score
  payload: jsonb('payload').notNull(), // Any additional metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const memoryItems = pgTable('memory_items', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'mistake' | 'reusable_phrase' | 'vocabulary' | 'tone_pattern'
  status: text('status').notNull().default('active'), // 'active' | 'archived'
  sourceCandidateId: text('source_candidate_id'), // App-managed reference to memoryCandidates.id
  sourceSessionId: text('source_session_id'), // App-managed reference to correctionSessions.id
  title: text('title').notNull(), // Friendly title
  explanation: text('explanation').notNull(), // Explanation
  sourceText: text('source_text'), // wrong text
  suggestedText: text('suggested_text'), // correct text
  payload: jsonb('payload').notNull(), // Snapshotted payload
  // SRS properties
  interval: integer('interval').notNull().default(1),
  easeFactor: real('ease_factor').notNull().default(2.5),
  reviewCount: integer('review_count').notNull().default(0),
  correctStreak: integer('correct_streak').notNull().default(0),
  wrongStreak: integer('wrong_streak').notNull().default(0),
  lastPracticedAt: timestamp('last_practiced_at'),
  nextPracticeAt: timestamp('next_practice_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
