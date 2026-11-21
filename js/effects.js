// The Glade — gentle movement layered over the painting.
// Everything is positioned in % of the painting, inside a box that matches exactly where the painting sits on screen.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n = v => v.toFixed(2);
const between = (r, [a, b]) => a + r() * (b - a);

const SEASON = {
  summer: { leaves: ['#c8d46a', '#a9c456', '#e0cf6a', '#8fb24c'], fireflies: 1, rays: true },
  autumn: { leaves: ['#e0a63a', '#d07a2c', '#c45a26', '#e8c25a'], fireflies: 1, rays: true },
  winter: { leaves: null, fireflies: 1, snow: true, rays: true },
};

export function renderEffects(fx, imageSrc, season = 'summer') {
  const look = SEASON[season] || SEASON.summer;
  if (!fx) return '';
  const r = rng(7);
  const out = [];

  // canopy sway: a soft-edged copy of the top of the painting that breathes gently around the trunk
  if (fx.sway) {
    const s = fx.sway;
    out.push(`<img class="fx-sway" src="${imageSrc}" alt="" style="--fade-from:${s.fadeFrom}%;--fade-to:${s.fadeTo}%;transform-origin:${s.pivot[0]}% ${s.pivot[1]}%">`);
  }

  // light rays
  (look.rays ? fx.rays || [] : []).forEach((ray, i) => {
    out.push(`<div class="fx-ray" style="left:${ray.x}%;top:${ray.y}%;width:${ray.w}%;height:${ray.h}%;--rot:${ray.angle}deg;--dur:${n(7 + i * 2.3)}s;--delay:-${n(i * 3.1)}s"></div>`);
  });

  // river: slow ripple rings and drifting glints
  const rv = fx.river;
  if (rv) {
    (rv.rings || []).forEach(([x, y, size], i) => {
      out.push(`<div class="fx-ring" style="left:${x}%;top:${y}%;width:${size}%;--dur:${n(7 + (i % 3) * 1.7)}s;--delay:-${n(i * 2.4)}s"></div>`);
    });
    for (let i = 0; i < (rv.glints || 0); i++) {
      const x = between(r, rv.x), y = between(r, rv.y);
      out.push(`<div class="fx-glint" style="left:${n(x)}%;top:${n(y)}%;width:${n(2 + r() * 4)}%;--dur:${n(5 + r() * 6)}s;--delay:-${n(r() * 10)}s;--dx:${n(1 + r() * 2.5)}vw"></div>`);
    }
  }

  // leaves drifting down from the canopy
  const lv = fx.leaves;
  if (lv && look.leaves) {
    const cols = look.leaves;
    for (let i = 0; i < lv.count; i++) {
      const x = between(r, lv.x), y = between(r, lv.y);
      const dur = 13 + r() * 10;
      out.push(`<div class="fx-leaf" style="left:${n(x)}%;top:${n(y)}%;--dur:${n(dur)}s;--delay:-${n(r() * dur)}s;--dx:${n(-6 - r() * 10)}vw;--dy:${n(lv.fall)}vh">
        <div class="fx-flutter" style="--fl:${n(2 + r() * 1.6)}s"><svg viewBox="0 0 20 12" width="${Math.round(12 + r() * 8)}"><path d="M1 6 C5 0 14 0 19 6 C14 12 5 12 1 6Z" fill="${cols[i % cols.length]}"/><path d="M2 6 L18 6" stroke="#6f7f34" stroke-width=".8"/></svg></div></div>`);
    }
  }

  // fireflies near the tree
  const ff = fx.fireflies;
  if (ff && look.fireflies) {
    for (let i = 0; i < Math.round(ff.count * look.fireflies); i++) {
      const x = between(r, ff.x), y = between(r, ff.y);
      out.push(`<div class="fx-firefly" style="left:${n(x)}%;top:${n(y)}%;--dur:${n(9 + r() * 9)}s;--delay:-${n(r() * 18)}s;--pulse:${n(1.8 + r() * 2.4)}s;--pd:-${n(r() * 4)}s;--x1:${n(-3 + r() * 6)}vw;--y1:${n(-3 + r() * 6)}vh;--x2:${n(-3 + r() * 6)}vw;--y2:${n(-3 + r() * 6)}vh"></div>`);
    }
  }

  // winter: gentle snowfall instead of leaves
  if (look.snow) {
    for (let i = 0; i < 70; i++) {
      const dur = 10 + r() * 12;
      out.push(`<div class="fx-snow" style="left:${n(r() * 110 - 5)}%;top:-3%;width:${n(2 + r() * 4)}px;--dur:${n(dur)}s;--delay:-${n(r() * dur)}s;--dx:${n(-4 + r() * 8)}vw;--dy:105vh;opacity:${n(.5 + r() * .5)}"></div>`);
    }
  }

  return out.join('');
}
