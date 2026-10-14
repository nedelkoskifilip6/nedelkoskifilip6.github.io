import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { categories, dishes, price, type Dish } from '../data/menu';
import { image, official } from '../data/site';
import DishModal from './DishModal';

export default function MenuExplorer() {
  const [category, setCategory] = useState(categories[0]);
  const [filter, setFilter] = useState('All dishes');
  const [activeId, setActiveId] = useState(dishes[0].id);
  const [selected, setSelected] = useState<Dish | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const filtered = dishes.filter(d => d.category === category && (filter === 'All dishes' || d.dietary.includes(filter)));
  const active = filtered.find(d => d.id === activeId) ?? filtered[0];
  const categoryIndex = categories.indexOf(category);
  const switchCategory = (next: string) => { setCategory(next); setActiveId(dishes.find(d => d.category === next)!.id); };
  useEffect(() => { const param = new URLSearchParams(location.search).get('category'); if (param && categories.includes(param)) switchCategory(param); }, []);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => { gsap.fromTo('.menu-feature', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .55, ease: 'power2.out' }); gsap.fromTo('.menu-dish-row', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: .045, duration: .45 }); }, root);
    return () => ctx.revert();
  }, [category, filter]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => gsap.fromTo('.menu-feature img', { scale: 1.035, opacity: .45 }, { scale: 1, opacity: 1, duration: .5 }), root);
    return () => ctx.revert();
  }, [active?.id]);
  return <div className="menu-explorer" ref={root}>
    <div className="menu-category-tabs" role="tablist" aria-label="Menu categories">{categories.map((c, i) => <button role="tab" id={`category-${i}`} aria-controls="menu-panel" aria-selected={c === category} tabIndex={c === category ? 0 : -1} key={c} onClick={() => switchCategory(c)} onKeyDown={e => { const move = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (move || e.key === 'Home' || e.key === 'End') { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? categories.length - 1 : (i + move + categories.length) % categories.length; switchCategory(categories[next]); document.getElementById(`category-${next}`)?.focus(); } }}><small>0{i + 1}</small>{c}</button>)}</div>
    <div className="menu-mobile-select"><label htmlFor="menu-category">Explore a category</label><select id="menu-category" value={category} onChange={e => switchCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
    <div className="menu-filter-line"><p><span>{String(categoryIndex + 1).padStart(2, '0')}</span> {category} <small>({filtered.length})</small></p><div><label htmlFor="dietary-filter">Dietary selection</label><select id="dietary-filter" value={filter} onChange={e => setFilter(e.target.value)}><option>All dishes</option><option>Vegetarian</option><option>Gluten Free</option></select></div></div>
    <div id="menu-panel" role="tabpanel" aria-labelledby={`category-${categoryIndex}`} className="menu-panel">
      {active ? <><div className="menu-feature"><button className="menu-feature-image" onClick={() => setSelected(active)} aria-label={`Open ${active.name} details`}><picture><source media="(max-width: 700px)" srcSet={image(active.photo, true)} /><img src={image(active.photo)} alt={`Illustrative ${active.category.toLowerCase()} image, not the actual ${active.name}`} width="2200" height="1467" /></picture><span className="photo-open">EXPAND THE EXPERIENCE <span>↗</span></span></button><div className="menu-feature-caption"><span>EDITORIAL PHOTOGRAPHY · ILLUSTRATIVE</span><span>0{filtered.indexOf(active) + 1} / 0{filtered.length}</span></div><h2>{active.name}</h2><p>{active.description}</p></div><div className="menu-dishes">{filtered.map((dish, i) => <div className={`menu-dish-row ${active.id === dish.id ? 'is-active' : ''}`} key={dish.id}><button className="dish-preview-button" onClick={() => setActiveId(dish.id)} aria-pressed={active.id === dish.id}><span className="dish-row-number">0{i + 1}</span><span><h3>{dish.name}</h3><p>{dish.description}</p>{dish.dietary.length > 0 && <small>{dish.dietary.join(' · ')}</small>}</span><span className="dish-row-price">{price(dish)}<small>CAD</small></span></button><button className="dish-detail-button" aria-label={`View ${dish.name}`} onClick={() => { setActiveId(dish.id); setSelected(dish); }}>↗</button></div>)}<div className="menu-dishes-note"><span className="tiny-line"></span><p>Flavour, considered.<br /><small>Verified dinner menu. Prices in Canadian dollars.<br />Photography illustrates the cuisine; it does not depict the named Miku dishes.</small></p></div></div></> : <div className="empty-menu"><h2>A different selection.</h2><p>No dishes in this category carry the selected official dietary label.</p><button className="button button-dark" onClick={() => setFilter('All dishes')}>Show all dishes <span>↗</span></button></div>}
    </div>
    <div className="menu-source-note"><p>Verified against Miku’s official dinner menu on October 14, 2026. Prices and seasonal selections may change.<br />Please confirm dietary requirements and current offerings with the restaurant.</p><a className="text-link" href={official.menu} target="_blank" rel="noopener noreferrer">Official menu <span>↗</span></a></div>
    <DishModal dish={selected} items={filtered} onClose={() => setSelected(null)} onChange={setSelected} />
  </div>;
}
