import { Injectable, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
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
  imagens: (ImagemServicoModel | string)[];
  status: string;
  quantidadeVendas: number;
}


export interface ImagemServicoModel {
  id: number;
  imagemUrl: string;
  ordem: number;
}

export interface CriarServicoDto {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  tempoEmMinutos: number;
  imagens: (ImagemServicoModel | string)[];
  status: string;
}

export interface EditarServicoDto {
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  tempoEmMinutos: number;
  imagens: (ImagemServicoModel | string)[];
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicoProfissionalService {
  
  private readonly apiUrl = environment.apiUrl;
  readonly categoriasExistentes: string[] = [];
  readonly categoriasCache = signal<string[]>([]);



  readonly servicosProfissional = signal<ServicoProfissionalModel[]>([]);

  constructor(private http: HttpClient) {}

  // mostrarServicos(): Observable<ServicoProfissionalModel[]> {
  //   const url = `${this.apiUrl}/api/servicos/MeusServicos/Profissional`;
  //   console.log('[API] Buscando serviços atualizados diretamente na API...');

  //   return this.http
  //     .get<ServicoProfissionalModel[]>(url, {
  //       withCredentials: true
  //     })
  //     .pipe(
  //       tap(servicos => {
  //         console.log(`[API] Sucesso! ${servicos.length} serviços retornados da API.`);
  //         this.servicosProfissional.set(servicos);
  //       })
  //     );
  // }




 mostrarServicos(): Observable<ServicoProfissionalModel[]> {
  // 1. Se já existir cache de serviços, retorna ele direto
  if (this.servicosProfissional().length > 0) {
    console.log('buscado no cache');
    return of(this.servicosProfissional());
  }

  // 2. Se o cache estiver vazio, vai na API de Serviços
  const url = `${this.apiUrl}/api/servicos/MeusServicos/Profissional`;
  console.log('[API] Cache vazio ou limpo. Buscando serviços na API...');

  return this.http
    .get<ServicoProfissionalModel[]>(url, { withCredentials: true })
    .pipe(
      tap(servicos => {
        console.log(`[API] Sucesso! ${servicos.length} serviços retornados.`);
        
        // Alimenta o cache global de serviços
        this.servicosProfissional.set(servicos); 
      })
    );
}

buscarCategoriasApi(): Observable<string[]> {
  // Verifica se as categorias já estão salvas no cache do Service
  if (this.categoriasCache().length > 0) {
    console.log('[Cache] Categorias recuperadas do cache local.');
    return of(this.categoriasCache());
  }

  // Substitua pela rota real correspondente do seu Controller C# se houver
  const url = `${this.apiUrl}/api/categorias/MinhasCategorias`; 
  console.log('[API] Buscando lista de categorias na API...');

  return this.http
    .get<string[]>(url, { withCredentials: true })
    .pipe(
      tap(categorias => {
        console.log(`[API] Sucesso! ${categorias.length} categorias encontradas.`);
        this.categoriasCache.set(categorias); // Salva no cache
      })
    );
}

  criarServico(formData: FormData ): Observable<ServicoProfissionalModel> 
  {
    return this.http
      .post<ServicoProfissionalModel>(
        `${this.apiUrl}/criarServico/meus`,
        formData,
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
editarServico( id: number,formData: FormData): Observable<ServicoProfissionalModel> {
  return this.http.put<ServicoProfissionalModel>(
    `${this.apiUrl}/api/servicos/${id}`,
    formData,
    {
      withCredentials: true
    }
  ).pipe(
    tap(servicoEditado => {
      this.atualizarNoCache(servicoEditado);
    })
  );
}

  excluirImagem(imagemId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/servicos/ApagarImagem/Profissional/Id${imagemId}`,
      {
        withCredentials: true
      }
    );
  }

  removerImagemDoCache(imagemId: number): void {
    this.servicosProfissional.update(servicos =>
      servicos.map(servico => ({
        ...servico,
        imagens: servico.imagens.filter(imagem =>
          typeof imagem === 'string' || imagem.id !== imagemId
        )
      }))
    );
  }

 deletarServico(id: number): Observable<void> {
  return this.http.delete<void>(
    `${this.apiUrl}/api/servicos/${id}`,
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
      console.log('Serviço atualizado no cache:', servico);
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