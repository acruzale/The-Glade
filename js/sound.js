// The Glade — soft forest sounds made in the browser (a stream and gentle birdsong).
// If you add your own recording at sounds/forest.mp3, it is used instead.

let ctx = null, master = null, birdBus = null, noiseSrc = null, birdTimer = null;
let on = false, fileAudio = null, fileChecked = false;

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    birdBus = ctx.createGain();
    birdBus.gain.value = 0.9;
    birdBus.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function startStream() {
  const len = ctx.sampleRate * 8;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  const drift = d[len - 1] - d[0]; // make the loop seamless
  for (let i = 0; i < len; i++) d[i] -= drift * (i / len);

  noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = buf;
  noiseSrc.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1100;
  const g = ctx.createGain();
  g.gain.value = 0.32;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.13;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain).connect(g.gain);
  lfo.start();
  noiseSrc.connect(lp).connect(g).connect(master);
  noiseSrc.start();
}

function chirp(t, f0, f1, dur, vol, out) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function birdPhrase(out = birdBus, loud = 1) {
  let dest = out;
  if (ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.random() * 1.4 - 0.7;
    p.connect(out);
    dest = p;
  }
  let t = ctx.currentTime + 0.05;
  const base = 2300 + Math.random() * 2000;
  const notes = 3 + Math.floor(Math.random() * 5);
  const style = Math.floor(Math.random() * 3);
  for (let i = 0; i < notes; i++) {
    const dur = 0.05 + Math.random() * 0.09;
    const f0 = base * (0.9 + Math.random() * 0.3);
    const f1 = style === 0 ? f0 * 1.35 : style === 1 ? f0 * 0.75 : f0 * (Math.random() < 0.5 ? 1.25 : 0.8);
    chirp(t, f0, f1, dur, (0.035 + Math.random() * 0.03) * loud, dest);
    t += dur + 0.03 + Math.random() * 0.07;
  }
}

function birdLoop() {
  if (!on) return;
  birdPhrase();
  birdTimer = setTimeout(birdLoop, 2500 + Math.random() * 6500);
}

async function hasFile() {
  if (fileChecked) return !!fileAudio;
  fileChecked = true;
  try {
    const r = await fetch('sounds/forest.mp3', { method: 'HEAD' });
    if (r.ok) { fileAudio = new Audio('sounds/forest.mp3'); fileAudio.loop = true; fileAudio.volume = 0.5; }
  } catch { /* no file */ }
  return !!fileAudio;
}

export function isAmbientOn() { return on; }

export async function toggleAmbient() {
  on = !on;
  if (await hasFile()) {
    if (on) fileAudio.play().catch(() => { on = false; });
    else fileAudio.pause();
    return on;
  }
  ensureCtx();
  if (on) {
    if (!noiseSrc) startStream();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.6, ctx.currentTime, 0.8);
    birdLoop();
  } else {
    clearTimeout(birdTimer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  }
  return on;
}

// A soft wooden-bell chime plus a little birdsong, for the end of the starter timer.
export function chime() {
  try {
    ensureCtx();
    const t = ctx.currentTime + 0.05;
    [[660, 0.12], [990, 0.07], [1320, 0.04]].forEach(([freq, vol], i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.18);
      g.gain.exponentialRampToValueAtTime(vol, t + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 2.6);
      o.connect(g).connect(ctx.destination);
      o.start(t + i * 0.18);
      o.stop(t + i * 0.18 + 2.7);
    });
    setTimeout(() => birdPhrase(ctx.destination, 1.6), 900);
  } catch { /* audio not available */ }
}
