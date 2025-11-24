export enum DishCategory {
  Veg = 'Veg',
  NonVeg = 'Non-Veg',
  Vegan = 'Vegan',
}

export enum DishType {
    Starter = 'Starter',
    MainCourse = 'Main Course',
    Dessert = 'Dessert',
    Drink = 'Drink',
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  image: string;
  category: DishCategory | null; // Desserts might not have a category
  type: DishType;
}

export interface HallPackage {
    id: number;
    name: string;
    tier: string;
    price: string;
    capacity: string;
    features: string[];
    limits: {
        starters: number;
        mainCourses: number;
        desserts: number;
        drinks: number;
    };
    isPopular?: boolean;
}

export interface CartItem extends Dish {
    quantity: number;
}

export interface BookingData {
  name: string;
  dateTime: string;
  guests: string;
  contact: string;
  preBookedItems: CartItem[];
}

export interface HallBookingData {
  name: string;
  dateTime: string;
  guests: string;
  contact: string;
  package: HallPackage;
  selectedItems: {
    starters: Dish[];
    mainCourses: Dish[];
    desserts: Dish[];
    drinks: Dish[];
  };
}