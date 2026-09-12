import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {session ? `Welcome, ${session.user.name}!` : "Welcome"}
        </h1>

        {session ? (
          <a
            href="/auth/logout"
            className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-6 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Log out
          </a>
        ) : (
          <div className="flex gap-4">
            <a
              href="/auth/login?screen_hint=signup"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Sign up
            </a>
            <a
              href="/auth/login"
              className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-6 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Log in
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
