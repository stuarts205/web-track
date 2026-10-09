import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const websiteTable = pgTable("websites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar({ length: 255 }).notNull().unique(),
  domain: varchar({ length: 255 }).notNull().unique(),
  timezone: varchar({ length: 255 }).notNull(),
  enableLocalhostTracking: boolean().default(false),
  userEmail: varchar({ length: 255 }).notNull(),
});

export const pageViewTable = pgTable("page_views", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  visitorId: varchar({ length: 255 }),
  websiteId: varchar({ length: 255 }).notNull(),
  domain: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 2048 }),
  type: varchar({ length: 255 }).notNull(),
  referrer: varchar({ length: 2048 }),
  entryTime: varchar({ length: 100 }),
  exitTime: varchar({ length: 100 }),
  totalActiveTime: integer(),
  urlParams: varchar({ length: 2048 }),
  utm_source: varchar({ length: 255 }),
  utm_medium: varchar({ length: 255 }),
  utm_campaign: varchar({ length: 255 }),
  device: varchar(),
  os: varchar(),
  browser: varchar(),
  ipAddress: varchar(),
  city: varchar(),
  country: varchar(),
  countryCode: varchar(),
  region: varchar(),
  refParams: varchar(),
  exitUrl: varchar(),
});

export const liveUserTable = pgTable("live_user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar(),
  visitorId: varchar().unique(),
  last_seen: bigint({ mode: "number" }).notNull(),
  city: varchar(),
  country: varchar(),
  countryCode: varchar(),
  region: varchar(),
  lat: varchar(),
  lng: varchar(),
  device: varchar(),
  os: varchar(),
  browser: varchar(),
});

export const clicksTable = pgTable("clicks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar({ length: 255 }).notNull(),
  visitorId: varchar({ length: 255 }),
  domain: varchar({ length: 255 }).notNull(),
  pageUrl: varchar({ length: 2048 }),
  eventType: varchar({ length: 100 }).notNull(),
  elementType: varchar({ length: 100 }).notNull(),
  label: varchar({ length: 255 }),
  targetUrl: varchar({ length: 2048 }),
  elementId: varchar({ length: 255 }),
  elementClass: varchar({ length: 1024 }),
  createdAt: bigint({ mode: "number" }).notNull(),
});

export const trackerRulesTable = pgTable("tracker_rules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar({ length: 255 }).notNull(),
  eventName: varchar({ length: 255 }).notNull(),
  enabled: boolean().default(true).notNull(),
  source: varchar({ length: 100 }).notNull().default("manual"),
  filtersJson: varchar({ length: 4096 }),
  createdBy: varchar({ length: 255 }),
  createdAt: bigint({ mode: "number" }).notNull(),
});

export const trackerEventsTable = pgTable("tracker_events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  websiteId: varchar({ length: 255 }).notNull(),
  trackerRuleId: integer(),
  eventName: varchar({ length: 255 }).notNull(),
  userId: varchar({ length: 255 }),
  userEmailHash: varchar({ length: 255 }),
  visitorId: varchar({ length: 255 }),
  sessionId: varchar({ length: 255 }),
  source: varchar({ length: 100 }).notNull().default("manual"),
  metaJson: varchar({ length: 8192 }),
  createdAt: bigint({ mode: "number" }).notNull(),
});
