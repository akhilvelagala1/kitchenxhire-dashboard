/** Chef hat + clipboard line illustration (Post a Job reference). */
export function RecruiterPostJobIllustration() {
  const stroke = '#FF4F18';
  const strokeDark = '#9E350B';

  return (
    <svg
      viewBox="0 0 300 230"
      className="mx-auto h-[190px] w-full max-w-[250px] object-contain min-[1024px]:h-[215px] min-[1024px]:max-w-[270px]"
      role="img"
      aria-label=""
    >
      <ellipse cx="150" cy="208" rx="108" ry="16" fill={stroke} opacity="0.07" />
      <path
        d="M58 78 Q74 62 92 78"
        fill="none"
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M228 68 Q246 50 268 68"
        fill="none"
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M238 92 L252 108"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />

      <rect
        x="88"
        y="72"
        width="124"
        height="148"
        rx="16"
        fill="#fff"
        stroke="#FFD4C2"
        strokeWidth="2.5"
      />
      <rect x="126" y="56" width="48" height="22" rx="6" fill={stroke} />

      <path
        d="M112 44 C112 30 168 30 168 44 L168 56 L112 56 Z"
        fill="#fff"
        stroke={strokeDark}
        strokeWidth="2.5"
      />
      <path
        d="M122 44 C122 36 158 36 158 44"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M118 38 C130 32 150 32 162 38"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {[0, 1, 2].map((row) => {
        const y = 98 + row * 32;
        return (
          <g key={row}>
            <rect x="104" y={y} width="24" height="24" rx="6" fill={stroke} />
            <path
              d={`M109 ${y + 12} L113 ${y + 16} L123 ${y + 8}`}
              stroke="#fff"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="136"
              y={y + 8}
              width={row === 0 ? 62 : row === 1 ? 54 : 58}
              height="9"
              rx="4.5"
              fill="#FFE8DC"
            />
          </g>
        );
      })}

      <g transform="translate(196 152) rotate(-38)">
        <path d="M0 0 L52 52 L38 68 L-14 16 Z" fill={stroke} />
        <rect x="8" y="10" width="34" height="8" rx="2" fill="#fff" />
      </g>
    </svg>
  );
}
