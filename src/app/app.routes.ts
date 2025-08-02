import { Routes } from '@angular/router';
import { isAdminGuard } from '@auth/guards/is-admin.guard';
import { notAuthenticatedGuard } from '@auth/guards/not-authenticated.guard';


export const routes: Routes = [
  
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes),
    canMatch: [
      notAuthenticatedGuard
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.routes').then(m => m.AdminDashboardRoutes),
    canMatch: [
      isAdminGuard
    ]
  },
  {
    path: '',
    loadChildren: () => import('./store-front/store-front.routes').then(m => m.storeFrontRoutes)
  }
];
