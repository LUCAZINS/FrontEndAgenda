import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { Observable, of, tap } from 'rxjs';
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
  profissional: Profissional;
  servicoId: number;
  servico: ServicoDetalhe;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
  statusAgendamento: string;
}

export interface CriarAgendamentoDto {
  clienteId: number;
  servicoId: number;
  dataInicio: string;
  observacoes: string;
  status: string;
}

export interface EditarAgendamentoDto {
  statusAgendamento: string;
  observacoes: string;
  dataInicio: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoprofissionalService {
  private readonly apiUrl = environment.apiUrl;

  readonly agendamentos = signal<Agendamento[]>([]);
  readonly carregado = signal(false);

  constructor(private http: HttpClient) {}

 buscarAgendamentosDoProfissional(
  forcarAtualizacao = false
): Observable<Agendamento[]> {

  if (this.carregado() && !forcarAtualizacao) {
    console.log("Usando cache");
    return of(this.agendamentos());
  }

  console.log("Buscando da API");

  return this.http.get<Agendamento[]>(
    `${this.apiUrl}/api/Agendamentos/profissional/meus`,
    {
      withCredentials: true
    }
  ).pipe(
    tap(dados => {
      this.agendamentos.set(dados);
      this.carregado.set(true);
    })
  );
}

  criarAgendamento(
    dto: CriarAgendamentoDto
  ): Observable<Agendamento> {
    return this.http.post<Agendamento>(
      `${this.apiUrl}/api/Agendamentos/criaragendamento/profissional`,
      dto,
      {
        withCredentials: true
      }
    ).pipe(
      tap(agendamento => {
        this.adicionarNoCache(agendamento);
      })
    );
  }

  cancelarAgendamento(id: number): Observable<Agendamento> {
    return this.http.patch<Agendamento>(
      `${this.apiUrl}/api/Agendamentos/${id}/cancelar`,
      {},
      {
        withCredentials: true
      }
    ).pipe(
      tap(agendamento => {
        this.atualizarNoCache(agendamento);
      })
    );
  }

  reativarAgendamento(id: number): Observable<Agendamento> {
    return this.http.patch<Agendamento>(
      `${this.apiUrl}/api/Agendamentos/${id}/reativar`,
      {},
      {
        withCredentials: true
      }
    ).pipe(
      tap(agendamento => {
        this.atualizarNoCache(agendamento);
      })
    );
  }

  deletarAgendamento(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/Agendamentos/profissional/${id}`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(() => {
        this.removerDoCache(id);
      })
    );
  }

  editarAgendamento(
    id: number,
    dto: EditarAgendamentoDto
  ): Observable<Agendamento> {
    return this.http.put<Agendamento>(
      `${this.apiUrl}/api/Agendamentos/${id}`,
      dto,
      {
        withCredentials: true
      }
    ).pipe(
      tap(agendamento => {
        this.atualizarNoCache(agendamento);
      })
    );
  }

  adicionarNoCache(agendamento: Agendamento): void {
    const existe = this.agendamentos()
      .some(item => item.id === agendamento.id);

    if (existe) {
      this.atualizarNoCache(agendamento);
      return;
    }

    this.agendamentos.update(lista => [
      ...lista,
      agendamento
    ]);
  }

atualizarNoCache(agendamento: Partial<Agendamento>): void {
  this.agendamentos.update(lista =>
    lista.map(item => {
      if (item.id !== agendamento.id) {
        return item;
      }

      return {
        ...item,
        ...agendamento,

        cliente: agendamento.cliente ?? item.cliente,
        profissional: agendamento.profissional ?? item.profissional,
        servico: agendamento.servico ?? item.servico
      };
    })
  );
}

  atualizarStatusNoCache(
    id: number,
    statusAgendamento: string
  ): void {
    this.agendamentos.update(lista =>
      lista.map(item =>
        item.id === id
          ? { ...item, statusAgendamento }
          : item
      )
    );
  }

  removerDoCache(id: number): void {
    this.agendamentos.update(lista =>
      lista.filter(item => item.id !== id)
    );
  }

  limparCache(): void {
    this.agendamentos.set([]);
    this.carregado.set(false);
  }
}