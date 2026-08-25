import { Component, OnDestroy, OnInit } from '@angular/core';
import { GoogleService, GoogleUserType} from '../../../../service/google-service';
import { AuthService } from '../../../auth/auth';
import { Router, Routes } from '@angular/router';


import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-google-profissional',
  standalone: true,
  imports: [],
  templateUrl: './login-google-profissional.html',
  styleUrl: './login-google-profissional.css',
})
export class LoginGoogleProfissional
  implements OnInit, OnDestroy {

  usuarioAutenticado = false;

  private sub?: Subscription;

  constructor(
    private googleService: GoogleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.sub =
      this.authService.estaAutenticado()
        .subscribe(status => {

          this.usuarioAutenticado = status;

        });

  }

  ngOnDestroy(): void {

    this.sub?.unsubscribe();

  }

  loginGoogle(role: GoogleUserType): void {

    const popup =
      this.googleService.conectarGoogle(role);

    if (!popup) {

      console.error(
        'O navegador bloqueou a janela de login.'
      );

      return;

    }

    const intervalo = setInterval(() => {

      if (popup.closed) {

        clearInterval(intervalo);

        this.verificarLogin();

      }

    }, 500);

  }

 verificarLogin(): void {

  this.authService.verificarSessao()
    .subscribe({
      next: usuario => {

        if (usuario.autenticado) {

          this.router.navigate([
            'Auth/login/Profissional/home'
          ]);

        }

      },

      error: erro => {

        console.error(
          'Erro ao verificar sessão:',
          erro
        );

      }
    });

}

  logout(): void {

    this.authService.logout()
      .subscribe({
        next: () => {

          this.usuarioAutenticado = false;

        },

        error: erro => {

          console.error(
            'Erro ao realizar logout:',
            erro
          );

        }
      });

  }
}