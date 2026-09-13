import { getProfile } from "@/lib/account";
import { InterestChecklist } from "./InterestChecklist";

export default async function InterestChecklistPage() {
  // Signed-out visitors are sent to sign in; answers are saved to the account.
  const savedProfile = await getProfile();

  return <InterestChecklist savedProfile={savedProfile} />;
}
