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
  const endpoint = new URL("https://www.googleapis.com/customsearch/v1")
  endpoint.searchParams.set("key", apiKey)
  endpoint.searchParams.set("cx", engineId)
  endpoint.searchParams.set("q", query)
  endpoint.searchParams.set("num", String(count))

  let response: Response
  try {
    response = await fetch(endpoint, { cache: "no-store" })
  } catch {
    return { ok: false, message: "Google Search could not be reached. Check the server connection and try again." }
  }

  const data = (await response.json().catch(() => ({}))) as {
    items?: Array<{ link?: string }>
    error?: { code?: number; message?: string; errors?: Array<{ reason?: string }> }
  }

  if (!response.ok) {
    const reason = data.error?.errors?.[0]?.reason
    if (data.error?.code === 400) {
      return {
        ok: false,
        message: `Google rejected the request${data.error?.message ? `: ${data.error.message}` : ". Verify the Search Engine ID (CX) and that it searches the entire web."}`,
      }
    }
    if (data.error?.code === 403 && reason === "dailyLimitExceeded") {
      return { ok: false, message: "Google Custom Search daily quota has been reached." }
    }
    if (data.error?.code === 403) {
      return { ok: false, message: "Google denied the request. Enable Custom Search JSON API for this API key and check its restrictions." }
    }
    return { ok: false, message: `Google Search failed${data.error?.message ? `: ${data.error.message}` : ". Check the API key and Search Engine ID."}` }
  }
  const urls = Array.from(new Set((data.items ?? []).map((item) => normalizeUrl(item.link ?? "")).filter((url): url is string => Boolean(url))))
  if (!urls.length) return { ok: false, message: "No website results found. Try broader search terms." }

  const rows = urls.map((url) => ({ url, domain: new URL(url).hostname.replace(/^www\./, ""), status: "pending" as const, depth: 0 }))
  const inserted = await db.insert(crawlSites).values(rows).onConflictDoNothing().returning({ id: crawlSites.id })
  revalidatePath("/")
  return { ok: true, message: `Found ${urls.length} website(s) and queued ${inserted.length} new lead(s).` }
}
