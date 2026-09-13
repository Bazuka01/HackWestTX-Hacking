import "server-only";
import { cookies } from "next/headers";
import { isLanguageCode, LANGUAGE_COOKIE, type LanguageCode } from "@/lib/i18n";

// The language the student picked with the language switcher, or English.
export async function getLanguage(): Promise<LanguageCode> {
  const value = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  return isLanguageCode(value) ? value : "en";
}
