# The Glade

A quiet place to work with your energy, not against it.

## Setup

### 1. Add your Firebase config
Open `js/firebase-config.js` and replace the placeholder values with your own.
You'll find them in Firebase console → ⚙️ Project settings → General → Your apps → (your web app) → **Config**.

### 2. Firestore rules
Firebase console → **Firestore Database** → **Rules** tab → replace everything with the contents of `firestore.rules` → **Publish**.

These rules mean only you (signed in) can read or write your own glade.

### 3. Google sign-in
- Firebase console → **Authentication** → **Sign-in method** → enable **Google**.
- Firebase console → **Authentication** → **Settings** → **Authorized domains** → **Add domain** → `yourusername.github.io`

### 4. GitHub Pages
1. Create a new repository (for example `the-glade`).
2. Upload **all** files and folders exactly as they are (`index.html`, `styles.css`, `manifest.json`, the icons, `js/`, `sounds/`).
3. Repository → **Settings** → **Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
4. After a minute, open `https://yourusername.github.io/the-glade/`.

### 5. On your phone
Open the link in Safari/Chrome → Share → **Add to Home Screen**. It then opens like an app.

## How it works
- **Check in** with Deep focus / Creative / Resting / Social. One leaf floats down the stream at a time.
- **Let it drift** if it doesn’t feel right. No record is kept of drifted leaves.
- **Begin** shows the next small step and an optional 5-minute starter timer that never tells you to stop.
- Everything you do **presses a leaf** into the journal and grows your glade. Birds arrive once it’s full. Nothing ever wilts.
- **Garden**: add, edit and sort everything. Tap the leaf on a hobby to put it in or out of season.
- **Regular days** (workouts): float by first on their days.
- **Work tasks**: only float by on weekdays before 5pm.
- **Weekly clearing**: appears once a week on your chosen day, then disappears once you close it.
- **Journal**: a real photo of a native plant and bird each day, following the seasons (photos from Wikipedia).
- **Settings**: always summer, or follow the seasons.

## Your glade painting
Put your painting in the `images` folder as `glade-3-summer.jpg` (wide 16:9, ideally 2560×1440 or larger).
Until it's there, a painted-style placeholder is shown.

In `js/glade-config.js` you can:
- set `river.top` so the floating leaf sits on your river (% from the top of the screen),
- add seasonal paintings (used when Settings → "Follow the seasons" is on),
- add growth stages that change the glade as leaves are pressed,
- set `focusX` to choose which part of the painting stays visible on phones.

## Optional: real forest sounds
Put a looping recording named `forest.mp3` into the `sounds` folder and it will be used instead of the built-in stream and birdsong.

## Data
Stored in your Firestore under `users/{your uid}/items` and `users/{your uid}/log`, plus your settings on `users/{your uid}`.
