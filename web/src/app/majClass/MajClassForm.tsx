"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Fade } from "@/components/effects/Fade";
import { ChainCover } from "@/components/effects/ChainCover";
import { Dropdown } from "@/components/Dropdown";
import { useT } from "@/components/LanguageProvider";
import { StepIndicator } from "@/components/StepIndicator";
import type { StudentProfile } from "@/lib/api";
import { labelFor } from "@/lib/i18n";
import { CLASS_YEARS, ETHNICITIES, MAJORS } from "@/lib/options";
import { saveProfileDraft } from "@/lib/profileDraft";
import connectXLogo from "@/components/icons/connectx-logo.png";

// savedProfile pre-fills the answers when a student comes back to edit them.
export function MajClassForm({
  savedProfile,
}: {
  savedProfile: StudentProfile | null;
}) {
  const router = useRouter();
  const t = useT();
  const [revealed, setRevealed] = useState(false);
  const [major, setMajor] = useState(savedProfile?.major ?? "");
  const [classification, setClassification] = useState(
    savedProfile?.class_year ?? ""
  );
  const [ethnicity, setEthnicity] = useState(savedProfile?.ethnicity ?? "");
  const [transitioning, setTransitioning] = useState(false);

  // The recommendations API requires a major; class and ethnicity are optional.
  // Step 2 saves these to the account together with the interests.
  function handleNext() {
    saveProfileDraft({
      major,
      class_year: classification || null,
      ethnicity: ethnicity && ethnicity !== "Prefer not to say" ? ethnicity : null,
    });
    setTransitioning(true);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-[#1A1A1A] px-6">
      <AmbientBackground />
      <Image
        src={connectXLogo}
        alt=""
        aria-hidden
        priority
        className="pointer-events-none absolute top-1/2 right-[8%] w-[480px] max-w-none -translate-y-1/2 rotate-12 opacity-10 select-none"
      />
      <Fade onComplete={() => setRevealed(true)} />
      {transitioning && (
        <ChainCover onComplete={() => router.push("/interestChecklist")} />
      )}

      <motion.div
        className="flex w-full max-w-3xl flex-col items-center gap-12 py-24"
        initial={{ opacity: 0, y: 8 }}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-heading text-center text-3xl font-extrabold tracking-tight text-[#EF4444]">
          {t.onboarding.heading}
        </h1>

        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <div className="w-full sm:max-w-xs">
              <Dropdown
                value={major}
                onChange={setMajor}
                options={MAJORS}
                getLabel={(value) => labelFor(t.options.majors, value)}
                placeholder={t.onboarding.majorPlaceholder}
                searchable
                allowCustom
              />
            </div>

            <div className="w-full sm:max-w-xs">
              <Dropdown
                value={classification}
                onChange={setClassification}
                options={CLASS_YEARS}
                getLabel={(value) => labelFor(t.options.classYears, value)}
                placeholder={t.onboarding.classPlaceholder}
              />
            </div>
          </div>

          <div className="w-full sm:max-w-xs">
            <div className="mb-2 text-sm text-[#8C8785]">
              {t.onboarding.ethnicityLabel}{" "}
              <span className="text-[#8C8785]/70">{t.onboarding.optional}</span>
            </div>
            <Dropdown
              value={ethnicity}
              onChange={setEthnicity}
              options={ETHNICITIES}
              getLabel={(value) => labelFor(t.options.ethnicities, value)}
              placeholder={t.onboarding.ethnicityPlaceholder}
            />
          </div>

          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!major}
            whileHover={major ? { scale: 1.08 } : undefined}
            whileTap={major ? { scale: 0.96 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-black px-6 py-3 text-[#DC143C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.common.next}
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

        <StepIndicator active={1} />
      </motion.div>
    </div>
  );
}
