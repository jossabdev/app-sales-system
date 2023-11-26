import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs';

export const AuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    take(1),
    tap((isLoggedIn) => !isLoggedIn ? router.navigate(['/login']): true)
  );
}

export const HasRole = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
 // Boolean(user && allowedRoles.includes(user.role)
  return authService.isLoggedIn().pipe(
    take(1),
    tap((isLoggedIn) => isLoggedIn && localStorage.getItem('Rol') === 'Vendedor' ? router.navigate(['/ventas']): true)
  );
}