import { Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service';
import { User } from '../../../shared/models/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{

  cartQuantity=0;
  user!:User;
  isHomePage: boolean = false;

  constructor(
    cartService:CartService,
    private userService:UserService,
    private location: Location,
    private router: Router
  ) { 
    cartService.getCartObservable().subscribe((newCart) => {
      this.cartQuantity = newCart.totalCount;
    })

    userService.userObservable.subscribe((newUser) => {
      this.user = newUser;
    })
  }

  ngOnInit(): void {
    // Check initial route
    this.checkRoute();
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });
  }

  private checkRoute(): void {
    const currentUrl = this.router.url;
    // Hide back button on home page (exact match or search/tag routes which are also home)
    this.isHomePage = currentUrl === '/' || currentUrl.startsWith('/search/') || currentUrl.startsWith('/tag/');
  }

  logout(){
    this.userService.logout();
  }

  get isAuth(){
    return this.user.token;
  }

  goBack(): void {
    this.location.back();
  }

}
