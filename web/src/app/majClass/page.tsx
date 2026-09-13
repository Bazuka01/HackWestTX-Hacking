"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Fade } from "@/components/effects/Fade";
import { ChainCover } from "@/components/effects/ChainCover";
import { Dropdown } from "@/components/Dropdown";
import { StepIndicator } from "@/components/StepIndicator";

const MAJORS = [
  "Computer Science",
  "Business Administration",
  "Biology",
  "Psychology",
  "Nursing",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Economics",
  "Finance",
  "Accounting",
  "Marketing",
  "Communications",
  "English",
  "Political Science",
  "Sociology",
  "Criminal Justice",
  "Education",
  "Kinesiology",
  "Biomedical Engineering",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Environmental Science",
  "History",
  "Graphic Design",
  "Architecture",
  "Public Health",
  "International Relations",
  "Journalism",
  "Music",
  "Art",
  "Philosophy",
  "Anthropology",
  "Data Science",
  "Information Technology",
  "Chemical Engineering",
];

const CLASSIFICATIONS = ["Freshman", "Sophomore", "Junior", "Senior"];

const ETHNICITIES = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Two or More Races",
  "Prefer not to say",
];

export default function MajClassPage() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [major, setMajor] = useState("");
  const [classification, setClassification] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-orange-200 px-6">
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
        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-600">
          Help Us Connect You
        </h1>

        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <div className="w-full sm:max-w-xs">
              <Dropdown
                value={major}
                onChange={setMajor}
                options={MAJORS}
                placeholder="Select your major"
                searchable
                allowCustom
              />
            </div>

            <div className="w-full sm:max-w-xs">
              <Dropdown
                value={classification}
                onChange={setClassification}
                options={CLASSIFICATIONS}
                placeholder="Classification"
              />
            </div>
          </div>

          <div className="w-full sm:max-w-xs">
            <div className="mb-2 text-sm text-slate-500/50">
              Ethnicity{" "}
              <span className="text-slate-500/30">(not required)</span>
            </div>
            <Dropdown
              value={ethnicity}
              onChange={setEthnicity}
              options={ETHNICITIES}
              placeholder="Select ethnicity"
            />
          </div>

          <motion.button
            type="button"
            onClick={() => setTransitioning(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-slate-500 px-6 py-3 text-orange-50"
          >
            Next
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
