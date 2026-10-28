import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { environment } from '../environments/environments';

export interface ClienteBusca {
  id: number;
  nome: string;
}

export interface Cliente {
  Id: number;
  clienteId: number;
  nome: string;
}

interface ClienteApi {
  Id?: number;
  clienteId?: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class Clienteservice {
  private apiUrl = environment.apiUrl;

  private meusClientesCache$?: Observable<Cliente[]>;
  private meusClientesDetailCache$?: Observable<any>;
  private meusClientesConcluidosCache$?: Observable<any>;

  clientes = signal<Cliente[]>([]);
  clientesCarregados = signal(false);

  constructor(private http: HttpClient) {}

  buscarMeusClientes(): Observable<Cliente[]> {
    if (!this.meusClientesCache$) {
      this.meusClientesCache$ = this.http
        .get<ClienteApi[]>(
          `${this.apiUrl}/api/Profissionais/profissional/me/clientes`,
          { withCredentials: true }
        )
        .pipe(
          map(clientes =>
            clientes.map(cliente => {
              const id = cliente.clienteId ?? cliente.Id;

              return {
                Id: id as number,
                clienteId: id as number,
                nome: cliente.nome
              };
            })
          ),
          tap(clientes => {
            this.clientes.set(clientes);
            this.clientesCarregados.set(true);
          }),
          shareReplay(1)
        );
    }

    return this.meusClientesCache$;
  }

  buscarMeusClientesDetail(): Observable<any> {
    if (!this.meusClientesDetailCache$) {
      this.meusClientesDetailCache$ = this.http.get(
        `${this.apiUrl}/api/Profissionais/profissional/me/clientesDetail`,
        { withCredentials: true }
      ).pipe(shareReplay(1));
    }

    return this.meusClientesDetailCache$;
  }

  buscarMeusClientesConcluidos(): Observable<any> {
    if (!this.meusClientesConcluidosCache$) {
      this.meusClientesConcluidosCache$ = this.http.get(
        `${this.apiUrl}/api/Profissionais/profissional/me/clientesConcluidos`,
        { withCredentials: true }
      ).pipe(shareReplay(1));
    }

    return this.meusClientesConcluidosCache$;
  }

  buscarClientesPorNome(busca: string): Observable<ClienteBusca[]> {
    return this.http.get<ClienteBusca[]>(
      `${this.apiUrl}/buscar/cliente/nome`,
      {
        params: { busca },
        withCredentials: true
      }
    );
  }

  atualizarClientes(): void {
    this.meusClientesCache$ = undefined;
    this.clientesCarregados.set(false);
  }

  atualizarClientesDetail(): void {
    this.meusClientesDetailCache$ = undefined;
  }

  atualizarClientesConcluidos(): void {
    this.meusClientesConcluidosCache$ = undefined;
  }

  atualizarTodosClientes(): void {
    this.meusClientesCache$ = undefined;
    this.meusClientesDetailCache$ = undefined;
    this.meusClientesConcluidosCache$ = undefined;
    this.clientesCarregados.set(false);
  }

  limparCache(): void {
    this.atualizarTodosClientes();
  }
}