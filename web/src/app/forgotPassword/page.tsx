"use client";

import { useState, type SubmitEvent } from "react";
import { motion, type Variants } from "motion/react";
import { Blinds } from "@/components/effects/Blinds";

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
          Reset Password
        </motion.h1>

        {status === "sent" ? (
          <motion.p
            variants={item}
            className="text-center text-sm text-slate-500"
          >
            If an account exists for that email, we&apos;ve sent a link to
            reset your password.
          </motion.p>
        ) : (
          <>
            <motion.p
              variants={item}
              className="text-center text-sm text-slate-500/70"
            >
              Enter your email and we&apos;ll send you a link to reset your
              password.
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
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-slate-500/30 bg-orange-200 px-6 py-3 text-slate-600/85 placeholder:text-slate-500/60 outline-none transition-colors hover:border-slate-500/55 focus:border-slate-600"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full cursor-pointer rounded-full bg-slate-500 py-3 text-orange-50 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send Reset Link"}
              </button>

              {status === "error" && (
                <p className="text-sm text-red-500">
                  Something went wrong. Please try again.
                </p>
              )}
            </motion.form>
          </>
        )}

        <motion.a
          href="/"
          variants={item}
          className="cursor-pointer text-sm text-slate-500/40 transition-colors duration-300 ease-out hover:text-slate-500"
        >
          Remember your password? Sign in
        </motion.a>
      </motion.div>
    </div>
  );
}
