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
    status: 'live',
    note: 'Live website',
    url: 'https://nedelkoskifilip6.github.io/six-senses-ibiza/',
    image: `${media}six-senses-1440.webp?v=hero-ai-bright-20261022`,
    srcset: `${media}six-senses-800.webp?v=hero-ai-bright-20261022 800w, ${media}six-senses-1440.webp?v=hero-ai-bright-20261022 1440w`,
    alt: 'Actual homepage screenshot of Filip’s Six Senses Ibiza portfolio concept',
    tone: 'sea',
  },
  {
    id: 'tesla-motors',
    number: '04',
    name: 'TESLA MOTORS',
    shortName: 'Tesla Motors',
    category: 'Electric Mobility / Cinematic Minimalism',
    year: '2026',
    status: 'live',
    note: 'Live website',
    url: 'https://nedelkoskifilip6.github.io/tesla-motors/',
    image: `${media}tesla-motors-preview.jpg`,
    alt: 'Tesla Motors Hero section with navigation, the Drive what’s next headline, action buttons, and a Cybertruck twilight background',
    tone: 'red',
  },
];
export const contacts = {
  github: 'https://github.com/nedelkoskifilip6',
  email: '',
  linkedin: '',
};
