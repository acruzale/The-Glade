// The Glade — your painting(s).
// Put your images in the `images` folder and write their names here.
// Until an image exists, a painted-style placeholder is shown instead.

export const GLADE = {
  // Fallback painting, used if a stage has no image for the current season.
  image: 'images/glade-3-summer.jpg',
  // Width ÷ height of your paintings (1024×572 → 1.79). All paintings should share this size and framing.
  aspect: 1024 / 572,

  // The glade grows in stages as leaves are pressed. Each stage can have a painting per season.
  // Spring uses the summer painting. Seasons are used when Settings → "Follow the seasons" is on.
  stages: [
    { name: 'Early', after: 0, summer: 'images/glade-1-summer.jpg', autumn: 'images/glade-1-autumn.jpg', winter: 'images/glade-1-winter.jpg' },
    {
      name: 'Growing', after: 30, summer: 'images/glade-2-summer.jpg', autumn: 'images/glade-2-autumn.jpg', winter: 'images/glade-2-winter.jpg',
      // In this painting the river is smaller and ends in the meadow, so the leaf takes a shorter trip.
      river: { from: { x: 45, y: 69.5, scale: 0.3 }, to: { x: 22, y: 79, scale: 0.75 }, seconds: 28, wave: 0.5 },
    },
    {
      name: 'Full', after: 70, summer: 'images/glade-3-summer.jpg', autumn: 'images/glade-3-autumn.jpg', winter: 'images/glade-3-winter.jpg',
      // In the winter painting the river bends between ice shelves, so the leaf follows that bend.
      rivers: { winter: { from: { x: 40, y: 78.5, scale: 0.4 }, via: { x: 22, y: 89, scale: 0.8 }, to: { x: -8, y: 95.5, scale: 1.15 }, seconds: 36, wave: 0.6 } },
    },
  ],

  // The leaf's path on the river, in % of the painting. A stage can have its own `river`, or one per season in `rivers` (see above). (x from the left, y from the top).
  // It starts small far away and floats towards you, growing as it comes closer.
  river: {
    from: { x: 50, y: 76.5, scale: 0.4 },
    to: { x: -8, y: 91, scale: 1.25 },
    seconds: 38,   // how long one trip takes
    wave: 0.8,     // how much the leaf bobs (in % of screen height)
  },

  // Animals that visit. x/y = where their feet are, in % of the painting. size = height in % of the painting.
  // after = how many pressed leaves before they start visiting. They come and go on their own.
  // Types: flock, robin, rabbit, deer, squirrel, heron. Add flip: true to make one face the other way.
  animals: [
    { type: 'flock', x: 55, y: 24, size: 5, after: 10 },
    { type: 'robin', x: 61, y: 80.5, size: 4.4, after: 25 },
    { type: 'rabbit', x: 88, y: 95, size: 9, after: 45 },
    { type: 'deer', x: 16, y: 77.5, size: 10, after: 65 },
    { type: 'squirrel', x: 71, y: 72, size: 5.5, after: 85 },
    { type: 'heron', x: 36, y: 79, size: 8, after: 105 },
  ],

  // Gentle movement over the painting (all positions in % of the painting).
  effects: {
    sway: { fadeFrom: 22, fadeTo: 40, pivot: [80, 70] },   // the canopy breathes around the trunk
    rays: [                                                 // soft light rays
      { x: 50, y: 6, w: 7, h: 62, angle: 18 },
      { x: 57, y: 4, w: 5, h: 64, angle: 23 },
      { x: 44, y: 12, w: 4, h: 50, angle: 13 },
    ],
    river: null,   // ripples and glints on the water (turned off)
    leaves: { count: 7, x: [25, 95], y: [0, 20], fall: 80 },
    fireflies: { count: 22, x: [66, 97], y: [48, 90] },     // near the tree on the right
  },

  // Which side the floating card sits on, so it doesn't cover the tree: 'left' or 'right'.
  cardSide: 'left',

  // Which part of the painting stays in view when a screen is narrower than the painting, as % from the left.
  focusX: 30,

  // Phones (tall, narrow screens): the painting still fills the screen, but only about a quarter of its width fits.
  // focusX chooses which part: 80 shows the tree trunk, the roots with the fireflies and a little of the water.
  phone: {
    focusX: 80,             // % from the left; higher = more tree, lower = more river
    whenNarrowerThan: 0.85, // use this when the screen's width ÷ height is below this
  },
};
