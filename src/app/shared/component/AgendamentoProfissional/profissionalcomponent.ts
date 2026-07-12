import { Component } from '@angular/core';
import { AgendamentoprofissionalService } from '../../../../service/AgendamentoprofissionalService';

@Component({
  selector: 'app-profissionalcomponent',
  imports: [],
  templateUrl: './profissionalcomponent.html',
  styleUrl: './profissionalcomponent.css',
})
export class Profissionalcomponent {
  constructor(
    private AgendamentoprofissionalService: AgendamentoprofissionalService
  ) {}

  mostrarAgendamentos() {
    this.AgendamentoprofissionalService.buscarAgendamentosDoProfissional().subscribe(
      (agendamentos) => {
        console.log('Agendamentos do profissional:', agendamentos);
      },
      (error) => {
        console.error('Erro ao buscar agendamentos:', error);
      }
    );
  }

  CriarAgendamento() {
    this.AgendamentoprofissionalService.criarAgendamento({
    "clienteId": 1,
    "profissionalId": 1,
    "servicoId": 1,
    "dataInicio": "2026-07-14T21:41:24.678Z",
    "observacoes": "string",
    "status": "Está Ok"
  }).subscribe(
    (agendamento) => {
      console.log('Agendamento criado com sucesso:', agendamento);
    },
    (error) => {
      console.error('Erro ao criar agendamento:', error);
    }
  );
}
}
