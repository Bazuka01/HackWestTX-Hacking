export function StepIndicator({ active }: { active: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2].map((step) => (
        <div
          key={step}
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
            step === active
              ? "border-slate-500 bg-slate-500 text-orange-50"
              : "border-slate-500/20 text-slate-500/40"
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
