"use client";

import { useState, type SubmitEvent } from "react";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { Iris } from "@/components/effects/Iris";
import { AmbientBackground } from "@/components/AmbientBackground";
import { useLanguage } from "@/components/LanguageProvider";
import { TRANSLATIONS } from "@/lib/i18n";
import connectXLogo from "@/components/icons/connectx-logo.png";

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
  const [closing, setClosing] = useState(false);
  const [email, setEmail] = useState("");
  const language = useLanguage();

  const isSignup = mode === "signup";
  const t = TRANSLATIONS[language];

  function switchMode() {
    setRevealed(false);
    setClosing(true);
  }

  function handleCloseComplete() {
    setMode((m) => (m === "signup" ? "signin" : "signup"));
    setClosing(false);
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = isSignup ? "signup" : "login";
    // Full document navigation: the Auth0 route handler issues a redirect
    // to the hosted login page, which a client-side router push can't follow.
    // returnTo sends the user to their home page after Auth0 finishes; it
    // forwards students who haven't answered the questions yet to onboarding.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/auth/login?screen_hint=${target}&login_hint=${encodeURIComponent(
      email
    )}&returnTo=${encodeURIComponent("/homePage")}`;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-[#1A1A1A]">
      <AmbientBackground />

      <Image
        src={connectXLogo}
        alt=""
        aria-hidden
        priority
        className="pointer-events-none absolute top-1/2 right-[8%] w-[480px] max-w-none -translate-y-1/2 rotate-12 opacity-10 select-none"
      />

      {closing ? (
        <Iris variant="out" onComplete={handleCloseComplete} />
      ) : (
        <Iris key={mode} variant="in" onComplete={() => setRevealed(true)} />
      )}

      <motion.div
        className="relative flex w-full max-w-sm flex-col items-center gap-6 px-8 py-16"
        variants={container}
        initial="hidden"
        animate={revealed ? "show" : "hidden"}
      >
        <motion.h1
          className="font-heading text-4xl font-extrabold tracking-tight text-[#EF4444]"
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
              className="w-full rounded-full border border-[#F3A5A5]/50 bg-black/20 px-6 py-3 text-[#F3A5A5] placeholder:text-[#F3A5A5]/50 outline-none transition-colors hover:border-[#F3A5A5] focus:border-[#F3A5A5]"
            />
          </motion.div>

          <motion.button
            type="button"
            variants={item}
            onClick={switchMode}
            className="cursor-pointer text-sm text-[#8C8785] transition-colors duration-300 ease-out hover:text-[#F3A5A5]"
          >
            {isSignup ? t.haveAccount : t.newHere}
          </motion.button>

          <motion.div variants={item} className="w-full">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-full bg-black py-3 text-[#DC143C] transition-colors hover:bg-black/80"
            >
              Continue
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
