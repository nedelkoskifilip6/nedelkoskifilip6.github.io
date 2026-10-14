import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { image } from '../data/site';
import { trapDialogFocus } from '../scripts/dialog';
const slides = [
  { photo: 'waterfront', title: 'A Pacific perspective', caption: 'Vancouver waterfront · location study' },
  { photo: 'interior', title: 'The intimacy of a table', caption: 'Restaurant atmosphere · illustrative, not Miku’s interior' },
  { photo: 'chef', title: 'Behind every gesture', caption: 'Japanese culinary craft · illustrative photography' },
  { photo: 'hero', title: 'An expression of balance', caption: 'Sushi composition · illustrative photography' },
];
export default function Gallery() {
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef(0);
  const slide = slides[active];
  const next = slides[(active + 1) % slides.length];
  const move = (dir: number) => setActive(a => (a + dir + slides.length) % slides.length);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => { gsap.fromTo('.gallery-active img, .gallery-next img, .lightbox-photo', { scale: 1.035, opacity: .4 }, { scale: 1, opacity: 1, duration: .65, ease: 'power2.out' }); gsap.fromTo('.gallery-caption-title', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5 }); }, root);
    return () => ctx.revert();
  }, [active]);
  useEffect(() => { const el = dialog.current!; if (opened && !el.open) { el.showModal(); document.body.classList.add('dialog-open'); } if (!opened && el.open) el.close(); }, [opened]);
  const touch = { onTouchStart: (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; }, onTouchEnd: (e: React.TouchEvent) => { const delta = e.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1); } };
  return <div className="gallery-experience" ref={root} onKeyDown={e => { if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } }}>
    <div className="gallery-images" {...touch}><button className="gallery-active" onClick={() => setOpened(true)} aria-label={`Open ${slide.title} in gallery lightbox`}><picture><source media="(max-width: 700px)" srcSet={image(slide.photo, true)} /><img loading="lazy" src={image(slide.photo)} alt={slide.caption} width="2200" height="1467" /></picture><span className="gallery-enlarge">VIEW FULL SCREEN <span>↗</span></span></button><button className="gallery-next" onClick={() => move(1)} aria-label="Next gallery photograph"><img loading="lazy" src={image(next.photo)} alt={next.caption} width="2200" height="1467" /><span>UP NEXT <span>→</span></span></button></div>
    <div className="gallery-caption"><div className="gallery-caption-title" aria-live="polite"><h3>{slide.title}</h3><p>{slide.caption}</p></div><div className="gallery-controls"><span>0{active + 1}<small> / 04</small></span><button className="round-arrow" onClick={() => move(-1)} aria-label="Previous gallery photograph">←</button><button className="round-arrow" onClick={() => move(1)} aria-label="Next gallery photograph">→</button></div></div>
    <dialog ref={dialog} className="gallery-lightbox" aria-label="Photography gallery" onKeyDown={trapDialogFocus} onClose={() => { setOpened(false); document.body.classList.remove('dialog-open'); }}><button className="modal-close" onClick={() => dialog.current?.close()} aria-label="Close gallery">✕</button><div className="lightbox-image" {...touch}><img className="lightbox-photo" src={image(slide.photo)} alt={slide.caption} /></div><div className="lightbox-bottom"><div aria-live="polite"><h3>{slide.title}</h3><p>{slide.caption}</p></div><div className="gallery-controls"><span>0{active + 1} / 04</span><button className="round-arrow" onClick={() => move(-1)} aria-label="Previous lightbox photograph">←</button><button className="round-arrow" onClick={() => move(1)} aria-label="Next lightbox photograph">→</button></div></div></dialog>
  </div>;
}
