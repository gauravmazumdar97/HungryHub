import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  user!: User;

  constructor(private userService: UserService) {
    this.user = this.userService.currentUser;
  }

  get isAuth(): boolean {
    return !!this.user.token;
  }

  get isAdmin(): boolean {
    return this.user.isAdmin;
  }
}
