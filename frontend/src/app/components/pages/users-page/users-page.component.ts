import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UsersPageComponent implements OnInit {
  users: User[] = [];
  isLoading = true;

  constructor(
    private userService: UserService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    if (!this.userService.currentUser.isAdmin) {
      this.toastrService.error('Admin access required', 'Unauthorized');
      this.router.navigateByUrl('/dashboard');
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.toastrService.error('Failed to load users', 'Error');
        this.isLoading = false;
        this.users = [];
      }
    });
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}

