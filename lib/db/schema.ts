import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export type Issue = {
  code: string
  label: string
  category: "seo" | "design"
  severity: "low" | "medium" | "high"
}

export const crawlSites = pgTable("crawl_sites", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  domain: text("domain").notNull(),
  // pending | crawling | crawled | blocked | error
  status: text("status").notNull().default("pending"),
  crawlRunId: integer("crawl_run_id"),
  depth: integer("depth").notNull().default(0),
  sourceUrl: text("source_url"),
  httpStatus: integer("http_status"),
  title: text("title"),
  // 0-100, higher means it needs modernization more urgently
  overallScore: integer("overall_score"),
  seoScore: integer("seo_score"),
  designScore: integer("design_score"),
  readabilityScore: integer("readability_score"),
  accessibilityScore: integer("accessibility_score"),
  issues: jsonb("issues").$type<Issue[]>().default([]),
  error: text("error"),
  blockReason: text("block_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  analyzedAt: timestamp("analyzed_at", { withTimezone: true }),
})

export const crawlRuns = pgTable("crawl_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  requestedCount: integer("requested_count").notNull().default(0),
  processedCount: integer("processed_count").notNull().default(0),
  discoveredCount: integer("discovered_count").notNull().default(0),
  blockedCount: integer("blocked_count").notNull().default(0),
  status: text("status").notNull().default("running"),
})

export type CrawlSite = typeof crawlSites.$inferSelect
export type CrawlRun = typeof crawlRuns.$inferSelect
