import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/account";
import { SignInForm } from "./SignInForm";

export default async function SignInPage() {
  // Signed-in students skip the form.
  if (await getSessionUser()) redirect("/homePage");

  return <SignInForm />;
}
