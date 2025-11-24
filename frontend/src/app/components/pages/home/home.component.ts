import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FoodService } from 'src/app/services/food.service';
import { Food } from 'src/app/shared/models/food';

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
filteredFoods = this.foods;
showModal: boolean = false;
constructor(private foodService:FoodService, activatedRoute:ActivatedRoute ) {
    let foodsObservable:Observable<Food[]>;
    activatedRoute.params.subscribe((params)=>{
      if(params.searchTerm)
        foodsObservable = this.foodService.getAllFoodBySearchItem(params.searchTerm);
      else if(params.tag)
        foodsObservable=this.foodService.getAllFoodsByTag(params.tag);
      else
        foodsObservable = foodService.getAll();

        foodsObservable.subscribe((serverFoods) => {
          this.foods = serverFoods;
        })
    })
     
    
    this.allTags = [...new Set(this.foods.flatMap(f => f.tags ?? []))];
    this.allOrigins = [...new Set(this.foods.flatMap(f => f.origins ?? []))];
    this.filteredFoods = this.foods;
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
  
}
