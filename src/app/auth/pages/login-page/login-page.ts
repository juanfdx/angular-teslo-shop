import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// SERVICES
import { AuthService } from '@auth/services/auth-service';


@Component({
  selector: 'login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
})

export class LoginPage {

  fb = inject(FormBuilder);
  hasError  = signal(false);
  isPosting = signal(false);
  router = inject(Router);

  authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [
      Validators.required, 
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
    ]
  ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })


  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  
  onSubmit() {
    if (this.loginForm.invalid) return;
    
    const { email = '', password = '' } = this.loginForm.value;
    
    this.authService
      .login(email!, password!)
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/', { replaceUrl: true });
          return;
        }
        else {
          this.hasError.set(true);
        }
      });

    setTimeout(() => this.hasError.set(false), 3000);
  }

}
