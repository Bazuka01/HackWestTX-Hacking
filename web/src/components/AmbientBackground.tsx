// Decorative ambient layer: a faint grid, glowing crimson auras, and thin
// circuit-trace accent lines. Sits behind page content on the dark pages.
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full">
          <defs>
            <pattern
              id="ambient-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#6B7280"
                strokeDasharray="2 4"
                strokeWidth="0.75"
              />
              <circle cx="48" cy="0" r="1.5" fill="#DC143C" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ambient-grid)" />
        </svg>
      </div>

      <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-[#DC143C] opacity-20 blur-[140px] mix-blend-screen" />
      <div className="absolute right-[-10%] -bottom-40 h-[720px] w-[720px] rounded-full bg-[#EF4444] opacity-15 blur-[160px] mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DC143C] opacity-10 blur-[120px]" />

      <div className="absolute top-12 left-1/4 h-px w-72 bg-gradient-to-r from-transparent via-[#DC143C] to-transparent opacity-40" />
      <div className="absolute right-1/3 bottom-16 h-px w-96 bg-gradient-to-r from-transparent via-[#6B7280] to-transparent opacity-30" />
    </div>
  );
}
