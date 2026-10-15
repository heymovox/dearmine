# ðŸ’Œ Happy Birthday, Muu Maa

A romantic, mobile-first birthday surprise website made for **Sweatha ("Muu Maa")**, from **Srinath**.

Five cinematic screens: a secret welcome, a birthday reveal with confetti, a scrapbook of
**23 Polaroid memories**, an animated love letter with a typewriter reveal, and a
firework finale â€” with **Uyire Un Uyirena** playing underneath.

Built with **React + Vite + TypeScript + Tailwind CSS v4 + Framer Motion + Lucide**.

---

## 1. Personalise it â€” everything is in ONE file

Open **`src/config/siteConfig.ts`**. That single file controls names, every line of text,
the love letter, the photos, the captions, the buttons and the song.

| What to change | Where in the file |
| --- | --- |
| Her name | `people.herName` |
| Her nickname | `people.nickname` |
| Your name | `people.myName` |
| Welcome screen text | `welcome` |
| Birthday messages | `birthday` |
| Gallery title + captions | `memories` |
| The whole love letter | `letter.paragraphs` (one string per paragraph) |
| Finale text + button labels | `finale` |
| Song path / volume / autoplay | `audio` |

Every place a name appears in the text uses `{people.nickname}` / `{people.herName}`, so changing
the name once updates the whole site.

---

## 2. The photos (already filled in âœ…)

All **23 photos** are installed and resized for fast mobile loading:

```
public/images/memory-01.jpg â€¦ memory-23.jpg
```

They were downscaled to a maximum of 1200 px on the long edge, which took the
folder from **18.3 MB down to 3.2 MB** with no visible loss. EXIF orientation
was applied, so nothing is sideways.

**Photo `n` â†’ caption `n`.** Captions live in `src/config/siteConfig.ts` â†’ `memories.photos`.

| # | Caption | # | Caption |
| --- | --- | --- | --- |
| 01 | My favourite smile â¤ï¸ | 13 | Your mehndi. My favourite art. ðŸ¤Ž |
| 02 | This moment, this feeling. | 14 | She's my â¤ï¸ Subrahmanyam |
| 03 | Even like this, I like you. | 15 | 1994 â†’ 2026. Some love never changes. |
| 04 | Namma memories, namakkagave. | 16 | Temple light, and you beside me. |
| 05 | Helmet pettiye bike ride. â¤ï¸ | 17 | The day I married my Muu Maa. |
| 06 | En Muu Maa, always special. | 18 | A sketch of the people I love most. |
| 07 | Two cones, one very happy girl. ðŸ¦ | 19 | Chai, city lights, and you. |
| 08 | Bangles, samosa, and you. ðŸ˜Œ | 20 | Moonlight and my favourite girl. âœ¨ |
| 09 | Every little detail of us. | 21 | She sleeps. I do not mind at all. |
| 10 | Sharing food before anything else. | 22 | My safe place. My home. |
| 11 | Just us, at home. â¤ï¸ | 23 | Saved on my phone. Saved in my heart. |
| 12 | That soft light, that soft look. | | |

Captions 01, 02, 04 and 06 are the ones you wrote. The rest were written to match
each photo â€” **edit any of them freely** in `memories.photos`. Photo 15 looks like it
may be a family photo rather than the two of you, so you may want to reword or drop it.

### Swapping a photo
1. Replace the file in `public/images/` (keep the name, or update `src` in the config).
2. Re-run `npm run build` so the change lands in `dist/`.

To add or remove photos, just add or remove entries in the `memories.photos` array â€”
the grid, the lightbox counter and the prev/next controls all adapt automatically.

---

## 3. The song (already filled in âœ…)

`Uyire-Un-Uyirena.mp3` is installed as **`public/audio/birthday-song.mp3`** (9.4 MB).

The music button now appears, the "Play our song ðŸŽµ" hint shows on the welcome
screen, and the track plays continuously while moving between screens.

**To replace it:** delete `birthday-song.mp3` and drop in a new file with that exact
name. Different name? Update `audio.src` in `src/config/siteConfig.ts`.

**Settings** (`audio` in the config):
* `loop` â€” `true` keeps it playing across screens
* `volume` â€” `0.45` (0â€“1)
* `startOnFirstTap` â€” `false` means she taps the button herself

> The file is 9.4 MB. Fine on Wi-Fi, but trimming it to 3â€“4 minutes will make the page
> feel much snappier on mobile data. Only use music you own or have permission to use.

---

## 4. Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other commands:

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
npm run lint
```

---

## 5. Deploy to Vercel

### Option A â€” Vercel CLI (fastest)

```bash
npm i -g vercel
vercel            # preview deployment
vercel --prod     # production, prints your public URL
```

Vercel detects Vite automatically. A `vercel.json` is already included with the build command,
output directory and cache headers.

### Option B â€” Vercel dashboard

1. Push this folder to a GitHub / GitLab / Bitbucket repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects **Vite**. Confirm:
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Click **Deploy**. Your public URL appears on the dashboard.

> Share the link with Sweatha (ideally a minute before she opens it). The site is a single page â€”
> no backend, no database, no login.

---

## 6. Project structure

```
src/
  config/siteConfig.ts      â† all personal content lives here
  audio/
    MusicProvider.tsx       â† one persistent <audio> element for the whole app
    musicContext.ts         â† the hook screens use
  components/
    FloatingHearts.tsx      drifting heart particles
    ConfettiBurst.tsx       one-shot confetti
    Fireworks.tsx           self-limiting fireworks for the finale
    GlowingHeart.tsx        the pulsing heart
    BirthdayCake.tsx        hand-built SVG cake
    Envelope.tsx            wax-sealed envelope that opens
    Typewriter.tsx          letter reveal (always skippable)
    Lightbox.tsx            photo viewer with prev / next / keyboard
    SmartImage.tsx          image with graceful missing-file fallback
    RomanticButton.tsx      the single button style
    ScreenProgress.tsx      bottom progress rail
    MusicToggle.tsx         music button + "play our song" hint
  screens/                  the five screens
  lib/motion.ts             shared motion + reduced-motion helper
public/
  images/                   memory-01..23.jpg (your photos)
  audio/birthday-song.mp3   Uyire-Un-Uyirena.mp3
```

---

## 7. Accessibility & performance notes

* Every animation respects `prefers-reduced-motion` â€” motion is reduced to simple fades.
* The typewriter can be skipped at any time (`Show Full Letter`), and the letter is also readable
  by pressing **Enter** or **Space**.
* Lightbox supports **â† / â†’** and **Esc**.
* Designed from **360 px** upward; no horizontal scrolling at any width.
* Floating hearts, confetti and fireworks are capped and stop on their own to protect battery.
* Fonts load from Google Fonts (Cormorant Garamond / Jost / Caveat) with a graceful fallback stack.

---

Made with love. â¤ï¸