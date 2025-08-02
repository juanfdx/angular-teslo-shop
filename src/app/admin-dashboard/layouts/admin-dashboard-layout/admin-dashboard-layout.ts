import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth-service';

@Component({
  selector: 'admin-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard-layout.html',
})
export class AdminDashboardLayout {

  authService = inject(AuthService);

  user = computed(() => this.authService.user());

}
