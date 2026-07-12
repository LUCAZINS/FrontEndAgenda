import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';



export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface Profissional {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  especialidade?: string;
}

export interface ServicoDetalhe {
  id: number;
  profissionalId: number;
  profissional: Profissional | null;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  tempoEmMinutos: number;
  imagemUrl: string;
  status: string;
}

export interface Agendamento {
  id: number;

  clienteId: number;
  cliente: Cliente;

  profissionalId: number;
  profissional: Profissional | null;

  servicoId: number;
  servico: ServicoDetalhe;

  dataInicio: string;
  dataFim: string;

  observacoes: string;
  statusAgendamento: string;
}

export interface CriarAgendamentoDto {
  clienteId: number;
  profissionalId: number;
  servicoId: number;
  dataInicio: string;
  observacoes: string;
  status: string;
}

@Injectable({
  providedIn: 'root' 
})
export class AgendamentoprofissionalService {

private readonly apiUrl = environment.apiUrl;



constructor(private http: HttpClient) { }

buscarAgendamentosDoProfissional(
  ): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(
      `${this.apiUrl}/api/Agendamentos/profissional/meus`,
      {
        withCredentials: true
      }
    );
  }

  criarAgendamento(dto: CriarAgendamentoDto): Observable<Agendamento> {
  return this.http.post<Agendamento>(
    `${this.apiUrl}/api/Agendamentos/profissional`,
    dto,
    {
      withCredentials: true
    }
  );
}

}


