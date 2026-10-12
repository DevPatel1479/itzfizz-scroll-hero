import React from 'react';

/** One impact metric. The number is counted up by the hero's GSAP intro. */
export default function StatCard({ value, description }) {
  return (
    <article className="stat-card" data-stat aria-label={`${value}% ${description}`}>
      <div className="flex items-baseline gap-1" aria-hidden="true">
        <span
          data-count={value}
          className="text-4xl font-bold leading-none tracking-tight tabular-nums md:text-5xl lg:text-6xl"
        >
          0
        </span>
        <span className="text-xl font-semibold text-lime md:text-2xl lg:text-3xl">%</span>
      </div>
      <p className="mt-2 text-xs leading-snug text-zinc-400 md:mt-3 md:text-sm">{description}</p>
    </article>
  );
}