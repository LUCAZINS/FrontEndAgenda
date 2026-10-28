import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment.development';

export interface Notificacao {
  id: number;
  agendamentoId: number;

  descricao: string;
  motivoDaModificacao: string;

  data: string;
  criadoPor: enumCriadoPor;

  lidaProfissional: boolean;
  lidaCliente: boolean;

  profissionalNome: string;
  clienteNome: string;
  servicoNome: string;

  statusDoAgendamento: string;
  statusAgendamento: string;

  dataInicio: string;
  dataFim: string;
}
export enum enumCriadoPor{
  Cliente,
  Profissional,
  Sistema
}
@Injectable({
  providedIn: 'root'
})
export class NotificacaoAgendamentoService {

  private apiUrl = `${environment.apiUrl}/api/Notificacao`;

  // ============================
  // CACHE DE NOTIFICAÇÕES
  // ============================

  readonly notificacoes = signal<Notificacao[]>([]);

  readonly notificacoesNaoLidas = signal<number>(0);

  constructor(private http: HttpClient) {}

  // ============================
  // CLIENTE
  // ============================

  buscarNotificacoesCliente(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(
      `${this.apiUrl}/cliente`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(dados => {
        this.notificacoes.set(dados);
        this.atualizarQuantidadeNaoLidas(dados);
      })
    );
  }

  // ============================
  // PROFISSIONAL
  // ============================

  buscarNotificacoesProfissional(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(
      `${this.apiUrl}/profissional`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(dados => {
        this.notificacoes.set(dados);
        this.atualizarQuantidadeNaoLidas(dados);
      })
    );
  }
  // ============================
  // BUSCAR DO AGENDAMENTO
  // ============================

  buscarHistoricoAgendamento(id: number): Observable<Notificacao[]> {
  return this.http.get<Notificacao[]>(
    `${this.apiUrl}/agendamento/${id}`,
    {
      withCredentials: true
    }
  );
}

  // ============================
  // NÃO LIDAS
  // ============================

  buscarNaoLidasCliente(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(
      `${this.apiUrl}/cliente/nao-lidas`,
      {
        withCredentials: true
      }
    );
  }

  buscarNaoLidasProfissional(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(
      `${this.apiUrl}/profissional/nao-lidas`,
      {
        withCredentials: true
      }
    );
  }

  // ============================
  // Buscar notificação por ID
  // ============================

  buscarNotificacaoPorId(id: number): Observable<Notificacao> {
  return this.http.get<Notificacao>(
    `${this.apiUrl}/${id}`,
    {
      withCredentials: true
    }
  );
}
  // ============================
  // MARCAR COMO LIDA
  // ============================

  marcarComoLidaCliente(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/cliente/${id}/lida`,
      {},
      {
        withCredentials: true
      }
    ).pipe(
      tap(() => {
        this.atualizarLida(id, true);
      })
    );
  }

  marcarComoLidaProfissional(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/profissional/${id}/lida`,
      {},
      {
        withCredentials: true
      }
    ).pipe(
      tap(() => {
        this.atualizarLida(id, true);
      })
    );
  }

  // ============================
  // MARCAR TODAS COMO LIDAS
  // ============================

  marcarTodasComoLidasCliente(): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/cliente/todas/lidas`,
      {},
      {
        withCredentials: true
      }
    ).pipe(
      tap(() => {
        this.marcarTodasComoLidas();
      })
    );
  }

  marcarTodasComoLidasProfissional(): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/profissional/todas/lidas`,
      {},
      {
        withCredentials: true
      }
    ).pipe(
      tap(() => {
        this.marcarTodasComoLidas();
      })
    );
  }

  // ============================
  // MÉTODOS DO CACHE
  // ============================

  private atualizarLida(
    id: number,
  lidaProfissional: boolean
  ): void {

    this.notificacoes.update(lista =>
      lista.map(notificacao =>
        notificacao.id === id
          ? {
              ...notificacao,
              lidaprofissional: lidaProfissional,
            }
          : notificacao
      )
    );

    this.atualizarQuantidadeNaoLidas(
      this.notificacoes()
    );
  }

  private marcarTodasComoLidas(): void {

    this.notificacoes.update(lista =>
      lista.map(notificacao => ({
        ...notificacao,
        lidaProfissional: true,
        lidaCliente: true
      }))
    );

    this.notificacoesNaoLidas.set(0);
  }

  private atualizarQuantidadeNaoLidas(
    notificacoes: Notificacao[]
  ): void {

    const quantidade = notificacoes.filter(
      notificacao => !notificacao.lidaProfissional
    ).length;

    this.notificacoesNaoLidas.set(quantidade);
  }

  limparCache(): void {
    this.notificacoes.set([]);
    this.notificacoesNaoLidas.set(0);
  }
}