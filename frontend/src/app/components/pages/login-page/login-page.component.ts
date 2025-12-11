import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { LoadingService } from 'src/app/services/loading.service';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  loginForm!:FormGroup;
  isSubmitted = false;
  returnUrl = '';
  constructor(
    private formBuilder:FormBuilder,
    private userService:UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService
    ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email:['', [Validators.required, Validators.email]],
      password:['', Validators.required],
    });
    //loginForm.controls.email

    this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl;   //?returnURl value
  }

  get fc(){
    return this.loginForm.controls;
  }

  submit(){
    this.isSubmitted = true;
    if(this.loginForm.invalid) return;

    // Show loading indicator
    this.loadingService.showLoading();
    
    this.userService.login({email:this.fc.email.value,
        password: this.fc.password.value}).subscribe({
          next: (user) => {
            // setTimeout(() => {
              // Hide loading before navigation
              this.loadingService.hideLoading();
              user.isAdmin ? this.returnUrl = '/dashboard' : this.returnUrl = '/home';

              // If returnUrl is provided, use it (user was trying to access a specific page)
              if (this.returnUrl) {
                this.router.navigateByUrl(this.returnUrl);
              }
            // }, 2000);
          },
          error: (error) => {
            // Hide loading on error
            this.loadingService.hideLoading();
            console.error('Login error:', error);
          }
        });
  }
}


