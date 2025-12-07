export class Food {
    id!: string;
    name!: string;
    price!: number;
    tags?: string[];
    stars!: number;
    imageUrl!: string;
    origins!: string[];
    cookTime!: string;
    stock!: number; // CRITICAL FIX: Added the missing 'stock' property
}