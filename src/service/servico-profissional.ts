import { Injectable, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment.development';

export interface ProfissionalModel {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  estabelecimentoId: number;
  estabelecimento: any | null;
  horaAbertura: string;
  horaFechamento: string;
}

export interface ServicoProfissionalModel {
  id: number;
  profissional: ProfissionalModel | null;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  tempoEmMinutos: number;
  imagemUrl: string;
  status: string;
}

export interface CriarServicoDto {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  tempoEmMinutos: number;
  imagemUrl: string;
  status: string;
}

export interface EditarServicoDto {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  tempoEmMinutos: number;
  imagemUrl: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicoProfissionalService {
  private readonly apiUrl = environment.apiUrl;

  readonly servicosProfissional = signal<ServicoProfissionalModel[]>([]);

  constructor(private http: HttpClient) {}

  mostrarServicos(): Observable<ServicoProfissionalModel[]> {
    const url = `${this.apiUrl}/api/servicos/MeusServicos/Profissional`;

    return this.http
      .get<ServicoProfissionalModel[]>(url, {
        withCredentials: true
      })
      .pipe(
        tap(servicos => {
          this.servicosProfissional.set(servicos);
        })
      );
  }

  criarServico(
    dto: CriarServicoDto
  ): Observable<ServicoProfissionalModel> {
    return this.http
      .post<ServicoProfissionalModel>(
        `${this.apiUrl}/criarServico/meus`,
        dto,
        {
          withCredentials: true
        }
      )
      .pipe(
        tap(servicoCriado => {
          this.adicionarNoCache(servicoCriado);
        })
      );
  }

  criarServicoc(dto: CriarServicoDto): Observable<ServicoProfissionalModel> {
  return this.http.post<ServicoProfissionalModel>(
    `${this.apiUrl}/criarServico/meus`,
    dto,
    {
      withCredentials: true
    }
  ).pipe(
    tap(servicoCriado => {
      this.adicionarNoCache(servicoCriado);
    })
  );
}
editarServico( id: number,dto: EditarServicoDto): Observable<ServicoProfissionalModel> {
  return this.http.put<ServicoProfissionalModel>(
    `${this.apiUrl}/api/servicos/${id}`,
    dto,
    {
      withCredentials: true
    }
  ).pipe(
    tap(servicoEditado => {
      this.atualizarNoCache(servicoEditado);
    })
  );
}
 deletarServico(id: number): Observable<void> {
  return this.http.delete<void>(
    `${this.apiUrl}/api/Servicos/${id}`,
    {
      withCredentials: true
    }
  ).pipe(
    tap(() => this.removerDoCache(id))
  );
}

  adicionarNoCache(servico: ServicoProfissionalModel): void {
    const existe = this.servicosProfissional()
      .some(item => item.id === servico.id);

    if (existe) {
      this.atualizarNoCache(servico);
      return;
    }

    this.servicosProfissional.update(lista => [
      ...lista,
      servico
    ]);
  }

  atualizarNoCache(
  servico: Partial<ServicoProfissionalModel>
): void {
  this.servicosProfissional.update(lista =>
    lista.map(item => {
      if (item.id !== servico.id) {
        return item;
      }

      return {
        ...item,
        ...servico
      };
    })
  );
}
  private removerDoCache(id: number): void {
    this.servicosProfissional.update(servicos =>
      servicos.filter(servico => servico.id !== id)
    );
  }

}