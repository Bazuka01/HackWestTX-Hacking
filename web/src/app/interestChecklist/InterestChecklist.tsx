"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChainCover } from "@/components/effects/ChainCover";
import { ChainFall } from "@/components/effects/ChainFall";
import { StepIndicator } from "@/components/StepIndicator";
import { Checkbox } from "@/components/Checkbox";
import { useT } from "@/components/LanguageProvider";
import { saveProfile } from "@/app/actions";
import type { StudentProfile } from "@/lib/api";
import { INTERESTS } from "@/lib/options";
import { clearProfileDraft, loadProfileDraft } from "@/lib/profileDraft";

const MAX_SELECTIONS = 5;
const EASE = [0.76, 0, 0.24, 1] as const;

// savedProfile pre-selects earlier picks and fills in step 1's answers if
// the student came straight here.
export function InterestChecklist({
  savedProfile,
}: {
  savedProfile: StudentProfile | null;
}) {
  const router = useRouter();
  const t = useT();
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string[]>(() =>
    (savedProfile?.hobbies ?? [])
      .filter((hobby) => (INTERESTS as readonly string[]).includes(hobby))
      .slice(0, MAX_SELECTIONS)
  );
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el!.scrollLeft += e.deltaY;
      e.preventDefault();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function toggle(hobby: string) {
    setSelected((prev) => {
      if (prev.includes(hobby)) return prev.filter((h) => h !== hobby);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, hobby];
    });
  }

  // Save both steps' answers to the account. The checklist mixes interests
  // and hobbies, so the picks are sent as hobbies (in English, since they're
  // matched against organization tags).
  async function handleNext() {
    const stepOne = loadProfileDraft() ?? savedProfile;
    if (!stepOne?.major) {
      router.push("/majClass");
      return;
    }

    setSaving(true);
    setSaveError(false);
    try {
      await saveProfile({
        major: stepOne.major,
        class_year: stepOne.class_year,
        ethnicity: stepOne.ethnicity,
        hobbies: selected,
        interests: [],
      });
      clearProfileDraft();
      setTransitioning(true);
    } catch {
      setSaveError(true);
      setSaving(false);
    }
  }

  const words = t.onboarding.tasteHeading.split(" ");
  const canContinue = selected.length > 0 && !saving;

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-orange-200 px-6 py-16">
      <ChainFall onComplete={() => setRevealed(true)} />
      {transitioning && (
        <ChainCover onComplete={() => router.push("/recommendations")} />
      )}

      <div className="flex w-full max-w-3xl flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="flex flex-wrap justify-center gap-x-3 text-3xl font-semibold tracking-tight text-slate-600">
            {words.map((word, i) => (
              <span key={i} className="overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={revealed ? { y: "0%" } : { y: "110%" }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: EASE }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="text-slate-500/50"
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t.onboarding.tastePrompt}
          </motion.p>
        </div>

        <div
          ref={scrollRef}
          className="w-full overflow-x-auto overflow-y-hidden py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="grid w-max grid-flow-col grid-rows-4 gap-3">
            {INTERESTS.map((hobby, i) => (
              <motion.div
                key={hobby}
                initial={{ opacity: 0, x: -24 }}
                animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.02, ease: "easeOut" }}
              >
                <Checkbox
                  label={t.options.interests[hobby]}
                  checked={selected.includes(hobby)}
                  disabled={
                    !selected.includes(hobby) && selected.length >= MAX_SELECTIONS
                  }
                  onChange={() => toggle(hobby)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            onClick={() => router.push("/majClass")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-slate-500 px-6 py-3 text-orange-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-4 w-4"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            {t.common.back}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!canContinue}
            whileHover={canContinue ? { scale: 1.08 } : undefined}
            whileTap={canContinue ? { scale: 0.96 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-slate-500 px-6 py-3 text-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? t.common.saving : t.common.next}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-4 w-4"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </motion.button>
        </div>

        {saveError && (
          <p className="-mt-6 text-sm text-red-600">{t.onboarding.saveError}</p>
        )}

        <StepIndicator active={2} />
      </div>
    </div>
  );
}
