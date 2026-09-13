import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function proxy(request: Request) {
  // Without Auth0 credentials in .env.local, auth0.middleware throws and every
  // page returns a 500. Let pages load so the app can still be run locally;
  // only the /auth routes (sign in/sign up) need the credentials.
  if (!process.env.AUTH0_DOMAIN) {
    return NextResponse.next();
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
