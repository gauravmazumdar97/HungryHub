import { Component, OnInit } from '@angular/core';
import { FoodService } from 'src/app/services/food.service';
import { Tag } from 'src/app/shared/models/tag';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tags?:Tag[];
  constructor(foodService:FoodService){
    foodService.getAllTags().subscribe({
      next: (serverTags) => {
      this.tags = serverTags;
      },
      error: (err) => {
        console.error('Error loading tags:', err);
        this.tags = [];
      }
    })
   }

  ngOnInit(): void {
    
  }

}
