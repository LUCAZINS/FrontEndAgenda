import { Injectable, signal } from '@angular/core';

export interface NotificacaoModel {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'info'; // Incluído o tipo info para o seu botão de teste
}

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private readonly _notificacoes = signal<NotificacaoModel[]>([]);
  readonly notificacoes = this._notificacoes.asReadonly();

  private filaEspera: NotificacaoModel[] = [];
  private proximoId = 0;

  exibir(mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso'): void {
    const nova = { id: this.proximoId++, mensagem, tipo };

    if (this._notificacoes().length >= 3) {
      this.filaEspera.push(nova);
    } else {
      this.adicionarEAgendarRemocao(nova);
    }
  }

  private adicionarEAgendarRemocao(notificacao: NotificacaoModel): void {
    // CORREÇÃO AQUI: Insere a nova no FINAL do array [...lista, notificacao]
    // Junto com o flex-direction do CSS, isso faz ela nascer fisicamente embaixo na tela
    this._notificacoes.update(lista => [...lista, notificacao]);

    setTimeout(() => {
      this.remover(notificacao.id);
    }, 5000);
  }

  remover(id: number): void {
    this._notificacoes.update(lista => lista.filter(n => n.id !== id));

    if (this.filaEspera.length > 0) {
      const proxima = this.filaEspera.shift();
      if (proxima) {
        this.adicionarEAgendarRemocao(proxima);
      }
    }
  }

  // CORREÇÃO DO ESC: Como a ordem mudou, a mais antiga agora fica no INÍCIO do array (posição 0)
  removerMaisAntigaComEsc(): void {
    if (this._notificacoes().length > 0) {
      const listaAtual = [...this._notificacoes()];
      const removida = listaAtual.shift(); // .shift() remove o primeiro (mais antigo)
      
      if (removida) {
        this.remover(removida.id);
      }
    }
  }
}
