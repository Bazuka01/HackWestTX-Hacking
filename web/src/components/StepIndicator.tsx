export function StepIndicator({ active }: { active: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2].map((step) => (
        <div
          key={step}
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
            step === active
              ? "border-[#DC143C] bg-[#DC143C] text-white"
              : "border-[#F3A5A5]/25 text-[#F3A5A5]/50"
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
