import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Notificacao } from '../../../../service/NotificacaoAgendamentoService';

@Component({
  selector: 'app-popup-notificacao',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './popup-notificacao.html',
  styleUrl: './popup-notificacao.css',
})
export class PopupNotificacao {

  aberto = signal(false);

  notificacao = signal<Notificacao | null>(null);

  abrir(notificacao: Notificacao): void {

    console.log(
      '🔔 Abrindo popup:',
      notificacao
    );

    this.notificacao.set(notificacao);
    this.aberto.set(true);

    setTimeout(() => {
      this.fechar();
    }, 5000);
  }

  fechar(): void {
    this.aberto.set(false);
  }
}