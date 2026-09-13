import { getBrowseData } from "@/lib/account";
import { BrowseView } from "./BrowseView";

export default async function BrowsePage() {
  // Signed-out visitors are sent to sign in.
  const data = await getBrowseData();

  return <BrowseView data={data} />;
}
