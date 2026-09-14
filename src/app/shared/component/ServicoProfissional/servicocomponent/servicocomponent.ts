import { Component, OnInit, HostListener, ChangeDetectorRef, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { of, finalize } from 'rxjs';
import { NgClass } from '@angular/common';


import {
  CriarServicoDto,
  EditarServicoDto,
  ServicoProfissionalModel,
  ServicoProfissionalService
} from '../../../../../service/servico-profissional';

// IMPORTANTE: Ajuste o caminho do import de acordo com a sua pasta de services
import { NotificacaoService } from '../../../../../service/NotificaçãoService'; 

@Component({
  selector: 'app-servicocomponent',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, NgClass],
  templateUrl: './servicocomponent.html',
  styleUrl: './servicocomponent.css'
})


export class Servicocomponent implements OnInit {
  readonly servicos;

    categoriasExistentes: string[] = [];
    imagensParaExcluir: number[] = [];

  
  


  precoEdicaoFormatadoVisivel = '';
  precoFormatadoVisivel = '';
  servicoEmEdicaoId: number | null = null;
  exibirFormulario = false;
  loading = true;
  imagemSelecionada: File | null = null;  
  imagemEdicaoSelecionada: File | null = null;


  servicoEmEdicao: EditarServicoDto = {
    nome: '',
    descricao: '',
    preco: 0,
    categoria: '',
    tempoEmMinutos: 0,
    imagens: [],
    status: 'Ativo'
  };

  novoServico: CriarServicoDto = {
    nome: '',
    descricao: '',
    preco: 0,
    categoria: '',
    tempoEmMinutos: 0,
    imagens: [],
    status: 'Ativo',
  };

  constructor(
    private servicoProfissionalService: ServicoProfissionalService,
    public notificacaoService: NotificacaoService, // INJETADO COMO PÚBLICO PARA O HTML LER
    private cdr: ChangeDetectorRef // 2. INJETE O DETECTOR DE MUDANÇAS AQUI
    
  ) {
    this.servicos = this.servicoProfissionalService.servicosProfissional;
  }

  ngOnInit(): void {
    this.mostrarServicos();
  }

  formatarMoedaEmTempoReal(event: any): void {
    let valorLimpo = event.target.value.replace(/\D/g, '');

    if (!valorLimpo) {
      this.precoFormatadoVisivel = '';
      this.novoServico.preco = 0;
      return;
    }

    const valorNumerico = parseFloat(valorLimpo) / 100;
    this.novoServico.preco = valorNumerico;

    this.precoFormatadoVisivel = valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

    filtroNome = signal<string>('');
ordenacaoVendas = signal<'nenhuma' | 'crescente' | 'decrescente'>('nenhuma');
filtroCategoria = signal<string>('todas');
servicosFiltrados = computed(() => {
  const termoNome = this.filtroNome().trim().toLowerCase();
  const categoria = this.filtroCategoria();
  const ordem = this.ordenacaoVendas();

  let lista = [...this.servicos()];

  // Filtro por nome
  if (termoNome) {
    lista = lista.filter(servico =>
      servico.nome.toLowerCase().includes(termoNome)
    );
  }

  // Filtro por categoria
  if (categoria !== 'todas') {
    lista = lista.filter(servico =>
      servico.categoria === categoria
    );
  }

  // Ordenação por vendas
  if (ordem === 'crescente') {
    lista.sort(
      (a, b) =>
        (a.quantidadeVendas ?? 0) -
        (b.quantidadeVendas ?? 0)
    );
  }

  if (ordem === 'decrescente') {
    lista.sort(
      (a, b) =>
        (b.quantidadeVendas ?? 0) -
        (a.quantidadeVendas ?? 0)
    );
  }

  return lista;
});

  @HostListener('document:keydown.escape', ['$event'])
  lidarTeclaEsc(event: Event): void { 
    if (this.exibirFormulario) { 
      console.log('[Teclado] ESC pressionado: Fechando formulário de criação.');
      this.exibirFormulario = false; 
      return;
    }

    if (this.servicoEmEdicaoId !== null) {
      console.log('[Teclado] ESC pressionado: Fechando formulário de edição.');
      this.cancelarEdicao();
      return; 
    }

    // DISPARA O FECHAMENTO UM POR UM DE DENTRO DO SERVICE GLOBAL
    this.notificacaoService.removerMaisAntigaComEsc();
  }

  selecionarImagem(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    this.imagemSelecionada = null;
    return;
  }

  this.imagemSelecionada = input.files[0];

  console.log('Imagem selecionada:', this.imagemSelecionada);
}

selecionarImagemEdicao(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    this.imagemEdicaoSelecionada = null;
    console.log('Nenhuma imagem selecionada para edição.');
    return;
  }

  this.imagemEdicaoSelecionada = input.files[0];

  console.log(
    'Nova imagem selecionada:',
    this.imagemEdicaoSelecionada
  );
}


    excluirImagem(imagemId: number | null): void {
  if (imagemId === null) {
    this.notificacaoService.exibir(
      'O serviço não retornou o ID desta imagem.',
      'erro'
    );
    return;
  }

  // Guarda o ID para excluir somente quando salvar
  if (!this.imagensParaExcluir.includes(imagemId)) {
    this.imagensParaExcluir.push(imagemId);
  }

  // Remove apenas da visualização
  this.servicoEmEdicao.imagens =
    this.servicoEmEdicao.imagens.filter(imagem =>
      typeof imagem === 'string' || imagem.id !== imagemId
    );

  // Ajusta o índice da imagem atual
  if (this.servicoEmEdicaoId !== null) {
    const quantidadeImagens = this.servicoEmEdicao.imagens.length;

    if (quantidadeImagens === 0) {
      delete this.indicesImagens[this.servicoEmEdicaoId];
    } else {
      const indiceAtual = this.obterIndiceImagem(
        this.servicoEmEdicaoId
      );

      this.indicesImagens[this.servicoEmEdicaoId] =
        Math.min(indiceAtual, quantidadeImagens - 1);
    }
  }

  this.cdr.detectChanges();

  console.log(
    'Imagens marcadas para exclusão:',
    this.imagensParaExcluir
  );
}

  private indicesImagens: { [servicoId: number]: number } = {};

  obterIndiceImagem(servicoId: number,): number {
  console.log('Id da imagem:', servicoId);
  return this.indicesImagens[servicoId] ?? 0;
}

  obterUrlImagem(imagem: { imagemUrl: string } | string): string {
    return typeof imagem === 'string' ? imagem : imagem.imagemUrl;
  }

  obterIdImagem(imagem: { id: number } | string): number | null {
    return typeof imagem === 'string' ? null : imagem.id;
  }

obterImagemAtual(imagemId: number): number {
  console.log('Id da imagem atual:', imagemId);
  this.servicoProfissionalService.servicosProfissional();
  return this.indicesImagens[imagemId] ?? 0;
}

imagemAnterior(servico: ServicoProfissionalModel): void {

  if (!servico.imagens || servico.imagens.length <= 1) {
    return;
  }

  const indiceAtual = this.obterIndiceImagem(servico.id);

  this.indicesImagens[servico.id] =
    indiceAtual === 0
      ? servico.imagens.length - 1
      : indiceAtual - 1;
}

proximaImagem(servico: ServicoProfissionalModel): void {

  if (!servico.imagens || servico.imagens.length <= 1) {
    return;
  }

  const indiceAtual = this.obterIndiceImagem(servico.id);

  this.indicesImagens[servico.id] =
    indiceAtual === servico.imagens.length - 1
      ? 0
      : indiceAtual + 1;
}


mostrarServicos(): void {
  this.loading = true;
  this.cdr.detectChanges(); // Force o carregamento a aparecer imediatamente

  this.servicoProfissionalService.mostrarServicos().subscribe({
    next: servicos => {
      console.log('Serviços carregados:', servicos);
      this.BuscarCategoria();
      
      // Um pequeno 'setTimeout' sutil de 200ms garante que a transição do esqueleto/loading 
      // aconteça perfeitamente, mesmo se os dados vierem na velocidade da luz do cache local.
      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges(); // Avisa o Angular para renderizar a lista
      }, 200);
    },
    error: erro => {
      console.error('Erro ao buscar serviços:', erro);
      this.notificacaoService.exibir('Erro ao carregar lista de serviços.', 'erro');
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  BuscarCategoria(): void {
    const listaServicos = this.servicos();

    if (listaServicos && listaServicos.length > 0) {
      const todasCategorias = listaServicos.map((s: ServicoProfissionalModel) => s.categoria);
      this.categoriasExistentes = [...new Set(todasCategorias)].filter(Boolean);
      console.log('Categorias carregadas do cache:', this.categoriasExistentes);
    }
  }

selecionarParaEditar(servico: ServicoProfissionalModel): void {
  this.servicoEmEdicaoId = servico.id;

  this.imagensParaExcluir = [];

  this.servicoEmEdicao = {
    nome: servico.nome,
    descricao: servico.descricao,
    preco: servico.preco,
    categoria: servico.categoria,
    tempoEmMinutos: servico.tempoEmMinutos,
    imagens: [...servico.imagens],
    status: servico.status
  };
    
    this.precoEdicaoFormatadoVisivel = servico.preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
  formatarMoedaEdicaoEmTempoReal(event: any): void {
    let valorLimpo = event.target.value.replace(/\D/g, '');

    if (!valorLimpo) {
      this.precoEdicaoFormatadoVisivel = '';
      this.servicoEmEdicao.preco = 0;
      return;
    }

    const valorNumerico = parseFloat(valorLimpo) / 100;
    this.servicoEmEdicao.preco = valorNumerico;

    this.precoEdicaoFormatadoVisivel = valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

salvarEdicao(): void {

  if (this.servicoEmEdicaoId === null) {
    console.error('Nenhum serviço foi selecionado para edição.');
    return;
  }

  this.loading = true;

  const formData = new FormData();

  formData.append(
    'Nome',
    this.servicoEmEdicao.nome
  );

  formData.append(
    'Descricao',
    this.servicoEmEdicao.descricao
  );

  formData.append(
    'Preco',
    this.servicoEmEdicao.preco.toString()
  );

  formData.append(
    'Categoria',
    this.servicoEmEdicao.categoria
  );

  formData.append(
    'TempoEmMinutos',
    this.servicoEmEdicao.tempoEmMinutos.toString()
  );

  formData.append(
    'Status',
    this.servicoEmEdicao.status
  );


  // Nova imagem
  if (this.imagemEdicaoSelecionada) {

    formData.append(
      'imagens',
      this.imagemEdicaoSelecionada,
      this.imagemEdicaoSelecionada.name
    );

  }


  console.log(
    'Imagens que serão excluídas:',
    this.imagensParaExcluir
  );


  this.servicoProfissionalService
    .editarServico(
      this.servicoEmEdicaoId,
      formData
    )
    .pipe(

      finalize(() => {

        // SEMPRE executa:
        // sucesso ou erro

        this.loading = false;

        this.cdr.detectChanges();

      })

    )
    .subscribe({

      // ==========================
      // SUCESSO
      // ==========================

      next: servicoEditado => {

        console.log(
          'Serviço editado:',
          servicoEditado
        );


        // Exclui somente agora
        this.imagensParaExcluir.forEach(imagemId => {

          this.servicoProfissionalService
            .excluirImagem(imagemId)
            .subscribe({

              next: () => {

                console.log(
                  'Imagem excluída:',
                  imagemId
                );

              },

              error: erro => {

                console.error(
                  'Erro ao excluir imagem:',
                  imagemId,
                  erro
                );

              }

            });

        });


        this.imagensParaExcluir = [];

        this.imagemEdicaoSelecionada = null;


        this.notificacaoService.exibir(
          'Serviço alterado com sucesso!',
          'sucesso'
        );


        this.cancelarEdicao();

        this.mostrarServicos();

      },


      // ==========================
      // ERRO
      // ==========================

      error: erro => {

        console.error(
          'Erro ao editar serviço:',
          erro
        );


        let mensagem =
          'Não foi possível salvar as alterações.';


        // Backend retornou texto diretamente
        if (typeof erro.error === 'string') {

          mensagem = erro.error;

        }

        // Backend retornou { message: "..." }
        else if (erro.error?.message) {

          mensagem = erro.error.message;

        }

        // Backend retornou { erro: "..." }
        else if (erro.error?.erro) {

          mensagem = erro.error.erro;

        }

        // ASP.NET ProblemDetails
        else if (erro.error?.detail) {

          mensagem = erro.error.detail;

        }

        // ASP.NET ProblemDetails title
        else if (erro.error?.title) {

          mensagem = erro.error.title;

        }


        this.notificacaoService.exibir(
          mensagem,
          'erro'
        );

      }

    });
}

obterCorCategoria(categoria: string): string {
  const cores = [
    'categoria-roxo',
    'categoria-azul',
    'categoria-verde',
    'categoria-laranja',
    'categoria-vermelho',
    'categoria-rosa',
    'categoria-ciano',
    'categoria-amarelo'
  ];

  // Garante que a mesma categoria sempre tenha a mesma cor
  let hash = 0;

  for (let i = 0; i < categoria.length; i++) {
    hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
  }

  const indice = Math.abs(hash) % cores.length;

  return cores[indice];
}

cancelarEdicao(): void {
  this.servicoEmEdicaoId = null;

  this.imagensParaExcluir = [];
  this.imagemEdicaoSelecionada = null;

  this.servicoEmEdicao = {
    nome: '',
    descricao: '',
    preco: 0,
    categoria: '',
    tempoEmMinutos: 0,
    imagens: [],
    status: 'Ativo'
  };

  this.precoEdicaoFormatadoVisivel = '';
}

  private limparFormularioCriacao(): void {
    this.novoServico = {
      nome: '',
      descricao: '',
      preco: 0,
      categoria: '',
      tempoEmMinutos: 0,
      imagens: [],
      status: 'Ativo'
    };
    this.precoFormatadoVisivel = '';
  }

  deletarServico(id: number): void {

  const confirmar = confirm(
    'Tem certeza que deseja excluir este serviço? Essa ação não poderá ser desfeita.'
  );

  if (!confirmar) {
    return;
  }

  this.servicoProfissionalService.deletarServico(id).subscribe({
    next: () => {
      this.notificacaoService.exibir(
        'Serviço excluído com sucesso.',
        'sucesso'
      );
    },
    error: erro => {
      console.log('Erro completo:', erro);

      let mensagem = 'Não foi possível excluir o serviço.';

      if (typeof erro.error === 'string') {
        mensagem = erro.error;
      } else if (erro.error?.message) {
        mensagem = erro.error.message;
      }

      this.notificacaoService.exibir(mensagem, 'erro');
    }
  });
}

  CriarServico(): void {
    if (!this.novoServico.nome ||
        !this.novoServico.descricao ||
        !this.novoServico.preco ||
        !this.novoServico.categoria ||
        !this.novoServico.tempoEmMinutos ||
        !this.novoServico.status
    ) {  
      this.notificacaoService.exibir('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    if (!this.imagemSelecionada) {
    this.notificacaoService.exibir(
      'Selecione uma imagem para o serviço.',
      'erro'
    );

    return;
  }

    const formData = new FormData();

  formData.append('Nome', this.novoServico.nome);
  formData.append('Descricao', this.novoServico.descricao);
  formData.append('Preco', this.novoServico.preco.toString());
  formData.append('Categoria', this.novoServico.categoria);
  formData.append(
    'TempoEmMinutos',
    this.novoServico.tempoEmMinutos.toString()
  );
  formData.append('Status', this.novoServico.status);

  formData.append(
    'imagem',
    this.imagemSelecionada
  );

  this.notificacaoService.exibir(
    'Salvando serviço...',
    'sucesso'
  );

  this.servicoProfissionalService
    .criarServico(formData)
    .subscribe({

      next: servico => {

        console.log('Serviço criado:', servico);

        this.notificacaoService.exibir(
          'Serviço criado com sucesso.',
          'sucesso'
        );

        this.limparFormularioCriacao();

        this.imagemSelecionada = null;

        this.BuscarCategoria();

        this.exibirFormulario = false;
      },

      error: erro => {

        console.error(
          'Erro ao criar serviço:',
          erro
        );

        this.notificacaoService.exibir(
          'Não foi possível criar o serviço.',
          'erro'
        );
      }
    });
}
}
