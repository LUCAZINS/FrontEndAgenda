import { Component, OnInit, signal } from '@angular/core';
import {
  Notificacao,
  NotificacaoAgendamentoService
} from '../../../../service/NotificacaoAgendamentoService';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notificacoesdetail-component',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './NotificacoesDetailComponent.html',
  styleUrl: './NotificacoesDetailComponent.css',
})
export class NotificacaoDetailComponent implements OnInit {

  notificacao = signal<Notificacao | null>(null);

  carregando = signal(true);

  erro = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificacaoService: NotificacaoAgendamentoService
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.erro.set('Notificação não encontrada.');
      this.carregando.set(false);
      return;
    }

    this.notificacaoService
      .buscarNotificacaoPorId(id)
      .subscribe({
        next: (notificacao) => {

          this.notificacao.set(notificacao);

          this.carregando.set(false);

          // Marca como lida somente se ainda estiver não lida
          if (!notificacao.lidaProfissional) {

            this.notificacaoService
              .marcarComoLidaProfissional(id)
              .subscribe({
                error: (erro) => {
                  console.error(
                    'Erro ao marcar notificação como lida:',
                    erro
                  );
                }
              });
          }
        },

        error: (erro) => {

          console.error(
            'Erro ao buscar notificação:',
            erro
          );

          this.erro.set(
            'Não foi possível carregar a notificação.'
          );

          this.carregando.set(false);
        }
      });
  }

  voltar(): void {
    this.router.navigate([
      '/Auth/Profissional/home/notificacoes'
    ]);
  }

  abrirAgendamento(): void {

    const notificacao = this.notificacao();

    if (!notificacao) {
      return;
    }

    this.router.navigate([
      '/Auth/Profissional/home/agendamentos',
      notificacao.agendamentoId
    ]);
  }
}