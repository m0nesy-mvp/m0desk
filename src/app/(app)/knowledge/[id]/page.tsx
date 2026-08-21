import { notFound } from "next/navigation";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { KnowledgeStatusBadge } from "@/components/badges";
import { Markdown } from "@/components/markdown";
import { KnowledgeDetailActions } from "@/components/knowledge/knowledge-detail-actions";
import { getKnowledgeEntry } from "@/lib/db/knowledge";
import { getProjectOptions } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getKnowledgeEntry(id);
  if (!entry) notFound();

  const projectOptions = await getProjectOptions();
  const relatedProject = projectOptions.find((p) => p.id === entry.project_id);

  return (
    <div>
      <PageHeader
        title={entry.title}
        description={`${entry.category || "Uncategorized"} · updated ${format(new Date(entry.updated_at), "MMM d, yyyy")}`}
        action={
          <KnowledgeDetailActions
            entry={entry}
            projects={projectOptions}
          />
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <KnowledgeStatusBadge status={entry.status} />
        {relatedProject && (
          <Link
            href={`/projects/${relatedProject.id}`}
            className="inline-flex items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <FolderKanban className="size-3" />
            {relatedProject.title}
          </Link>
        )}
        {entry.tags.map((t) => (
          <span
            key={t}
            className="rounded border border-border bg-muted/40 px-1.5 py-px font-mono text-[10.5px] text-muted-foreground/80"
          >
            #{t}
          </span>
        ))}
      </div>

      {entry.summary && (
        <p className="mb-6 rounded-lg border bg-muted/20 px-4 py-3 text-[13.5px] leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>
      )}

      <div className="rounded-lg border bg-card p-5">
        {entry.content ? (
          <Markdown content={entry.content} />
        ) : (
          <p className="text-[13px] italic text-muted-foreground/60">
            No notes yet.
          </p>
        )}
      </div>
    </div>
  );
}
