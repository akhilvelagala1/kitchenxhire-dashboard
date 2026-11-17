/** Decorative peach wave at the bottom of the hire login card (reference modal). */
export function AuthLoginWave() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[88px]">
      <svg
        viewBox="0 0 480 88"
        preserveAspectRatio="none"
        className="h-full w-full text-brand-50"
        role="presentation"
      >
        <path fill="currentColor" d="M0 52 C120 88 240 28 360 52 S480 72 480 72 V88 H0 Z" />
        <path
          fill="currentColor"
          fillOpacity={0.55}
          d="M0 64 C100 44 220 78 340 58 S480 80 480 80 V88 H0 Z"
        />
      </svg>
    </div>
  );
}
