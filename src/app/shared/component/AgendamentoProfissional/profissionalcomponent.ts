import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificacaoService } from '../../../../service/NotificaçãoService';
import { ServicoProfissionalService } from '../../../../service/ServicoProfissionalService';
import { SignalrService } from '../../../../service/SingnalService';
import { AgendamentoprofissionalService } from '../../../../service/AgendamentoprofissionalService';
import { Clienteservice, ClienteBusca } from '../../../../service/clienteservice';

@Component({
  selector: 'app-profissionalcomponent',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './profissionalcomponent.html',
  styleUrl: './profissionalcomponent.css'
})
export class Profissionalcomponent implements OnInit {
  modoVisualizacao = signal<'agenda' | 'lista'>('agenda');
  dataSelecionada = signal(new Date());
  readonly carregandoAgendamentos = signal(true);

  readonly agendamentos;

  horarios = Array.from({ length: 24 }, (_, i) => i);

  modalAgendamentoAberto = signal(false);

  filtroStatus = signal('Todos');
  filtroCliente = signal<number | null>(null);
  filtroServico = signal<number | null>(null);
  filtroData = signal('');
  busca = signal('');
  ordenacao = signal<'dataAsc' | 'dataDesc'>('dataAsc');

  clienteBusca = signal('');
  clientesSugestoes = signal<{ clienteId: number; nome: string }[]>([]);
  clienteSelecionado = signal<{
    clienteId: number;
    nome: string;
  } | null>(null);

  servicoBusca = signal('');
  servicosSugestoes = signal<{ servicoId: number; nome: string }[]>([]);
  servicoSelecionado = signal<{
    servicoId: number;
    nome: string;
  } | null>(null);

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

  motivoDaModificacao = '';

  constructor(
    private router: Router,
    public servicoProfissionalService: ServicoProfissionalService,
    private clienteService: Clienteservice,
    public notificacaoService: NotificacaoService,
    public agendamentoprofissionalService: AgendamentoprofissionalService,
    private signalrService: SignalrService
  ) {
    this.agendamentos =
      this.agendamentoprofissionalService.agendamentos;
  }

  ngOnInit(): void {
    this.carregarAgendamentos();
    this.carregarServicos();
  }

  carregarAgendamentos(): void {
    this.carregandoAgendamentos.set(true);

    this.agendamentoprofissionalService
      .buscarAgendamentosDoProfissional()
      .subscribe({
        next: () => this.carregandoAgendamentos.set(false),
        error: erro => {
          console.error('Erro ao carregar agendamentos:', erro);
          this.carregandoAgendamentos.set(false);
        }
      });
  }

  dataFormatada = computed(() =>
    this.dataSelecionada().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  );

  abrirDetalhesAgendamento(id: number): void {
    this.router.navigate([
      '/Auth/Profissional/home/agendamentos/',
      id
    ]);
  }

  agendamentosDoDia = computed(() => {
    const selecionada = this.dataSelecionada();

    return this.agendamentos().filter((agendamento: any) => {
      const data = new Date(agendamento.dataInicio);

      return (
        data.getFullYear() === selecionada.getFullYear() &&
        data.getMonth() === selecionada.getMonth() &&
        data.getDate() === selecionada.getDate()
      );
    });
  });

  alterarVisualizacao(modo: 'agenda' | 'lista'): void {
    this.modoVisualizacao.set(modo);
  }

  voltarDia(): void {
    const data = new Date(this.dataSelecionada());
    data.setDate(data.getDate() - 1);
    this.dataSelecionada.set(data);
  }

  avancarDia(): void {
    const data = new Date(this.dataSelecionada());
    data.setDate(data.getDate() + 1);
    this.dataSelecionada.set(data);
  }

  irParaHoje(): void {
    this.dataSelecionada.set(new Date());
  }

  selecionarData(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.value) {
      return;
    }

    const [ano, mes, dia] = input.value.split('-').map(Number);

    this.dataSelecionada.set(new Date(ano, mes - 1, dia));
  }

  calcularTop(agendamento: any): number {
    const data = new Date(agendamento.dataInicio);
    const minutos = data.getHours() * 60 + data.getMinutes();

    return (minutos / 60) * 80;
  }

  calcularAltura(agendamento: any): number {
    const inicio = new Date(agendamento.dataInicio);
    const fim = new Date(agendamento.dataFim);
    const duracaoMinutos =
      (fim.getTime() - inicio.getTime()) / 60000;

    return (duracaoMinutos / 60) * 80;
  }

  readonly clientesFiltro = computed(() => {
    const mapa = new Map<number, string>();

    for (const agendamento of this.agendamentos()) {
      if (agendamento.clienteId && agendamento.cliente?.nome) {
        mapa.set(
          agendamento.clienteId,
          agendamento.cliente.nome
        );
      }
    }

    return Array.from(mapa.entries()).map(([id, nome]) => ({
      id,
      nome
    }));
  });

  readonly servicosFiltro = computed(() =>
    this.servicoProfissionalService.servicosProfissional()
  );

  buscarCliente(event: Event): void {
    const input = event.target as HTMLInputElement;
    const termo = input.value.trim();

    this.clienteBusca.set(termo);
    this.clienteSelecionado.set(null);
    this.novoAgendamento.clienteId = 0;

    if (termo.length < 3) {
      this.clientesSugestoes.set([]);
      return;
    }

    this.clienteService.buscarClientesPorNome(termo).subscribe({
      next: (clientes: ClienteBusca[]) => {
        const resultado = clientes
          .slice(0, 10)
          .map(cliente => ({
            clienteId: cliente.id,
            nome: cliente.nome
          }));

        this.clientesSugestoes.set(resultado);
      },
      error: erro => {
        console.error('Erro ao buscar clientes:', erro);
        this.clientesSugestoes.set([]);
      }
    });
  }

  selecionarCliente(cliente: {
    clienteId: number;
    nome: string;
  }): void {
    this.clienteSelecionado.set(cliente);
    this.clienteBusca.set(cliente.nome);
    this.novoAgendamento.clienteId = cliente.clienteId;
    this.clientesSugestoes.set([]);
  }

  carregarServicos(): void {
    this.servicoProfissionalService.mostrarServicos().subscribe({
      next: servicos => {
        console.log('Serviços do profissional:', servicos);
      },
      error: erro => {
        console.error('Erro ao buscar serviços:', erro);
      }
    });
  }

  buscarServico(event: Event): void {
    const input = event.target as HTMLInputElement;
    const termo = input.value.trim();

    this.servicoBusca.set(termo);
    this.servicoSelecionado.set(null);
    this.novoAgendamento.servicoId = 0;

    if (termo.length < 2) {
      this.servicosSugestoes.set([]);
      return;
    }

    const resultado = this.servicosFiltro()
      .filter(servico =>
        servico.nome.toLowerCase().includes(termo.toLowerCase())
      )
      .slice(0, 10)
      .map(servico => ({
        servicoId: servico.id,
        nome: servico.nome
      }));

    this.servicosSugestoes.set(resultado);
  }

  selecionarServico(servico: {
    servicoId: number;
    nome: string;
  }): void {
    this.servicoSelecionado.set(servico);
    this.servicoBusca.set(servico.nome);
    this.novoAgendamento.servicoId = servico.servicoId;
    this.servicosSugestoes.set([]);
  }

  agendamentosFiltrados = computed(() => {
    let resultado = [...this.agendamentos()];

    if (this.filtroStatus() !== 'Todos') {
      resultado = resultado.filter(
        a => a.statusAgendamento === this.filtroStatus()
      );
    }

    if (this.filtroCliente() !== null) {
      resultado = resultado.filter(
        a => a.clienteId === this.filtroCliente()
      );
    }

    if (this.filtroServico() !== null) {
      resultado = resultado.filter(
        a => a.servicoId === this.filtroServico()
      );
    }

    if (this.filtroData()) {
      resultado = resultado.filter(a => {
        const data = new Date(a.dataInicio);
        const valor = [
          data.getFullYear(),
          String(data.getMonth() + 1).padStart(2, '0'),
          String(data.getDate()).padStart(2, '0')
        ].join('-');

        return valor === this.filtroData();
      });
    }

    const termo = this.busca().trim().toLowerCase();

    if (termo) {
      resultado = resultado.filter(a => {
        const cliente = a.cliente?.nome?.toLowerCase() || '';
        const servico = a.servico?.nome?.toLowerCase() || '';
        const observacoes = a.observacoes?.toLowerCase() || '';

        return (
          cliente.includes(termo) ||
          servico.includes(termo) ||
          observacoes.includes(termo)
        );
      });
    }

    resultado.sort((a, b) => {
      const dataA = new Date(a.dataInicio).getTime();
      const dataB = new Date(b.dataInicio).getTime();

      return this.ordenacao() === 'dataAsc'
        ? dataA - dataB
        : dataB - dataA;
    });

    return resultado;
  });

  alterarOrdenacao(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;

    if (valor === 'dataAsc' || valor === 'dataDesc') {
      this.ordenacao.set(valor);
    }
  }

  criarAgendamento(): void {
    const cliente = this.clienteSelecionado();

    if (!cliente?.clienteId) {
      this.notificacaoService.exibir(
        'Selecione um cliente.',
        'erro'
      );
      return;
    }

    if (!this.novoAgendamento.servicoId) {
      this.notificacaoService.exibir(
        'Selecione um serviço.',
        'erro'
      );
      return;
    }

    if (!this.novoAgendamento.dataInicio) {
      this.notificacaoService.exibir(
        'Informe a data e o horário.',
        'erro'
      );
      return;
    }

    const dto = {
      clienteId: cliente.clienteId,
      servicoId: this.novoAgendamento.servicoId,
      dataInicio: new Date(
        this.novoAgendamento.dataInicio
      ).toISOString(),
      observacoes: this.novoAgendamento.observacoes,
      status: 'Pendente'
    };

    this.agendamentoprofissionalService
      .criarAgendamento(dto)
      .subscribe({
        next: () => {
          this.notificacaoService.exibir(
            'Agendamento criado com sucesso!',
            'sucesso'
          );

          this.fecharModalAgendamento();
          this.carregarAgendamentos();
        },
        error: erro => {
          const mensagem =
            typeof erro.error === 'string'
              ? erro.error
              : erro.error?.message ??
                erro.error?.mensagem ??
                'Não foi possível criar o agendamento.';

          this.notificacaoService.exibir(mensagem, 'erro');
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
      observacoes: agendamento.observacoes ?? '',
      dataInicio: this.converterParaDatetimeLocal(
        agendamento.dataInicio
      )
    };
  }

  editarAgendamento(): void {
    if (!this.agendamentoEdicao.id) {
      return;
    }

    if (!this.agendamentoEdicao.dataInicio) {
      return;
    }

    const dto = {
      statusAgendamento:
        this.agendamentoEdicao.statusAgendamento,
      observacoes: this.agendamentoEdicao.observacoes,
      dataInicio: new Date(
        this.agendamentoEdicao.dataInicio
      ).toISOString()
    };

    this.agendamentoprofissionalService
      .editarAgendamento(this.agendamentoEdicao.id, dto)
      .subscribe({
        next: () => {
          this.limparFormularioEdicao();
          this.carregarAgendamentos();
        },
        error: erro => {
          console.error('Erro ao editar agendamento:', erro);
        }
      });
  }

  reativarAgendamento(id: number): void {
    const motivo = this.motivoDaModificacao.trim();

    if (!motivo) {
      return;
    }

    this.agendamentoprofissionalService
      .reativarAgendamento(id, motivo)
      .subscribe({
        next: () => {
          this.motivoDaModificacao = '';
          this.carregarAgendamentos();
        },
        error: erro => {
          console.error('Erro ao reativar agendamento:', erro);
        }
      });
  }

  deletarAgendamento(id: string | number): void {
    this.agendamentoprofissionalService
      .deletarAgendamento(Number(id))
      .subscribe({
        next: () => this.carregarAgendamentos(),
        error: erro => {
          console.error('Erro ao deletar agendamento:', erro);
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

    this.clienteBusca.set('');
    this.clienteSelecionado.set(null);
    this.clientesSugestoes.set([]);

    this.servicoBusca.set('');
    this.servicoSelecionado.set(null);
    this.servicosSugestoes.set([]);
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

    const convertida = new Date(data);
    const ajuste = convertida.getTimezoneOffset() * 60000;

    return new Date(convertida.getTime() - ajuste)
      .toISOString()
      .slice(0, 16);
  }

  abrirModalAgendamento(): void {
    this.limparFormularioCriacao();
    this.modalAgendamentoAberto.set(true);

    if (!this.clienteService.clientesCarregados()) {
      this.clienteService.buscarMeusClientes().subscribe({
        next: clientes => {
          console.log('Clientes carregados:', clientes);
        },
        error: erro => {
          console.error('Erro ao carregar clientes:', erro);
        }
      });
    }
  }

  fecharModalAgendamento(): void {
    this.modalAgendamentoAberto.set(false);
    this.limparFormularioCriacao();
  }
}