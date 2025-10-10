import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { generateId } from '../../shared/helpers/id.helper.ts';
import { users } from './users.ts';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().$default(generateId),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});
