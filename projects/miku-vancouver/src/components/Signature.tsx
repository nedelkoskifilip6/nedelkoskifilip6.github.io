import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { signature, price, type Dish } from '../data/menu';
import { image } from '../data/site';
import DishModal from './DishModal';

export default function Signature() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Dish | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const dish = signature[active];
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => { gsap.fromTo('.signature-photo img', { opacity: .4, scale: 1.055 }, { opacity: 1, scale: 1, duration: .7 }); gsap.fromTo('.signature-info', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5 }); }, root);
    return () => ctx.revert();
  }, [active]);
  return <div className="signature-experience" ref={root}>
    <div className="signature-photo"><button onClick={() => setSelected(dish)} aria-label={`Explore ${dish.name}`}><picture><source media="(max-width: 700px)" srcSet={image(dish.photo, true)} /><img loading="lazy" src={image(dish.photo)} alt={`Illustrative Japanese cuisine photography for ${dish.name}; not an actual Miku dish`} width="2200" height="1467" /></picture><span className="photo-open">EXPLORE THE DISH</span></button><span className="photo-caption">LICENSED EDITORIAL IMAGE · ILLUSTRATIVE</span></div>
    <div className="signature-panel"><span className="collection-number">0{active + 1}<small> / 05</small></span><div className="signature-info" aria-live="polite"><p className="eyebrow">{dish.category}</p><h3>{dish.name}</h3><p>{dish.description}</p><span className="signature-price">{price(dish)} <small>CAD</small></span><button className="text-link" onClick={() => setSelected(dish)}>Discover this dish</button></div><div className="signature-index" aria-label="Signature dishes">{signature.map((d, i) => <button key={d.id} onClick={() => setActive(i)} aria-pressed={active === i}><span>0{i + 1}</span>{d.name}</button>)}</div></div>
    <DishModal dish={selected} items={signature} onClose={() => setSelected(null)} onChange={setSelected} />
  </div>;
}
