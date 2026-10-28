import { Component, OnInit } from '@angular/core';
import {
  Notificacao,
  NotificacaoAgendamentoService
} from '../../../../service/NotificacaoAgendamentoService';

import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-notificacoes-component',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notificacoes-component.html',
  styleUrl: './notificacoes-component.css',
})
export class NotificacoesComponent implements OnInit {

  carregando = true;

  constructor(
    public notificacaoAgendamentoService: NotificacaoAgendamentoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  // ============================
  // NOTIFICAÇÕES
  // ============================

  carregarNotificacoes(): void {

    // Se já temos notificações no cache,
    // não precisamos fazer outra requisição.
    if (this.notificacaoAgendamentoService.notificacoes().length > 0) {

      console.log('📦 Notificações carregadas do cache.');

      this.carregando = false;
      this.cdr.detectChanges();

      return;
    }

    // Caso o cache esteja vazio, busca na API.
    this.buscarNotificacoes();
  }

  buscarNotificacoes(): void {

    this.carregando = true;

    this.notificacaoAgendamentoService
      .buscarNotificacoesProfissional()
      .subscribe({

        next: (dados) => {

          console.log('📥 Notificações carregadas da API:', dados);

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (erro) => {

          console.error(
            '❌ Erro ao buscar notificações:',
            erro
          );

          this.carregando = false;

          this.cdr.detectChanges();
        }

      });
  }

  // ============================
  // MARCAR COMO LIDA
  // ============================

  marcarComoLida(notificacao: Notificacao): void {

    if (notificacao.lidaProfissional) {
      return;
    }

    this.notificacaoAgendamentoService
      .marcarComoLidaProfissional(notificacao.id)
      .subscribe({

        next: () => {

          console.log(
            '✅ Notificação marcada como lida:',
            notificacao.id
          );

        },

        error: (erro) => {

          console.error(
            '❌ Erro ao marcar notificação como lida:',
            erro
          );

        }

      });
  }

  // ============================
  // MARCAR TODAS COMO LIDAS
  // ============================

  marcarTodasComoLidas(): void {

    this.notificacaoAgendamentoService
      .marcarTodasComoLidasProfissional()
      .subscribe({

        next: () => {

          console.log(
            '✅ Todas as notificações foram marcadas como lidas.'
          );

        },

        error: (erro) => {

          console.error(
            '❌ Erro ao marcar notificações como lidas:',
            erro
          );

        }

      });
  }

  // ============================
  // ABRIR NOTIFICAÇÃO
  // ============================

  abrirNotificacao(notificacao: Notificacao): void {

    if (!notificacao.lidaProfissional) {

      this.notificacaoAgendamentoService
        .marcarComoLidaProfissional(notificacao.id)
        .subscribe({

          next: () => {

            this.router.navigate([
              '/Auth/Profissional/home/notificacoes',
              notificacao.agendamentoId
            ]);

          },

          error: (erro) => {

            console.error(
              '❌ Erro ao marcar notificação como lida:',
              erro
            );

          }

        });

    } else {

      this.router.navigate([
        '/Auth/Profissional/home/notificacoes',
        notificacao.agendamentoId
      ]);

    }
  }
}