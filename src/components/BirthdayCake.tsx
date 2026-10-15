/** Hand-built CSS/SVG birthday cake used on the birthday reveal screen. */
export default function BirthdayCake({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 180"
      className={className}
      role="img"
      aria-label="A birthday cake with lit candles"
    >
      <defs>
        <linearGradient id="cakeTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#F0CBD9" />
        </linearGradient>
        <linearGradient id="cakeMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3CBD9" />
          <stop offset="100%" stopColor="#D7A0A7" />
        </linearGradient>
        <linearGradient id="cakeBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D1476C" />
          <stop offset="100%" stopColor="#A31F42" />
        </linearGradient>
        <radialGradient id="flame" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFDF6" />
          <stop offset="45%" stopColor="#FFD27F" />
          <stop offset="100%" stopColor="#F08A3C" />
        </radialGradient>
      </defs>

      {/* Plate */}
      <ellipse cx="110" cy="164" rx="86" ry="11" fill="#4A1025" opacity="0.18" />

      {/* Base tier */}
      <rect x="36" y="112" width="148" height="46" rx="10" fill="url(#cakeBase)" />
      <rect x="36" y="112" width="148" height="8" rx="4" fill="#F8DCE5" opacity="0.75" />

      {/* Middle tier */}
      <rect x="54" y="80" width="112" height="36" rx="9" fill="url(#cakeMid)" />

      {/* Top tier */}
      <rect x="72" y="54" width="76" height="30" rx="8" fill="url(#cakeTop)" />

      {/* Icing drips */}
      <g fill="#FFF8F0" opacity="0.92">
        <path d="M54 116c6 0 6 9 12 9s6-9 12-9 6 9 12 9 6-9 12-9 6 9 12 9 6-9 12-9 6 9 12 9 6-9 12-9v9c-6 0-6 9-12 9s-6-9-12-9-6 9-12 9-6-9-12-9-6 9-12 9-6-9-12-9-6 9-12 9Z" />
        <path d="M72 84c4 0 4 6 8 6s4-6 8-6 4 6 8 6 4-6 8-6 4 6 8 6 4-6 8-6 4 6 8 6 4-6 8-6 4 6 8 6v7c-4 0-4 6-8 6s-4-6-8-6-4 6-8 6-4-6-8-6-4 6-8 6-4-6-8-6-4 6-8 6-4-6-8-6-4 6-8 6Z" />
      </g>

      {/* Candles */}
      {[92, 110, 128].map((x, i) => (
        <g key={x}>
          <rect x={x - 2.5} y={26} width="5" height="30" rx="2.5" fill="#FFF8F0" />
          <rect
            x={x - 2.5}
            y={26 + (i % 2) * 6}
            width="5"
            height="30"
            rx="2.5"
            fill="#B5284D"
            opacity="0.5"
            transform={`rotate(${i % 2 === 0 ? 6 : -6} ${x} 40)`}
          />
        </g>
      ))}

      {/* Flames */}
      {[92, 110, 128].map((x, i) => (
        <g key={`f-${x}`}>
          <ellipse
            cx={x + (i % 2 === 0 ? 0.8 : -0.8)}
            cy={16 - (i % 2) * 6}
            rx="5"
            ry="9"
            fill="url(#flame)"
          />
          <ellipse
            cx={x + (i % 2 === 0 ? 0.8 : -0.8)}
            cy={14 - (i % 2) * 6}
            rx="9"
            ry="13"
            fill="url(#flame)"
            opacity="0.22"
          />
        </g>
      ))}
    </svg>
  )
}