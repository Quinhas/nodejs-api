import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { generateId } from '../../shared/helpers/id.helper.ts';

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().$default(generateId),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
