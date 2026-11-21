// The Glade — where the painting sits on screen.
// It always fills the whole screen (like a cover photo).
// On tall, narrow screens (phones) only part of its width fits, so it centres on the part set in glade-config.js.

import { GLADE } from './glade-config.js';

export function paintingRect() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const aspect = GLADE.aspect || 16 / 9;
  const phone = GLADE.phone;
  // Phones keep the painting full screen too, just centred on a different part of it.
  const narrow = phone && vw / vh < (phone.whenNarrowerThan ?? 0.85);
  const focusX = narrow ? (phone.focusX ?? 68) : (GLADE.focusX ?? 50);
  if (vw / vh > aspect) { const h = vw / aspect; return { x: 0, y: (vh - h) / 2, w: vw, h, phone: false }; }
  const w = vh * aspect;
  return { x: (vw - w) * (focusX / 100), y: 0, w, h: vh, phone: false };
}

// A point on the painting (in %) → a point on the screen (in px).
export function toScreen(px, py, rect = paintingRect()) {
  return { x: rect.x + (rect.w * px) / 100, y: rect.y + (rect.h * py) / 100, scale: rect.h / 100 };
}
