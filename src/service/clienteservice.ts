import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../environments/environments';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ClienteBusca 
{
  clienteId: number;
  nome: string;
}
@Injectable({
  providedIn: 'root'
})
export class Clienteservice {

  private apiUrl = environment.apiUrl;

  // Cache
  private meusClientesCache$?: Observable<any>;
  private meusClientesDetailCache$?: Observable<any>;
  private meusClientesConcluidosCache$?: Observable<any>;
  clientes = signal<{ clienteId: number; nome: string; }[]>([]);
  clientesCarregados = signal(false);

  constructor(private http: HttpClient) {}

  // =========================
  // MEUS CLIENTES
  // =========================

buscarMeusClientes(): Observable<ClienteBusca[]> {

if (!this.meusClientesCache$) {


this.meusClientesCache$ =
  this.http.get<ClienteBusca[]>(
    `${this.apiUrl}/api/Profissionais/profissional/me/clientes`,
    {
      withCredentials: true
    }
  ).pipe(

    tap(clientes => {

      console.log(
        'Clientes recebidos da API:',
        clientes
      );

      this.clientes.set(clientes);

      this.clientesCarregados.set(true);

    }),

    shareReplay(1)

  );


}

return this.meusClientesCache$;
}


  // =========================
  // CLIENTES DETAIL
  // =========================

  buscarMeusClientesDetail(): Observable<any> {

    if (!this.meusClientesDetailCache$) {

      this.meusClientesDetailCache$ = this.http.get(
        `${this.apiUrl}/api/Profissionais/profissional/me/clientesDetail`,
        { withCredentials: true }
      ).pipe(
        shareReplay(1)
      );
    }

    return this.meusClientesDetailCache$;
  }

  // =========================
  // CLIENTES CONCLUÍDOS
  // =========================

  buscarMeusClientesConcluidos(): Observable<any> {

    if (!this.meusClientesConcluidosCache$) {

      this.meusClientesConcluidosCache$ = this.http.get(
        `${this.apiUrl}/api/Profissionais/profissional/me/clientesConcluidos`,
        { withCredentials: true }
      ).pipe(
        shareReplay(1)
      );
    }

    return this.meusClientesConcluidosCache$;
  }






  // =========================
  // ATUALIZAR CACHE
  // =========================

  atualizarClientes(): void {
    this.meusClientesCache$ = undefined;
  }

  atualizarClientesDetail(): void {
    this.meusClientesDetailCache$ = undefined;
  }

  atualizarClientesConcluidos(): void {
    this.meusClientesConcluidosCache$ = undefined;
  }

  // Atualiza todos os caches
  atualizarTodosClientes(): void {
    this.meusClientesCache$ = undefined;
    this.meusClientesDetailCache$ = undefined;
    this.meusClientesConcluidosCache$ = undefined;
  }

  // =========================
  // RETIRAR DO CACHE
  // =========================

  limparCache(): void {
    this.meusClientesCache$ = undefined;
    this.meusClientesDetailCache$ = undefined;
    this.meusClientesConcluidosCache$ = undefined;
  }


}