import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

const CONFETTI_COLORS = ['#fb7185', '#f59e0b', '#22c55e', '#38bdf8', '#a78bfa', '#facc15'];
const CONFETTI_PIECE_COUNT = 260;

const buildConfettiPieces = (burstId) =>
  Array.from({ length: CONFETTI_PIECE_COUNT }, (_, index) => {
    const startLeft = (index * 37 + burstId * 13) % 100;
    const startTop = -22 - ((index * 11 + burstId * 3) % 58);
    const drift = ((index * 29 + burstId * 17) % 88) - 44;
    const midDrift = ((index * 43 + burstId * 23) % 54) - 27;
    const flutter = ((index * 17 + burstId * 5) % 24) - 12;
    const fallDistance = 126 + ((index * 7 + burstId * 5) % 54);
    const spin = 520 + ((index * 41 + burstId * 19) % 980);

    return {
      id: `${burstId}-${index}`,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      size: 5 + ((index * 5) % 11),
      delay: (index % 42) * 22,
      duration: 2400 + ((index * 31 + burstId * 9) % 1600),
      rotate: (index * 47) % 360,
      startLeft,
      startTop,
      drift,
      midDrift,
      flutter,
      fallDistance,
      spin,
      shapeClass: index % 3 === 0 ? 'rounded-full' : index % 3 === 1 ? 'rounded-sm' : 'rounded-[2px]',
    };
  });

const BirthdayConfettiPopper = ({ burstId = 0, active = false }) => {
  const [visibleBurst, setVisibleBurst] = useState(0);
  const pieces = useMemo(() => buildConfettiPieces(visibleBurst), [visibleBurst]);

  useEffect(() => {
    if (!active || burstId <= 0) return undefined;

    setVisibleBurst(burstId);
    const timer = window.setTimeout(() => {
      setVisibleBurst(0);
    }, 4600);

    return () => window.clearTimeout(timer);
  }, [active, burstId]);

  if (!active || visibleBurst <= 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-24 h-0 w-0 -translate-x-1/2 sm:top-28">
        <div className="birthday-confetti-flash absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-amber-500 shadow-xl ring-1 ring-amber-200">
          <Sparkles className="h-7 w-7" />
        </div>
      </div>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={`birthday-confetti-piece absolute ${piece.shapeClass}`}
          style={{
            '--confetti-x': `${piece.drift}vw`,
            '--confetti-mid-x': `${piece.midDrift}vw`,
            '--confetti-flutter': `${piece.flutter}vw`,
            '--confetti-y': `${piece.fallDistance}vh`,
            '--confetti-rotate': `${piece.rotate}deg`,
            '--confetti-spin': `${piece.spin}deg`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
            backgroundColor: piece.color,
            height: `${piece.size}px`,
            left: `${piece.startLeft}vw`,
            top: `${piece.startTop}vh`,
            width: `${piece.size * (indexIsRibbon(piece.id) ? 1.7 : 0.82)}px`,
          }}
        />
      ))}
    </div>
  );
};

const indexIsRibbon = (id) => Number(String(id).split('-').pop() || 0) % 4 === 0;

export default BirthdayConfettiPopper;
