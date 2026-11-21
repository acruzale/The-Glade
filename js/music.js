// The Glade — your own music. Songs play one after another and loop back to the first,
// or one song repeats. The song list is set in glade-config.js.

let audio = null;
let songs = [];
let index = 0;
let playAll = true;
let volume = 0.6;
let failures = 0;
let listener = () => {};

export function onMusicChange(fn) { listener = fn; }
const notify = () => listener();

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'none';
  audio.volume = volume;
  audio.addEventListener('ended', () => { if (playAll) nextSong(); });
  audio.addEventListener('playing', () => { failures = 0; notify(); });
  audio.addEventListener('pause', notify);
  audio.addEventListener('error', () => {
    // a missing or unreadable file: skip it, but stop if none of them work
    failures += 1;
    if (failures < songs.length) nextSong();
    else { failures = 0; notify(); }
  });
  return audio;
}

export function setupMusic(list, { start = 0, all = true, vol = 0.6 } = {}) {
  songs = (list || []).filter(s => s && s.file);
  index = Math.min(Math.max(0, start), Math.max(0, songs.length - 1));
  playAll = all;
  volume = vol;
  if (audio) { audio.volume = volume; audio.loop = !playAll; }
}

export const hasSongs = () => songs.length > 0;
export const songList = () => songs;
export const currentIndex = () => index;
export const isMusicPlaying = () => !!audio && !audio.paused && !audio.ended;

export function playSong(i = index) {
  if (!songs.length) return;
  const a = ensureAudio();
  index = ((i % songs.length) + songs.length) % songs.length;
  const src = new URL(songs[index].file, document.baseURI).href;
  if (a.src !== src) a.src = src;
  a.loop = !playAll;
  a.volume = volume;
  a.play().catch(() => notify());
  notify();
}

export function pauseMusic() { if (audio) audio.pause(); notify(); }
export function toggleMusic() { if (isMusicPlaying()) pauseMusic(); else playSong(index); }
export function nextSong() { playSong(index + 1); }

export function setPlayAll(on) { playAll = on; if (audio) audio.loop = !on; }
export function setVolume(v) { volume = v; if (audio) audio.volume = v; }
