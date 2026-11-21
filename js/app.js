// The Glade — main app
import { firebaseConfig } from './firebase-config.js';
import { GLADE } from './glade-config.js';
import { placeholderScene } from './glade-scene.js';
import { renderAnimals } from './animals.js';
import { renderEffects } from './effects.js';
import { paintingRect, toScreen } from './geometry.js';
import { natureForDate, fetchPhoto } from './nature-data.js';
import { toggleAmbient, isAmbientOn, chime } from './sound.js';
import { setupMusic, hasSongs, songList, currentIndex, isMusicPlaying, playSong, pauseMusic, toggleMusic, nextSong, setPlayAll, setVolume, onMusicChange } from './music.js';

let db = null;      // the active storage (real Firebase or guest)
let realDb = null;  // Firebase, loaded when configured
const $app = document.getElementById('app');
const $glade = document.getElementById('glade');
const $river = document.getElementById('river');
const configured = !!(firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE'));

const STATE_INFO = {
  focus: { label: 'Deep focus', hint: 'Ready to lock in' },
  creative: { label: 'Creative', hint: 'Want to make something' },
  rest: { label: 'Resting', hint: 'Low energy, and that’s okay' },
  social: { label: 'Social', hint: 'Time with people' },
  clearing: { label: 'Weekly clearing', hint: '' },
};
const PLACES = ['focus', 'creative', 'rest', 'clearing'];
const LEAF_NAMES = { fern: 'fern frond', flower: 'wildflower', reed: 'willow leaf', oak: 'oak leaf', clover: 'clover leaf' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const STARTER_MINUTES = 5;
const GLADE_VIEWS = ['stream', 'begin', 'pressed']; // views shown as a card floating over the open glade

const S = {
  user: null, items: [], log: [], settings: {},
  view: 'loading', mood: null, drifted: new Set(), leafId: null,
  current: null, editing: null, form: null, returnView: null, clearingReturn: 'garden',
  journalDate: null, timer: null, timerInt: null, lastPressed: null, undo: null, guest: false,
  gladeSrc: null, riverKey: null, previewCount: null, previewSeason: null,
};

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function dateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function daysUntil(s) { return Math.round((parseDate(s) - parseDate(dateStr())) / 86400000); }
const getItem = id => S.items.find(i => i.id === id);
const nextStep = it => (it?.steps || []).find(s => !s.done);
const isRegular = it => (it?.days || []).length > 0;
function isWorkTime() { const d = new Date(); return d.getDay() >= 1 && d.getDay() <= 5 && d.getHours() < 17; }
function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
function seasonOf(date) {
  const m = date.getMonth() + 1;
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter';
}
function deadlineText(s) {
  const n = daysUntil(s);
  if (n < 0) return 'The gentle deadline has passed. Still here whenever you’re ready.';
  if (n === 0) return 'Gently due today';
  if (n === 1) return 'Gently due tomorrow';
  if (n <= 14) return `Gently due in ${n} days`;
  return `Due ${parseDate(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;
}
function leafKindFor(item, state) {
  if (item && isRegular(item)) return 'oak';
  return { focus: 'fern', creative: 'flower', rest: 'reed', clearing: 'clover' }[state] || 'fern';
}
function clearingWeekKey() {
  const d = new Date();
  const diff = (d.getDay() - (S.settings.clearingDay ?? 0) + 7) % 7;
  return dateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff));
}
const isClearing = i => (i.states || []).includes('clearing');
const doneThisWeek = i => (i.weekly ? i.lastDoneWeek === clearingWeekKey() : i.status === 'done' && i.doneWeek === clearingWeekKey());
const clearingItems = () => S.items.filter(i => isClearing(i) && (i.status === 'active' || (i.status === 'done' && i.doneWeek === clearingWeekKey())));
const clearingDue = () => S.settings.clearingClosedWeek !== clearingWeekKey() && clearingItems().some(i => !doneThisWeek(i));
function clean(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) out[k] = v === undefined ? null : v;
  return out;
}
// While a timer runs, the Glade tab always brings you back to it.
const timerRunning = () => !!(S.timer && getItem(S.timer.itemId));
const gladeHome = () => (timerRunning() ? 'begin' : S.mood ? 'stream' : 'home');
// ---------- icons ----------
function leafSvg(kind, size = 24) {
  const p = {
    fern: '<path d="M12 22 Q12 13 12 3" stroke="#3f6b3a" stroke-width="1.2" fill="none"/>' +
      [5, 8, 11, 14, 17].map((y, i) => { const l = 5.5 - i * 0.7; return `<ellipse cx="${12 - l / 1.6}" cy="${y}" rx="${l / 1.6}" ry="1.3" fill="#5f8f4e" transform="rotate(-25 ${12 - l / 1.6} ${y})"/><ellipse cx="${12 + l / 1.6}" cy="${y}" rx="${l / 1.6}" ry="1.3" fill="#5f8f4e" transform="rotate(25 ${12 + l / 1.6} ${y})"/>`; }).join(''),
    flower: '<path d="M12 22 Q13 16 12 11" stroke="#4f7a3f" stroke-width="1.3" fill="none"/><ellipse cx="14.5" cy="17" rx="2.6" ry="1.1" fill="#5f8f4e" transform="rotate(-30 14.5 17)"/>' +
      [0, 72, 144, 216, 288].map(a => { const r = (a - 90) * Math.PI / 180; return `<circle cx="${(12 + Math.cos(r) * 3.4).toFixed(1)}" cy="${(9 + Math.sin(r) * 3.4).toFixed(1)}" r="3" fill="#fbfaf3" stroke="#b9c4a8" stroke-width=".6"/>`; }).join('') +
      '<circle cx="12" cy="9" r="2.1" fill="#e3b54a"/>',
    reed: '<path d="M5 20 C8 12 14 6 20 4 C18 10 12 16 5 20Z" fill="#8bb06a"/><path d="M5 20 L19 5" stroke="#4f6b3e" stroke-width=".8"/>',
    oak: '<path d="M12 3 C14 4 13 6 15 6 C17 6 17 8 16 9 C18 10 18 12 16 13 C18 14 17 16 15 16 C15 18 13 18 12.6 19 L12.6 22 L11.4 22 L11.4 19 C11 18 9 18 9 16 C7 16 6 14 8 13 C6 12 6 10 8 9 C7 8 7 6 9 6 C11 6 10 4 12 3Z" fill="#8a9a4f"/><path d="M12 5 L12 19" stroke="#5e6b33" stroke-width=".7"/>',
    clover: '<path d="M12 22 L12 12" stroke="#4f7a3f" stroke-width="1.2"/><circle cx="12" cy="7.5" r="3.6" fill="#5f9a52"/><circle cx="8.3" cy="11.6" r="3.6" fill="#6aa65c"/><circle cx="15.7" cy="11.6" r="3.6" fill="#6aa65c"/>',
    social: '<circle cx="8.5" cy="9" r="2.6" fill="#8a7558"/><ellipse cx="10" cy="14" rx="4" ry="3.2" fill="#8a7558"/><ellipse cx="8.6" cy="14.3" rx="2.2" ry="2.2" fill="#d9824a"/><circle cx="15.5" cy="10" r="2.4" fill="#6e5a3c"/><ellipse cx="16.8" cy="14.6" rx="3.7" ry="3" fill="#6e5a3c"/><ellipse cx="15.6" cy="14.9" rx="2" ry="2" fill="#e3b54a"/>',
  }[kind] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}
const moodIcon = m => leafSvg({ focus: 'fern', creative: 'flower', rest: 'reed', social: 'social' }[m], 34);
const I = {
  glade: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L6 12 H9 L5 18 H19 L15 12 H18 Z"/><path d="M12 18 V21"/></svg>',
  journal: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5 C7 4 10 4 12 6 C14 4 17 4 20 5.5 V19 C17 17.5 14 17.5 12 19.5 C10 17.5 7 17.5 4 19 Z"/><path d="M12 6 V19.5"/></svg>',
  garden: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 V11"/><path d="M12 13 C12 9 9 7 5 7 C5 11 8 13 12 13 Z"/><path d="M12 11 C12 7 15 5 19 5 C19 9 16 11 12 11 Z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7 H14 M18 7 H20 M4 17 H8 M12 17 H20"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10 V14 H8 L13 18 V6 L8 10 Z"/><path d="M16.5 9 C17.8 10.5 17.8 13.5 16.5 15"/><path d="M19 6.5 C21.5 9.5 21.5 14.5 19 17.5"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10 V14 H8 L13 18 V6 L8 10 Z"/><path d="M17 10 L21 14 M21 10 L17 14"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 L10 17 L19 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5 V19 M5 12 H19"/></svg>',
};


const I2 = {
  close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 L8 12 L15 19"/></svg>',
};

// ---------- data actions ----------
function updateItem(id, patch) { const it = getItem(id); if (it) Object.assign(it, patch); db.updateItem(id, clean(patch)); }
function addItem(data) { const it = db.addItem(clean(data)); S.items.push(it); return it; }
function deleteItem(id) { S.items = S.items.filter(i => i.id !== id); db.deleteItem(id); }
function saveSettings(patch) { Object.assign(S.settings, patch); db.saveSettings(patch); }

// Press a leaf. `prev` holds the item's old values so the press can be undone.
function press(item, state, { navigate = true, prev = null } = {}) {
  const kind = leafKindFor(item, state);
  const entry = { itemId: item?.id || null, title: item?.title || 'Rested', state, kind, date: dateStr(), at: Date.now() };
  if (S.timer && item && S.timer.itemId === item.id) {
    entry.minutes = Math.max(1, Math.round(elapsed() / 60000));
    stopTimer();
  }
  const saved = db.addLog(entry);
  S.log.push(saved);
  S.lastPressed = saved;
  S.undo = { logId: saved.id, itemId: item?.id || null, prev };
  if (navigate) { S.view = 'pressed'; render(); }
  else toast(`${/^[aeiou]/.test(LEAF_NAMES[kind]) ? 'An' : 'A'} ${LEAF_NAMES[kind]} was pressed into today’s page.`, { label: 'Undo', fn: () => { undoLast(); render(); } });
}
function undoLast() {
  const u = S.undo;
  if (!u) return;
  S.log = S.log.filter(l => l.id !== u.logId);
  db.deleteLog(u.logId);
  if (u.itemId && u.prev) updateItem(u.itemId, u.prev);
  S.undo = null;
  S.lastPressed = null;
}
function untickClearing(it) {
  const key = clearingWeekKey();
  const entry = [...S.log].reverse().find(l => l.itemId === it.id && l.state === 'clearing' && l.date >= key);
  if (entry) { S.log = S.log.filter(l => l !== entry); db.deleteLog(entry.id); }
  if (it.weekly) updateItem(it.id, { lastDoneWeek: null });
  else updateItem(it.id, { status: 'active', doneWeek: null });
}

// ---------- the stream ----------
function pickLeaf(mood) {
  if (mood === 'social') return null;
  const today = new Date().getDay();
  const doneToday = new Set(S.log.filter(l => l.date === dateStr()).map(l => l.itemId));
  const active = S.items.filter(i => i.status === 'active' && !S.drifted.has(i.id));
  const regular = active.filter(i => (i.days || []).includes(today) && !doneToday.has(i.id));
  if (regular.length) return regular[0];
  const pool = active.filter(i => !isRegular(i) && (i.states || []).includes(mood) &&
    (!i.hobby || i.inSeason) && (!i.work || isWorkTime()));
  if (!pool.length) return null;
  const weights = pool.map(i => {
    if (!i.deadline) return 1;
    const n = daysUntil(i.deadline);
    return n <= 0 ? 6 : n <= 3 ? 5 : n <= 7 ? 3 : n <= 21 ? 2 : 1;
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let k = 0; k < pool.length; k++) { r -= weights[k]; if (r <= 0) return pool[k]; }
  return pool[pool.length - 1];
}

// ---------- timer (counts up, keeps running when you switch pages, tabs, or close the app) ----------
const TIMER_KEY = 'glade-timer';
const pad = n => String(n).padStart(2, '0');
function saveTimer() { try { S.timer ? localStorage.setItem(TIMER_KEY, JSON.stringify(S.timer)) : localStorage.removeItem(TIMER_KEY); } catch { /* storage blocked */ } }
function restoreTimer() {
  try { S.timer = JSON.parse(localStorage.getItem(TIMER_KEY)); } catch { S.timer = null; }
  if (S.timer && !getItem(S.timer.itemId)) S.timer = null;
  saveTimer();
  if (S.timer && Date.now() - S.timer.start < TIMER_LIMIT) ensureTick();
}
function ensureTick() { if (!S.timerInt) S.timerInt = setInterval(tick, 1000); }
const TIMER_LIMIT = 4 * 60 * 60000; // stops counting after 4 hours, in case it was forgotten
const elapsed = () => (S.timer ? Math.min(Date.now() - S.timer.start, TIMER_LIMIT) : 0);
function fmtUp(ms) {
  const t = Math.floor(ms / 1000), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
function fmtMinutes(min) { return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`; }
function startTimer() {
  S.timer = { start: Date.now(), itemId: S.current, mood: S.mood, chimed: false };
  saveTimer(); ensureTick(); render();
}
function stopTimer() { S.timer = null; saveTimer(); clearInterval(S.timerInt); S.timerInt = null; }
function tick() {
  if (!S.timer) return;
  const e = elapsed();
  if (e >= TIMER_LIMIT) {
    clearInterval(S.timerInt); S.timerInt = null;
    document.querySelectorAll('[data-timer-text]').forEach(el => { el.textContent = fmtUp(e); });
    toast('The timer stopped at 4 hours. Press “Done” whenever you like and it’ll be saved.');
    return;
  }
  if (!S.timer.chimed && e >= STARTER_MINUTES * 60000) {
    S.timer.chimed = true; saveTimer(); chime(); // a gentle "you've started" after 5 minutes, then it just keeps counting
    const note = document.getElementById('timer-note');
    if (note) note.textContent = 'You’ve started. Keep going for as long as you like.';
  }
  document.querySelectorAll('[data-timer-text]').forEach(el => { el.textContent = fmtUp(e); });
}
function timerHtml(item) {
  if (!S.timer || S.timer.itemId !== item.id) {
    return `<button class="btn glass-btn wide" data-action="start-timer">Start the timer</button><p class="hint center">It counts up, so you can see how long you spent. It never tells you to stop.</p>`;
  }
  return `<div class="timer-up"><span class="timer-label">You’ve been here for</span><span class="timer-big" data-timer-text>${fmtUp(elapsed())}</span>
    <span class="hint" id="timer-note">${elapsed() >= TIMER_LIMIT ? 'The timer stopped at 4 hours, in case it was forgotten.' : S.timer.chimed ? 'You’ve started. Keep going for as long as you like.' : 'A soft chime at 5 minutes, just to say you’ve started.'}</span></div>`;
}

// ---------- the glade (background) ----------
const pressedCount = () => (S.previewCount ?? S.log.length);
function currentStage() {
  const count = pressedCount();
  return [...(GLADE.stages || [])].sort((a, b) => a.after - b.after).filter(s => count >= s.after && (s.summer || s.autumn || s.winter)).pop();
}
function currentSeason() {
  if (S.previewSeason) return S.previewSeason;
  if (S.settings.seasonMode !== 'seasons') return 'summer';
  const s = seasonOf(new Date());
  return s === 'spring' ? 'summer' : s;
}
function gladeSrc() {
  const stage = currentStage();
  if (!stage) return GLADE.image;
  return stage[currentSeason()] || stage.summer || GLADE.image;
}
const loadedImg = () => [...$glade.querySelectorAll('.glade-img.loaded')].pop();
let preloaded = false;
function preloadPaintings() {
  if (preloaded) return;
  preloaded = true;
  (GLADE.stages || []).forEach(st => ['summer', 'autumn', 'winter'].forEach(se => { if (st[se]) new Image().src = st[se]; }));
}
function updateGlade() {
  if (!$glade.dataset.ready) {
    // A soft background colour shows only for the very first moment, until the painting has loaded.
    $glade.innerHTML = '<div class="glade-ph"></div><img class="glade-backdrop" alt=""><div class="glade-stage"></div><div class="glade-animals"></div>';
    $glade.style.setProperty('--focus-x', `${GLADE.focusX ?? 50}%`);
    document.body.dataset.card = GLADE.cardSide || 'right';
    $glade.dataset.ready = '1';
  }
  const src = gladeSrc();
  if (src && src !== S.gladeSrc) {
    S.gladeSrc = src;
    // The new painting fades in on top of the old one, which stays until the new one is fully shown.
    const img = new Image();
    img.className = 'glade-img';
    img.alt = '';
    img.onload = () => {
      if (S.gladeSrc !== src) { img.remove(); return; }
      layoutPaintings();
      $glade.querySelector('.glade-backdrop').src = src;
      requestAnimationFrame(() => img.classList.add('loaded'));
      placeRiver(); placeAnimals(true); placeStage(true);
      preloadPaintings();
      setTimeout(() => $glade.querySelectorAll('.glade-img').forEach(el => { if (el !== img && S.gladeSrc === src) el.remove(); }), 1400);
    };
    img.onerror = () => {
      img.remove();
      if (!loadedImg()) $glade.querySelector('.glade-ph').innerHTML = placeholderScene(); // no painting yet: show the drawn stand-in
    };
    $glade.insertBefore(img, $glade.querySelector('.glade-stage'));
    layoutPaintings();
    img.src = src;
  }
  const open = GLADE_VIEWS.includes(S.view);
  $glade.classList.toggle('blurred', S.view === 'home' || S.view === 'login' || S.view === 'loading');
  $glade.classList.toggle('dim', !open && !(S.view === 'home' || S.view === 'login' || S.view === 'loading'));

  placeAnimals();

  // the leaf on the river
  const item = S.view === 'stream' && S.leafId ? getItem(S.leafId) : null;
  const key = item ? `${item.id}-${S.drifted.size}` : '';
  if (key !== S.riverKey) {
    S.riverKey = key;
    placeRiver();
    $river.innerHTML = item ? `<div class="river-leaf"><div class="bob">${leafSvg(leafKindFor(item, S.mood), 58)}</div></div>` : '';
  }
}

// Map a point on the painting (in %) to the screen, the same way the image is cropped (object-fit: cover).
function paintingToScreen(px, py, aspect, focusX) {
  const vw = window.innerWidth, vh = window.innerHeight;
  let w, h, ox, oy;
  if (vw / vh > aspect) { w = vw; h = vw / aspect; ox = 0; oy = (vh - h) / 2; }
  else { h = vh; w = vh * aspect; oy = 0; ox = (vw - w) * (focusX / 100); }
  return [ox + (w * px) / 100, oy + (h * py) / 100];
}
function placeRiver() {
  const painted = !!loadedImg();
  // The placeholder's river runs straight across; the painting uses the path from glade-config.js.
  const stg = currentStage();
  const r = painted ? (stg?.rivers?.[currentSeason()] || stg?.river || GLADE.river) : { from: { x: 104, y: 76, scale: 0.9 }, to: { x: -6, y: 76, scale: 0.9 }, seconds: 42, wave: 0.8 };
  // painting: use its real position on screen; placeholder: a plain 16:9 cover
  const map = (x, y) => {
    if (painted) { const p = toScreen(x, y); return [p.x, p.y]; }
    return paintingToScreen(x, y, 16 / 9, 50);
  };
  const [x0, y0] = map(r.from.x, r.from.y);
  const [x1, y1] = map(r.to.x, r.to.y);
  const via = r.via || { x: (r.from.x + r.to.x) / 2, y: (r.from.y + r.to.y) / 2, scale: ((r.from.scale ?? 1) + (r.to.scale ?? 1)) / 2 };
  const [xm, ym] = map(via.x, via.y);
  const st = $river.style;
  st.setProperty('--xm', `${xm}px`); st.setProperty('--ym', `${ym}px`); st.setProperty('--sm', via.scale ?? 1);
  st.setProperty('--x0', `${x0}px`); st.setProperty('--y0', `${y0}px`); st.setProperty('--s0', r.from.scale ?? 1);
  st.setProperty('--x1', `${x1}px`); st.setProperty('--y1', `${y1}px`); st.setProperty('--s1', r.to.scale ?? 1);
  st.setProperty('--dur', `${r.seconds || 38}s`);
  st.setProperty('--river-wave', `${r.wave ?? 0.8}vh`);
}
let animalsKey = '';
function placeAnimals(force = false) {
  const layer = $glade.querySelector('.glade-animals');
  if (!layer) return;
  const painted = !!loadedImg();
  const count = S.view === 'login' || S.view === 'loading' ? 0 : pressedCount();
  const visible = painted ? (GLADE.animals || []).filter(a => count >= (a.after || 0)).length : 0;
  const key = `${visible}-${S.gladeSrc}-${window.innerWidth}x${window.innerHeight}`;
  if (key === animalsKey && !force) return;
  animalsKey = key;
  layer.innerHTML = visible ? renderAnimals(GLADE.animals, count) : '';
}
// The effects box sits exactly where the painting is drawn, so effects can use % of the painting.
let stageSrc = '';
function placeStage(force = false) {
  const stage = $glade.querySelector('.glade-stage');
  const img = [...$glade.querySelectorAll('.glade-img')].pop();
  if (!stage || !img) return;
  if (!img.complete || !img.naturalWidth) return;
  const rc = paintingRect();
  Object.assign(stage.style, { left: `${rc.x}px`, top: `${rc.y}px`, width: `${rc.w}px`, height: `${rc.h}px` });
  const key = `${img.src}|${currentSeason()}`;
  if (force || stageSrc !== key) { stageSrc = key; stage.innerHTML = renderEffects(GLADE.effects, img.src, currentSeason()); }
}
// Place every painting layer exactly where the painting belongs (fills the screen, or phone framing).
function layoutPaintings() {
  const rc = paintingRect();
  $glade.querySelectorAll('.glade-img').forEach(img => Object.assign(img.style, { left: `${rc.x}px`, top: `${rc.y}px`, width: `${rc.w}px`, height: `${rc.h}px` }));
  $glade.classList.toggle('phone-framing', rc.phone);
}
window.addEventListener('resize', () => { layoutPaintings(); placeRiver(); placeAnimals(); placeStage(); });

// ---------- sound: your songs or the forest ----------
const soundMode = () => (S.settings.soundMode || (hasSongs() ? 'music' : 'forest'));
const soundOn = () => isAmbientOn() || isMusicPlaying();
function applyMusicSettings() {
  setupMusic(GLADE.music, { start: S.settings.songIndex ?? 0, all: S.settings.playAllSongs !== false, vol: S.settings.musicVolume ?? 0.6 });
}
// Sound is on by default. Browsers only allow sound after a tap or click, so it starts with your first one.
let soundArmed = false;
function startSoundIfWanted() {
  if (S.settings.soundOn === false || soundOn()) return;
  const start = () => { if (S.settings.soundOn !== false && !soundOn()) toggleSound({ remember: false }); };
  if (navigator.userActivation?.isActive) { start(); return; }
  if (soundArmed) return;
  soundArmed = true;
  const onFirst = e => {
    document.removeEventListener('pointerdown', onFirst, true);
    document.removeEventListener('keydown', onFirst, true);
    soundArmed = false;
    if (e.target.closest?.('#sound-btn')) return; // that tap is already about the sound
    start();
  };
  document.addEventListener('pointerdown', onFirst, true);
  document.addEventListener('keydown', onFirst, true);
}
async function toggleSound({ remember = true } = {}) {
  if (soundMode() === 'music' && hasSongs()) {
    if (isAmbientOn()) await toggleAmbient();
    toggleMusic();
  } else {
    if (isMusicPlaying()) pauseMusic();
    await toggleAmbient();
  }
  if (remember) saveSettings({ soundOn: soundOn() });
  refreshSoundUi();
}
function refreshSoundUi() {
  const b = document.getElementById('sound-btn');
  if (b) { b.innerHTML = soundOn() ? I.soundOn : I.soundOff; b.setAttribute('aria-pressed', soundOn()); }
  const now = document.getElementById('now-playing');
  if (now) now.textContent = isMusicPlaying() ? `Playing: ${songList()[currentIndex()]?.title || ''}` : 'Paused';
  const pp = document.getElementById('music-toggle');
  if (pp) pp.textContent = isMusicPlaying() ? 'Pause' : 'Play';
  const sel = document.getElementById('song-select');
  if (sel && Number(sel.value) !== currentIndex()) sel.value = String(currentIndex());
}
onMusicChange(() => {
  if (S.settings.songIndex !== currentIndex() && isMusicPlaying()) S.settings.songIndex = currentIndex();
  refreshSoundUi();
});
function soundSettings() {
  const songs = songList();
  const mode = soundMode();
  return `<fieldset><legend>Sound</legend>
    <label class="check"><input type="radio" name="soundmode" data-setting="soundMode" value="music" ${mode === 'music' ? 'checked' : ''}><span>My music</span></label>
    <label class="check"><input type="radio" name="soundmode" data-setting="soundMode" value="forest" ${mode === 'forest' ? 'checked' : ''}><span>Forest sounds (stream and birdsong)</span></label>
    ${mode === 'music' ? `
      <label class="field"><span>Song</span><select id="song-select">${songs.map((sg, i) => `<option value="${i}" ${i === currentIndex() ? 'selected' : ''}>${esc(sg.title)}</option>`).join('')}</select></label>
      <div class="row music-row"><button type="button" class="btn glass-btn" id="music-toggle" data-action="music-toggle">${isMusicPlaying() ? 'Pause' : 'Play'}</button><button type="button" class="btn glass-btn" data-action="music-next">Next song</button></div>
      <p class="small" id="now-playing">${isMusicPlaying() ? `Playing: ${esc(songs[currentIndex()]?.title || '')}` : 'Paused'}</p>
      <label class="check"><input type="checkbox" id="play-all" ${S.settings.playAllSongs !== false ? 'checked' : ''}><span>Play all songs one after another <span class="muted">(off = repeat this song)</span></span></label>
      <label class="field"><span>Volume</span><input type="range" id="music-volume" min="0" max="1" step="0.05" value="${S.settings.musicVolume ?? 0.6}"></label>`
      : '<p class="hint">The speaker button at the top turns the sound on and off.</p>'}
  </fieldset>`;
}

// ---------- views ----------
function shell(content) {
  const nav = [['glade', 'Glade', I.glade], ['journal', 'Journal', I.journal], ['garden', 'Garden', I.garden], ['settings', 'Settings', I.settings]];
  const tab = ['home', ...GLADE_VIEWS].includes(S.view) ? 'glade' : { clearing: 'garden', edit: 'garden' }[S.view] || S.view;
  return `<header class="top">
      <button class="brand glass" data-action="go" data-view="glade">The Glade</button>
      <nav class="nav glass">${nav.map(([v, l, ic]) => `<button class="${tab === v ? 'on' : ''}" data-action="go" data-view="${v}">${ic}<span>${l}</span></button>`).join('')}</nav>
      <div class="top-right">
        ${S.timer && S.view !== 'begin' && getItem(S.timer.itemId) ? `<button class="timer-chip glass" data-action="open-timer" aria-label="Back to your timer"><span data-timer-text>${fmtUp(elapsed())}</span><span class="timer-chip-title">${esc(getItem(S.timer.itemId).title)}</span></button>` : ''}
        <button class="icon-btn glass" id="sound-btn" data-action="sound" aria-label="Forest sounds" aria-pressed="${soundOn()}">${soundOn() ? I.soundOn : I.soundOff}</button>
      </div>
    </header>
    ${S.guest ? '<div class="guest-banner glass"><span>Guest mode · nothing is saved</span><button class="link inline" data-action="leave-guest">Leave</button></div>' : ''}
    <main class="main view-${S.view}">${content}</main>`;
}

function viewLogin() {
  return `<main class="main center-stage"><section class="glass card login-card">
    <h1 class="title">The Glade</h1>
    <p class="sub">A quiet place to work with your energy, not against it.</p>
    ${configured ? '<button class="btn primary wide" data-action="signin">Sign in with Google</button>' : ''}
    <button class="btn glass-btn wide" data-action="guest">Explore as a guest</button>
    <p class="hint center">Guests see a sample glade. Nothing is saved.</p>
    <p class="err center" id="login-err"></p></section></main>`;
}

function viewHome() {
  return `<section class="checkin-stage">
    <h1 class="greet">${greeting()}</h1>
    <p class="greet-sub">How is your energy right now?</p>
    <div class="checkin">${['focus', 'creative', 'rest', 'social'].map(m => `
      <button class="mood glass" data-action="mood" data-mood="${m}">
        <span class="mood-icon">${moodIcon(m)}</span>
        <span class="mood-label">${STATE_INFO[m].label}</span>
        <span class="mood-hint">${STATE_INFO[m].hint}</span>
      </button>`).join('')}</div>
    ${clearingDue() ? `<button class="clearing-chip glass" data-action="open-clearing" data-from="home">${leafSvg('clover', 26)}<span><strong>Your weekly clearing is ready</strong><span class="block small">A few small things, then they’re gone for the week.</span></span></button>` : ''}
  </section>`;
}

function cardTop() {
  return `<div class="card-top"><span class="eyebrow">${STATE_INFO[S.mood]?.label || ''}</span><button class="link small" data-action="change-energy">Change energy</button></div>`;
}

function viewStream() {
  const m = S.mood;
  if (m === 'social') {
    return `<section class="float-card glass center">${leafSvg('social', 52)}<h2>Enjoy your time</h2>
      <p>Nothing is waiting for you here. The Glade will be right where you left it.</p>
      <button class="btn glass-btn" data-action="change-energy">Change energy</button></section>`;
  }
  const item = S.leafId ? getItem(S.leafId) : null;
  if (!item) {
    const msg = m === 'rest' ? 'Resting is enough. You don’t need to earn it.' : S.drifted.size ? 'Everything has floated by for now.' : 'Nothing is floating by for this energy right now.';
    return `<section class="float-card glass">${cardTop()}<h2>The stream is quiet</h2><p>${msg}</p>
      <div class="stack">${m === 'rest' ? '<button class="btn primary" data-action="just-rest">I’ll just rest</button>' : ''}
      ${S.drifted.size ? '<button class="btn glass-btn" data-action="restart-stream">Let them float by again</button>' : ''}
      <button class="btn glass-btn" data-action="go" data-view="garden">Add something in the Garden</button></div></section>`;
  }
  const step = nextStep(item);
  const isProject = !item.hobby && !isRegular(item) && (item.states || []).some(s => s === 'focus' || s === 'creative');
  return `<section class="float-card glass" id="leaf-card">
      ${cardTop()}
      ${isRegular(item) ? '<p class="tag">Today’s regular</p>' : ''}
      <h2 class="leaf-title">${esc(item.title)}</h2>
      ${step ? `<div class="step"><span class="step-label">Next small step</span>${esc(step.text)}</div>`
        : isProject ? `<p class="small">No steps yet. <button class="link inline" data-action="edit" data-id="${item.id}">Add one</button></p>` : ''}
      ${item.deadline ? `<p class="gentle-date">${deadlineText(item.deadline)}</p>` : ''}
      <div class="row">${S.timer && S.timer.itemId === item.id
        ? `<button class="btn primary" data-action="open-timer">Continue · <span data-timer-text>${fmtUp(elapsed())}</span></button>`
        : '<button class="btn primary" data-action="begin">Begin</button>'}<button class="btn glass-btn" data-action="drift">Let it drift</button></div>
      ${m === 'rest' ? '<button class="link center-link" data-action="just-rest">I’ll just rest instead</button>' : ''}
    </section>`;
}

function viewBegin() {
  const item = getItem(S.current);
  if (!item) { S.view = gladeHome(); return S.view === 'home' ? viewHome() : viewStream(); }
  const step = nextStep(item);
  const regular = isRegular(item);
  const canComplete = !regular && !item.hobby && !(item.states || []).every(s => s === 'rest');
  return `<section class="float-card glass center">
      <span class="eyebrow">You’re here</span><h2>${esc(item.title)}</h2>
      ${step ? `<div class="step big">${esc(step.text)}</div>` : ''}
      <div class="timer">${timerHtml(item)}</div>
      <div class="stack">
        ${step && !regular ? '<button class="btn primary" data-action="step-done">Step done</button>' : ''}
        <button class="btn ${step && !regular ? 'glass-btn' : 'primary'}" data-action="done-now">${regular ? 'Done for today' : 'Done for now'}</button>
        ${canComplete ? '<button class="link" data-action="complete">This whole thing is finished</button>' : ''}
        <button class="link" data-action="stream-back">Back to the stream</button>
      </div></section>`;
}

function viewPressed() {
  const e = S.lastPressed;
  if (!e) { S.view = gladeHome(); return S.view === 'home' ? viewHome() : viewStream(); }
  return `<section class="float-card glass center"><div class="pressed-leaf">${leafSvg(e.kind, 96)}</div>
    <h2>${/^[aeiou]/.test(LEAF_NAMES[e.kind]) ? 'An' : 'A'} ${LEAF_NAMES[e.kind]} was pressed into today’s page</h2>
    <p class="small">${e.minutes ? `You spent ${fmtMinutes(e.minutes)} on this. ` : ''}Your glade grew a little.</p>
    <div class="stack"><button class="btn primary" data-action="another-leaf">Back to the stream</button>
    <button class="btn glass-btn" data-action="journal-today">See today’s page</button>
    ${S.undo ? '<button class="link" data-action="undo">Undo, that was a mistake</button>' : ''}</div></section>`;
}

function panelHead(title, { back = false, close = true, sub = '' } = {}) {
  return `<div class="panel-head">
    ${back ? `<button class="icon-btn" data-action="clearing-back" aria-label="Back">${I2.back}</button>` : ''}
    <div class="panel-title"><h1>${title}</h1>${sub ? `<p class="small muted">${sub}</p>` : ''}</div>
    ${close ? `<button class="icon-btn" data-action="close-panel" aria-label="Close">${I2.close}</button>` : ''}
  </div>`;
}

function viewJournal() {
  const d = S.journalDate || dateStr();
  const date = parseDate(d);
  const { kind, item: n } = natureForDate(date);
  const entries = S.log.filter(l => l.date === d);
  const isToday = d === dateStr();
  return `<section class="panel paper">
    <div class="journal-head">
      <button class="icon-btn" data-action="jday" data-delta="-1" aria-label="Previous day">${I2.back}</button>
      <div class="center"><p class="eyebrow">${isToday ? 'Today' : '&nbsp;'}</p><h1>${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h1></div>
      <button class="icon-btn flip" data-action="jday" data-delta="1" aria-label="Next day" ${isToday ? 'disabled' : ''}>${I2.back}</button>
      <button class="icon-btn" data-action="close-panel" aria-label="Close">${I2.close}</button>
    </div>
    <article class="nature-card">
      <div class="photo" data-wiki="${esc(n.wiki)}"><span class="tape"></span><div class="photo-ph">Finding a photo…</div></div>
      <div class="nature-text"><p class="eyebrow">${kind === 'plant' ? 'Plant of the day' : 'Bird of the day'}</p><h2>${esc(n.name)}</h2><p class="latin">${esc(n.latin)}</p>
      <p>${esc(n.fact)}</p>
      <a class="small link-out" data-wiki-link href="https://en.wikipedia.org/wiki/${encodeURIComponent(n.wiki.replace(/ /g, '_'))}" target="_blank" rel="noopener">Read more on Wikipedia</a></div>
    </article>
    <section class="pressed-list"><h3>Pressed on this day</h3>
      ${entries.length ? `<ul>${entries.map(e => `<li>${leafSvg(e.kind, 28)}<span>${esc(e.title)}</span><span class="small muted">${e.minutes ? `${fmtMinutes(e.minutes)} · ` : ''}${e.kind === 'oak' ? 'Regular day' : (STATE_INFO[e.state]?.label || '')}</span></li>`).join('')}</ul>`
        : '<p class="muted">A quiet day. Quiet days belong here too.</p>'}
    </section></section>`;
}

function groupOf(i) {
  if (i.status === 'basket') return 'basket';
  if (i.status === 'done') return 'done';
  if (isRegular(i)) return 'regular';
  if (i.hobby) return 'hobby';
  const st = i.states || [];
  if (st.includes('focus')) return 'focus';
  if (st.includes('creative')) return 'creative';
  if (st.includes('rest')) return 'rest';
  return 'clearing';
}
const GROUPS = [
  ['basket', 'Seeds waiting for a home', 'Give these a place when you have a moment.'],
  ['focus', 'Projects and deep focus', ''],
  ['creative', 'Creative', ''],
  ['hobby', 'Hobbies', 'Tap the leaf to bring a hobby into season. One or two at a time keeps choosing easy.'],
  ['rest', 'Rest', ''],
  ['regular', 'Regular days', 'These float by first on their days.'],
  ['clearing', 'Weekly clearing', ''],
];
function chipsFor(i) {
  const c = [];
  if (i.status !== 'basket') (i.states || []).forEach(s => c.push(STATE_INFO[s]?.label));
  if (isRegular(i)) c.push(i.days.map(d => DAYS[d]).join(', '));
  if (i.weekly) c.push('Every week');
  if (i.work) c.push('Work');
  if (i.deadline) c.push(`Due ${parseDate(i.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`);
  const steps = (i.steps || []).length;
  if (steps) c.push(`${(i.steps || []).filter(s => s.done).length}/${steps} steps`);
  return c.filter(Boolean).map(t => `<span class="chip">${esc(t)}</span>`).join('');
}
function itemRow(i) {
  return `<div class="item-row">
    <button class="item-main" data-action="edit" data-id="${i.id}"><span class="item-title">${esc(i.title)}</span><span class="chips">${chipsFor(i)}</span></button>
    ${i.hobby && i.status === 'active' ? `<button class="season-toggle ${i.inSeason ? 'on' : ''}" data-action="season" data-id="${i.id}" aria-pressed="${!!i.inSeason}">${leafSvg('flower', 22)}<span>${i.inSeason ? 'In season' : 'Seed'}</span></button>` : ''}
    ${i.status === 'done' ? `<button class="season-toggle" data-action="bring-back" data-id="${i.id}">${I2.back}<span>Bring back</span></button>` : ''}
  </div>`;
}
function viewGarden() {
  const groups = {};
  S.items.forEach(i => { (groups[groupOf(i)] ||= []).push(i); });
  const done = groups.done || [];
  return `<section class="panel glass">
    ${panelHead('Garden', { sub: 'Everything that can float down your stream.' })}
    <div class="row garden-actions"><button class="btn primary" data-action="add">${I.plus}<span>Add</span></button>
    <button class="btn glass-btn" data-action="open-clearing" data-from="garden">${leafSvg('clover', 20)} Weekly clearing</button></div>
    ${GROUPS.filter(([k]) => groups[k]?.length).map(([k, title, hint]) => `
      <section class="group ${k === 'basket' ? 'basket' : ''}"><h3>${title}</h3>${hint ? `<p class="hint">${hint}</p>` : ''}
      ${groups[k].map(itemRow).join('')}</section>`).join('')}
    ${done.length ? `<details class="group done"><summary>Finished (${done.length})</summary><p class="hint">Finished something by accident? Tap “Bring back”.</p>${done.map(itemRow).join('')}</details>` : ''}
    ${S.items.length ? '' : '<p class="muted center">Nothing here yet. Tap Add to plant your first seed.</p>'}
  </section>`;
}

function blankForm() {
  return { title: '', states: [], hobby: false, inSeason: true, work: false, weekly: false, days: [], steps: [], deadline: null, status: 'active', lastDoneWeek: null, doneWeek: null };
}
function viewEdit() {
  const f = S.form;
  const isNew = !S.editing;
  return `<form class="panel glass form" onsubmit="return false">
    <div class="panel-head"><div class="panel-title"><h1>${isNew ? 'Add something' : f.status === 'basket' ? 'Give this seed a home' : 'Edit'}</h1></div>
      <button type="button" class="icon-btn" data-action="cancel-edit" aria-label="Close without saving">${I2.close}</button></div>
    <label class="field"><span>What is it?</span><input data-field="title" value="${esc(f.title)}" placeholder="e.g. Repot the basil" maxlength="120" autocomplete="off"></label>
    <p class="err" id="err-title"></p>
    <fieldset><legend>Where does it fit?</legend>
      <div class="chips-select">${PLACES.map(s => `<button type="button" class="chip-btn ${f.states.includes(s) ? 'on' : ''}" data-action="toggle-state" data-state="${s}" aria-pressed="${f.states.includes(s)}">${STATE_INFO[s].label}</button>`).join('')}</div>
      <p class="hint">You can pick more than one.</p><p class="err" id="err-states"></p></fieldset>
    <label class="check"><input type="checkbox" data-field="hobby" ${f.hobby ? 'checked' : ''}><span>This is a hobby <span class="muted">(only floats by while it’s in season)</span></span></label>
    ${f.hobby ? `<label class="check indent"><input type="checkbox" data-field="inSeason" ${f.inSeason ? 'checked' : ''}><span>In season now</span></label>` : ''}
    <label class="check"><input type="checkbox" data-field="work" ${f.work ? 'checked' : ''}><span>Work task <span class="muted">(only floats by on weekdays before 5pm)</span></span></label>
    ${f.states.includes('clearing') ? `<label class="check"><input type="checkbox" data-field="weekly" ${f.weekly ? 'checked' : ''}><span>Comes back every week</span></label>` : ''}
    <fieldset><legend>Regular days <span class="muted">(optional, like workouts)</span></legend>
      <div class="chips-select days">${DAYS.map((d, i) => `<button type="button" class="chip-btn ${f.days.includes(i) ? 'on' : ''}" data-action="toggle-day" data-day="${i}" aria-pressed="${f.days.includes(i)}">${d}</button>`).join('')}</div>
      <p class="hint">On these days it floats by first, whatever your energy (except Social).</p></fieldset>
    <fieldset><legend>Steps</legend>
      ${f.steps.length ? `<ol class="steps-edit">${f.steps.map((s, k) => `<li class="${s.done ? 'done' : ''}"><button type="button" class="step-text" data-action="step-toggle" data-k="${k}" title="Tap to mark done or not done">${esc(s.text)}</button><button type="button" class="icon-btn small" data-action="step-remove" data-k="${k}" aria-label="Remove step">${I2.close}</button></li>`).join('')}</ol>` : ''}
      <div class="row"><input id="new-step" placeholder="Add a small step" maxlength="200" autocomplete="off"><button type="button" class="btn glass-btn" data-action="step-add">Add</button></div>
      <p class="hint">The stream only ever shows the next one. Tap a step to mark it done or not done.</p></fieldset>
    <label class="field"><span>Deadline <span class="muted">(optional, makes it float by more often as the day gets closer)</span></span>
      <input type="date" data-field="deadline" value="${f.deadline || ''}"></label>
    ${!isNew && f.status === 'done' ? '<label class="check"><input type="checkbox" data-field="reopen"><span>Bring this back (it’s marked as finished)</span></label>' : ''}
    <div class="stack">
      <button type="button" class="btn primary" data-action="save-item">Save</button>
      ${isNew ? '<button type="button" class="btn glass-btn" data-action="save-later">Decide later</button>' : ''}
      <button type="button" class="link" data-action="cancel-edit">Cancel</button>
      ${!isNew ? '<button type="button" class="link danger" data-action="delete-item">Delete</button>' : ''}
    </div></form>`;
}

function viewClearing() {
  const items = clearingItems();
  const closed = S.settings.clearingClosedWeek === clearingWeekKey();
  return `<section class="panel glass">
    ${panelHead('Weekly clearing', { back: true, close: false, sub: 'A few small things, then they’re gone for the week.' })}
    ${items.length ? `<ul class="clearing-list">${items.map(i => {
      const done = doneThisWeek(i);
      const step = nextStep(i);
      return `<li class="${done ? 'done' : ''}"><button class="tick ${done ? 'on' : ''}" data-action="clear-tick" data-id="${i.id}" aria-pressed="${done}" aria-label="${done ? 'Undo' : 'Done'}: ${esc(i.title)}">${I.check}</button>
        <div><span class="item-title">${esc(i.title)}</span>
        <span class="small block muted">${done ? 'Done. Tap the tick to undo.' : i.weekly ? 'Every week' : 'Whenever you’re ready'}</span>
        ${step && !done ? `<span class="small block">Next: ${esc(step.text)}</span>` : ''}</div></li>`;
    }).join('')}</ul>` : '<p class="muted">Nothing in your clearing. Add things in the Garden and choose “Weekly clearing”.</p>'}
    <p class="muted">Anything left will simply come back next week.</p>
    <div class="stack">${closed ? '<p class="small center">The clearing is closed for this week.</p>' : '<button class="btn primary" data-action="close-clearing">Close the clearing for this week</button>'}
    <button class="btn glass-btn" data-action="clearing-back">${I2.back} Back</button></div></section>`;
}

function viewSettings() {
  const sm = S.settings.seasonMode || 'summer';
  const hasSeasons = (GLADE.stages || []).some(s => s.autumn || s.winter);
  return `<section class="panel glass">${panelHead('Settings')}
    <fieldset><legend>How the glade looks</legend>
      <label class="check"><input type="radio" name="season" data-setting="seasonMode" value="summer" ${sm === 'summer' ? 'checked' : ''}><span>Always summer</span></label>
      <label class="check"><input type="radio" name="season" data-setting="seasonMode" value="seasons" ${sm === 'seasons' ? 'checked' : ''}><span>Follow the seasons</span></label>
      <p class="hint">${hasSeasons ? '' : 'Seasonal paintings haven’t been added yet, so the glade looks the same either way for now. '}The journal always follows the real seasons, so its plants and birds match what you can spot outside.</p></fieldset>
    <label class="field"><span>Weekly clearing day</span><select data-setting="clearingDay">${DAY_NAMES.map((d, i) => `<option value="${i}" ${Number(S.settings.clearingDay ?? 0) === i ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
    ${soundSettings()}
    ${previewControls()}
    <hr>${S.guest ? '<p class="small">You’re exploring as a guest. Changes disappear when you leave or refresh.</p><button class="btn glass-btn" data-action="leave-guest">Leave guest mode</button>'
      : `<p class="small">Signed in as ${esc(S.user?.email || '')}</p><button class="btn glass-btn" data-action="signout">Sign out</button>`}</section>`;
}

// Try the glade at each growth stage and season with one slider, without pressing any leaves.
function previewSteps() {
  const stages = (GLADE.stages || []).filter(s => s.summer || s.autumn || s.winter);
  const seasons = ['summer', 'autumn', 'winter'].filter(se => stages.some(s => s[se]));
  const steps = [{ label: 'As it is', count: null, season: null }];
  seasons.forEach(se => stages.forEach(st => steps.push({ label: `${se[0].toUpperCase() + se.slice(1)} · ${st.name || `after ${st.after}`}`, count: st.after, season: se })));
  return { steps, seasons, stages };
}
function previewIndex(steps) {
  const i = steps.findIndex(s => s.count === S.previewCount && s.season === S.previewSeason);
  return i < 0 ? 0 : i;
}
function previewControls() {
  const { steps, seasons, stages } = previewSteps();
  if (steps.length < 3) return '';
  const i = previewIndex(steps);
  return `<fieldset class="preview-box"><legend>Preview the glade</legend>
    <p class="hint">Slide to see the glade grow through each season. This only changes what you see right now.</p>
    <div class="preview-label"><span id="preview-label">${esc(steps[i].label)}</span><button type="button" class="link small" id="preview-reset" data-action="preview-reset" ${i ? '' : 'hidden'}>Back to as it is</button></div>
    <input type="range" id="preview-slider" min="0" max="${steps.length - 1}" step="1" value="${i}" aria-label="Preview the glade" aria-valuetext="${esc(steps[i].label)}">
    <div class="preview-ticks" style="--groups:${seasons.length}"><span class="tick-now">Now</span>${seasons.map(se => `<span>${se[0].toUpperCase() + se.slice(1)}</span>`).join('')}</div>
    <p class="hint small">Each season goes ${stages.map(s => (s.name || '').toLowerCase()).join(' → ')}.</p>
  </fieldset>`;
}
function applyPreview(index) {
  const { steps } = previewSteps();
  const st = steps[index] || steps[0];
  S.previewCount = st.count;
  S.previewSeason = st.season;
  const label = document.getElementById('preview-label');
  if (label) label.textContent = st.label;
  const slider = document.getElementById('preview-slider');
  if (slider) { slider.setAttribute('aria-valuetext', st.label); slider.value = String(index); }
  const reset = document.getElementById('preview-reset');
  if (reset) reset.hidden = index === 0;
  updateGlade();
  placeStage();
  placeRiver();
}

// ---------- render ----------
function render() {
  updateGlade();
  if (S.view === 'login') { $app.innerHTML = viewLogin(); return; }
  if (S.view === 'loading') { $app.innerHTML = '<div class="loading">The Glade is waking up…</div>'; return; }
  const views = { home: viewHome, stream: viewStream, begin: viewBegin, pressed: viewPressed, journal: viewJournal, garden: viewGarden, edit: viewEdit, clearing: viewClearing, settings: viewSettings };
  const html = (views[S.view] || viewHome)();
  updateGlade(); // a view may have redirected
  $app.innerHTML = shell(html);
  if (S.view === 'journal') hydratePhotos();
}

function hydratePhotos() {
  document.querySelectorAll('.photo[data-wiki]').forEach(async el => {
    const p = await fetchPhoto(el.dataset.wiki);
    if (!el.isConnected) return;
    const fail = () => { const ph = el.querySelector('.photo-ph'); if (ph) ph.textContent = 'No photo right now'; };
    if (!p || !p.srcs?.length) { fail(); return; }
    const img = new Image();
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    let i = 0;
    img.onload = () => { el.querySelector('.photo-ph')?.remove(); el.classList.add('loaded'); };
    img.onerror = () => { i += 1; if (i < p.srcs.length) img.src = p.srcs[i]; else { img.remove(); fail(); } };
    img.src = p.srcs[0];
    el.appendChild(img);
    const link = el.closest('article').querySelector('[data-wiki-link]');
    if (link) link.href = p.page;
  });
}

let toastTimer;
let toastAction = null;
function toast(msg, action = null) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  toastAction = action;
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button data-action="toast-action">${esc(action.label)}</button>` : ''}`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); toastAction = null; }, action ? 6000 : 3200);
}
function showErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }

function go(view, { fromHistory = false } = {}) {
  if (view === 'glade') view = gladeHome();
  if (view === 'begin' && timerRunning() && S.current !== S.timer.itemId && !getItem(S.current)) S.current = S.timer.itemId;
  if (view === 'begin' && timerRunning() && (!S.current || S.current === S.timer.itemId)) { S.current = S.timer.itemId; S.mood = S.mood || S.timer.mood || 'focus'; }
  if (!fromHistory && view !== S.view) { try { history.pushState({ view }, ''); } catch { /* not allowed here */ } }
  S.view = view;
  if (view === 'journal' && !S.journalDate) S.journalDate = dateStr();
  render();
  window.scrollTo(0, 0);
}

function addStepFromInput() {
  const input = document.getElementById('new-step');
  const text = (input?.value || '').trim();
  if (!text) { input?.focus(); return; }
  S.form.steps.push({ text, done: false });
  render();
  document.getElementById('new-step')?.focus();
}

function saveForm(later) {
  const f = S.form;
  f.title = (f.title || '').trim();
  if (!f.title) { showErr('err-title', 'Give it a name first.'); return; }
  if (!later && !f.states.length && !f.days.length) { showErr('err-states', 'Pick at least one place it fits (or some regular days).'); return; }
  const pending = (document.getElementById('new-step')?.value || '').trim();
  if (pending) f.steps.push({ text: pending, done: false });
  let status = later ? 'basket' : (f.status === 'basket' || !f.status ? 'active' : f.status);
  if (f.reopen) status = 'active';
  const data = {
    title: f.title, states: f.states, hobby: !!f.hobby, inSeason: !!f.inSeason, work: !!f.work,
    weekly: !!f.weekly && f.states.includes('clearing'), days: f.days, steps: f.steps,
    deadline: f.deadline || null, status, lastDoneWeek: f.lastDoneWeek || null, doneWeek: status === 'done' ? (f.doneWeek || null) : null,
  };
  if (S.editing) updateItem(S.editing, data);
  else addItem({ ...data, createdAt: Date.now() });
  toast(later ? 'Saved in your seed basket.' : 'Saved.');
  S.form = null; S.editing = null;
  go(S.returnView || 'garden');
}

// ---------- events ----------
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const a = el.dataset.action;
  switch (a) {
    case 'go': go(el.dataset.view); break;
    case 'close-panel': go('glade'); break;
    case 'signin':
      try { await realDb.signIn(); } catch (err) { showErr('login-err', err.code === 'auth/unauthorized-domain' ? 'This web address isn’t allowed yet. Add it under Firebase → Authentication → Settings → Authorized domains.' : 'Sign-in didn’t work. Please try again.'); }
      break;
    case 'signout': stopTimer(); await db.signOut(); break;
    case 'guest': await enterGuest(); break;
    case 'leave-guest': leaveGuest(); break;
    case 'sound': await toggleSound(); break;
    case 'music-toggle': if (isAmbientOn()) await toggleAmbient(); toggleMusic(); saveSettings({ soundOn: isMusicPlaying() }); refreshSoundUi(); break;
    case 'music-next': if (isAmbientOn()) await toggleAmbient(); nextSong(); saveSettings({ songIndex: currentIndex() }); refreshSoundUi(); break;
    case 'preview-reset': applyPreview(0); break;
    case 'toast-action': {
      const fn = toastAction?.fn;
      document.getElementById('toast')?.classList.remove('show');
      toastAction = null;
      if (fn) fn();
      break;
    }
    case 'mood':
      S.mood = el.dataset.mood; S.drifted = new Set();
      S.leafId = pickLeaf(S.mood)?.id || null;
      go('stream'); break;
    case 'change-energy': S.mood = null; S.leafId = null; go('home'); break;
    case 'drift': {
      const leaf = $river.querySelector('.river-leaf'), card = document.getElementById('leaf-card');
      leaf?.classList.add('away'); card?.classList.add('away');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => { S.drifted.add(S.leafId); S.leafId = pickLeaf(S.mood)?.id || null; render(); }, reduce ? 0 : 650);
      break;
    }
    case 'restart-stream': S.drifted = new Set(); S.leafId = pickLeaf(S.mood)?.id || null; render(); break;
    case 'another-leaf': S.leafId = pickLeaf(S.mood)?.id || null; go('stream'); break;
    case 'begin': S.current = S.leafId; go('begin'); break;
    case 'open-timer': S.current = S.timer.itemId; S.mood = S.mood || S.timer.mood || 'focus'; go('begin'); break;
    case 'start-timer': startTimer(); break;
    case 'step-done': {
      const it = getItem(S.current);
      const prev = { steps: JSON.parse(JSON.stringify(it.steps || [])) };
      const k = (it.steps || []).findIndex(s => !s.done);
      if (k >= 0) updateItem(it.id, { steps: it.steps.map((s, j) => (j === k ? { ...s, done: true } : s)) });
      press(it, S.mood, { prev }); break;
    }
    case 'done-now': press(getItem(S.current), S.mood); break;
    case 'complete': {
      const it = getItem(S.current);
      updateItem(it.id, { status: 'done' });
      press(it, S.mood, { prev: { status: 'active' } }); break;
    }
    case 'undo': {
      const itemId = S.undo?.itemId;
      undoLast();
      toast('Undone. Nothing was pressed.');
      if (itemId && getItem(itemId)?.status === 'active') { S.leafId = itemId; }
      go(S.mood ? 'stream' : 'home'); break;
    }
    case 'just-rest': press(null, 'rest'); break;
    case 'stream-back': if (S.timer && S.timer.itemId === S.current) stopTimer(); go('stream'); break;
    case 'journal-today': S.journalDate = dateStr(); go('journal'); break;
    case 'jday': {
      const d = parseDate(S.journalDate || dateStr());
      d.setDate(d.getDate() + Number(el.dataset.delta));
      if (dateStr(d) <= dateStr()) { S.journalDate = dateStr(d); render(); }
      break;
    }
    case 'season': { const it = getItem(el.dataset.id); updateItem(it.id, { inSeason: !it.inSeason }); render(); break; }
    case 'bring-back': updateItem(el.dataset.id, { status: 'active', doneWeek: null }); toast('Brought back.'); render(); break;
    case 'add': S.form = blankForm(); S.editing = null; S.returnView = 'garden'; go('edit'); break;
    case 'edit': {
      const it = getItem(el.dataset.id);
      S.editing = it.id;
      S.form = { ...blankForm(), ...JSON.parse(JSON.stringify(it)) };
      delete S.form.id;
      S.returnView = S.view === 'edit' ? 'garden' : S.view;
      go('edit'); break;
    }
    case 'cancel-edit': S.form = null; S.editing = null; go(S.returnView || 'garden'); break;
    case 'toggle-state': {
      const st = el.dataset.state, f = S.form;
      f.states = f.states.includes(st) ? f.states.filter(x => x !== st) : [...f.states, st];
      render(); break;
    }
    case 'toggle-day': {
      const d = Number(el.dataset.day), f = S.form;
      f.days = f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d].sort();
      render(); break;
    }
    case 'step-add': addStepFromInput(); break;
    case 'step-remove': S.form.steps.splice(Number(el.dataset.k), 1); render(); break;
    case 'step-toggle': { const s = S.form.steps[Number(el.dataset.k)]; s.done = !s.done; render(); break; }
    case 'save-item': saveForm(false); break;
    case 'save-later': saveForm(true); break;
    case 'delete-item':
      if (el.dataset.confirm !== '1') { el.dataset.confirm = '1'; el.textContent = 'Tap again to delete'; break; }
      deleteItem(S.editing); S.form = null; S.editing = null; toast('Deleted.');
      go(GLADE_VIEWS.includes(S.returnView) ? 'glade' : 'garden'); break;
    case 'open-clearing': S.clearingReturn = el.dataset.from === 'home' ? 'glade' : 'garden'; go('clearing'); break;
    case 'clearing-back': go(S.clearingReturn || 'garden'); break;
    case 'clear-tick': {
      const it = getItem(el.dataset.id);
      if (doneThisWeek(it)) { untickClearing(it); toast('Undone.'); render(); break; }
      const prev = it.weekly ? { lastDoneWeek: it.lastDoneWeek || null } : { status: 'active', doneWeek: null };
      if (it.weekly) updateItem(it.id, { lastDoneWeek: clearingWeekKey() });
      else updateItem(it.id, { status: 'done', doneWeek: clearingWeekKey() });
      press(it, 'clearing', { navigate: false, prev });
      render(); break;
    }
    case 'close-clearing':
      saveSettings({ clearingClosedWeek: clearingWeekKey() });
      toast('The clearing is closed until next week.');
      go(S.clearingReturn || 'glade'); break;
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'preview-slider') { applyPreview(Number(t.value)); return; }
  if (t.id === 'music-volume') { setVolume(Number(t.value)); S.settings.musicVolume = Number(t.value); return; }
  if (t.dataset.field && S.form && t.type !== 'checkbox') {
    S.form[t.dataset.field] = t.value || (t.dataset.field === 'deadline' ? null : '');
    if (t.dataset.field === 'title') showErr('err-title', '');
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'song-select') { if (isAmbientOn()) toggleAmbient(); playSong(Number(t.value)); saveSettings({ songIndex: Number(t.value) }); refreshSoundUi(); return; }
  if (t.id === 'play-all') { setPlayAll(t.checked); saveSettings({ playAllSongs: t.checked }); return; }
  if (t.id === 'music-volume') { saveSettings({ musicVolume: Number(t.value) }); return; }
  if (t.dataset.field && S.form && t.type === 'checkbox') { S.form[t.dataset.field] = t.checked; render(); }
  if (t.dataset.setting) {
    const v = t.dataset.setting === 'clearingDay' ? Number(t.value) : t.value;
    const wasOn = soundOn();
    saveSettings({ [t.dataset.setting]: v });
    if (t.dataset.setting === 'soundMode') {
      // switch over to the chosen sound if something was already playing
      if (wasOn) { if (isMusicPlaying()) pauseMusic(); if (isAmbientOn()) toggleAmbient(); toggleSound(); }
      render();
      return;
    }
    toast('Saved.');
    updateGlade();
  }
});

// The back button (or swipe back on a phone) steps back through the app's pages; the timer keeps running.
window.addEventListener('popstate', e => {
  if (['login', 'loading'].includes(S.view)) return;
  let view = e.state?.view || gladeHome();
  if (view === 'edit' && !S.form) view = 'garden';
  if (view === 'begin' && !getItem(S.current)) view = gladeHome();
  go(view, { fromHistory: true });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'new-step') { e.preventDefault(); addStepFromInput(); }
  if (e.key === 'Escape' && S.view === 'edit') { S.form = null; S.editing = null; go(S.returnView || 'garden'); }
});

// ---------- starting items ----------
function starterItems() {
  const t = Date.now();
  let n = 0;
  const mk = o => ({ ...blankForm(), inSeason: false, createdAt: t + n++, ...o });
  const clothes = [{ text: 'Put on your workout clothes', done: false }];
  return [
    mk({ title: 'Herbarium app: write the Google Sheet info', states: ['focus'] }),
    mk({ title: 'Sounds and Words app', states: ['focus'], work: true }),
    mk({ title: 'Christmas welcome board', states: ['focus', 'creative'], work: true }),
    mk({ title: 'Procreate class', states: ['creative'], hobby: true }),
    mk({ title: 'Watercolour class', states: ['creative'], hobby: true }),
    mk({ title: 'Figure drawing class', states: ['creative'], hobby: true }),
    mk({ title: 'Animal learning', states: ['creative'], hobby: true }),
    mk({ title: 'Knitting', states: ['creative', 'rest'], hobby: true }),
    mk({ title: 'Christmas gift crocheting', states: ['creative'], hobby: true, inSeason: true }),
    mk({ title: 'Playing music', states: ['creative', 'rest'], hobby: true, inSeason: true }),
    mk({ title: 'Video games', states: ['rest'] }),
    mk({ title: 'Isometric exercises', days: [2], steps: clothes }),
    mk({ title: 'Mobility and yoga flow', days: [4], steps: clothes }),
    mk({ title: 'Push/pull exercises', days: [6], steps: clothes }),
    mk({ title: 'Weekly budget', states: ['clearing'], weekly: true }),
    mk({ title: 'Pay bills', states: ['clearing'], weekly: true }),
    mk({ title: 'Change driving licence online', states: ['clearing'] }),
  ];
}

// ---------- guest mode ----------
async function enterGuest() {
  stopTimer();
  db = await import('./guest-db.js');
  const data = await db.loadAll();
  Object.assign(S, { guest: true, user: null, items: data.items, log: data.log, settings: data.settings, mood: null, leafId: null, journalDate: null, form: null, editing: null });
  restoreTimer();
  applyMusicSettings();
  go('home');
  startSoundIfWanted();
  setTimeout(() => toast('Welcome! This is a sample glade. Try checking in.'), 500);
}
function leaveGuest() {
  stopTimer();
  pauseMusic();
  Object.assign(S, { guest: false, items: [], log: [], settings: {}, journalDate: null, form: null, editing: null, mood: null, leafId: null });
  db = realDb;
  S.view = 'login';
  render();
}

// ---------- boot ----------
async function loadUser(user) {
  S.view = 'loading'; render();
  try {
    const data = await db.loadAll(user.uid);
    S.items = data.items; S.log = data.log; S.settings = data.settings;
    if (!S.settings.seeded) {
      if (!S.items.length) {
        S.items = await db.seed(starterItems());
        setTimeout(() => toast('Your projects, hobbies and must-dos are already in the Garden.'), 600);
      }
      saveSettings({ seeded: true });
    }
    restoreTimer();
    applyMusicSettings();
    S.view = 'home';
    render();
    startSoundIfWanted();
  } catch (err) {
    console.error(err);
    $app.innerHTML = `<main class="main"><section class="card"><h2>Couldn’t open your glade</h2><p>${err.code === 'permission-denied' ? 'Firestore said no. Check that the security rules from the README are published.' : 'Please check your connection and refresh.'}</p></section></main>`;
  }
}

async function boot() {
  if (!configured) { S.view = 'login'; render(); return; }
  render();
  try {
    realDb = await import('./db.js');
  } catch (err) {
    console.error(err);
    S.view = 'login'; render();
    showErr('login-err', 'Couldn’t reach Firebase. Check your connection and the details in js/firebase-config.js. You can still explore as a guest.');
    return;
  }
  db = realDb;
  db.setErrorHandler(err => { console.error(err); toast('Something didn’t save. Check your connection or the Firestore rules.'); });
  db.onUser(user => {
    if (S.guest) return; // guests stay in their sample glade
    S.user = user;
    if (!user) { S.view = 'login'; render(); return; }
    loadUser(user);
  });
}

boot();
