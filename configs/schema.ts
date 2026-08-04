import {
  bigint,
  boolean,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

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
