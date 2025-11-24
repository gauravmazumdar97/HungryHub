import { Dish, DishCategory, DishType, HallPackage } from './types';

export const MENU_ITEMS: Dish[] = [
  // --- Starters ---
  {
    id: 1,
    name: 'Scotch Egg',
    description: 'A classic hard-boiled egg wrapped in sausage meat, coated in breadcrumbs and fried.',
    image: 'https://images.unsplash.com/photo-1580955513878-3603415379b3?q=80&w=1974&auto=format&fit=crop',
    category: DishCategory.NonVeg,
    type: DishType.Starter,
  },
  {
    id: 9,
    name: 'Smoked Salmon Blinis',
    description: 'Delicate blinis topped with Scottish smoked salmon, cream cheese, and dill.',
    image: 'https://images.unsplash.com/photo-1615141998968-24bc1962b8a0?q=80&w=1974&auto=format&fit=crop',
    category: DishCategory.NonVeg,
    type: DishType.Starter,
  },
  {
    id: 12,
    name: 'Burrata with Prosciutto & Figs',
    description: 'Creamy Italian burrata cheese served with thinly sliced prosciutto, fresh figs, and a drizzle of balsamic glaze.',
    image: 'https://images.unsplash.com/photo-1563864019-948f20a6f4a8?q=80&w=1974&auto=format&fit=crop',
    category: DishCategory.NonVeg,
    type: DishType.Starter,
  },
  {
    id: 5,
    name: 'Pea & Mint Soup',
    description: 'A refreshing and vibrant soup made with fresh peas and mint, served chilled or warm.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop',
    category: DishCategory.Vegan,
    type: DishType.Starter,
  },
  {
    id: 11,
    name: 'Welsh Rarebit',
    description: 'A savoury sauce of melted cheese and seasonings served over toasted artisan bread.',
    image: 'https://images.unsplash.com/photo-1584523274245-c3d4239283b2?q=80&w=1974&auto=format&fit=crop',
    category: DishCategory.Veg,
    type: DishType.Starter,
  },

  // --- Main Courses ---
  {
    id: 3,
    name: 'Fish & Chips',
    description: 'Beer-battered cod served with thick-cut chips, mushy peas, and house-made tartar sauce.',
    image: 'https://images.unsplash.com/photo-1579208034281-a73915ba532b?q=80&w=1974&auto=format&fit=crop',
    category: DishCategory.NonVeg,
    type: DishType.MainCourse,
  },
  {
    id: 6,
    name: 'Shepherd\'s Pie',
    description: 'Rich lamb mince in a rosemary gravy with vegetables, topped with a fluffy layer of mashed potato.',
    image: 'https://images.unsplash.com/photo-1598866952872-7c39041532a2?q=80&w=2070&auto=format&fit=crop',
    category: DishCategory.NonVeg,
    type: DishType.MainCourse,
  },
    {
    id: 13,
    name: 'Duck Confit',
    description: 'Classic French slow-cooked duck leg with a crispy skin, served on a bed of puy lentils with a cherry reduction.',
    image: 'https://images.unsplash.com/photo-1598511757833-68d29e7102b3?q=80&w=1976&auto=format&fit=crop',
    category: DishCategory.NonVeg,
    type: DishType.MainCourse,
  },
  {
    id: 7,
    name: 'Mushroom & Ale Pie',
    description: 'Hearty wild mushrooms and root vegetables in a rich ale gravy, encased in a flaky pastry.',
    image: 'https://images.unsplash.com/photo-1621852003712-4010375a40a8?q=80&w=1974&auto=format&fit=crop',
    category: DishCategory.Vegan,
    type: DishType.MainCourse,
  },
   {
    id: 2,
    name: 'Glamorgan Sausages',
    description: 'Traditional Welsh vegetarian sausages made with Caerphilly cheese, leeks, and breadcrumbs.',
    image: 'https://plus.unsplash.com/premium_photo-1673822114878-a029f61a15a0?q=80&w=2070&auto=format&fit=crop',
    category: DishCategory.Veg,
    type: DishType.MainCourse,
  },

  // --- Desserts ---
  {
    id: 4,
    name: 'Sticky Toffee Pudding',
    description: 'A moist sponge cake with finely chopped dates, covered in a toffee sauce and served with vanilla custard.',
    image: 'https://images.unsplash.com/photo-1584879234854-de5527a052e4?q=80&w=1974&auto=format&fit=crop',
    category: null,
    type: DishType.Dessert,
  },
  {
    id: 8,
    name: 'Eton Mess',
    description: 'A traditional dessert combining fresh strawberries, broken meringue, and whipped double cream.',
    image: 'https://images.unsplash.com/photo-1567197188339-397a7a403222?q=80&w=1974&auto=format&fit=crop',
    category: null,
    type: DishType.Dessert,
  },
  {
    id: 10,
    name: 'Apple Crumble',
    description: 'Warm baked apples topped with a crisp and buttery crumble, served with clotted cream or ice cream.',
    image: 'https://images.unsplash.com/photo-1567172353770-65c363f8cb12?q=80&w=1974&auto=format&fit=crop',
    category: null,
    type: DishType.Dessert,
  },
    {
    id: 14,
    name: 'Crème Brûlée',
    description: 'A rich custard base topped with a layer of hardened caramelized sugar, with a hint of vanilla bean.',
    image: 'https://images.unsplash.com/photo-1673327498083-2f2b31119565?q=80&w=1974&auto=format&fit=crop',
    category: null,
    type: DishType.Dessert,
  },
  // --- Drinks ---
  {
    id: 15,
    name: 'Pimm\'s Cup',
    description: 'A classic British cocktail with Pimm\'s No. 1, lemonade, mint, cucumber, orange, and strawberries.',
    image: 'https://images.unsplash.com/photo-1624492819890-5880daa42159?q=80&w=1974&auto=format&fit=crop',
    category: null,
    type: DishType.Drink,
  },
  {
    id: 16,
    name: 'Elderflower Presse',
    description: 'A refreshing non-alcoholic sparkling drink with the delicate taste of elderflower.',
    image: 'https://images.unsplash.com/photo-1602148733224-ad84346c9343?q=80&w=1974&auto=format&fit=crop',
    category: null,
    type: DishType.Drink,
  },
  {
    id: 17,
    name: 'London Fog',
    description: 'A cozy tea latte made with Earl Grey tea, steamed milk, and a hint of vanilla.',
    image: 'https://images.unsplash.com/photo-1639733346411-91a03358c54c?q=80&w=1974&auto=format&fit=crop',
    category: null,
    type: DishType.Drink,
  },
];

export const HALL_PACKAGES: HallPackage[] = [
    {
        id: 1,
        name: 'Essential Gathering',
        tier: 'Package 1',
        price: '£',
        capacity: '15-30 people',
        features: ['1 Starter', '1 Main Course', '1 Dessert', '1 Drink'],
        limits: { starters: 1, mainCourses: 1, desserts: 1, drinks: 1 },
    },
    {
        id: 2,
        name: 'Deluxe Celebration',
        tier: 'Package 2',
        price: '££',
        capacity: '15-30 people',
        features: ['2 Starters', '2 Main Courses', '2 Desserts', 'Drinks Included'],
        limits: { starters: 2, mainCourses: 2, desserts: 2, drinks: 30 }, // Effectively unlimited drinks
        isPopular: true,
    },
    {
        id: 3,
        name: 'Grand Soirée',
        tier: 'Package 3',
        price: '£££',
        capacity: '15-30 people',
        features: ['3 Starters', '3 Main Courses', 'Gourmet Dessert Bar', 'Premium Drinks Included'],
        limits: { starters: 3, mainCourses: 3, desserts: 3, drinks: 30 }, // Effectively unlimited drinks
    }
];