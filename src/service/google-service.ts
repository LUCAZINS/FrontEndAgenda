import { Injectable } from '@angular/core'; 
import { environment } from '../environments/environments'; 
import { HttpClient } from '@angular/common/http'; 
import { BehaviorSubject, Observable, tap } from 'rxjs'; 

export type GoogleUserType = 'cliente' | 'profissional' | 'estabelecimento'; 

export interface GoogleStatusResponse { 
  autenticado: boolean; 
  nome?: string; 
  email?: string; 
  role?: string; 
} 

@Injectable({ 
  providedIn: 'root' 
}) 
export class GoogleService { 
  private readonly apiUrl = environment.apiUrl; 

  // 1. Iniciamos como falso por padrão até a API responder
  private usuarioAutenticado$ = new BehaviorSubject<boolean>(false); 

  constructor(private http: HttpClient) {
    // 2. Chamar automaticamente ao iniciar a aplicação para checar o Cookie
    this.verificarAutenticacaoInicial();
  } 

  // Método privado para rodar a checagem no carregamento da página (F5)
  private verificarAutenticacaoInicial() {
    this.statusLogin().subscribe({
      next: (res) => {
        // Atualiza o BehaviorSubject com a resposta real do Cookie/Backend
        this.usuarioAutenticado$.next(res.autenticado);
      },
      error: () => {
        this.usuarioAutenticado$.next(false);
      }
    });
  }

  conectarGoogle(role: GoogleUserType): Window | null { 
    const url = `${this.apiUrl}/api/google/connect/${role}`; 
    console.log('Abrindo popup para login com Google:', url); 
    return window.open( 
      url, 'google-login', 'width=500,height=700,left=500,top=100' 
    ); 
  } 

  statusLogin(): Observable<GoogleStatusResponse> { 
    console.log('Verificando status do login com Google...'); 
    return this.http.get<GoogleStatusResponse>( 
      `${this.apiUrl}/api/google/google/status`, // Corrigido a rota duplicada se necessário (/google/google/)
      { withCredentials: true } 
    ).pipe(
      tap(response => { 
        console.log('Resposta da API:', response); 
        // Se a chamada manual do statusLogin for feita por outro componente, atualiza o estado global
        this.usuarioAutenticado$.next(response.autenticado);
      })
    ); 
  } 

  logout() { 
    return this.http.post(`${this.apiUrl}/api/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          console.log('Logout realizado com sucesso.'); 
          this.logoutSucesso(); // Atualiza o BehaviorSubject para false
        },
        error: (err) => console.error('Erro ao fazer logout:', err)
      }); 
  } 

  getUsuarioAutenticado(): Observable<boolean> { 
    return this.usuarioAutenticado$.asObservable(); 
  } 

  loginSucesso(){ 
    this.usuarioAutenticado$.next(true); 
  } 

  logoutSucesso() { 
    this.usuarioAutenticado$.next(false); 
  } 
}
