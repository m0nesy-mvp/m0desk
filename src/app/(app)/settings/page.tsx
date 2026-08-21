import { SettingsView } from "@/components/settings/settings-view";
import { getDataCounts } from "@/lib/db/stats";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const counts = await getDataCounts();
  return <SettingsView counts={counts} />;
}
