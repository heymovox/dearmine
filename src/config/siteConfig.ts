/**
 * ---------------------------------------------------------------------------
 *  MUU MAA — CENTRAL CONFIGURATION
 * ---------------------------------------------------------------------------
 *  Everything personal about this website lives in this one file.
 *  Swap the names, the words, the photos and the song here — no component
 *  editing required.
 *
 *  Quick guide
 *  -----------
 *  • Names ......... edit `people`
 *  • Screen text ... edit `welcome`, `birthday`, `memories`, `letter`, `finale`
 *  • Photos ........ drop your own files into `public/images/` and update `memories.photos`
 *  • Song .......... drop your file into `public/audio/` (or change `audio.src`)
 *  • Colours ....... edit the palette in `theme` (also used by src/index.css)
 * ---------------------------------------------------------------------------
 */

export const people = {
  /** Her name. */
  herName: 'Sweatha',
  /** The nickname you call her. */
  nickname: 'Muu Maa',
  /** Your name. */
  myName: 'Srinath',
}

/** Shorthand so captions/messages can reference names without hardcoding them. */
const HER = people.herName
const NICK = people.nickname
const ME = people.myName

export type ScreenId = 'welcome' | 'birthday' | 'memories' | 'letter' | 'finale'

/** Ordered list of screens — drives the progress dots and next/previous logic. */
export const screenOrder: ScreenId[] = [
  'welcome',
  'birthday',
  'memories',
  'letter',
  'finale',
]

/** Shown on the bottom progress dots. */
export const screenLabels: Record<ScreenId, string> = {
  welcome: 'Welcome',
  birthday: 'Birthday',
  memories: 'Memories',
  letter: 'Letter',
  finale: 'Surprise',
}

/* ------------------------------------------------------------------ */
/*  Screen 1 — Secret Welcome                                          */
/* ------------------------------------------------------------------ */
export const welcome = {
  eyebrow: 'A little secret, just for you',
  title: `Hey, ${NICK}… ❤️`,
  subtitle: 'Unakkaga naan oru chinna surprise ready pannirukken.',
  hint: 'Tap the button below… there is something waiting for you.',
  cta: 'Open Your Surprise 💌',
  /** Small pulse shown while the music is still silent. */
  musicHint: 'Play our song 🎵',
}

/* ------------------------------------------------------------------ */
/*  Screen 2 — Birthday Reveal                                         */
/* ------------------------------------------------------------------ */
export const birthday = {
  eyebrow: `It's the ${HER}'s day`,
  title: `Happy Birthday, En ${HER}! ❤️`,
  paragraphs: [
    `Innaikku un birthday mattum illa, indha ulagathukku en ${NICK} vandha special day.`,
    `Un life-la happiness neraya irukkanum, un smile eppovume ippadiye irukkanum, nee aasai padra ella vishayamum niraiveranum.`,
  ],
  cta: 'Innum Onnu Unakkaga…',
}

/* ------------------------------------------------------------------ */
/*  Screen 3 — Our Memories                                            */
/* ------------------------------------------------------------------ */
export type MemoryPhoto = {
  /** Path inside /public — e.g. '/images/couple-1.jpg' */
  src: string
  /** Caption printed under the Polaroid. Edit freely. */
  caption: string
  /** Tiny label shown on the placeholder until a real photo is added. */
  label: string
  /** Slight rotation (deg) so the scrapbook feels hand-placed. */
  tilt: number
}

/**
 * Every entry currently points at `/images/photo-placeholder.svg`.
 * To reorder, swap the entries. To remove a photo, delete its entry.
 * Captions are yours to rewrite — nothing else needs touching.
 */
export const memories = {
  title: 'Namma Rendu Peroda Chinna Ulagam ❤️',
  subtitle: 'Indha oru chinna collection — namma oru periya story-oda first pages.',
  hint: 'Tap any photo to see it bigger.',
  photos: [
    {
      src: '/images/photo-placeholder.svg',
      caption: 'My favourite smile ❤️',
      label: 'Photo 1',
      tilt: -3,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'This moment, this feeling.',
      label: 'Photo 2',
      tilt: 2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Even like this, I like you.',
      label: 'Photo 3',
      tilt: -1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Namma memories, namakkagave.',
      label: 'Photo 4',
      tilt: 3,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Helmet pettiye bike ride. ❤️',
      label: 'Photo 5',
      tilt: -2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: `En ${NICK}, always special.`,
      label: 'Photo 6',
      tilt: 2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Two cones, one very happy girl. 🍦',
      label: 'Photo 7',
      tilt: -3.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Bangles, samosa, and you. 😌',
      label: 'Photo 8',
      tilt: 3.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Every little detail of us.',
      label: 'Photo 9',
      tilt: -2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Sharing food before anything else.',
      label: 'Photo 10',
      tilt: 1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Just us, at home. ❤️',
      label: 'Photo 11',
      tilt: -3,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'That soft light, that soft look.',
      label: 'Photo 12',
      tilt: 2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Your mehndi. My favourite art. 🤎',
      label: 'Photo 13',
      tilt: -1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: "She's my ❤️ Subrahmanyam",
      label: 'Photo 14',
      tilt: 3,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: '1994 → 2026. Some love never changes.',
      label: 'Photo 15',
      tilt: -2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Temple light, and you beside me.',
      label: 'Photo 16',
      tilt: 2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'The day I married my Muu Maa.',
      label: 'Photo 17',
      tilt: -3.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'A sketch of the people I love most.',
      label: 'Photo 18',
      tilt: 1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Chai, city lights, and you.',
      label: 'Photo 19',
      tilt: -2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Moonlight and my favourite girl. ✨',
      label: 'Photo 20',
      tilt: 3.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'She sleeps. I do not mind at all.',
      label: 'Photo 21',
      tilt: -2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'My safe place. My home.',
      label: 'Photo 22',
      tilt: 2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Saved on my phone. Saved in my heart.',
      label: 'Photo 23',
      tilt: -1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Waiting at the station, together.',
      label: 'Photo 24',
      tilt: 2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Same platform. Another memory.',
      label: 'Photo 25',
      tilt: -2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Red wall, happy us.',
      label: 'Photo 26',
      tilt: 3,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'One more for the same smile.',
      label: 'Photo 27',
      tilt: -1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Long drive, no hurry.',
      label: 'Photo 28',
      tilt: 2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Two tickets, one plan.',
      label: 'Photo 29',
      tilt: -3,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Hard days we got through. You stayed.',
      label: 'Photo 30',
      tilt: 3.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Mirror selfie, real smiles.',
      label: 'Photo 31',
      tilt: -2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'No filter needed.',
      label: 'Photo 32',
      tilt: 1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Cheeky moments. 😌',
      label: 'Photo 33',
      tilt: -2,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Sleepy days, quiet calls.',
      label: 'Photo 34',
      tilt: 3,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Festive colours.',
      label: 'Photo 35',
      tilt: -3.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Distance is only temporary.',
      label: 'Photo 36',
      tilt: 2.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Calling my favourite person.',
      label: 'Photo 37',
      tilt: -1.5,
    },
    {
      src: '/images/photo-placeholder.svg',
      caption: 'Always on call with my people.',
      label: 'Photo 38',
      tilt: 3,
    },
  ] satisfies MemoryPhoto[],
  cta: 'Innum Onnu Unakkaga…',
}

/* ------------------------------------------------------------------ */
/*  Screen 4 — Animated Love Letter                                    */
/* ------------------------------------------------------------------ */
export const letter = {
  eyebrow: 'From my heart to yours',
  title: `${NICK}, konjam manasu vittu pesattuma? 💌`,
  hint: 'Tap the envelope to open it.',
  cta: 'Open My Letter 💌',
  /** Shown while the typewriter is still writing. */
  showFullCta: 'Show Full Letter',
  /** Shown once the letter is fully readable. */
  continueCta: 'Innum Onnu Unakkaga…',
  signature: `With all my love,\n${ME} ❤️`,
  /**
   * The letter, split into paragraphs for the typewriter reveal.
   * Paragraph 1 is treated as the greeting, the last as the sign-off.
   */
  paragraphs: [
    `Happy Birthday, en chellame. ❤️`,
    `Unakku enna sollanum nu yosicha, vaarthaigal neraya irukku. Aana unna evlo nesikkiren nu solla sila nerathula vaarthaigal pathaadhu.`,
    `Un smile paatha enakku varra happiness, un kooda pesura chinna chinna moments, un kitta en feelings-ah share panradhu… idhellam enakku romba precious.`,
    `Nee happy-ah irukkuradha paakumbodhu enakkum santhoshama irukkum. Un dreams ellam niraiveranum. Unakku kashtamaana naal vandhaalum, un feelings-ah purinjukka oruthar irukkanum nu nee ninaicha, unna purinjukka naanum eppovum try pannanum nu aasai paduren.`,
    `${NICK}, nee perfect-ah irukkanum nu naan expect pannala. Nee nee-ah irukkanum. Un happiness, un dreams, un feelings ellame mukkiyam.`,
    `Indha birthday-ku expensive gift kudukkuradha vida, un heart-la oru chinna beautiful memory create pannanum nu dhaan indha website-ah unakkaga pannirukken.`,
    `Indha page-la irukkura ovvoru chinna detail-um, unna special-ah feel panna vaikkura oru aasaiyoda create pannadhu.`,
    `Unakku indha birthday oru beautiful beginning-ah irukkanum. Un life-la love-um peace-um happiness-um neraya irukkanum.`,
    `Happy Birthday, en ${NICK}. ❤️`,
    `Un smile-ku innum neraya reasons kidaikkanum. Un heart eppovume happy-ah irukkanum.`,
  ],
}

/* ------------------------------------------------------------------ */
/*  Screen 5 — Final Birthday Surprise                                 */
/* ------------------------------------------------------------------ */
export const finale = {
  title: `Happy Birthday, My ${HER}! ❤️`,
  paragraphs: [
    `En ${NICK}… nee enakku romba special.`,
    `Indha chinna website full-ah unakkaga dhaan. Un birthday-la nee smile pannina, indha surprise create pannadhu enakku worth it.`,
  ],
  closing: 'Always remember: You are loved. ❤️',
  signature: `With love, ${ME} ❤️`,
  buttons: [
    { id: 'letter', label: 'Read My Letter Again 💌' },
    { id: 'memories', label: 'Our Memories 📸' },
    { id: 'welcome', label: 'Replay Our Surprise ❤️' },
  ],
}

/* ------------------------------------------------------------------ */
/*  Music                                                              */
/* ------------------------------------------------------------------ */
export const audio = {
  /**
   * Drop your own song at `public/audio/birthday-song.mp3` — the path below
   * already points there. You may also change it to any other filename.
   * Use music you own or have permission to use.
   */
  src: '/audio/birthday-song.mp3',
  /** Loop the song for the whole experience. */
  loop: true,
  /** Default volume 0–1. */
  volume: 0.45,
  /**
   * Set to true if you prefer visitors to press the music button themselves.
   * When false, music starts on the first tap anywhere on the page.
   */
  startOnFirstTap: false,
}

/* ------------------------------------------------------------------ */
/*  Theme                                                              */
/* ------------------------------------------------------------------ */
export const theme = {
  burgundy: '#4A1025',
  romanticRed: '#B5284D',
  blushPink: '#F8DCE5',
  warmCream: '#FFF8F0',
  roseGold: '#D7A0A7',
}

/* ------------------------------------------------------------------ */
/*  Everything in one object, if you prefer a single import            */
/* ------------------------------------------------------------------ */
export const siteConfig = {
  people,
  welcome,
  birthday,
  memories,
  letter,
  finale,
  audio,
  theme,
  screenOrder,
  screenLabels,
}

export default siteConfig