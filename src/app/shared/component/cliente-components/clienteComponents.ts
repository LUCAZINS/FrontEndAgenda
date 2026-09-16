import { Component, OnInit, signal, computed } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';

import { Clienteservice } from '../../../../service/clienteservice';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cliente-components',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    FormsModule
  ],
  templateUrl: './cliente-components.html',
  styleUrl: './cliente-components.css'
})
export class ClienteComponents implements OnInit {

  filtroNome = signal('');

  clientes = signal<any[]>([]);

  clienteSelecionado = signal<any | null>(null);

  carregando = signal(false);

  erro = signal('');

  constructor(
    private clienteService: Clienteservice
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

    clientesFiltrados = computed(() => {

      const busca = this.filtroNome()
        .trim()
        .toLowerCase();

      if (!busca) {
        return this.clientes();
      }

      return this.clientes().filter(cliente =>
        cliente.nome?.toLowerCase().includes(busca)
      );

    });

    
  carregarClientes(): void {

    this.carregando.set(true);
    this.erro.set('');

    this.clienteService.buscarMeusClientes().subscribe({

      next: (res: any[]) => {

        this.clientes.set(res);

        this.carregando.set(false);

      },

      error: (err) => {

        console.error('Erro ao buscar clientes:', err);

        this.erro.set(
          'Não foi possível carregar os clientes.'
        );

        this.carregando.set(false);

      }

    });

  }


  selecionarCliente(cliente: any): void {

    // Mostra imediatamente o cliente selecionado
    this.clienteSelecionado.set(cliente);

    this.clienteService.buscarMeusClientesDetail().subscribe({

      next: (res: any[]) => {

        const clienteDetalhado = res.find(
          c => c.clienteId === cliente.clienteId
        );

        if (clienteDetalhado) {

          this.clienteSelecionado.set(
            clienteDetalhado
          );

        }

      },

      error: (err) => {

        console.error(
          'Erro ao buscar detalhes do cliente:',
          err
        );

      }

    });

  }


  voltarClientes(): void {

    this.clienteSelecionado.set(null);

  }


  obterClasseAgendamento(agendamento: any): string {

    if (agendamento.status) {

      const status = agendamento.status.toLowerCase();

      if (status === 'cancelado') {
        return 'status-cancelado';
      }

      if (
        status === 'concluido' ||
        status === 'concluído'
      ) {
        return 'status-concluido';
      }

    }

    const dataAgendamento =
      new Date(agendamento.data);

    const agora = new Date();

    if (dataAgendamento >= agora) {
      return 'status-futuro';
    }

    return 'status-passado';

  }


  obterStatusAgendamento(agendamento: any): string {

    if (agendamento.status) {

      const status =
        agendamento.status.toLowerCase();

      if (status === 'cancelado') {
        return 'Cancelado';
      }

      if (
        status === 'concluido' ||
        status === 'concluído'
      ) {
        return 'Concluído';
      }

    }

    const dataAgendamento =
      new Date(agendamento.data);

    const agora = new Date();

    if (dataAgendamento >= agora) {
      return 'Futuro';
    }

    return 'Passado';

  }

}

