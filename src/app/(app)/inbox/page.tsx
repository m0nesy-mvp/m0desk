import { PageHeader } from "@/components/page-header";
import { InboxPanel } from "@/components/inbox/inbox-panel";
import { getInboxItems } from "@/lib/db/inbox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const items = await getInboxItems();

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="Everything that doesn't have a home yet — captured fast, organized later."
      />
      <InboxPanel items={items} />
    </div>
  );
}
