import { Injectable } from '@angular/core';
import { environment } from '../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';


export type GoogleUserType =
  | 'cliente'
  | 'profissional'
  | 'estabelecimento';

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

  constructor(private http: HttpClient) {}

  conectarGoogle(role: GoogleUserType): Window | null {
    const url = `${this.apiUrl}/api/google/connect/${role}`;

    console.log('Abrindo popup para login com Google:', url);
    return window.open(
      url,
      'google-login',
      'width=500,height=700,left=500,top=100'
    );
  }

  statusLogin(): Observable<GoogleStatusResponse> {
    console.log('Verificando status do login com Google...');
    return this.http.get<GoogleStatusResponse>(
      `${this.apiUrl}/api/google/google/status`,
      {
        withCredentials: true
      }
    ).pipe(tap(response => {
      console.log('Resposta da API:', response);
      console.log(JSON.stringify(response, null, 2));
    }));
  }
  logout() {
    return this.http.post(`${this.apiUrl}/api/auth/logout`, {}, {
      withCredentials: true
    }).subscribe(() => {
      console.log('Logout realizado com sucesso.');
    });
  }
}