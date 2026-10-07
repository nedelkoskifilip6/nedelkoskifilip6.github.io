const vehicleInfo = {
  'model-3': {
    name: 'Model 3 Standard', category: 'Electric sedan · Rear-Wheel Drive',
    description: 'A refined electric sedan balancing long range, quick response and everyday comfort.',
    image: '/tesla-motors/images/model-3-standard-card-97.jpg', source: 'https://www.tesla.com/model3',
    specs: [['346', 'mi', 'EPA-est. range'], ['4.2', 'sec', '0–60 mph'], ['Dual Motor', 'AWD', 'Drive'], ['24', 'cu ft', 'Cargo volume'], ['5', 'seats', 'Seating'], ['250', 'kW', 'Peak Supercharging']],
    colors: [['Stealth Grey', '#56595b'], ['Pearl White', '#e8e6df'], ['Diamond Black', '#17191a'], ['Deep Blue', '#19395f'], ['Ultra Red', '#9b1721']]
  },
  'model-3-premium': {
    name: 'Model 3 Premium', category: 'Electric sedan · Premium AWD',
    description: 'A refined all-wheel-drive electric sedan with long range, quick acceleration and a quiet, comfortable cabin.',
    image: '/tesla-motors/images/model-3-premium-card-73.jpg', source: 'https://www.tesla.com/model3',
    specs: [['346', 'mi', 'EPA-est. range'], ['4.2', 'sec', '0–60 mph'], ['Dual Motor', 'AWD', 'Drive'], ['24', 'cu ft', 'Cargo volume'], ['5', 'seats', 'Seating'], ['250', 'kW', 'Peak Supercharging']],
    colors: [['Stealth Grey', '#56595b'], ['Pearl White', '#e8e6df'], ['Diamond Black', '#17191a'], ['Deep Blue', '#19395f'], ['Ultra Red', '#9b1721']]
  },
  'model-y': {
    name: 'Model Y Standard', category: 'Electric SUV · Rear-Wheel Drive',
    description: 'A versatile electric SUV with generous cargo room, a calm cabin and range for longer journeys.',
    image: '/tesla-motors/images/model-y-standard-card-68.jpg', source: 'https://www.tesla.com/modely',
    specs: [['321', 'mi', 'EPA-est. range'], ['6.8', 'sec', '0–60 mph'], ['125', 'mph', 'Top speed'], ['74', 'cu ft', 'Cargo volume'], ['5', 'seats', 'Seating'], ['160', 'mi', 'Added in 15 min']],
    colors: [['Stealth Grey', '#56595b'], ['Pearl White', '#e8e6df'], ['Diamond Black', '#17191a']]
  },
  cybertruck: {
    name: 'Model Cybertruck', category: 'Electric pickup · Dual Motor AWD',
    description: 'An angular stainless-steel electric pickup with all-wheel drive, substantial towing capacity and flexible cargo space.',
    image: '/tesla-motors/images/cybertruck-card-35.jpg', source: 'https://www.tesla.com/cybertruck',
    specs: [['325', 'mi', 'EPA-est. range'], ['4.1', 'sec', '0–60 mph'], ['112', 'mph', 'Top speed'], ['7,500', 'lb', 'Towing capacity'], ['117.3', 'cu ft', 'Cargo volume'], ['5', 'seats', 'Seating']],
    colors: [['Stainless steel', '#b7b9b8']]
  }
};

const viewer = document.querySelector('#model-viewer');
const image = document.querySelector('#viewer-image');
let opener = null;
let closeTimer;
const swatchMarkup = (items) => items.map(([name, colour]) => `<span class="viewer-swatch-item" aria-label="${name}"><i class="viewer-swatch" style="--swatch:${colour}" aria-hidden="true"></i></span>`).join('');

function openModel(card) {
  const model = vehicleInfo[card.dataset.modelId];
  if (!model || !viewer) return;
  clearTimeout(closeTimer);
  viewer.classList.remove('is-closing');
  opener = card;
  const rect = card.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  viewer.style.setProperty('--clip-top', `${Math.max(0, rect.top / vh * 100)}%`);
  viewer.style.setProperty('--clip-right', `${Math.max(0, (vw - rect.right) / vw * 100)}%`);
  viewer.style.setProperty('--clip-bottom', `${Math.max(0, (vh - rect.bottom) / vh * 100)}%`);
  viewer.style.setProperty('--clip-left', `${Math.max(0, rect.left / vw * 100)}%`);
  document.querySelector('#viewer-title').textContent = model.name;
  document.querySelector('#viewer-category').textContent = model.category;
  document.querySelector('#viewer-description').textContent = model.description;
  document.querySelector('#viewer-caption').textContent = `${model.name.toUpperCase()} · COURTESY OF TESLA, INC.`;
  document.querySelector('#viewer-source').href = model.source;
  document.querySelector('#viewer-specs').innerHTML = model.specs.map(([value, unit, label]) => `<div class="viewer-spec"><strong>${value}<small>${unit}</small></strong><span>${label}</span></div>`).join('');
  document.querySelector('#viewer-swatches').innerHTML = swatchMarkup(model.colors);
  document.querySelector('#viewer-colour-names').textContent = model.colors.map(([name]) => name).join(' · ');
  image.src = model.image;
  image.alt = `${model.name} — courtesy of Tesla, Inc.`;
  viewer.hidden = false;
  document.body.classList.add('model-viewer-open');
  requestAnimationFrame(() => requestAnimationFrame(() => viewer.classList.add('is-open')));
}

function closeModel() {
  if (!viewer || viewer.hidden) return;
  viewer.classList.add('is-closing');
  viewer.classList.remove('is-open');
  closeTimer = window.setTimeout(() => {
    viewer.hidden = true;
    viewer.classList.remove('is-closing');
    document.body.classList.remove('model-viewer-open');
    if (opener) {
      opener.classList.add('is-returned-from-viewer');
      opener.focus();
    }
  }, 900);
}

const clearReturnedCardFocus = () => document.querySelectorAll('.lineup-card.is-returned-from-viewer').forEach((card) => card.classList.remove('is-returned-from-viewer'));
document.addEventListener('pointerdown', clearReturnedCardFocus, true);
document.addEventListener('keydown', clearReturnedCardFocus, true);
document.querySelectorAll('.lineup-card').forEach((card) => card.addEventListener('click', () => openModel(card)));
viewer?.addEventListener('click', () => closeModel());
