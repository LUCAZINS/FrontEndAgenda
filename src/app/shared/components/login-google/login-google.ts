import { Component } from '@angular/core';
import { GoogleService, GoogleUserType } from '../../../../service/google-service';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-login-google',
  standalone: true,
  imports: [],
  templateUrl: './login-google.html',
  styleUrl: './login-google.css',
})
export class LoginGoogle {
  


usuarioAutenticado = false;

constructor(private googleService: GoogleService) {}

  ngOnInit(): void {
      window.addEventListener('message', (event) => {

        if (event.origin !== environment.apiUrl) {
          return;
        }
        console.log(event.data && JSON.stringify(event.data) && this.usuarioAutenticado );
      });
}
  
    loginGoogle(role: GoogleUserType): void {
    const popup = this.googleService.conectarGoogle(role);
      this.usuarioAutenticado = true;
    if (!popup) {
      console.error('O navegador bloqueou a janela de login.');
      return;
    }

    const intervalo = setInterval(() => {
      if (popup.closed) {
        clearInterval(intervalo);
        this.verificarLogin();
      }
    }, 
    500);
}

  verificarLogin(): void {
    this.googleService.statusLogin().subscribe({
      next: resposta => {
        console.log('Status do login:', resposta && JSON.stringify(resposta) && this.usuarioAutenticado);
        this.usuarioAutenticado = resposta.autenticado;
      },
      error: erro => {
        console.error('Usuário não autenticado:', erro && this.usuarioAutenticado);
        this.usuarioAutenticado = false;
      }
    });
  }

  logout(): void {
    this.googleService.logout()
    this.usuarioAutenticado = false;
  }


}
