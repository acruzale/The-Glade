// The Glade — plants and birds for the pressed-leaf journal.
// All native to Switzerland / Central Europe. `months` = when they're easiest to spot.
// `wiki` is the English Wikipedia page used to fetch a real photo.

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const PLANTS = [
  { name: 'Snowdrop', latin: 'Galanthus nivalis', wiki: 'Galanthus nivalis', months: [1, 2, 3], fact: 'One of the first flowers of the year. It can push up through thin snow, helped by hardened tips on its leaves.' },
  { name: 'Christmas rose', latin: 'Helleborus niger', wiki: 'Helleborus niger', months: [12, 1, 2, 3], fact: 'Native to the Alps, it flowers in the middle of winter, often with snow around it.' },
  { name: 'Holly', latin: 'Ilex aquifolium', wiki: 'Ilex aquifolium', months: [11, 12, 1, 2], fact: 'Only female holly trees carry the red berries, which help birds through the winter.' },
  { name: 'Ivy', latin: 'Hedera helix', wiki: 'Hedera helix', months: [9, 10, 11, 12, 1, 2], fact: 'Ivy flowers in autumn, when little else does, and its berries ripen in late winter, just when birds need food most.' },
  { name: 'Mistletoe', latin: 'Viscum album', wiki: 'Viscum album', months: [12, 1, 2], fact: 'A half-parasite that grows on trees like apple and poplar. Birds spread its sticky seeds from branch to branch.' },
  { name: 'Norway spruce', latin: 'Picea abies', wiki: 'Picea abies', months: [11, 12, 1, 2], fact: 'The most common tree in Swiss forests, and the classic Christmas tree.' },
  { name: 'Hazel', latin: 'Corylus avellana', wiki: 'Corylus avellana', months: [1, 2, 3, 9], fact: 'Its yellow catkins appear in late winter. The tiny red female flowers are easy to miss but become hazelnuts.' },
  { name: 'Scots pine', latin: 'Pinus sylvestris', wiki: 'Pinus sylvestris', months: ALL, fact: 'Look up the trunk: the bark near the top of a Scots pine turns a warm orange.' },
  { name: 'Hart’s-tongue fern', latin: 'Asplenium scolopendrium', wiki: 'Asplenium scolopendrium', months: ALL, fact: 'Unlike most ferns, its fronds are not divided at all. They are long, glossy straps, green all year.' },
  { name: 'Common haircap moss', latin: 'Polytrichum commune', wiki: 'Polytrichum commune', months: ALL, fact: 'One of the largest mosses. Up close, each stem looks like a tiny star-shaped pine tree.' },
  { name: 'Wood anemone', latin: 'Anemone nemorosa', wiki: 'Anemonoides nemorosa', months: [3, 4, 5], fact: 'Carpets woodland floors in spring before the trees leaf out. It spreads very slowly, so big patches often mean old woodland.' },
  { name: 'Lesser celandine', latin: 'Ficaria verna', wiki: 'Ficaria verna', months: [3, 4], fact: 'Its glossy yellow petals close up in dull weather and open again when the sun comes out.' },
  { name: 'Coltsfoot', latin: 'Tussilago farfara', wiki: 'Tussilago', months: [2, 3, 4], fact: 'Its yellow flowers appear before any leaves do, so it looks like a dandelion growing from bare ground.' },
  { name: 'Cowslip', latin: 'Primula veris', wiki: 'Primula veris', months: [4, 5], fact: 'Its nodding yellow flowers hang in a cluster, which is why it is sometimes called “key flower”.' },
  { name: 'Wild garlic', latin: 'Allium ursinum', wiki: 'Allium ursinum', months: [3, 4, 5], fact: 'You often smell a patch before you see it. Careful: its leaves look similar to poisonous lily of the valley.' },
  { name: 'Wood sorrel', latin: 'Oxalis acetosella', wiki: 'Oxalis acetosella', months: [4, 5], fact: 'Its clover-like leaves fold down at night and when it rains.' },
  { name: 'Spring gentian', latin: 'Gentiana verna', wiki: 'Gentiana verna', months: [4, 5, 6], fact: 'A tiny, intensely blue star of alpine meadows, flowering as the snow melts.' },
  { name: 'Dandelion', latin: 'Taraxacum officinale', wiki: 'Taraxacum officinale', months: [4, 5], fact: 'Each “flower” is actually a head of many tiny florets, and every one becomes a seed with its own parachute.' },
  { name: 'Blackthorn', latin: 'Prunus spinosa', wiki: 'Prunus spinosa', months: [3, 4, 9, 10], fact: 'White blossom covers its bare branches before the leaves appear. In autumn it carries dark blue sloes.' },
  { name: 'European beech', latin: 'Fagus sylvatica', wiki: 'Fagus sylvatica', months: [4, 5, 10], fact: 'The most common broadleaf tree in Switzerland. Fresh spring leaves are soft and silky at the edges.' },
  { name: 'Silver birch', latin: 'Betula pendula', wiki: 'Betula pendula', months: [3, 4, 10, 11], fact: 'Its white bark reflects sunlight, and its thin branches hang down like soft curtains.' },
  { name: 'Lily of the valley', latin: 'Convallaria majalis', wiki: 'Convallaria majalis', months: [5, 6], fact: 'Tiny white bells with a sweet scent. Every part of the plant is poisonous, so just admire it.' },
  { name: 'Ox-eye daisy', latin: 'Leucanthemum vulgare', wiki: 'Leucanthemum vulgare', months: [5, 6, 7, 8], fact: 'A classic of Swiss summer meadows. What looks like one flower is really many tiny flowers packed together.' },
  { name: 'Wild strawberry', latin: 'Fragaria vesca', wiki: 'Fragaria vesca', months: [5, 6, 7], fact: 'Small but full of flavour. The little “seeds” on the outside are actually the true fruits.' },
  { name: 'Edelweiss', latin: 'Leontopodium nivale', wiki: 'Leontopodium nivale', months: [7, 8, 9], fact: 'Its woolly white hairs protect it from cold and strong sunlight high in the mountains.' },
  { name: 'Yarrow', latin: 'Achillea millefolium', wiki: 'Achillea millefolium', months: [6, 7, 8, 9], fact: 'Its feathery leaves gave it the name millefolium: “a thousand leaves”.' },
  { name: 'Harebell', latin: 'Campanula rotundifolia', wiki: 'Campanula rotundifolia', months: [7, 8, 9], fact: 'Delicate blue bells on stems so thin they tremble in the slightest breeze.' },
  { name: 'Small-leaved lime', latin: 'Tilia cordata', wiki: 'Tilia cordata', months: [6, 7], fact: 'Its flowers smell sweet and are loved by bees. Dried, they make linden tea.' },
  { name: 'St John’s wort', latin: 'Hypericum perforatum', wiki: 'Hypericum perforatum', months: [6, 7, 8], fact: 'Hold a leaf up to the light and you will see tiny see-through dots, like pinpricks.' },
  { name: 'Lady fern', latin: 'Athyrium filix-femina', wiki: 'Athyrium filix-femina', months: [5, 6, 7, 8, 9], fact: 'Soft, lacy fronds that unroll in spring from tight curls called fiddleheads.' },
  { name: 'Bramble', latin: 'Rubus fruticosus', wiki: 'Rubus fruticosus', months: [7, 8, 9], fact: 'The same bush often carries flowers, green, red and ripe black berries all at once.' },
  { name: 'Rowan', latin: 'Sorbus aucuparia', wiki: 'Sorbus aucuparia', months: [8, 9, 10], fact: 'Its bright orange-red berries are a favourite of thrushes and blackbirds.' },
  { name: 'Sweet chestnut', latin: 'Castanea sativa', wiki: 'Castanea sativa', months: [9, 10, 11], fact: 'Grown in Ticino for centuries, where its nuts were once an important everyday food.' },
  { name: 'Field maple', latin: 'Acer campestre', wiki: 'Acer campestre', months: [9, 10, 11], fact: 'Its small, rounded leaves turn a soft butter-yellow in autumn.' },
  { name: 'Hawthorn', latin: 'Crataegus monogyna', wiki: 'Crataegus monogyna', months: [5, 9, 10, 11], fact: 'White blossom in May, then red berries called haws that feed birds into winter.' },
  { name: 'European larch', latin: 'Larix decidua', wiki: 'Larix decidua', months: [10, 11], fact: 'A conifer that loses its needles. Before they fall, whole mountainsides glow golden.' },
];

export const BIRDS = [
  { name: 'European robin', latin: 'Erithacus rubecula', wiki: 'European robin', months: ALL, fact: 'Robins sing all winter. Both males and females hold winter territories and sing to defend them.' },
  { name: 'Blackbird', latin: 'Turdus merula', wiki: 'Common blackbird', months: ALL, fact: 'Often the first bird singing at dawn and one of the last at dusk.' },
  { name: 'Great tit', latin: 'Parus major', wiki: 'Great tit', months: ALL, fact: 'It has a huge range of calls. Its best-known song sounds like “tea-cher, tea-cher”.' },
  { name: 'Blue tit', latin: 'Cyanistes caeruleus', wiki: 'Eurasian blue tit', months: ALL, fact: 'Small, acrobatic and often seen hanging upside down while hunting for food on twigs.' },
  { name: 'Wren', latin: 'Troglodytes troglodytes', wiki: 'Eurasian wren', months: ALL, fact: 'Tiny, but its song is astonishingly loud for its size.' },
  { name: 'Eurasian jay', latin: 'Garrulus glandarius', wiki: 'Eurasian jay', months: ALL, fact: 'Buries thousands of acorns in autumn. The ones it forgets grow into new oak trees.' },
  { name: 'Great spotted woodpecker', latin: 'Dendrocopos major', wiki: 'Great spotted woodpecker', months: ALL, fact: 'In late winter and spring it drums on dead branches to claim its territory.' },
  { name: 'Nuthatch', latin: 'Sitta europaea', wiki: 'Eurasian nuthatch', months: ALL, fact: 'It can climb head-first down tree trunks, something woodpeckers can’t do.' },
  { name: 'Chaffinch', latin: 'Fringilla coelebs', wiki: 'Common chaffinch', months: ALL, fact: 'One of the most common birds in Switzerland. Its cheerful song ends with a little flourish.' },
  { name: 'Goldfinch', latin: 'Carduelis carduelis', wiki: 'European goldfinch', months: ALL, fact: 'Uses its fine, pointed beak to pick seeds out of thistles and teasels.' },
  { name: 'Goldcrest', latin: 'Regulus regulus', wiki: 'Goldcrest', months: ALL, fact: 'Europe’s smallest bird, weighing only about 5 to 6 grams. It loves spruce forests.' },
  { name: 'Kingfisher', latin: 'Alcedo atthis', wiki: 'Common kingfisher', months: ALL, fact: 'Watches from a branch over the water, then dives straight in to catch small fish.' },
  { name: 'Grey heron', latin: 'Ardea cinerea', wiki: 'Grey heron', months: ALL, fact: 'Can stand completely still in shallow water for a long time, waiting for a fish to pass.' },
  { name: 'White-throated dipper', latin: 'Cinclus cinclus', wiki: 'White-throated dipper', months: ALL, fact: 'The only songbird that walks underwater along stream beds to find food.' },
  { name: 'Grey wagtail', latin: 'Motacilla cinerea', wiki: 'Grey wagtail', months: ALL, fact: 'Lives along fast streams and constantly bobs its long tail up and down.' },
  { name: 'Tawny owl', latin: 'Strix aluco', wiki: 'Tawny owl', months: [10, 11, 12, 1, 2, 3], fact: 'The famous “too-whit too-whoo” is usually two owls: one calls “ke-wick”, another answers “hoo”.' },
  { name: 'Alpine chough', latin: 'Pyrrhocorax graculus', wiki: 'Alpine chough', months: ALL, fact: 'A black mountain bird with a yellow beak, often seen at summits and cable car stations.' },
  { name: 'Bullfinch', latin: 'Pyrrhula pyrrhula', wiki: 'Eurasian bullfinch', months: [11, 12, 1, 2, 3], fact: 'Quiet and shy, with soft piping calls. Males have a warm red breast.' },
  { name: 'Fieldfare', latin: 'Turdus pilaris', wiki: 'Fieldfare', months: [11, 12, 1, 2, 3], fact: 'In winter, noisy flocks gather in fields and orchards to feed on fallen fruit.' },
  { name: 'Song thrush', latin: 'Turdus philomelos', wiki: 'Song thrush', months: [3, 4, 5, 6, 7, 8, 9], fact: 'Breaks snail shells by smashing them on a favourite stone, called an “anvil”.' },
  { name: 'Black redstart', latin: 'Phoenicurus ochruros', wiki: 'Black redstart', months: [3, 4, 5, 6, 7, 8, 9, 10], fact: 'Originally a bird of mountain cliffs, it now often nests on buildings in towns.' },
  { name: 'White stork', latin: 'Ciconia ciconia', wiki: 'White stork', months: [3, 4, 5, 6, 7, 8], fact: 'It almost disappeared from Switzerland in the 1950s and was brought back. Now it nests here again.' },
  { name: 'Barn swallow', latin: 'Hirundo rustica', wiki: 'Barn swallow', months: [4, 5, 6, 7, 8, 9], fact: 'Spends winter in Africa and returns each spring, often to the same barn.' },
  { name: 'Common swift', latin: 'Apus apus', wiki: 'Common swift', months: [5, 6, 7], fact: 'Spends almost its whole life in the air. It even sleeps while flying.' },
  { name: 'Common cuckoo', latin: 'Cuculus canorus', wiki: 'Common cuckoo', months: [4, 5, 6], fact: 'Its call is easy to recognise, but the bird itself is rarely seen.' },
  { name: 'Golden oriole', latin: 'Oriolus oriolus', wiki: 'Eurasian golden oriole', months: [5, 6, 7, 8], fact: 'Bright yellow but hard to spot in the treetops. Its fluting song sounds almost tropical.' },
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const dayNumber = d => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);

function pick(list, date, salt) {
  const m = date.getMonth() + 1;
  let pool = list.filter(x => x.months.includes(m));
  if (!pool.length) pool = list;
  const key = `${date.getFullYear()}-${m}-${salt}`;
  pool = [...pool].sort((a, b) => hash(a.name + key) - hash(b.name + key));
  return pool[dayNumber(date) % pool.length];
}

// One entry per day: plants and birds take turns.
export function natureForDate(date) {
  return dayNumber(date) % 2 === 0
    ? { kind: 'plant', item: pick(PLANTS, date, 'p') }
    : { kind: 'bird', item: pick(BIRDS, date, 'b') };
}

// Real photos come from Wikipedia's free summary API, cached on the device.
const CACHE_KEY = 'glade-photos-v1';
let cache = null;
function getCache() {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { cache = {}; }
  return cache;
}

export async function fetchPhoto(wiki) {
  const c = getCache();
  if (c[wiki]) return c[wiki];
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki.replace(/ /g, '_'))}`);
    if (!res.ok) return null;
    const j = await res.json();
    let src = null;
    if (j.originalimage && j.originalimage.width <= 900) src = j.originalimage.source;
    else if (j.thumbnail) src = j.thumbnail.source.replace(/\/\d+px-/, '/800px-');
    if (!src) return null;
    const out = { src, page: j.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki)}` };
    c[wiki] = out;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* storage full or blocked */ }
    return out;
  } catch {
    return null;
  }
}
