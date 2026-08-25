import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CriarServicoDto,
  EditarServicoDto,
  ServicoProfissionalModel,
  ServicoProfissionalService
} from '../../../../../service/servico-profissional';

@Component({
  selector: 'app-servicocomponent',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './servicocomponent.html',
  styleUrl: './servicocomponent.css'
})
export class Servicocomponent implements OnInit {
  readonly servicos;

  servicoEmEdicaoId: number | null = null;

  servicoEmEdicao: EditarServicoDto = {
    nome: '',
    descricao: '',
    preco: 0,
    categoria: '',
    tempoEmMinutos: 0,
    imagemUrl: '',
    status: 'Ativo'
  };

  novoServico: CriarServicoDto = {
    nome: '',
    descricao: '',
    preco: 0,
    categoria: '',
    tempoEmMinutos: 0,
    imagemUrl: '',
    status: 'Ativo'
  };

    mensagemErroDelete = '';
    mensagemNotificacao = '';
    tipoNotificacao: 'sucesso' | 'erro' = 'sucesso';
    mostrarNotificacao = false;

  constructor(
    private servicoProfissionalService: ServicoProfissionalService
  ) {
    this.servicos =
      this.servicoProfissionalService.servicosProfissional;
  }

  ngOnInit(): void {
    this.mostrarServicos();
  }

  mostrarServicos(): void {
    this.servicoProfissionalService.mostrarServicos().subscribe({
      next: servicos => {
        console.log(
          'Serviços do profissional:',
          servicos
        );
      },

      error: erro => {
        console.error(
          'Erro ao buscar serviços do profissional:',
          erro
        );
      }
    });
  }



  selecionarParaEditar(
    servico: ServicoProfissionalModel
  ): void {
    this.servicoEmEdicaoId = servico.id;

    this.servicoEmEdicao = {
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco,
      categoria: servico.categoria,
      tempoEmMinutos: servico.tempoEmMinutos,
      imagemUrl: servico.imagemUrl,
      status: servico.status
    };
  }

  salvarEdicao(): void {
    if (this.servicoEmEdicaoId === null) {
      console.error(
        'Nenhum serviço foi selecionado para edição.'
      );
      return;
    }

    this.servicoProfissionalService
      .editarServico(
        this.servicoEmEdicaoId,
        this.servicoEmEdicao
      )
      .subscribe({
        next: servicoEditado => {
          console.log(
            'Serviço editado:',
            servicoEditado
          );

          this.cancelarEdicao();
        },

        error: erro => {
          console.error(
            'Erro ao editar serviço:',
            erro
          );
        }
      });
  }

  cancelarEdicao(): void {
    this.servicoEmEdicaoId = null;

    this.servicoEmEdicao = {
      nome: '',
      descricao: '',
      preco: 0,
      categoria: '',
      tempoEmMinutos: 0,
      imagemUrl: '',
      status: 'Ativo'
    };
  }

  private limparFormularioCriacao(): void {
    this.novoServico = {
      nome: '',
      descricao: '',
      preco: 0,
      categoria: '',
      tempoEmMinutos: 0,
      imagemUrl: '',
      status: 'Ativo'
    };
  }

  
deletarServico(id: number): void {

  this.servicoProfissionalService.deletarServico(id)
  .subscribe({

    next: () => {
      this.exibirNotificacao(
        'Serviço excluído com sucesso.'
      );
    },

    error: erro => {

      console.log('Erro completo:', erro);

      let mensagem = 'Não foi possível excluir o serviço.';

      if (typeof erro.error === 'string') {
        mensagem = erro.error;
      } 
      else if (erro.error?.message) {
        mensagem = erro.error.message;
      }

      setTimeout(() => {
        this.exibirNotificacao(mensagem);
      }, 100);
    }

  });

}


exibirNotificacao(mensagem: string): void {
  
  console.log('Antes:', this.mostrarNotificacao);

  this.mensagemNotificacao = mensagem;
  this.mostrarNotificacao = true;

  console.log('Depois:', this.mostrarNotificacao);

  setTimeout(() => {
    this.mostrarNotificacao = false;
    console.log('Fechou:', this.mostrarNotificacao);
  }, 5000);
}

CriarServico(): void{
  if (!
    this.novoServico.nome ||
      !this.novoServico.descricao ||
      !this.novoServico.preco ||
      !this.novoServico.categoria ||
      !this.novoServico.tempoEmMinutos ||
      !this.novoServico.imagemUrl ||
      !this.novoServico.status
  ) {  
    this.exibirNotificacao('Preencha os campos obrigatórios.');
    return;
  }

  const dto: CriarServicoDto = {
    nome: this.novoServico.nome,
    descricao: this.novoServico.descricao,
    preco: this.novoServico.preco,
    categoria: this.novoServico.categoria,
    tempoEmMinutos: this.novoServico.tempoEmMinutos,
    imagemUrl: this.novoServico.imagemUrl,
    status: this.novoServico.status
  }
    this.exibirNotificacao('Criando serviço...');

  this.servicoProfissionalService.criarServico(dto).subscribe({
    next: () => {
      this.exibirNotificacao('Serviço criado com sucesso.');
      this.limparFormularioCriacao();
    },
    error: (erro) => {
      console.error('Erro ao criar serviço:', erro);
    }
  });

  
}

}

