export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const path = (relative = '') => `${BASE}/${relative.replace(/^\//, '')}`;
export const image = (name: string, mobile = false) => path(`images/${name}${mobile ? '-mobile' : ''}.webp`);
export const official = {
  home: 'https://mikurestaurant.com/',
  menu: 'https://mikurestaurant.com/menu/',
  booking: 'https://www.opentable.ca/r/miku-restaurant-vancouver-reservations-vancouver?restref=24787&lang=en-CA&ot_source=Restaurant%20website&ot_campaign=homepagebutton',
  privateDining: 'https://mikurestaurant.com/private-events/',
};
export const verifiedDate = 'October 14, 2026';
