(() => {
  const cards = [...document.querySelectorAll('.project-facts > div, .feature-card, .principle-card')];
  if (!cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-sequence-visible'));
    return;
  }

  document.documentElement.classList.add('sequence-cards-ready');
  const groups = [
    ...document.querySelectorAll('.project-facts, .feature-list, .principle-grid')
  ];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const items = [...entry.target.querySelectorAll('.project-facts > div, .feature-card, .principle-card')];
      items.forEach((item, index) => {
        item.style.setProperty('--sequence-delay', `${index * 150}ms`);
        requestAnimationFrame(() => item.classList.add('is-sequence-visible'));
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  groups.forEach((group) => observer.observe(group));
})();
