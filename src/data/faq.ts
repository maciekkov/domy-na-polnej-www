import items from './faq-content.json'
export type FaqItem = { id: string; question: string; answer: string }
/** One source for browser and static HTML. Source dates/legal claims still require owner approval. */
export const faqItems: FaqItem[] = items
