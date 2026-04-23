import React, { useEffect, useMemo, useState } from 'react';
import { Cake, Sparkles } from 'lucide-react';

const BIRTHDAY_BANNER_PAPERS = [
  { left: 58, delay: 0, duration: 4.1, size: 9, color: '#ffffffcc', drift: 18, rotate: 28 },
  { left: 66, delay: 0.45, duration: 4.7, size: 7, color: '#fef3c7dd', drift: -14, rotate: -22 },
  { left: 74, delay: 0.9, duration: 4.3, size: 10, color: '#e0f2fedd', drift: 16, rotate: 42 },
  { left: 82, delay: 0.2, duration: 5.1, size: 8, color: '#fce7f3dd', drift: -18, rotate: -38 },
  { left: 91, delay: 1.1, duration: 4.6, size: 7, color: '#dcfce7dd', drift: 13, rotate: 24 },
  { left: 62, delay: 1.5, duration: 5.2, size: 8, color: '#ffffffbb', drift: -20, rotate: -32 },
  { left: 70, delay: 1.9, duration: 4.4, size: 9, color: '#fde68add', drift: 15, rotate: 36 },
  { left: 78, delay: 2.2, duration: 5.4, size: 7, color: '#bae6fddd', drift: -16, rotate: -24 },
  { left: 87, delay: 2.7, duration: 4.8, size: 10, color: '#ffffffcc', drift: 17, rotate: 34 },
  { left: 95, delay: 3.1, duration: 5.5, size: 8, color: '#fbcfe8dd', drift: -12, rotate: -28 },
];

export const getLocalBirthdayParts = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return {
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }

  const raw = String(value || '').trim();
  if (!raw) return null;

  const dateOnlyMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dateOnlyMatch) {
    return {
      month: Number(dateOnlyMatch[2]),
      day: Number(dateOnlyMatch[3]),
    };
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  };
};

export const isBirthdayToday = (dob, now = new Date()) => {
  const birthday = getLocalBirthdayParts(dob);
  if (!birthday) return false;

  return birthday.month === now.getMonth() + 1 && birthday.day === now.getDate();
};

export const getNextMidnightDelay = (now = new Date()) => {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
};

const getDateLabel = (now = new Date()) =>
  now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

const BirthdayWelcomeBanner = ({
  user,
  name,
  fallbackName = 'there',
  normalTitle,
  normalDescription = "Here's your overview for today",
  birthdayTitle,
  birthdayDescription = 'Your dashboard is celebrating with you today. Wishing you a bright year ahead.',
  showDate = true,
  className = '',
}) => {
  const [today, setToday] = useState(() => new Date());
  const displayName = String(name || user?.name || fallbackName || 'there').trim();
  const birthdayActive = useMemo(() => isBirthdayToday(user?.dob, today), [user?.dob, today]);
  const dateLabel = useMemo(() => getDateLabel(today), [today]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToday(new Date());
    }, getNextMidnightDelay(today));

    return () => window.clearTimeout(timer);
  }, [today]);

  if (birthdayActive) {
    return (
      <div className={`birthday-banner-celebration relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-rose-500 via-amber-400 to-sky-500 p-6 shadow-sm ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.36),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.28),transparent_20%),radial-gradient(circle_at_58%_88%,rgba(255,255,255,0.24),transparent_24%)]" />
        <div className="birthday-banner-sheen absolute inset-0" />
        <div className="birthday-banner-float birthday-banner-float-1 absolute left-10 top-3 h-3 w-3 rotate-12 rounded-sm bg-white/75" />
        <div className="birthday-banner-float birthday-banner-float-2 absolute right-24 top-7 h-2.5 w-5 -rotate-12 rounded-full bg-white/65" />
        <div className="birthday-banner-float birthday-banner-float-3 absolute bottom-5 left-1/3 h-2 w-2 rounded-full bg-white/75" />
        <div className="birthday-banner-float birthday-banner-float-4 absolute bottom-8 right-10 h-3 w-3 rotate-45 rounded-sm bg-white/60" />
        <div className="birthday-banner-paper-rain absolute inset-0" aria-hidden="true">
          {BIRTHDAY_BANNER_PAPERS.map((paper, index) => (
            <span
              key={`${paper.left}-${paper.delay}`}
              className="birthday-banner-paper absolute rounded-[2px]"
              style={{
                '--paper-drift': `${paper.drift}px`,
                '--paper-rotate': `${paper.rotate}deg`,
                animationDelay: `${paper.delay}s`,
                animationDuration: `${paper.duration}s`,
                backgroundColor: paper.color,
                height: `${paper.size}px`,
                left: `${paper.left}%`,
                top: '-18px',
                width: `${paper.size * (index % 3 === 0 ? 1.6 : 0.9)}px`,
              }}
            />
          ))}
        </div>
        <div className="birthday-banner-cake-scene pointer-events-none absolute bottom-3 right-8 hidden h-28 w-40 md:block" aria-hidden="true">
          <div className="birthday-banner-candle birthday-banner-candle-1">
            <span className="birthday-banner-flame" />
          </div>
          <div className="birthday-banner-candle birthday-banner-candle-2">
            <span className="birthday-banner-flame" />
          </div>
          <div className="birthday-banner-candle birthday-banner-candle-3">
            <span className="birthday-banner-flame" />
          </div>
          <div className="birthday-banner-cake-top" />
          <div className="birthday-banner-cake-icing" />
          <div className="birthday-banner-cake-body">
            <span />
            <span />
            <span />
          </div>
          <div className="birthday-banner-cake-plate" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="birthday-cake-pulse flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-slate-950 ring-1 ring-white/30 backdrop-blur">
              <Cake className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="birthday-badge-spark mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-slate-950 ring-1 ring-white/25">
                <Sparkles className="h-3.5 w-3.5" />
                Birthday Today
              </div>
              <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                {birthdayTitle || `Happy Birthday, ${displayName}!`}
              </h2>
              <p className="mt-1 max-w-3xl text-sm font-medium text-slate-900">
                {birthdayDescription}
              </p>
            </div>
          </div>

          {showDate ? (
            <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-slate-950 ring-1 ring-white/25 backdrop-blur">
              {dateLabel}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-6 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {normalTitle || `Welcome back, ${displayName}!`}
          </h2>
          <p className="mt-1 text-sm text-gray-300">{normalDescription}</p>
        </div>
        {showDate ? (
          <div className="hidden sm:block">
            <span className="px-3 py-1 text-xs text-white rounded-full bg-white/20">
              {dateLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BirthdayWelcomeBanner;
