import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../environments/environments";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface AuthStatus {
  autenticado: boolean;
  role?: string;
  nome?: string | null;
  profissionalId?: string | null;
  clienteId?: string | null;
  estabelecimentoId?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;

  private usuarioAutenticado$ =
    new BehaviorSubject<boolean>(false);

  private usuario$ =
    new BehaviorSubject<AuthStatus | null>(null);

  constructor(private http: HttpClient) {}

  verificarSessao(): Observable<AuthStatus> {

    return this.http.get<AuthStatus>(
      `${this.apiUrl}/api/google/status`,
      {
        withCredentials: true
      }
    ).pipe(

      tap(usuario => {

        this.usuarioAutenticado$.next(usuario.autenticado);

        this.usuario$.next(usuario);

      })

    );
  }

  estaAutenticado(): Observable<boolean> {
    return this.usuarioAutenticado$.asObservable();
  }

  getUsuario(): Observable<AuthStatus | null> {
    return this.usuario$.asObservable();
  }

  logout(): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/api/auth/logout`,
      {},
      {
        withCredentials: true
      }
    ).pipe(

      tap(() => {

        this.usuarioAutenticado$.next(false);

        this.usuario$.next(null);

      })

    );
  }
}