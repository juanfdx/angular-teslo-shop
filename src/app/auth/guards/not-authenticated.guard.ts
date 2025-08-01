import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '@auth/services/auth-service';
import { firstValueFrom } from 'rxjs';


export const notAuthenticatedGuard: CanMatchFn = async (
  route: Route, 
  segments: UrlSegment[]
) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  // check if user is authenticated (firstValueFrom is used to wait for the observable to complete)
  const isAuthenticated = await firstValueFrom(authService.checkAuthStatus());
  
  if (isAuthenticated) {
    router.navigateByUrl('/');
    return false; // return false to prevent navigation
  }
  
  return true; // return true to allow navigation
};
