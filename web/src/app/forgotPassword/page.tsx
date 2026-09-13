"use client";

import { useState, type SubmitEvent } from "react";
import { motion, type Variants } from "motion/react";
import { Blinds } from "@/components/effects/Blinds";
import { useT } from "@/components/LanguageProvider";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

type Status = "idle" | "sending" | "sent" | "error";

export default function ForgotPasswordPage() {
  const [revealed, setRevealed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const allText = useT();
  const t = allText.forgotPassword;

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-orange-200">
      <Blinds onComplete={() => setRevealed(true)} />

      <motion.div
        className="relative flex w-full max-w-sm flex-col items-center gap-6 px-8 py-16"
        variants={container}
        initial="hidden"
        animate={revealed ? "show" : "hidden"}
      >
        <motion.h1
          className="text-3xl font-semibold tracking-tight text-slate-600"
          variants={item}
        >
          {t.title}
        </motion.h1>

        {status === "sent" ? (
          <motion.p
            variants={item}
            className="text-center text-sm text-slate-500"
          >
            {t.sent}
          </motion.p>
        ) : (
          <>
            <motion.p
              variants={item}
              className="text-center text-sm text-slate-500/70"
            >
              {t.intro}
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="flex w-full flex-col items-center gap-4"
              variants={item}
            >
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={allText.signIn.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-slate-500/30 bg-orange-200 px-6 py-3 text-slate-600/85 placeholder:text-slate-500/60 outline-none transition-colors hover:border-slate-500/55 focus:border-slate-600"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full cursor-pointer rounded-full bg-slate-500 py-3 text-orange-50 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? t.sending : t.send}
              </button>

              {status === "error" && (
                <p className="text-sm text-red-500">{t.error}</p>
              )}
            </motion.form>
          </>
        )}

        <motion.a
          href="/"
          variants={item}
          className="cursor-pointer text-sm text-slate-500/40 transition-colors duration-300 ease-out hover:text-slate-500"
        >
          {t.remember}
        </motion.a>
      </motion.div>
    </div>
  );
}
