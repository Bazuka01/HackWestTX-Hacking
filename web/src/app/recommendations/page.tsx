import { requireUser } from "@/lib/account";
import { MatchesView } from "./MatchesView";

export default async function RecommendationsPage() {
  // Matches belong to an account, so signed-out visitors are sent to sign in.
  await requireUser();

  return <MatchesView />;
}
