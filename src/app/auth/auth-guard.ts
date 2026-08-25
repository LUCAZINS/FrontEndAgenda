import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.verificarSessao().pipe(

    map(usuario => {

      if (usuario.autenticado) {
        return true;
      }

      return router.createUrlTree([
        '/Auth/login/Profissional'
      ]);

    }),

    catchError(() => {

      return of(
        router.createUrlTree([
          '/Auth/login/Profissional'
        ])
      );

    })

  );
};