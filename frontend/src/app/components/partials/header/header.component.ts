import { Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from 'src/app/services/cart.service';
import { UserService } from 'src/app/services/user.service';
import { ThemeService } from 'src/app/services/theme.service';
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
  isDarkMode = false;
  isAuthPage: boolean = false;

  constructor(
    cartService:CartService,
    private userService:UserService,
    private location: Location,
    private router: Router,
    public themeService: ThemeService
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

    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  private checkRoute(): void {
    const currentUrl = this.router.url;
    // Hide back button on home page (exact match or search/tag routes which are also home)
    this.isHomePage = currentUrl === '/home' || currentUrl.startsWith('/search/') || currentUrl.startsWith('/tag/');
    // Hide cart on login and register pages (including root path which now shows login)
    this.isAuthPage = currentUrl === '/' || currentUrl.includes('/login') || currentUrl.includes('/register');
  }

  logout(){
    this.userService.logout();
  }

  get isAuth(){
    return this.user.token;
  }

  get isAdmin(){
    return this.user.isAdmin;
  }

  goBack(): void {
    this.location.back();
  }

  hungryHubClick(): void {
    this.router.navigateByUrl('/');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

}
