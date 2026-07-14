import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AgendamentoprofissionalService }
  from '../../../../service/AgendamentoprofissionalService';

import { SignalrService }
  from '../../../../service/SingnalService';
import { retry, timer } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profissionalcomponent',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './profissionalcomponent.html',
  styleUrl: './profissionalcomponent.css',
})
export class Profissionalcomponent implements OnInit, OnDestroy {

  readonly agendamentos;

  novoAgendamento = {
    clienteId: 0,
    servicoId: 0,
    dataInicio: '',
    observacoes: '',
    status: 'Ativo'
  };

  agendamentoEdicao = {
    id: 0,
    statusAgendamento: '',
    observacoes: '',
    dataInicio: ''
  };

  constructor(
    public agendamentoprofissionalService:
      AgendamentoprofissionalService,

    private signalrService: SignalrService
  ) {
    this.agendamentos =
      this.agendamentoprofissionalService.agendamentos;
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.signalrService.iniciarConexao();

      this.signalrService.ouvirStatusAlterado(dados => {
        console.log('Status alterado recebido:', dados);

        this.agendamentoprofissionalService.atualizarStatusNoCache(
          dados.id,
          dados.statusAgendamento
        );
      });

      this.signalrService.ouvirNovoAgendamento(agendamento => {
        console.log('Novo agendamento recebido:', agendamento);

        this.agendamentoprofissionalService.adicionarNoCache(
          agendamento
        );
      });

      this.signalrService.ouvirDeletaragendameneto(id => {
        console.log('Agendamento deletado recebido:', id);

        this.agendamentoprofissionalService.removerDoCache(id);
      });

      this.signalrService.ouvirAgendamentoAtualizado(agendamento => {
        console.log('Agendamento atualizado recebido:', agendamento);

        this.agendamentoprofissionalService.atualizarNoCache(
          agendamento
        );
      });

      this.mostrarAgendamentos();

    } catch (erro) {
      console.error('Erro ao iniciar o SignalR:', erro);
    }
  }

  ngOnDestroy(): void {
    this.signalrService.pararConexao()
      .catch(erro => {
        console.error('Erro ao parar o SignalR:', erro);
      });
  }

  mostrarAgendamentos(): void {
    this.agendamentoprofissionalService
      .buscarAgendamentosDoProfissional()
      .subscribe({
        next: agendamentos => {
          console.log(
            'Agendamentos do profissional:',
            agendamentos
          );
        },
        error: erro => {
          console.error(
            'Erro ao buscar agendamentos:',
            erro
          );
        }
      });
  }

  criarAgendamento(): void {
    if (
      !this.novoAgendamento.clienteId ||
      !this.novoAgendamento.servicoId ||
      !this.novoAgendamento.dataInicio
    ) {
      console.error('Preencha os campos obrigatórios.');
      return;
    }

    const dto = {
      clienteId: Number(this.novoAgendamento.clienteId),
      servicoId: Number(this.novoAgendamento.servicoId),

      dataInicio: new Date(
        this.novoAgendamento.dataInicio
      ).toISOString(),

      observacoes: this.novoAgendamento.observacoes,
      status: this.novoAgendamento.status
    };

    this.agendamentoprofissionalService
      .criarAgendamento(dto)
      .subscribe({
        next: agendamento => {
          console.log(
            'Agendamento criado com sucesso:',
            agendamento
          );

          this.limparFormularioCriacao();
        },
        error: erro => {
          console.error(
            'Erro ao criar agendamento:',
            erro
          );
        }
      });
  }

  prepararEdicao(agendamento: any): void {
    this.agendamentoEdicao = {
      id: agendamento.id,
      statusAgendamento:
        agendamento.statusAgendamento ??
        agendamento.status ??
        '',

      observacoes:
        agendamento.observacoes ?? '',

      dataInicio: this.converterParaDatetimeLocal(
        agendamento.dataInicio
      )
    };
  }

  editarAgendamento(): void {
    if (!this.agendamentoEdicao.id) {
      console.error('Selecione um agendamento para editar.');
      return;
    }

    if (!this.agendamentoEdicao.dataInicio) {
      console.error('Informe a data do agendamento.');
      return;
    }

    const dto = {
      statusAgendamento:
        this.agendamentoEdicao.statusAgendamento,

      observacoes:
        this.agendamentoEdicao.observacoes,

      dataInicio: new Date(
        this.agendamentoEdicao.dataInicio
      ).toISOString()
    };

    this.agendamentoprofissionalService
      .editarAgendamento(
        this.agendamentoEdicao.id,
        dto
      )
      .subscribe({
        next: resposta => {
          console.log(
            'Agendamento editado:',
            resposta
          );

          this.limparFormularioEdicao();
        },
        error: erro => {
          console.error(
            'Erro ao editar agendamento:',
            erro
          );
        }
      });
  }

  reativarAgendamento(id: string | number): void {
    this.agendamentoprofissionalService
      .reativarAgendamento(Number(id))
      .pipe(
        retry({count: 3,
    delay: () => timer(1000)})
      )
      .subscribe({
        next: resposta => {
          console.log(
            'Agendamento reativado:',
            resposta
          );
        },
        error: erro => {
          console.error(
            'Erro ao reativar agendamento:',
            erro
          );
        }
      });
  }

  cancelarAgendamento(id: string | number): void {
    this.agendamentoprofissionalService
      .cancelarAgendamento(Number(id))
         .pipe(
        retry({count: 3,
    delay: () => timer(1000)})
      )
      .subscribe({
        next: resposta => {
          console.log(
            'Agendamento cancelado:',
            resposta
          );
        },
        error: erro => {
          console.error(
            'Erro ao cancelar agendamento:',
            erro
          );
        }
      });
  }

  deletarAgendamento(id: string | number): void {
    this.agendamentoprofissionalService
      .deletarAgendamento(Number(id))
      .subscribe({
        next: resposta => {
          console.log(
            'Agendamento deletado:',
            resposta
          );
        },
        error: erro => {
          console.error(
            'Erro ao deletar agendamento:',
            erro
          );
        }
      });
  }

  limparFormularioCriacao(): void {
    this.novoAgendamento = {
      clienteId: 0,
      servicoId: 0,
      dataInicio: '',
      observacoes: '',
      status: 'Ativo'
    };
  }

  limparFormularioEdicao(): void {
    this.agendamentoEdicao = {
      id: 0,
      statusAgendamento: '',
      observacoes: '',
      dataInicio: ''
    };
  }

  converterParaDatetimeLocal(data: string): string {
    if (!data) {
      return '';
    }

    const dataConvertida = new Date(data);
    const ajusteFuso =
      dataConvertida.getTimezoneOffset() * 60000;

    return new Date(
      dataConvertida.getTime() - ajusteFuso
    )
      .toISOString()
      .slice(0, 16);
  }
}