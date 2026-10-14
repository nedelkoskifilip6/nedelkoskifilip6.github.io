import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { type Dish, price } from '../data/menu';
import { image, official } from '../data/site';
import { trapDialogFocus } from '../scripts/dialog';

interface Props { dish: Dish | null; items: Dish[]; onClose: () => void; onChange: (dish: Dish) => void; }
export default function DishModal({ dish, items, onClose, onChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef(0);
  const wasOpen = useRef(false);
  const index = dish ? items.findIndex(d => d.id === dish.id) : 0;
  const move = (direction: number) => onChange(items[(index + direction + items.length) % items.length]);
  useEffect(() => {
    const el = dialog.current!;
    if (dish && !el.open) { el.showModal(); document.body.classList.add('dialog-open'); }
    if (!dish && el.open) el.close();
    if (dish) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        const ctx = gsap.context(() => {
          gsap.fromTo('.dish-modal-image', { scale: wasOpen.current ? 1.035 : .9, clipPath: wasOpen.current ? 'inset(0%)' : 'inset(12% 9%)', opacity: .5 }, { scale: 1, clipPath: 'inset(0%)', opacity: 1, duration: .75, ease: 'power3.out' });
          gsap.fromTo('.dish-modal-copy > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, duration: .55, ease: 'power2.out' });
        }, el);
        wasOpen.current = true;
        return () => ctx.revert();
      }
    } else { wasOpen.current = false; document.body.classList.remove('dialog-open'); }
  }, [dish]);
  useEffect(() => () => { dialog.current?.close(); document.body.classList.remove('dialog-open'); }, []);
  return <dialog ref={dialog} className="dish-modal" aria-labelledby="dish-modal-title" onClose={() => { document.body.classList.remove('dialog-open'); onClose(); }} onKeyDown={e => { trapDialogFocus(e); if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } }}>
    {dish && <>
      <button className="modal-close" onClick={() => dialog.current?.close()} aria-label="Close dish details">✕</button>
      <div className="dish-modal-image" onTouchStart={e => touchX.current = e.touches[0].clientX} onTouchEnd={e => { const delta = e.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1); }}><img src={image(dish.photo)} alt={`Illustrative ${dish.category.toLowerCase()} photography; not the actual ${dish.name}`} /><span>ILLUSTRATIVE PHOTOGRAPHY · NOT THE ACTUAL DISH</span></div>
      <div className="dish-modal-copy"><p className="eyebrow">{dish.category} · MIKU VANCOUVER</p><h2 id="dish-modal-title">{dish.name}</h2><p className="modal-description">{dish.description}</p><div className="modal-price">{price(dish)} <small>CAD</small></div>{dish.dietary.length > 0 && <p className="dietary-label">{dish.dietary.join(' · ')} · Official menu label</p>}<p className="menu-provenance">Dinner menu verified October 14, 2026.<br />Selections and prices may change. Please discuss dietary needs directly with the restaurant.</p><a className="text-link" href={official.menu} target="_blank" rel="noopener noreferrer">View Miku’s official menu <span>↗</span></a><div className="modal-pagination"><button className="round-arrow" onClick={() => move(-1)} aria-label="Previous dish">←</button><span>{String(index + 1).padStart(2, '0')} <small>/ {String(items.length).padStart(2, '0')}</small></span><button className="round-arrow" onClick={() => move(1)} aria-label="Next dish">→</button></div></div>
    </>}
  </dialog>;
}
