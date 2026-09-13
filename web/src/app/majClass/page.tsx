import { getProfile } from "@/lib/account";
import { MajClassForm } from "./MajClassForm";

export default async function MajClassPage() {
  // Signed-out visitors are sent to sign in; answers are saved to the account.
  const savedProfile = await getProfile();

  return <MajClassForm savedProfile={savedProfile} />;
}
