import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

export interface Profissional {
  id: number;
  estabelecimentoId: number;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  horaAbertura: string;
  horaFechamento: string;
  imagemUrlPerfil: string | null;
  imagemUrlLogo: string | null;
  imagemUrlBanner: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarProfissional(): Observable<Profissional> {
    return this.http.get<Profissional>(
      `${this.apiUrl}/api/Profissionais/profissional/me`,
      { withCredentials: true }
    );
  }
}