import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const connection = process.env.AUTH0_CONNECTION ?? "Username-Password-Authentication";

  if (!domain) {
    return NextResponse.json(
      { error: "Auth0 is not configured" },
      { status: 500 }
    );
  }

  // https://auth0.com/docs/api/authentication/change-password/change-password
  // Public, unauthenticated endpoint — safe to call without a client secret.
  const auth0Response = await fetch(
    `https://${domain}/dbconnections/change_password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, email, connection }),
    }
  );

  // Always respond with a generic success message regardless of whether the
  // email is registered, so this endpoint can't be used to enumerate accounts.
  if (!auth0Response.ok && auth0Response.status !== 404) {
    return NextResponse.json(
      { error: "Unable to send reset email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
