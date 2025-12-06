import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FoodService } from 'src/app/services/food.service';
import { Food } from 'src/app/shared/models/food';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import {CartService} from "../../../services/cart.service";
import {Cart} from "../../../shared/models/carts";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

foods:Food[] = [];

selectedTags: string[] = [];
selectedOrigins: string[] = [];
priceRange = { min: 0, max: 1000 };
filterName: string = '';
filterRestaurant: string = '';
allTags: string[] = [];
allOrigins: string[] = [];
searchText: string = '';
dragging = false;
cart: Food[] = [];
filteredFoods = this.foods;
showModal: boolean = false;
constructor(private cartService: CartService,private foodService:FoodService, activatedRoute:ActivatedRoute,private router: Router  ) {
  let foodsObservable:Observable<Food[]>;
  // activatedRoute.params.subscribe((params)=>{
  //   if(params.searchTerm)
  //     foodsObservable = this.foodService.getAllFoodBySearchItem(params.searchTerm);
  //   else if(params.tag)
  //     foodsObservable=this.foodService.getAllFoodsByTag(params.tag);
  //   else
  //     foodsObservable = foodService.getAll();

  //     foodsObservable.subscribe((serverFoods) => {
  //       this.foods = serverFoods;
  //     })
  // })

  this.foods = [
    {
      id: '1',
      name: 'Pizza',
      price: 500,
      tags: ['Italian', 'Fast Food'],
      stars: 4.5,
      imageUrl: '/assets/bdapav.jpeg',
      origins: ['Italy'],
      cookTime: '20 min'
    },
    {
      id: '2',
      name: 'Burger',
      price: 300,
      tags: ['American', 'Fast Food'],
      stars: 4.2,
      imageUrl: '/assets/pasta.jpeg',
      origins: ['USA'],
      cookTime: '15 min'
    },
    {
      id: '3',
      name: 'Sushi',
      price: 800,
      tags: ['Japanese', 'Seafood'],
      stars: 4.8,
      imageUrl: '/assets/samosa.jpeg',
      origins: ['Japan'],
      cookTime: '25 min'
    },
    {
      id: '4',
      name: 'Pasta',
      price: 450,
      tags: ['Italian', 'Vegetarian'],
      stars: 4.4,
      imageUrl: '/assets/pasta.jpeg',
      origins: ['Italy'],
      cookTime: '18 min'
    },
    {
      id: '5',
      name: 'Tacos',
      price: 350,
      tags: ['Mexican', 'Fast Food'],
      stars: 4.3,
      imageUrl: '/assets/tacos.jpeg',
      origins: ['Mexico'],
      cookTime: '12 min'
    },
    {
      id: '6',
      name: 'Spring Rolls',
      price: 200,
      tags: ['Chinese', 'Snack'],
      stars: 4.1,
      imageUrl: '/assets/springRoll.jpeg',
      origins: ['China'],
      cookTime: '10 min'
    },
    {
      id: '7',
      name: 'Dosa',
      price: 250,
      tags: ['Indian', 'Vegetarian'],
      stars: 4.6,
      imageUrl: '/assets/dosa.jpeg',
      origins: ['India'],
      cookTime: '15 min'
    },
    {
      id: '8',
      name: 'Ramen',
      price: 550,
      tags: ['Japanese', 'Noodles'],
      stars: 4.7,
      imageUrl: '/assets/ramen.jpeg',
      origins: ['Japan'],
      cookTime: '20 min'
    },
    {
      id: '9',
      name: 'Steak',
      price: 1000,
      tags: ['American', 'Meat'],
      stars: 4.9,
      imageUrl: '/assets/steak.jpeg',
      origins: ['USA'],
      cookTime: '30 min'
    },
    {
      id: '10',
      name: 'Falafel',
      price: 300,
      tags: ['Middle Eastern', 'Vegetarian'],
      stars: 4.5,
      imageUrl: '/assets/falafel.jpeg',
      origins: ['Middle East'],
      cookTime: '15 min'
    }
  ];
     

  this.allTags = [...new Set(this.foods.flatMap(f => f.tags ?? []))];
  this.allOrigins = [...new Set(this.foods.flatMap(f => f.origins ?? []))];
  this.filteredFoods = this.foods;
  const savedCart = this.getCartFromLocalStorage();
  if (savedCart) {
    this.cart = savedCart.items.map((item: any) => item.food);
  } else {
    this.cart = [];
  }
}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
}

openModal() {
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
}

applyFilter() {
  this.filteredFoods = this.foods.filter(food =>
    (this.selectedTags.length === 0 || (food.tags && food.tags.some(tag => this.selectedTags.includes(tag)))) &&
    (this.selectedOrigins.length === 0 || food.origins.some(origin => this.selectedOrigins.includes(origin))) &&
    food.price >= this.priceRange.min &&
    food.price <= this.priceRange.max
  );
  this.closeModal();
}

clearFilters() {
  this.selectedTags = [];
  this.selectedOrigins = [];
  this.priceRange = { min: 0, max: 1000 };
  this.filteredFoods = this.foods;
}

isDragOver = false;
onDrop(event: CdkDragDrop<Food[]>) {
  const food: Food = event.item.data;

  if (event.container.id === 'cartDropList' && !this.cart.some(f => f.id === food.id)) {
    this.cart.push(food);
    this.cartService.addToCart(food);

    this.isDragOver = false;
  }
}
onDragEnter() {
  this.isDragOver = true; // highlight cart
}

onDragLeave() {
  this.isDragOver = false; // remove highlight
}

onFoodClick(event: MouseEvent,food: Food) {
  console.log(this.dragging)
  if (this.dragging) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  this.router.navigate(['/food', food.id]);
}
private getCartFromLocalStorage():Cart{
  const cartJson = localStorage.getItem('Cart');
  return cartJson? JSON.parse(cartJson): new Cart();

}

}