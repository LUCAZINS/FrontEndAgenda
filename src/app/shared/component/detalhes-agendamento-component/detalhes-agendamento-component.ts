import {
  Component,
  OnInit,
  signal,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe  } from '@angular/common';
import { NotificacaoService } from '../../../../service/NotificaçãoService';
import {
  AgendamentoprofissionalService,
  Agendamento
} from '../../../../service/AgendamentoprofissionalService';
import { SignalrService } from '../../../../service/SingnalService';
import { 
  Notificacao,
  NotificacaoAgendamentoService,
  enumCriadoPor } from '../../../../service/NotificacaoAgendamentoService';


@Component({
  selector: 'app-detalhes-agendamento',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './detalhes-agendamento-component.html',
  styleUrl: './detalhes-agendamento-component.css'
})
export class DetalhesAgendamentoComponent implements OnInit {

  agendamento = signal<Agendamento | null>(null);
  carregando = signal(true);
  erro = signal<string | null>(null);
  historicoNotificacoes = signal<Notificacao[]>([]);
  readonly enumCriadoPor = enumCriadoPor;
  carregandoTela = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalrService: SignalrService,
    private agendamentoService: AgendamentoprofissionalService,
    private notificacaoService: NotificacaoAgendamentoService,
    private cdr: ChangeDetectorRef,
    public notificacaoToastService: NotificacaoService
  ) {}

async ngOnInit(): Promise<void> {

  const id = Number(
    this.route.snapshot.paramMap.get('id')
  );

  if (!id) {
    this.notificacaoToastService.exibir(
      'Não foi possível Buscar o agendamento.',
      'erro'
    );

    this.erro.set('Agendamento inválido.');
    this.carregando.set(false);
    return;
  }


  // =====================================
  // AGENDAMENTO — STATUS
  // =====================================

  this.signalrService.ouvirStatusAlterado(dados => {

    console.log('🟡 STATUS ALTERADO:', dados);

    if (dados.id !== id) {
      return;
    }

    this.agendamento.update(atual => {

      if (!atual) {
        return atual;
      }

      return {
        ...atual,
        statusAgendamento: dados.statusAgendamento
      };
    });

    this.cdr.detectChanges();
  });


  // =====================================
  // AGENDAMENTO — ATUALIZAÇÃO COMPLETA
  // =====================================

  this.signalrService.ouvirAgendamentoAtualizado(dados => {

    console.log('🔵 AGENDAMENTO ATUALIZADO:', dados);

    if (dados.id !== id) {
      return;
    }

    this.agendamento.update(atual => {

      if (!atual) {
        return dados;
      }

      return {
        ...atual,
        ...dados,
        cliente: dados.cliente ?? atual.cliente,
        profissional: dados.profissional ?? atual.profissional,
        servico: dados.servico ?? atual.servico
      };
    });

    this.cdr.detectChanges();
  });


  // =====================================
  // NOTIFICAÇÃO
  // =====================================

  this.signalrService.ouvirNovaNotificacao(notificacao => {

    console.log('🔔 Detalhes recebeu notificação:', notificacao);

    if (notificacao.agendamentoId !== id) {
      return;
    }

    this.historicoNotificacoes.update(lista => [
      ...lista,
      notificacao
    ]);

    this.cdr.detectChanges();
  });


  // =====================================
  // CARREGAMENTO INICIAL
  // =====================================

  this.buscarAgendamento(id);
}

buscarAgendamento(id: number): void {
  this.carregando.set(true);
  this.carregandoTela.set(true);
  this.agendamentoService
    .buscarAgendamentosDoProfissional(true)
    .subscribe({
      next: agendamentos => {
        const encontrado = agendamentos.find(
          item => item.id === id
        );
        this.carregandoTela.set(false);
        this.agendamento.set(encontrado ?? null);
        this.buscarHistoricoNotificacoes(id);
        this.carregando.set(false);
      },
      error: erro => {
        console.error('Erro ao buscar agendamento:', erro);
        this.carregando.set(false);
      }
    });
}



  voltar(): void {
    this.router.navigate([
      '/Auth/Profissional/home/agendamentos'
    ]);
  }

cancelarAgendamento(id: number): void {
  this.carregandoTela.set(true);
  if (!confirm('Deseja realmente cancelar este agendamento?')) {
    return;
  }

  const motivo = prompt('Informe o motivo do cancelamento:');

  if (!motivo || !motivo.trim()) {
    this.notificacaoToastService.exibir(
      'O motivo do cancelamento é obrigatório.',
      'info'
    );
    this.carregandoTela.set(false);
    return;
  }

  this.agendamentoService
    .cancelarAgendamento(id, motivo.trim())
    .subscribe({
      next: (resposta) => {
        this.carregandoTela.set(false);;
        console.log('Cancelamento realizado:', resposta);
          this.notificacaoToastService.exibir(
            'Agendamento cancelado com sucesso!',
            'sucesso'
          );
        this.agendamento.update(atual => {
          if (!atual) {
            return atual;
          }

          return {
            ...atual,
            ...resposta,
            cliente: resposta.cliente ?? atual.cliente,
            profissional: resposta.profissional ?? atual.profissional,
            servico: resposta.servico ?? atual.servico
          };
        });

      },

      error: erro => {
        this.carregandoTela.set(false);;
        console.error('Erro ao cancelar agendamento:', erro);
        this.notificacaoToastService.exibir(
          erro?.error?.mensagem ??
          'Não foi possível cancelar o agendamento.',
          'erro'
        );      
      }
    });
}


reativarAgendamento(id: number): void {
  const motivo = prompt('Informe o motivo da reativação:');
 
  if (!motivo || !motivo.trim()) {

        this.notificacaoToastService.exibir(
        'Motivo da reativação é obrigatório.',
        'erro'
      );
    return;
  }
   this.carregandoTela.set(true);;

  this.agendamentoService
    .reativarAgendamento(id, motivo.trim())
    .subscribe({
      next: (resposta) => {
          this.notificacaoToastService.exibir(
           'Agendamento reativado com sucesso.',
          'sucesso'
        );
        console.log('Reativação realizada:', resposta);
        this.carregandoTela.set(false);;
        this.agendamento.update(atual => {
          if (!atual) {
            return atual;
          }

          return {
            ...atual,
            ...resposta,
            cliente: resposta.cliente ?? atual.cliente,
            profissional: resposta.profissional ?? atual.profissional,
            servico: resposta.servico ?? atual.servico
          };
        });

      },

      error: erro => {
        console.error('Erro ao reativar agendamento:', erro);
        this.carregandoTela.set(false);;
        this.notificacaoToastService.exibir(
          erro?.error?.mensagem ??
          'Não foi possível reativar o agendamento.',
          'erro'
        );      
      }
    });
}

confirmarAgendamento(id: number): void {
  this.carregandoTela.set(true);;
  console.log('Confirmar agendamento:', id);

  this.agendamentoService.confirmarAgendamento(id).subscribe({
    next: (agendamento) => {
      this.carregandoTela.set(false);;
      console.log('Agendamento confirmado:', agendamento);

      this.agendamento.update(atual => {
        if (!atual) {
          return atual;
        }

        return {
          ...atual,
          ...agendamento,
          cliente: agendamento.cliente ?? atual.cliente,
          profissional: agendamento.profissional ?? atual.profissional,
          servico: agendamento.servico ?? atual.servico
        };
      });
      this.carregandoTela.set(false);;
      this.notificacaoToastService.exibir(
        'Agendamento confirmado com sucesso!',
        'sucesso'
      );
    },

    error: (erro) => {
      this.carregandoTela.set(false);;
      console.error('Erro ao confirmar agendamento:', erro);

      this.notificacaoToastService.exibir(
        erro?.error?.mensagem ??
        erro?.error?.message ??
        'Não foi possível confirmar o agendamento.',
        'erro'
      );
    }
  });
}

concluirAgendamento(id: number): void {
  this.carregandoTela.set(true);;
  if (!confirm('Deseja concluir este agendamento?')) {
    return;
  }

  this.agendamentoService
    .concluirAgendamento(id)
    .subscribe({
      next: (resposta) => {
        this.carregandoTela.set(false);;
        console.log('Agendamento concluído:', resposta);

        this.agendamento.update(atual => {
          if (!atual) {
            return atual;
          }

          return {
            ...atual,
            ...resposta,
            cliente: resposta.cliente ?? atual.cliente,
            profissional: resposta.profissional ?? atual.profissional,
            servico: resposta.servico ?? atual.servico
          };
        });
        this.notificacaoToastService.exibir(
          'Agendamento concluído com sucesso!',
          'sucesso'
        );
      },

      error: erro => {
        console.error('Erro ao concluir agendamento:', erro);
        this.carregandoTela.set(false);;
        this.notificacaoToastService.exibir(
          erro?.error?.mensagem ??
          'Não foi possível concluir o agendamento.',
          'erro'
        );
      }
    });
}

editarAgendamento(id: number): void {
  console.log('Editar agendamento:', id);
}

buscarHistoricoNotificacoes(id: number): void {

  this.notificacaoService
    .buscarHistoricoAgendamento(id)
    .subscribe({

      next: notificacoes => {

        console.log(
          '📋 Histórico de notificações:',
          notificacoes
        );

        this.historicoNotificacoes.set(notificacoes);

      },

      error: erro => {

        console.error(
          'Erro ao buscar histórico do agendamento:',
          erro
        );

        this.historicoNotificacoes.set([]);
      }

    });
}




}