import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private readonly apiUrl = environment.apiUrl;

  private hubConnection?: signalR.HubConnection;

  iniciarConexao(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/agendaHub`, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR conectado.');
      })
      .catch(erro => {
        console.error('Erro ao conectar ao SignalR:', erro);
        throw erro;
      });
  }

  ouvirStatusAlterado(
    callback: (dados: {
      id: number;
      statusAgendamento: string;
    }) => void
  ): void {
    this.hubConnection?.on('StatusAlterado', callback);
  }

  ouvirNovoAgendamento(callback: (agendamento: any) => void): void {
    this.hubConnection?.on('NovoAgendamento', callback);
  }

  ouvirDeletaragendameneto(callback: (agendamento: any) => void): void {
    this.hubConnection?.on('AgendamentoRemovido', callback);
  }

  ouvirAgendamentoAtualizado(callback: (agendamento: any) => void): void {
    this.hubConnection?.on('AgendamentoAtualizado', callback);
  }

  

  pararConexao(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.resolve();
    }

    return this.hubConnection.stop();
  }
  
}