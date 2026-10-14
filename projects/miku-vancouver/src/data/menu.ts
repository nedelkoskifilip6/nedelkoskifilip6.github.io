import research from './research.json';
export interface Dish {
  id: string; name: string; category: string; price: number; priceLabel?: string;
  description: string; dietary: string[]; source: string; photo: string;
}
export const categories = research.categories;
const photos: Record<string, string> = {
  'Signature Aburi': 'sushi', 'Sushi & Sashimi': 'sashimi', 'Appetizers': 'wagyu',
  'Main Courses': 'wagyu', 'Kaiseki Experience': 'hero', 'Desserts': 'dessert', 'Beverages': 'tea',
};
const individual: Record<string, string> = { 'salmon-oshi': 'sushi', 'ebi-oshi': 'hero', 'saba-oshi': 'sushi', 'miku-roll': 'hero', 'sablefish': 'fish', 'tofu-salad': 'salad', 'lobster-ceviche': 'shellfish', 'ebi-fritters': 'shellfish' };
export const dishes: Dish[] = research.dishes.map(d => ({ ...d, photo: individual[d.id] ?? photos[d.category] }));
export const price = (dish: Dish) => dish.priceLabel ?? `$${Number.isInteger(dish.price) ? dish.price : dish.price.toFixed(2)}`;
export const signature = ['salmon-oshi', 'ebi-oshi', 'miku-roll', 'sablefish', 'green-tea-opera'].map(id => dishes.find(d => d.id === id)!);
