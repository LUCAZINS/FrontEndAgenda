import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { GoogleService, GoogleUserType } from '../../../../service/google-service';
import { environment } from '../../../../environments/environments';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-google',
  standalone: true,
  imports: [],
  templateUrl: './login-google.html',
  styleUrl: './login-google.css',
})
export class LoginGoogle implements OnInit, OnDestroy {
  
usuarioAutenticado:boolean =  false;
private sub!:Subscription;


constructor(
  private googleService: 
  GoogleService,
  private cdr: ChangeDetectorRef 
  
) {}

  ngOnInit(): void {
      window.addEventListener('message', (event) => {

        if (event.origin !== environment.apiUrl) {
          return;
        }
        console.log(event.data && JSON.stringify(event.data) && this.usuarioAutenticado );
      });

      this.sub = this.googleService.getUsuarioAutenticado().subscribe(status => {this.usuarioAutenticado = status; 
        console.log('Status de autenticação atualizado:', status, this.usuarioAutenticado);
        this.cdr.detectChanges(); 

    });
}
ngOnDestroy() {
    this.sub.unsubscribe(); 
  }

  
    loginGoogle(role: GoogleUserType): void {
    const popup = this.googleService.conectarGoogle(role);
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
        console.log(this.usuarioAutenticado);
        this.usuarioAutenticado = resposta.autenticado;
      },
      error: erro => {
        console.error("Erro ao verificar login: Login = ", erro && this.usuarioAutenticado);
        this.usuarioAutenticado = false;
      }
    });
  }

  logout(): void {
    this.googleService.logout()
    this.usuarioAutenticado = false;
  }




}
