import { redirect } from "next/navigation";
import { getDashboard, requireUser } from "@/lib/account";
import { HomePage } from "./HomePage";

export default async function HomePageRoute() {
  const user = await requireUser();
  const dashboard = await getDashboard();

  // New accounts answer the questions first, then get matched.
  if (!dashboard.profile) redirect("/majClass");
  if (dashboard.recommendations.length === 0) redirect("/recommendations");

  return <HomePage firstName={user.firstName} dashboard={dashboard} />;
}
