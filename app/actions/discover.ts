"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { crawlSites } from "@/lib/db/schema"

const MAX_RESULTS = 10

function normalizeUrl(raw: string) {
  try {
    const url = new URL(raw)
    if (!["http:", "https:"].includes(url.protocol)) return null
    url.hash = ""
    return url.toString()
  } catch {
    return null
  }
}

export async function discoverWebsites(input: { industry: string; location: string; keywords: string; resultCount: number }) {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
  const engineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
  if (!apiKey || !engineId) return { ok: false, message: "Google Search is not connected. Add GOOGLE_CUSTOM_SEARCH_API_KEY and GOOGLE_CUSTOM_SEARCH_ENGINE_ID in Vercel project variables." }

  const query = [input.industry, input.location, input.keywords].map((value) => value.trim()).filter(Boolean).join(" ")
  if (!query) return { ok: false, message: "Add an industry, location, or keyword." }

  const count = Math.min(Math.max(Math.floor(input.resultCount || 10), 1), MAX_RESULTS)
  const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(engineId)}&q=${encodeURIComponent(query)}&num=${count}`, { cache: "no-store" })
  if (!response.ok) return { ok: false, message: "Google Search failed. Check your API key, search engine ID, and quota." }

  const data = (await response.json()) as { items?: Array<{ link?: string }> }
  const urls = Array.from(new Set((data.items ?? []).map((item) => normalizeUrl(item.link ?? "")).filter((url): url is string => Boolean(url))))
  if (!urls.length) return { ok: false, message: "No website results found. Try broader search terms." }

  const rows = urls.map((url) => ({ url, domain: new URL(url).hostname.replace(/^www\./, ""), status: "pending" as const, depth: 0 }))
  const inserted = await db.insert(crawlSites).values(rows).onConflictDoNothing().returning({ id: crawlSites.id })
  revalidatePath("/")
  return { ok: true, message: `Found ${urls.length} website(s) and queued ${inserted.length} new lead(s).` }
}
