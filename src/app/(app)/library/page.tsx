import { PageHeader } from "@/components/page-header";
import { LibraryBrowser } from "@/components/library/library-browser";
import { NewLibraryButton } from "@/components/library/new-library-button";
import { getLibraryItems } from "@/lib/db/library";
import { getProjectOptions } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [items, projectOptions] = await Promise.all([
    getLibraryItems(),
    getProjectOptions(),
  ]);

  return (
    <div>
      <PageHeader
        title="Library"
        description="Raw material you've collected — papers, repos, courses and more."
        action={<NewLibraryButton projects={projectOptions} />}
      />
      <LibraryBrowser items={items} projects={projectOptions} />
    </div>
  );
}
