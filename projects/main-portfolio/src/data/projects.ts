export type Project = {
  id: string;
  number: string;
  name: string;
  shortName: string;
  category: string;
  year: string;
  status: 'live' | 'coming-soon';
  note: string;
  url?: string;
  image: string;
  srcset?: string;
  alt: string;
  tone: string;
};
const media = '/portfolio-media/';
const screenshot = (name: string) => ({
  image: `${media}${name}-1600.webp`,
  srcset: `${media}${name}-800.webp 800w, ${media}${name}-1600.webp 1600w, ${media}${name}-2400.webp 2400w`,
});
export const projects: Project[] = [
  {
    id: 'revolut',
    number: '01',
    name: 'REVOLUT',
    shortName: 'Revolut',
    category: 'Modern Fintech / Futuristic Minimalism',
    year: '2026',
    status: 'live',
    note: 'Live website',
    url: 'https://nedelkoskifilip6.github.io/revolut-finance/',
    ...screenshot('revolut'),
    alt: 'Actual homepage screenshot of Filip’s Revolut Finance portfolio concept',
    tone: 'teal',
  },
  {
    id: 'miku',
    number: '02',
    name: 'MIKU VANCOUVER',
    shortName: 'Miku Vancouver',
    category: 'Fine Dining / Japanese Elegance',
    year: '2026',
    status: 'live',
    note: 'Live website',
    url: 'https://nedelkoskifilip6.github.io/miku-vancouver/',
    ...screenshot('miku'),
    alt: 'Actual homepage screenshot of Filip’s Miku Vancouver portfolio concept',
    tone: 'warm',
  },
  {
    id: 'six-senses',
    number: '03',
    name: 'SIX SENSES IBIZA',
    shortName: 'Six Senses Ibiza',
    category: 'Luxury Hospitality / Elegant & Natural Minimalism',
    year: '2026',
    status: 'coming-soon',
    note: 'Built locally · not published',
    image: `${media}six-senses-1440.webp`,
    srcset: `${media}six-senses-800.webp 800w, ${media}six-senses-1440.webp 1440w`,
    alt: 'Actual screenshot of Filip’s unpublished Six Senses Ibiza concept',
    tone: 'sea',
  },
  {
    id: 'bang-olufsen',
    number: '04',
    name: 'BANG & OLUFSEN',
    shortName: 'Bang & Olufsen',
    category: 'Luxury Technology / Scandinavian Minimalism',
    year: '2026',
    status: 'coming-soon',
    note: 'Concept placeholder · coming soon',
    image: `${media}bang-concept.svg`,
    alt: 'Clearly labeled concept placeholder for a future Bang & Olufsen design study',
    tone: 'ivory',
  },
  {
    id: 'sothebys',
    number: '05',
    name: 'SOTHEBY’S INTERNATIONAL REALTY',
    shortName: 'Sotheby’s',
    category: 'Luxury Real Estate / Architectural Minimalism',
    year: '2026',
    status: 'coming-soon',
    note: 'Concept placeholder · coming soon',
    image: `${media}sothebys-concept.svg`,
    alt: 'Clearly labeled concept placeholder for a future Sotheby’s International Realty design study',
    tone: 'stone',
  },
];
export const contacts = {
  github: 'https://github.com/nedelkoskifilip6',
  email: '',
  linkedin: '',
};
