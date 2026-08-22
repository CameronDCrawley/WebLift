import { History } from "lucide-react"
import type { CrawlRun } from "@/lib/db/schema"

export function CrawlHistory({ runs }: { runs: CrawlRun[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2"><History className="size-4 text-primary" /><h2 className="text-lg font-medium">Crawl history</h2></div>
      <div className="overflow-hidden rounded-xl border border-border/60">
        {runs.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No crawl runs yet.</p> : runs.map((run) => (
          <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-4 py-3 text-sm last:border-0">
            <span className="font-mono text-xs text-muted-foreground">{new Date(run.startedAt).toLocaleString()}</span>
            <span>{run.processedCount} analyzed</span><span>{run.discoveredCount} discovered</span><span>{run.blockedCount} blocked</span>
            <span className="text-muted-foreground">{run.status}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
