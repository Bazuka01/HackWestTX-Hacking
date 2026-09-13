"use client";

import { useState, type SubmitEvent } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Blinds } from "@/components/effects/Blinds";
import { Iris } from "@/components/effects/Iris";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { AUTH0_LOCALES } from "@/lib/i18n";

type Mode = "signup" | "signin";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const fieldGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function SignInForm() {
  const [mode, setMode] = useState<Mode>("signup");
  const [revealed, setRevealed] = useState(false);
  const [email, setEmail] = useState("");
  const language = useLanguage();
  const allText = useT();

  const isSignup = mode === "signup";
  const t = allText.signIn;

  // Only the email is asked for here: Auth0's own page collects the password,
  // so asking for it twice would just make students type it again.
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams({
      screen_hint: isSignup ? "signup" : "login",
      login_hint: email,
      // Show Auth0's page in the language picked here.
      ui_locales: AUTH0_LOCALES[language],
      // Go to the home page afterwards; it forwards students who haven't
      // answered the questions yet to onboarding. Without it, the SDK's
      // default is "/", which is this same form.
      returnTo: "/homePage",
    });
    // Full document navigation: the Auth0 route handler issues a redirect
    // to the hosted login page, which a client-side router push can't follow.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/auth/login?${params}`;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-orange-200">
      <AnimatePresence mode="wait" onExitComplete={() => setRevealed(false)}>
        <motion.div
          key={mode}
          className="relative flex w-full max-w-sm flex-col items-center gap-6 px-8 py-16"
          variants={container}
          initial="hidden"
          animate={revealed ? "show" : "hidden"}
        >
          {isSignup ? (
            <Blinds onComplete={() => setRevealed(true)} />
          ) : (
            <Iris onComplete={() => setRevealed(true)} />
          )}

          <motion.h1
            className="text-3xl font-semibold tracking-tight text-slate-600"
            variants={item}
          >
            {isSignup ? t.createAccount : t.signIn}
          </motion.h1>

          <motion.form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center gap-4"
            variants={fieldGroup}
          >
            <motion.div variants={item} className="w-full">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-slate-500/30 bg-orange-200 px-6 py-3 text-slate-600/85 placeholder:text-slate-500/60 outline-none transition-colors hover:border-slate-500/55 focus:border-slate-600"
              />
            </motion.div>

            <motion.p
              variants={item}
              className="-mt-1 text-center text-xs text-slate-500/60"
            >
              {t.passwordNextStep}
            </motion.p>

            {!isSignup && (
              <motion.a
                href="/forgotPassword"
                variants={item}
                className="cursor-pointer text-sm text-slate-500/40 transition-colors duration-300 ease-out hover:text-slate-500"
              >
                {t.forgotPassword}
              </motion.a>
            )}

            <motion.button
              type="button"
              variants={item}
              onClick={() => setMode(isSignup ? "signin" : "signup")}
              className="cursor-pointer text-sm text-slate-500/40 transition-colors duration-300 ease-out hover:text-slate-500"
            >
              {isSignup ? t.haveAccount : t.newHere}
            </motion.button>

            <motion.div variants={item} className="w-full">
              <button
                type="submit"
                className="w-full cursor-pointer rounded-full bg-slate-500 py-3 text-orange-50 transition-colors hover:bg-slate-600"
              >
                {isSignup ? t.createAccount : t.signIn}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
