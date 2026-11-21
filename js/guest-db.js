// The Glade — guest mode. Same functions as db.js, but everything lives in memory
// and disappears when the page is closed or refreshed. Nothing is sent to Firebase.

let n = 0;
const newId = () => `guest-${n++}`;
const dateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function daysFromNow(k) { const d = new Date(); d.setDate(d.getDate() + k); return dateStr(d); }

function sampleItems() {
  const t = Date.now();
  let c = 0;
  const mk = o => ({
    title: '', states: [], hobby: false, inSeason: false, work: false, weekly: false, days: [], steps: [],
    deadline: null, status: 'active', lastDoneWeek: null, createdAt: t + c++, id: newId(), ...o,
  });
  const steps = list => list.map((text, i) => ({ text, done: i === 0 && list.length > 2 }));
  return [
    mk({ title: 'Plan a small garden corner', states: ['focus'], steps: steps(['Measure the space', 'List five plants you like', 'Sketch a rough layout', 'Check which plants like shade']) }),
    mk({ title: 'Write a short story', states: ['focus', 'creative'], steps: steps(['Write one opening sentence', 'Name the main character', 'Outline the ending']) }),
    mk({ title: 'Organise photo albums', states: ['focus'], deadline: daysFromNow(9), steps: steps(['Pick one month of photos', 'Delete blurry ones']) }),
    mk({ title: 'Prepare slides for Monday', states: ['focus'], work: true, steps: steps(['Open last week’s slides']) }),
    mk({ title: 'Watercolour practice', states: ['creative'], hobby: true, inSeason: true, steps: steps(['Fill water jars and lay out paints']) }),
    mk({ title: 'Bread baking', states: ['creative', 'rest'], hobby: true, inSeason: true }),
    mk({ title: 'Learning guitar', states: ['creative'], hobby: true }),
    mk({ title: 'Birdwatching notes', states: ['creative', 'rest'], hobby: true }),
    mk({ title: 'Read a cosy book', states: ['rest'] }),
    mk({ title: 'Video games', states: ['rest'] }),
    mk({ title: 'Listen to an album start to finish', states: ['rest'] }),
    mk({ title: 'Evening walk', days: [1, 3, 5], steps: [{ text: 'Put on your shoes', done: false }] }),
    mk({ title: 'Stretching', days: [0, 2, 4, 6], steps: [{ text: 'Roll out the mat', done: false }] }),
    mk({ title: 'Weekly budget', states: ['clearing'], weekly: true }),
    mk({ title: 'Water the plants', states: ['clearing'], weekly: true }),
    mk({ title: 'Renew library card', states: ['clearing'] }),
    mk({ title: 'Call about the bike repair', status: 'basket' }),
  ];
}

// A month of example sessions so the glade already has trees and a few birds.
function sampleLog(items) {
  const byTitle = t => items.find(i => i.title === t);
  const pool = [
    ['Plan a small garden corner', 'focus', 'fern'],
    ['Write a short story', 'creative', 'flower'],
    ['Watercolour practice', 'creative', 'flower'],
    ['Bread baking', 'creative', 'flower'],
    ['Read a cosy book', 'rest', 'reed'],
    ['Video games', 'rest', 'reed'],
    [null, 'rest', 'reed'],
    ['Evening walk', 'focus', 'oak'],
    ['Stretching', 'focus', 'oak'],
    ['Weekly budget', 'clearing', 'clover'],
    ['Organise photo albums', 'focus', 'fern'],
    ['Listen to an album start to finish', 'rest', 'reed'],
  ];
  const out = [];
  let k = 0;
  for (let day = 34; day >= 1; day--) {
    if (day % 6 === 0) continue; // some quiet days too
    const perDay = 3 + (day % 3);
    for (let j = 0; j < perDay; j++) {
      const [title, state, kind] = pool[(k * 7 + j * 3) % pool.length];
      const d = new Date(); d.setDate(d.getDate() - day);
      out.push({ id: newId(), itemId: title ? byTitle(title)?.id || null : null, title: title || 'Rested', state, kind, date: dateStr(d), at: d.getTime() + j });
      k++;
    }
  }
  return out;
}

export function setErrorHandler() {}
export function onUser() {}
export async function signIn() {}
export async function signOut() {}

export async function loadAll() {
  const items = sampleItems();
  return {
    items,
    log: sampleLog(items),
    settings: { seasonMode: 'summer', clearingDay: new Date().getDay(), clearingClosedWeek: null, seeded: true },
  };
}
export function saveSettings() {}
export function addItem(data) { return { id: newId(), ...data }; }
export function updateItem() {}
export function deleteItem() {}
export function addLog(entry) { return { id: newId(), ...entry }; }
export function deleteLog() {}
export async function seed(list) { return list.map(d => ({ id: newId(), ...d })); }
