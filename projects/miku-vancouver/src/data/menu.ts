import research from './research.json';
export interface Dish {
  id: string; name: string; category: string; price: number; priceLabel?: string;
  description: string; dietary: string[]; source: string; photo: string;
}
export const categories = research.categories;
// Each menu dish has its own licensed editorial photograph. Imagery is illustrative.
const dishPhotos: Record<string, string> = {
  'salmon-oshi': 'sushi', 'ebi-oshi': 'prawn-nigiri', 'saba-oshi': 'hero', 'miku-roll': 'roll-tray',
  'bluefin-trio': 'tuna-nigiri', 'sockeye-sashimi': 'sashimi-platter',
  'tofu-salad': 'salad', 'lobster-ceviche': 'tuna-tartare', 'ebi-fritters': 'tempura', 'wagyu-carpaccio': 'carpaccio',
  'sablefish': 'fish', 'wagyu-steak': 'steak', 'miku-kaiseki': 'kaiseki-spread', 'waterfront-kaiseki': 'dark-rolls',
  'green-tea-opera': 'matcha-layer', 'miso-cheesecake': 'cheesecake', 'espresso': 'coffee-ceramic', 'green-tea': 'tea',
};
export const dishes: Dish[] = research.dishes.map(d => ({ ...d, photo: dishPhotos[d.id] }));
export const price = (dish: Dish) => dish.priceLabel ?? `$${Number.isInteger(dish.price) ? dish.price : dish.price.toFixed(2)}`;
export const signature = ['salmon-oshi', 'ebi-oshi', 'miku-roll', 'sablefish', 'green-tea-opera'].map(id => dishes.find(d => d.id === id)!);
