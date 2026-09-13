import { getDashboard } from "@/lib/account";
import { SavedEventsView } from "./SavedEventsView";

export default async function SavedEventsPage() {
  // Signed-out visitors are sent to sign in.
  const { saved_events } = await getDashboard();

  return <SavedEventsView savedEvents={saved_events} />;
}
