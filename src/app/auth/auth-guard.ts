import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[Guard] Verificando sessão...');

  return authService.verificarSessao().pipe(

    map(usuario => {

      console.log('[Guard] Resposta da sessão:', usuario);

      if (usuario.autenticado) {

        console.log('[Guard] Usuário autenticado. Acesso liberado.');

        return true;
      }

      console.warn('[Guard] Usuário não autenticado.');

      return router.createUrlTree([
        '/Auth/login/Profissional'
      ]);
    }),

    catchError(erro => {

      console.error(
        '[Guard] Erro ao verificar sessão:',
        erro
      );

      return of(
        router.createUrlTree([
          '/Auth/login/Profissional'
        ])
      );
    })
  );
};