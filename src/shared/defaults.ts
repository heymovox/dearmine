import { OCCASIONS, type OccasionKey } from './constants'
import type { DesignConfig, SurpriseContent } from './schemas'
import type { RenderPayload } from './types'

/**
 * Clearly-labelled example content used for template previews and as a
 * starting point for new drafts. Never presented as a real customer's story.
 */
export function exampleContent(occasion: OccasionKey = 'BIRTHDAY'): SurpriseContent {
  const label = OCCASIONS.find((o) => o.key === occasion)?.label ?? 'celebration'
  return {
    title: `A little ${label.toLowerCase()} surprise for you`,
    openingMessage: 'Hey you… I made something for you. ❤️',
    mainMessage:
      'This is an example message so you can see how your words will look. Imagine your own memories here — the inside jokes, the little moments, all of it.',
    letter:
      'My love,\n\nEvery day with you feels like a small celebration. I wanted to put a few of those days somewhere you could keep them.\n\nThis is placeholder text for the template preview. When you create your own surprise, this is where your letter will live — in your words, for them.\n\nWith all my love.',
    finalMessage: 'Thank you for being you. Here is to many more moments together. ❤️',
    signature: 'With love, Your Name',
    secretMessage: 'You found it. I love you more than words fit here. ❤️',
    timeline: [
      { date: 'The beginning', title: 'We met', description: 'Example milestone — replace with your own first meeting.' },
      { date: 'Our first date', title: 'The first date', description: 'Example milestone — where did you go, and what do you remember?' },
      { date: 'Today', title: 'Still us', description: 'Example milestone — add the moments that matter most.' },
    ],
    promises: [
      { title: 'I promise', body: 'To always save you the last bite.' },
      { title: 'I promise', body: 'To listen, even on the busiest days.' },
      { title: 'I promise', body: 'To keep choosing you.' },
    ],
    quiz: [
      { question: 'Where did we first meet? (example question)', options: ['A coffee shop', 'A friend’s party', 'Online', 'College'], correctIndex: 0 },
      { question: 'Our favourite thing to do together? (example)', options: ['Long drives', 'Movie nights', 'Cooking', 'All of it'], correctIndex: 3 },
    ],
    coupons: [
      { title: 'One movie night', description: 'You pick the film, I make the snacks.' },
      { title: 'A whole day together', description: 'No plans, no phones — just us.' },
      { title: 'Your favourite meal', description: 'Cooked by me, exactly how you like it.' },
    ],
    storyPanels: [
      { caption: 'Panel one — how your story begins.' },
      { caption: 'Panel two — the moment everything changed.' },
      { caption: 'Panel three — where you are today.' },
    ],
    choices: [
      { label: 'Open a memory', message: 'This is placeholder text for a memory you can customise.' },
      { label: 'Read a promise', message: 'This is placeholder text for a promise you can customise.' },
      { label: 'Get a kiss', message: 'This is placeholder text for a message you can customise. 😘' },
      { label: 'One more surprise', message: 'This is placeholder text for a final message you can customise.' },
    ],
  }
}

export function defaultDesign(): DesignConfig {
  return {
    palette: 'midnight',
    font: 'cormorant',
    animation: 'balanced',
    coverPhotoId: null,
    sections: {},
  }
}

/** A complete example payload for the public template preview page. */
export function examplePayload(templateKey: string, templateSlug: string, palette: string, occasion: OccasionKey = 'BIRTHDAY'): RenderPayload {
  return {
    templateKey,
    templateSlug,
    content: exampleContent(occasion),
    design: { ...defaultDesign(), palette },
    assets: [],
    meta: {
      title: 'Example surprise',
      recipientName: 'Alex',
      creatorName: 'Sam',
      nickname: 'A',
      occasion,
      occasionDate: null,
    },
  }
}
