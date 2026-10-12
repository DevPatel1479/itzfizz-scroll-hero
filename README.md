# ITZFIZZ Digital — Scroll-Driven Hero

**Live Demo:** [View the deployed website](https://devpatel1479.github.io/itzfizz-scroll-hero/)

A responsive recreation of the ITZFIZZ scroll-driven hero assignment, built with React, Vite, Tailwind CSS, and GSAP ScrollTrigger. A letter-spaced "WELCOME ITZFIZZ" headline sits above a car that is driven across the screen by page scroll. As the car moves, a lime trail follows it, the headline letters light up as it passes, and four impact statistics appear one by one.



## Features

- **Hero on the first screen:** a pinned, full-viewport stage with a letter-spaced headline, the car on a road line, and the impact stats below.
- **Load animation (GSAP timeline):** the top bar, headline letters (staggered fade + upward movement), subtitle, and car ease in on page load. The stats stay hidden until the user scrolls.
- **Scroll-scrubbed car:** horizontal car movement is tied to scroll progress with ScrollTrigger (`scrub: 1`), so it is interpolated and smoothed rather than autoplayed. Scrolling back up reverses it.
- **Scroll-driven stats:** each of the four stat cards fades and slides in, and counts up from 0, at its own point in the car's journey. They appear strictly one by one and reverse when scrolling back.
- **Car-linked details:** the lime trail follows the car's leading edge, and each headline letter lights up when the car's nose passes it.
- **Performance:** only `transform` and `opacity` are animated. Letter positions are measured once on load/resize (never inside the scroll loop), and the letter highlight toggles a class only when the lit count changes.
- **Responsive and accessible:** layouts for mobile (stats in a 2×2 grid) up to large screens, scroll refresh on resize, and `prefers-reduced-motion` support (static final state).
- A short closing section lets the hero unpin naturally at the end of the scroll.
- GitHub Pages deployment workflow included.

> The four percentage metrics are illustrative and adapted from the reference concept. They should not be presented as independently verified client results.

## Run locally



```bash
npm install
npm run dev
```



## Production build

```bash
npm run build
npm run preview
```

Vite writes the static site to `dist/`.

## Tuning the animation

All values are in `src/App.jsx`:

| Setting | What it controls |
|---|---|
| `scrub: 1` | Smoothing delay between scroll and car motion (higher = floatier) |
| `h-[300svh]` on the story section | Total scroll distance for the animation |
| `startX` / `endX` | Where the car starts and ends horizontally |
| `STARTS` | Point in the car's journey (0–1) where each stat begins to appear |
| `REVEAL` | How much of the journey each stat takes to fully appear |

If the wheels float above or sit below the road line, adjust `bottom-[14%]` (road) and `bottom-[calc(14%-6px)]` (car) in the same file.


## Project structure

```text
itzfizz-scroll-hero/
├── .github/workflows/deploy.yml
├── public/
│   ├── assets/itzfizz-coupe.webp
│   └── favicon.svg
├── src/
│   ├── components/StatCard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Tech stack

- React + Vite
- Tailwind CSS
- GSAP + ScrollTrigger
- Semantic HTML, responsive CSS, and vanilla JavaScript logic