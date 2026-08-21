import { PageHeader } from "@/components/page-header";
import { KnowledgeBrowser } from "@/components/knowledge/knowledge-browser";
import { getKnowledge } from "@/lib/db/knowledge";
import { getProjectOptions } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const [entries, projectOptions] = await Promise.all([
    getKnowledge(),
    getProjectOptions(),
  ]);

  return (
    <div>
      <PageHeader
        title="Knowledge"
        description="What you've learned, understood, and distilled."
      />
      <KnowledgeBrowser entries={entries} projects={projectOptions} />
    </div>
  );
}
