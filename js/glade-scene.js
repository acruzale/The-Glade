// The Glade — painted-style placeholder scene, shown until your own painting is added.
// Same layout as the real one: big tree in front on the left, river across the lower part.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = n => Math.round(n);

export function placeholderScene() {
  const r = rng(42);
  const o = [];
  o.push(`<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd9cf"/><stop offset=".55" stop-color="#e9ecd2"/><stop offset="1" stop-color="#f6e9c4"/></linearGradient>
    <radialGradient id="sun" cx="1120" cy="250" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff8dc" stop-opacity="1"/><stop offset=".25" stop-color="#fff2c4" stop-opacity=".7"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></radialGradient>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c6b1"/><stop offset="1" stop-color="#c9d8bd"/></linearGradient>
    <linearGradient id="bank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9dbb76"/><stop offset="1" stop-color="#6f9551"/></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0c3"/><stop offset=".5" stop-color="#6fb2a6"/><stop offset="1" stop-color="#4f9488"/></linearGradient>
    <linearGradient id="near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f8c48"/><stop offset="1" stop-color="#2f5530"/></linearGradient>
    <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b2e22"/><stop offset=".6" stop-color="#5e4632"/><stop offset="1" stop-color="#8a6a48"/></linearGradient>
    <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe6" stop-opacity=".45"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></linearGradient>
  </defs>`);
  o.push('<rect width="1600" height="900" fill="url(#sky)"/>');
  o.push('<rect width="1600" height="900" fill="url(#sun)"/>');
  // clouds
  [[820, 150, 1], [1380, 110, .8], [560, 230, .6]].forEach(([x, y, s]) => {
    o.push(`<g class="cloud" opacity=".75" fill="#ffffff"><ellipse cx="${x}" cy="${y}" rx="${130 * s}" ry="${26 * s}"/><ellipse cx="${x + 50 * s}" cy="${y - 18 * s}" rx="${70 * s}" ry="${30 * s}"/><ellipse cx="${x - 60 * s}" cy="${y - 8 * s}" rx="${60 * s}" ry="${22 * s}"/></g>`);
  });
  // far mountains + hills
  o.push('<path d="M600 520 L820 330 L900 380 L1010 280 L1150 410 L1260 350 L1420 470 L1600 420 L1600 600 L600 600Z" fill="#b7cbc2" opacity=".8"/>');
  o.push('<path d="M985 300 L1010 280 L1040 308 L1022 318Z M800 345 L820 330 L842 350Z" fill="#f4f6f0" opacity=".9"/>');
  o.push('<path d="M0 520 C200 470 380 500 560 480 S900 450 1100 480 S1400 460 1600 470 L1600 640 L0 640Z" fill="url(#far)"/>');
  // distant tree line (layered conifers)
  [['#8fb096', 545, 26], ['#6f9a7a', 575, 34], ['#557f62', 600, 40]].forEach(([col, base, hmax], li) => {
    let d = '';
    for (let x = 380 + li * 10; x < 1640; x += 14 + r() * 10) {
      const h = hmax * (.55 + r() * .6), w = h * .32;
      d += `M${f(x - w)} ${base} L${f(x)} ${f(base - h)} L${f(x + w)} ${base}Z `;
    }
    o.push(`<path d="${d}" fill="${col}"/>`);
  });
  // far bank
  o.push('<path d="M0 600 C300 590 600 612 900 604 S1350 596 1600 602 L1600 660 L0 660Z" fill="url(#bank)"/>');
  // light rays
  [[1120, 240, 760, 900, 980, 900], [1120, 240, 1000, 900, 1180, 900], [1120, 240, 1260, 900, 1380, 900]].forEach(p => {
    o.push(`<polygon points="${p.join(' ')}" fill="url(#ray)" opacity=".5"/>`);
  });
  // river (centre ≈ 76% of the height)
  o.push('<path d="M0 640 C300 630 600 652 900 644 S1350 632 1600 640 L1600 734 C1300 742 1000 726 700 734 S250 744 0 732Z" fill="url(#water)"/>');
  o.push('<path d="M0 640 C300 630 600 652 900 644 S1350 632 1600 640 L1600 652 C1300 646 1000 660 700 654 S250 644 0 652Z" fill="#cfe9df" opacity=".55"/>');
  for (let k = 0; k < 16; k++) {
    const x = r() * 1600, y = 662 + r() * 62, w = 40 + r() * 90;
    o.push(`<path class="ripple" style="animation-delay:-${(r() * 3).toFixed(1)}s" d="M${f(x)} ${f(y)} q${f(w / 2)} -4 ${f(w)} 0" stroke="#e8f6f0" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`);
  }
  // sun glints on water
  for (let k = 0; k < 26; k++) o.push(`<ellipse class="glint" style="animation-delay:-${(r() * 4).toFixed(1)}s" cx="${f(950 + r() * 380)}" cy="${f(655 + r() * 70)}" rx="${f(4 + r() * 10)}" ry="1.6" fill="#fffbe6"/>`);
  // near bank
  o.push('<path d="M0 730 C250 742 700 726 1000 734 S1400 744 1600 734 L1600 900 L0 900Z" fill="url(#near)"/>');
  // foreground grasses and ferns along the near bank
  for (let k = 0; k < 90; k++) {
    const x = r() * 1600, y = 740 + r() * 160, h = 20 + r() * 40 * (y / 800);
    const col = ['#4f7a3f', '#6f9a52', '#86ad62', '#3f6634'][Math.floor(r() * 4)];
    o.push(`<path class="sway" style="transform-origin:${f(x)}px ${f(y)}px;animation-delay:-${(r() * 5).toFixed(1)}s" d="M${f(x)} ${f(y)} q${f(-6 + r() * 12)} ${f(-h * .6)} ${f(-10 + r() * 20)} ${f(-h)}" stroke="${col}" stroke-width="${(2 + r() * 2).toFixed(1)}" fill="none" stroke-linecap="round"/>`);
  }
  // wildflowers on both banks
  for (let k = 0; k < 40; k++) {
    const near = r() < .6, x = r() * 1600, y = near ? 750 + r() * 140 : 606 + r() * 28;
    const s = near ? 3 + r() * 3 : 1.4 + r();
    const c = ['#fbfaf2', '#f3d36a', '#a9cbe8', '#fff3d1'][Math.floor(r() * 4)];
    o.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${s.toFixed(1)}" fill="${c}"/>`);
  }
  // big tree (foreground, left)
  o.push('<path d="M150 900 C190 760 210 620 240 520 C262 440 250 360 300 260 L340 268 C310 360 330 450 318 540 C306 640 330 780 370 900Z" fill="url(#trunk)"/>');
  o.push('<path d="M300 300 C380 240 470 220 560 160 M290 380 C220 330 140 320 60 300 M320 250 C340 180 330 120 360 40" stroke="#4a382a" stroke-width="16" fill="none" stroke-linecap="round"/>');
  o.push('<path d="M150 900 C130 880 90 885 60 900 M370 900 C400 880 440 884 470 900" stroke="#3b2e22" stroke-width="18" fill="none" stroke-linecap="round"/>');
  const canopy = [];
  for (let k = 0; k < 70; k++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    const cx = 300 + Math.cos(a) * 420 * d, cy = 120 + Math.sin(a) * 230 * d;
    canopy.push([cx, cy, 50 + r() * 70]);
  }
  canopy.sort((p, q) => p[0] - q[0]);
  canopy.forEach(([cx, cy, rr]) => {
    const lit = cx > 420;
    o.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" fill="${lit ? '#5f8f45' : '#3e6a36'}"/>`);
    o.push(`<circle cx="${f(cx + rr * .25)}" cy="${f(cy - rr * .3)}" r="${f(rr * .6)}" fill="${lit ? '#86b55a' : '#4f7c3f'}" opacity=".9"/>`);
    if (lit && r() < .6) o.push(`<circle cx="${f(cx + rr * .4)}" cy="${f(cy - rr * .45)}" r="${f(rr * .28)}" fill="#c9df7c" opacity=".85"/>`);
  });
  // leaf clusters hanging at the top right
  for (let k = 0; k < 26; k++) {
    const x = 1300 + r() * 320, y = r() * 140;
    o.push(`<ellipse class="sway slow" style="transform-origin:${f(x)}px 0px" cx="${f(x)}" cy="${f(y)}" rx="${f(10 + r() * 10)}" ry="${f(5 + r() * 4)}" fill="${r() < .5 ? '#b9d36b' : '#86b55a'}" transform="rotate(${f(r() * 360)} ${f(x)} ${f(y)})"/>`);
  }
  // big foreground leaves, bottom corners
  for (let k = 0; k < 14; k++) {
    const left = k < 7, x = left ? r() * 260 : 1340 + r() * 260, y = 820 + r() * 100, rr = 40 + r() * 40;
    o.push(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr)}" ry="${f(rr * .55)}" fill="${r() < .5 ? '#2f5a2f' : '#3f7038'}" transform="rotate(${f(-40 + r() * 80)} ${f(x)} ${f(y)})"/>`);
  }
  return `<svg class="scene-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${o.join('')}</svg>`;
}
