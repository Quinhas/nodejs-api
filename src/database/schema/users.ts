import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { generateId } from '../../shared/helpers/id.helper.ts';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().$default(generateId),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  normalizedEmail: text('normalized_email').unique(),
});
