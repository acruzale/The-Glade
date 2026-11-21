// The Glade — animals that visit the painting.
// Each animal is a small painted-style drawing. Positions and when they start visiting are set in glade-config.js.

import { toScreen } from './geometry.js';

const SPRITES = {
  // width ÷ height, then the drawing (feet at the bottom centre)
  deer: [1.15, `<svg viewBox="0 0 115 100">
    <defs><linearGradient id="dr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07c50"/><stop offset="1" stop-color="#7f5330"/></linearGradient></defs>
    <ellipse cx="66" cy="97" rx="32" ry="2.6" fill="#1d2a14" opacity=".25"/>
    <g stroke="#5e3e24" stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M48 56 L46 74 L48 96"/><path d="M56 57 L57 75 L55 96" stroke="#4e321c"/>
      <path d="M80 55 L84 72 L81 96"/><path d="M88 54 L91 72 L90 96" stroke="#4e321c"/>
    </g>
    <path d="M95 40 q9 -1 8 6 q-4 2 -8 -2z" fill="#f2ead9"/>
    <path d="M40 46 C42 34 60 32 74 33 C88 33 98 36 98 46 C98 56 86 60 70 60 C54 60 40 58 40 46Z" fill="url(#dr)"/>
    <path d="M48 55 C58 59 78 59 90 54" stroke="#e2cfac" stroke-width="3" fill="none" opacity=".6"/>
    <g class="graze" style="transform-origin:46px 42px">
      <path d="M42 44 C40 34 36 26 30 19 L38 14 C44 22 50 32 54 40Z" fill="url(#dr)"/>
      <path d="M38 16 C34 10 26 8 20 11 C16 13 14 17 17 20 C22 22 30 22 36 22Z" fill="#94643c"/>
      <ellipse cx="16.5" cy="18.5" rx="2.6" ry="2.1" fill="#2a1d14"/>
      <ellipse cx="38" cy="7" rx="6.5" ry="2.6" fill="#7f5330" transform="rotate(-35 38 7)"/>
      <ellipse cx="38" cy="7" rx="4" ry="1.2" fill="#d9b9a2" transform="rotate(-35 38 7)"/>
      <circle cx="27" cy="13.5" r="1.5" fill="#1a120c"/>
      <path d="M30 20 q4 2 7 0" stroke="#f2ead9" stroke-width="1.6" fill="none" opacity=".7"/>
    </g></svg>`],

  heron: [0.6, `<svg viewBox="0 0 60 100">
    <ellipse cx="30" cy="98" rx="16" ry="2.4" fill="#1d2a14" opacity=".25"/>
    <path d="M28 98 L28 66 M34 98 L33 66" stroke="#6f6a5e" stroke-width="2"/>
    <path d="M40 52 L56 60 L42 58Z" fill="#6f777a"/>
    <ellipse cx="34" cy="52" rx="15" ry="11" fill="#9aa1a3"/>
    <path d="M30 50 C40 52 48 56 52 60" stroke="#7d8588" stroke-width="3" fill="none" opacity=".7"/>
    <g class="heron-head" style="transform-origin:24px 46px">
      <path d="M24 46 Q12 32 20 18" stroke="#c9cdcd" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="20" cy="15" rx="5" ry="4.2" fill="#eceeee"/>
      <path d="M16 14 L2 16.5 L16 17Z" fill="#d9a33a"/>
      <path d="M21 12 L34 9" stroke="#2a2a2a" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="18" cy="14" r="1" fill="#1e1e1e"/>
    </g></svg>`],

  robin: [1.15, `<svg viewBox="0 0 46 40">
    <ellipse cx="22" cy="39" rx="10" ry="1.4" fill="#1d2a14" opacity=".25"/>
    <g class="hop">
      <path d="M20 36 L19 39 M25 36 L26 39" stroke="#5a4636" stroke-width="1.4"/>
      <path d="M30 24 L43 30 L40 33 L28 30Z" fill="#6e5a3c"/>
      <ellipse cx="24" cy="26" rx="12" ry="10" fill="#8a7558"/>
      <ellipse cx="19" cy="28" rx="7.5" ry="7.5" fill="#d9824a"/>
      <path d="M22 21 q8 -2 12 5 q-6 3 -12 1z" fill="#75613f"/>
      <circle cx="14" cy="16" r="6.5" fill="#8a7558"/>
      <circle cx="12" cy="18" r="4" fill="#d9824a"/>
      <circle cx="12.5" cy="14.5" r="1.3" fill="#1a1a1a"/><circle cx="12.9" cy="14.1" r=".4" fill="#fff"/>
      <path d="M8 15 L3.5 16.4 L8 17.4Z" fill="#3d332a"/>
    </g></svg>`],

  squirrel: [0.95, `<svg viewBox="0 0 60 64">
    <ellipse cx="28" cy="62" rx="16" ry="2" fill="#1d2a14" opacity=".25"/>
    <g class="tail" style="transform-origin:38px 52px"><path d="M36 54 C56 52 60 30 50 16 C44 8 34 10 36 18 C44 22 46 34 38 42Z" fill="#a85a28"/><path d="M40 46 C52 40 54 26 47 18" stroke="#c97a42" stroke-width="3" fill="none" opacity=".7"/></g>
    <ellipse cx="28" cy="46" rx="11" ry="14" fill="#b5652e"/>
    <ellipse cx="25" cy="50" rx="6" ry="9" fill="#e8d2b0"/>
    <ellipse cx="34" cy="58" rx="7" ry="4" fill="#9c5124"/>
    <circle cx="22" cy="28" r="9" fill="#b5652e"/>
    <path d="M24 20 L27 12 L29 21Z M18 21 L19 13 L22 20Z" fill="#9c5124"/>
    <circle cx="18" cy="27" r="1.6" fill="#1a120c"/><circle cx="18.5" cy="26.5" r=".5" fill="#fff"/>
    <circle cx="13.6" cy="30" r="1.2" fill="#3a2414"/>
    <ellipse cx="18" cy="40" rx="3.5" ry="3" fill="#6b4a2a"/>
    <path d="M20 38 q-4 2 -3 5" stroke="#9c5124" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  </svg>`],

  rabbit: [0.95, `<svg viewBox="0 0 60 64">
    <ellipse cx="30" cy="62" rx="20" ry="2.4" fill="#1d2a14" opacity=".28"/>
    <g class="ears" style="transform-origin:22px 22px">
      <ellipse cx="20" cy="10" rx="3.6" ry="11" fill="#9a8470" transform="rotate(-10 20 10)"/>
      <ellipse cx="20" cy="10" rx="1.6" ry="8" fill="#d9b9a2" transform="rotate(-10 20 10)"/>
      <ellipse cx="27" cy="11" rx="3.6" ry="11" fill="#8c7662" transform="rotate(12 27 11)"/>
    </g>
    <ellipse cx="34" cy="48" rx="18" ry="14" fill="#9a8470"/>
    <circle cx="51" cy="48" r="4.5" fill="#f4efe6"/>
    <ellipse cx="34" cy="58" rx="12" ry="4" fill="#857060"/>
    <circle cx="22" cy="30" r="10" fill="#a08a76"/>
    <ellipse cx="25" cy="40" rx="6" ry="6" fill="#d8cbb8" opacity=".8"/>
    <circle cx="18" cy="28" r="1.8" fill="#1a1410"/><circle cx="18.6" cy="27.4" r=".55" fill="#fff"/>
    <circle cx="13" cy="32" r="1.3" fill="#6b4a3a"/>
    <ellipse cx="22" cy="58" rx="5" ry="2.6" fill="#857060"/>
  </svg>`],

  flock: [3, `<svg viewBox="0 0 120 40">
    <g fill="none" stroke="#3d4a3a" stroke-width="2.2" stroke-linecap="round">
      <path class="flap" d="M10 20 q6 -7 12 0 q6 -7 12 0"/>
      <path class="flap f2" d="M46 10 q5 -6 10 0 q5 -6 10 0"/>
      <path class="flap f3" d="M80 26 q5 -6 10 0 q5 -6 10 0"/>
    </g></svg>`],
};

export function renderAnimals(list, pressedCount) {
  return (list || []).filter(a => pressedCount >= (a.after || 0) && SPRITES[a.type]).map((a, i) => {
    const [ratio, svg] = SPRITES[a.type];
    const p = toScreen(a.x, a.y);
    const h = a.size * p.scale, w = h * ratio;
    const cycle = a.cycle || 80 + i * 17;
    const style = [
      `left:${(p.x - w / 2).toFixed(1)}px`, `top:${(p.y - h).toFixed(1)}px`,
      `width:${w.toFixed(1)}px`, `height:${h.toFixed(1)}px`,
      `--cycle:${cycle}s`, `--delay:-${(cycle * (0.12 + (i % 4) * 0.12)).toFixed(1)}s`,
    ].join(';');
    return `<div class="animal animal-${a.type}${a.flip ? ' flip' : ''}" style="${style}">${svg}</div>`;
  }).join('');
}
