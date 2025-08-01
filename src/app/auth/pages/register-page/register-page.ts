import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth-service';


@Component({
  selector: 'register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.html',
})

export class RegisterPage {

  fb = inject(FormBuilder);
  hasError  = signal(false);
  isPosting = signal(false);
  router = inject(Router);

  authService = inject(AuthService);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [
      Validators.required, 
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
    ]
  ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })


  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }


  onSubmit() {
    if (this.registerForm.invalid) return;
    
    const { fullName = '', email = '', password = '' } = this.registerForm.value;
    
    this.authService
      .register(fullName!, email!, password!) 
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
