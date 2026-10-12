import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StatCard from './components/StatCard.jsx';

gsap.registerPlugin(ScrollTrigger);
// Mobile URL-bar show/hide fires resize events; ignoring them avoids mid-scroll refreshes (jank).
ScrollTrigger.config({ ignoreMobileResize: true });

const easeOut = gsap.parseEase('power2.out');

const stats = [
  { value: 58, description: 'Increase in pick-up point use' },
  { value: 23, description: 'Decrease in customer phone calls' },
  { value: 27, description: 'Increase in convenient collections' },
  { value: 40, description: 'Decrease in time spent waiting' },
];

const WORDS = ['WELCOME', 'ITZFIZZ'];

export default function App() {
  const storyRef = useRef(null);
  const stageRef = useRef(null);
  const carRef = useRef(null);
  const trailRef = useRef(null);

  useLayoutEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    const car = carRef.current;
    const trail = trailRef.current;
    if (!story || !stage || !car || !trail) return undefined;

    let cancelled = false;
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray('[data-letter]');
      const cards = gsap.utils.toArray('[data-stat]');
      const counters = gsap.utils.toArray('[data-count]');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---------- 1. Intro (starts once the car image is decoded, so it never stutters) ---------- */
      let intro = null;
      if (!reduced) {
        intro = gsap
          .timeline({ paused: true, defaults: { ease: 'power3.out' } })
          .from('[data-nav]', { y: -16, autoAlpha: 0, duration: 0.8 }, 0)
          .from(letters, { y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.05 }, 0.15)
          .from('[data-sub]', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.9)
          .from('[data-car-img]', { autoAlpha: 0, y: 24, duration: 1, ease: 'power2.out' }, 0.5)
          .from('[data-hint]', { autoAlpha: 0, duration: 0.8 }, 1.3);
      } else {
        counters.forEach((el) => { el.textContent = el.dataset.count; });
      }

      /* ---------- 2. Scroll-driven car ---------- */
      let carW = 1;
      let centers = [];
      let litCount = -1;
      // Car travel range (shared by the tween and the stat reveal logic)
      const startX = () => -carW * 0.35;
      const endX = () => stage.clientWidth - carW * 0.82;
      // Stat i begins at STARTS[i] of the car's journey and finishes REVEAL later (0..1 of travel)
      const STARTS = [0.1, 0.32, 0.54, 0.76];
      const REVEAL = 0.18;

      // One debounced refresh instead of several back-to-back ones (image, fonts, resize).
      const queueRefresh = gsap.delayedCall(0.15, () => ScrollTrigger.refresh()).pause();
      const requestRefresh = () => queueRefresh.restart(true);

      // Fast setters + change detection: no object allocation / parsing inside the scroll loop.
      const setTrail = gsap.quickSetter(trail, 'scaleX');
      const setCardY = cards.map((c) => gsap.quickSetter(c, 'y', 'px'));
      const setCardO = cards.map((c) => gsap.quickSetter(c, 'opacity'));
      const lastP = cards.map(() => -1);

      // Measured only on load/refresh – never inside the scroll loop (no layout thrash).
      const measure = () => {
        carW = car.offsetWidth || 1;
        const stageLeft = stage.getBoundingClientRect().left;
        const raw = letters.map((l) => {
          const r = l.getBoundingClientRect();
          return r.left - stageLeft + r.width / 2;
        });
        const first = raw[0];
        const span = (raw[raw.length - 1] - first) || 1;
        centers = raw.map((c) => (c - first) / span); // 0..1 across the headline (keeps the word gap)
      };

      // Runs on every smoothed frame: transforms + a class toggle only when the count changes.
      const update = (xOverride) => {
        const x = typeof xOverride === 'number' ? xOverride : Number(gsap.getProperty(car, 'x')) || 0;
        const front = x + carW * 0.93; // nose of the car
        setTrail(gsap.utils.clamp(0, 1, front / stage.clientWidth));

        // Travel progress 0..1: identical on every screen size, so nothing is lit at page load.
        const t = gsap.utils.clamp(0, 1, (x - startX()) / (endX() - startX() || 1));

        // Headline letters light up in reading order as the car travels.
        const LIT_START = 0.06;
        const LIT_SPAN = 0.84;
        let n = 0;
        while (n < centers.length && t >= LIT_START + centers[n] * LIT_SPAN && t > LIT_START) n += 1;
        if (n !== litCount) {
          litCount = n;
          letters.forEach((l, i) => l.classList.toggle('is-lit', i < n));
        }

        // Stats: revealed one by one by the car's travel progress (0 at page load, so none show yet).
        // Pure function of car position, so it reverses when scrolling back up.
        cards.forEach((card, i) => {
          const p = gsap.utils.clamp(0, 1, (t - (STARTS[i] ?? 0.1 + i * 0.22)) / REVEAL);
          if (p === lastP[i]) return; // nothing changed for this card
          lastP[i] = p;
          const eased = easeOut(p);
          setCardO[i](eased);
          setCardY[i]((1 - eased) * 40);
          const v = Math.round(Number(counters[i].dataset.count) * eased);
          if (counters[i].textContent !== String(v)) counters[i].textContent = v;
        });
      };

      gsap.set(trail, { transformOrigin: 'left center', scaleX: 0 });
      if (!reduced) gsap.set(cards, { opacity: 0, y: 40 });

      if (!reduced) {
        gsap.fromTo(
          car,
          { x: startX },
          {
            x: endX,
            ease: 'none',
            scrollTrigger: {
              trigger: story,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.8, // smoothing/interpolation between scroll and motion
              invalidateOnRefresh: true,
              onRefresh: (self) => { measure(); update(startX() + self.progress * (endX() - startX())); },
            },
            onUpdate: () => update(),
          },
        );
      } else {
        measure();
        gsap.set(car, { x: stage.clientWidth * 0.3 });
        letters.forEach((l) => l.classList.add('is-lit'));
        gsap.set(trail, { scaleX: 0.6 });
      }

      // Decode the image off the main thread, then start the intro and re-measure once.
      const img = car.querySelector('img');
      const ready = () => {
        if (cancelled) return;
        intro?.play();
        requestRefresh();
      };
      if (img?.decode) img.decode().then(ready, ready);
      else ready();
      document.fonts?.ready.then(() => { if (!cancelled) requestRefresh(); });
    }, story.parentElement);

    return () => { cancelled = true; ctx.revert(); };
  }, []);

  return (
    <main>
      <section ref={storyRef} id="home" className="relative h-[300svh]" aria-label="Scroll-driven hero">
        <div
          ref={stageRef}
          className="sticky top-0 flex h-svh min-h-[560px] flex-col overflow-hidden bg-ink"
        >
          <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute left-1/2 top-[38%] h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(70,110,60,0.18),transparent_65%)]"
            aria-hidden="true"
          />

          {/* Top bar */}
          <header data-nav className="relative z-20 flex items-center justify-between px-5 py-5 md:px-[6vw] md:py-7">
            <a href="#home" className="flex items-center gap-2.5 text-sm font-extrabold tracking-wider">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime text-xs font-extrabold text-ink">IF</span>
              ITZFIZZ
            </a>
            
          </header>

          {/* Headline */}
          <div className="relative z-10 mt-[3svh] px-4 text-center md:mt-[5svh]">
            <h1
              aria-label="Welcome ITZFIZZ"
              className="flex items-center justify-center gap-[0.9em] text-[clamp(1.05rem,4.4vw,4rem)] font-extrabold leading-none"
            >
              {WORDS.map((word) => (
                <span key={word} className="flex gap-[0.3em]" aria-hidden="true">
                  {word.split('').map((ch, i) => (
                    <span key={`${word}-${i}`} data-letter className="hero-letter">{ch}</span>
                  ))}
                </span>
              ))}
            </h1>
            <p data-sub className="mt-4 text-xs text-zinc-400 md:text-sm">
              Digital experiences that move people forward.
            </p>
          </div>

          {/* Road + car (flexible zone between headline and stats) */}
          <div className="relative z-0 min-h-[110px] flex-1">
            <div className="absolute inset-x-0 bottom-[14%] h-px bg-white/15" aria-hidden="true">
              <div ref={trailRef} className="h-[3px] w-full -translate-y-px bg-lime shadow-[0_0_18px_rgba(200,255,77,0.45)] will-change-transform" />
            </div>
            <div ref={carRef} className="absolute bottom-[calc(14%-6px)] left-0 will-change-transform" aria-hidden="true">
              <div className="absolute -bottom-1 left-[8%] right-[6%] h-[12%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65),transparent_70%)]" />
              <img
                data-car-img
                src={`${import.meta.env.BASE_URL}assets/itzfizz-coupe.webp`}
                alt=""
                fetchPriority="high"
                decoding="async"
                draggable="false"
                className="block h-[clamp(90px,24svh,260px)] w-auto max-w-none select-none"
              />
            </div>
          </div>

          {/* Stats (below the headline and car) */}
          <div className="relative z-10 grid grid-cols-2 gap-3 px-5 pb-8 md:grid-cols-4 md:gap-5 md:px-[6vw] md:pb-10">
            {stats.map((s) => <StatCard key={s.description} {...s} />)}
          </div>

          <p data-hint className="absolute bottom-2.5 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] text-zinc-500">
            SCROLL
          </p>
        </div>
      </section>

      <section className="grid min-h-[60svh] place-items-center bg-[#0b130e] px-6 py-24 text-center">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Good design does the moving.</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-zinc-400">
            Thoughtful design and smart development, built for every screen.
          </p>
        </div>
      </section>
    </main>
  );
}