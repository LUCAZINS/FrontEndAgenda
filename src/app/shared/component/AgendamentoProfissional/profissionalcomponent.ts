import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { retry, timer } from 'rxjs';

import {
AgendamentoprofissionalService
} from '../../../../service/AgendamentoprofissionalService';

import {
SignalrService
} from '../../../../service/SingnalService';

import {
Clienteservice,
ClienteBusca
} from '../../../../service/clienteservice';

@Component({
selector: 'app-profissionalcomponent',
standalone: true,
imports: [
FormsModule,
DatePipe
],
templateUrl: './profissionalcomponent.html',
styleUrl: './profissionalcomponent.css',
})
export class Profissionalcomponent implements OnInit {

modoVisualizacao = signal<'agenda' | 'lista'>('agenda');

dataSelecionada = signal(new Date());

readonly agendamentos;

horarios = Array.from(
{ length: 24 },
(_, i) => i
);

modalAgendamentoAberto = signal(false);

// =========================
// FILTROS
// =========================

filtroStatus = signal<string>('Todos');

filtroCliente = signal<number | null>(null);

filtroServico = signal<number | null>(null);

filtroData = signal<string>('');

busca = signal<string>('');

ordenacao =
signal<'dataAsc' | 'dataDesc'>('dataAsc');

// =========================
// CLIENTE
// =========================

clienteBusca = signal('');

clientesSugestoes =
signal<{ clienteId: number; nome: string }[]>([]);

clienteSelecionado =
signal<{
clienteId: number;
nome: string;
} | null>(null);

// =========================
// SERVIÇO
// =========================

servicoBusca = signal('');

servicosSugestoes =
signal<{
servicoId: number;
nome: string;
}[]>([]);

servicoSelecionado =
signal<{
servicoId: number;
nome: string;
} | null>(null);




readonly carregandoAgendamentos = signal(true);

novoAgendamento = {


clienteId: 0,

servicoId: 0,

dataInicio: '',

observacoes: '',

status: 'Ativo'


};

// =========================
// EDIÇÃO
// =========================

agendamentoEdicao = {


id: 0,

statusAgendamento: '',

observacoes: '',

dataInicio: ''

};

constructor(


private clienteService: Clienteservice,

public agendamentoprofissionalService:
  AgendamentoprofissionalService,

private signalrService: SignalrService


) {


this.agendamentos =
  this.agendamentoprofissionalService
    .agendamentos;


}

async ngOnInit(): Promise<void> {

this.carregarAgendamentos();
this.mostrarAgendamentos();


}

carregarAgendamentos(): void {
  this.carregandoAgendamentos.set(true);

  this.agendamentoprofissionalService.buscarAgendamentosDoProfissional()
    .subscribe({
      next: () => {
        this.carregandoAgendamentos.set(false);
      },
      error: () => {
        this.carregandoAgendamentos.set(false);
      }
    });
}

// =========================
// DATA FORMATADA
// =========================

dataFormatada = computed(() => {
return this.dataSelecionada()
  .toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  );
});

// =========================
// AGENDAMENTOS DO DIA
// =========================

agendamentosDoDia = computed(() => {

const dataSelecionada =
  this.dataSelecionada();

return this.agendamentos().filter(
  agendamento => {

    const data =
      new Date(
        agendamento.dataInicio
      );

    return (

      data.getFullYear() ===
      dataSelecionada.getFullYear()

      &&

      data.getMonth() ===
      dataSelecionada.getMonth()

      &&

      data.getDate() ===
      dataSelecionada.getDate()

    );

  }
);

});

// =========================
// ALTERAR VISUALIZAÇÃO
// =========================

alterarVisualizacao(
modo: 'agenda' | 'lista'
): void {

this.modoVisualizacao.set(modo);

}

// =========================
// NAVEGAÇÃO DE DATA
// =========================

voltarDia(): void {


const data =
  new Date(
    this.dataSelecionada()
  );

data.setDate(
  data.getDate() - 1
);

this.dataSelecionada.set(data);


}

avancarDia(): void {


const data =
  new Date(
    this.dataSelecionada()
  );

data.setDate(
  data.getDate() + 1
);

this.dataSelecionada.set(data);


}

irParaHoje(): void {


this.dataSelecionada.set(
  new Date()
);


}

selecionarData(event: Event): void {


const input =
  event.target as HTMLInputElement;

if (!input.value) {
  return;
}

const [
  ano,
  mes,
  dia
] =
  input.value
    .split('-')
    .map(Number);

this.dataSelecionada.set(
  new Date(
    ano,
    mes - 1,
    dia
  )
);


}

// =========================
// POSIÇÃO DOS AGENDAMENTOS
// =========================

calcularTop(
agendamento: any
): number {


const dataInicio =
  new Date(
    agendamento.dataInicio
  );

const hora =
  dataInicio.getHours();

const minutos =
  dataInicio.getMinutes();

const minutosDesdeInicioDoDia =
  (hora * 60) + minutos;

const pixelsPorHora = 80;

return (
  minutosDesdeInicioDoDia / 60
) * pixelsPorHora;


}

calcularAltura(
agendamento: any
): number {


const inicio =
  new Date(
    agendamento.dataInicio
  );

const fim =
  new Date(
    agendamento.dataFim
  );

const duracaoMinutos =
  (
    fim.getTime() -
    inicio.getTime()
  ) / 60000;

const pixelsPorHora = 80;

return (
  duracaoMinutos / 60
) * pixelsPorHora;


}

// =========================
// BUSCAR AGENDAMENTOS
// =========================

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

// =========================
// FILTRO DE CLIENTES
// =========================

readonly clientesFiltro = computed(() => {


const mapa =
  new Map<number, string>();

for (
  const agendamento of this.agendamentos()
) {

  if (
    agendamento.clienteId &&
    agendamento.cliente?.nome
  ) {

    mapa.set(
      agendamento.clienteId,
      agendamento.cliente.nome
    );

  }

}

return Array
  .from(mapa.entries())
  .map(
    ([id, nome]) => ({
      id,
      nome
    })
  );


});

// =========================
// FILTRO DE SERVIÇOS
// =========================

readonly servicosFiltro = computed(() => {


const mapa =
  new Map<number, string>();

for (
  const agendamento of this.agendamentos()
) {

  if (
    agendamento.servicoId &&
    agendamento.servico?.nome
  ) {

    mapa.set(
      agendamento.servicoId,
      agendamento.servico.nome
    );

  }

}

return Array
  .from(mapa.entries())
  .map(
    ([id, nome]) => ({
      id,
      nome
    })
  );


});

// =========================
// AUTOCOMPLETE CLIENTE
// =========================

buscarCliente(event: Event): void {

const input =
event.target as HTMLInputElement;

const termo =
input.value.trim();

this.clienteBusca.set(termo);

this.clienteSelecionado.set(null);

this.novoAgendamento.clienteId = 0;

if (termo.length < 2) {

this.clientesSugestoes.set([]);

return;


}

const clientes =
this.clienteService.clientes();

console.log(
'Clientes disponíveis para busca:',
clientes
);

const resultado =
clientes
.filter(cliente =>
cliente.nome
.toLowerCase()
.includes(
termo.toLowerCase()
)
)
.slice(0, 10);

console.log(
'Clientes encontrados:',
resultado
);

this.clientesSugestoes.set(
resultado
);
}


selecionarCliente(
cliente: ClienteBusca
): void {


this.clienteSelecionado.set(
  cliente
);

this.clienteBusca.set(
  cliente.nome
);

this.novoAgendamento.clienteId =
  cliente.clienteId;

this.clientesSugestoes.set([]);


}

// =========================
// AUTOCOMPLETE SERVIÇO
// =========================

buscarServico(
event: Event
): void {


const input =
  event.target as HTMLInputElement;

const termo =
  input.value.trim();

this.servicoBusca.set(
  termo
);

this.servicoSelecionado.set(
  null
);

this.novoAgendamento.servicoId =
  0;

if (termo.length < 2) {

  this.servicosSugestoes.set([]);

  return;

}

const resultado =
  this.servicosFiltro()
    .filter(servico =>
      servico.nome
        .toLowerCase()
        .includes(
          termo.toLowerCase()
        )
    )
    .slice(0, 10)
    .map(servico => ({
      servicoId: servico.id,
      nome: servico.nome
    }));

this.servicosSugestoes.set(
  resultado
);


}

selecionarServico(
servico: {
servicoId: number;
nome: string;
}
): void {


this.servicoSelecionado.set(
  servico
);

this.servicoBusca.set(
  servico.nome
);

this.novoAgendamento.servicoId =
  servico.servicoId;

this.servicosSugestoes.set([]);


}

// =========================
// AGENDAMENTOS FILTRADOS
// =========================

agendamentosFiltrados = computed(() => {


let resultado =
  [...this.agendamentos()];


// STATUS

if (
  this.filtroStatus() !== 'Todos'
) {

  resultado =
    resultado.filter(
      a =>
        a.statusAgendamento ===
        this.filtroStatus()
    );

}


// CLIENTE

if (
  this.filtroCliente() !== null
) {

  resultado =
    resultado.filter(
      a =>
        a.clienteId ===
        this.filtroCliente()
    );

}


// SERVIÇO

if (
  this.filtroServico() !== null
) {

  resultado =
    resultado.filter(
      a =>
        a.servicoId ===
        this.filtroServico()
    );

}


// DATA

if (this.filtroData()) {

  resultado =
    resultado.filter(a => {

      const data =
        new Date(
          a.dataInicio
        );

      const ano =
        data.getFullYear();

      const mes =
        String(
          data.getMonth() + 1
        ).padStart(2, '0');

      const dia =
        String(
          data.getDate()
        ).padStart(2, '0');

      return (
        `${ano}-${mes}-${dia}`
        ===
        this.filtroData()
      );

    });

}


// BUSCA

const termo =
  this.busca()
    .trim()
    .toLowerCase();

if (termo) {

  resultado =
    resultado.filter(a => {

      const cliente =
        a.cliente?.nome
          ?.toLowerCase() || '';

      const servico =
        a.servico?.nome
          ?.toLowerCase() || '';

      const observacoes =
        a.observacoes
          ?.toLowerCase() || '';

      return (

        cliente.includes(termo)

        ||

        servico.includes(termo)

        ||

        observacoes.includes(termo)

      );

    });

}


// ORDENAÇÃO

resultado.sort((a, b) => {

  const dataA =
    new Date(
      a.dataInicio
    ).getTime();

  const dataB =
    new Date(
      b.dataInicio
    ).getTime();

  return (
    this.ordenacao() === 'dataAsc'
      ? dataA - dataB
      : dataB - dataA
  );

});


return resultado;


});

// =========================
// ALTERAR ORDENAÇÃO
// =========================

alterarOrdenacao(
event: Event
): void {


const valor =
  (event.target as HTMLSelectElement)
    .value;

if (
  valor === 'dataAsc' ||
  valor === 'dataDesc'
) {

  this.ordenacao.set(
    valor
  );

}


}

// =========================
// CRIAR AGENDAMENTO
// =========================

criarAgendamento(): void {


if (!this.clienteSelecionado()) {

  console.log(
    'Selecione um cliente.'
  );

  return;

}

if (
  !this.novoAgendamento.servicoId
) {

  console.log(
    'Selecione um serviço.'
  );

  return;

}

if (
  !this.novoAgendamento.dataInicio
) {

  console.log(
    'Informe a data e horário.'
  );

  return;

}


const dto = {

  clienteId:
    Number(
      this.novoAgendamento.clienteId
    ),

  servicoId:
    Number(
      this.novoAgendamento.servicoId
    ),

  dataInicio:
    new Date(
      this.novoAgendamento.dataInicio
    ).toISOString(),

  observacoes:
    this.novoAgendamento.observacoes,

  status:
    this.novoAgendamento.status

};


this.agendamentoprofissionalService
  .criarAgendamento(dto)
  .subscribe({

    next: agendamento => {

      console.log(
        'Agendamento criado com sucesso:',
        agendamento
      );

      this.fecharModalAgendamento();

    },

    error: erro => {

      console.error(
        'Erro ao criar agendamento:',
        erro
      );

    }

  });


}

// =========================
// EDIÇÃO
// =========================

prepararEdicao(
agendamento: any
): void {


this.agendamentoEdicao = {

  id:
    agendamento.id,

  statusAgendamento:
    agendamento.statusAgendamento ??
    agendamento.status ??
    '',

  observacoes:
    agendamento.observacoes ??
    '',

  dataInicio:
    this.converterParaDatetimeLocal(
      agendamento.dataInicio
    )

};


}

editarAgendamento(): void {


if (
  !this.agendamentoEdicao.id
) {

  console.error(
    'Selecione um agendamento para editar.'
  );

  return;

}


if (
  !this.agendamentoEdicao.dataInicio
) {

  console.error(
    'Informe a data do agendamento.'
  );

  return;

}


const dto = {

  statusAgendamento:
    this.agendamentoEdicao
      .statusAgendamento,

  observacoes:
    this.agendamentoEdicao
      .observacoes,

  dataInicio:
    new Date(
      this.agendamentoEdicao
        .dataInicio
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

// =========================
// REATIVAR
// =========================

reativarAgendamento(
id: string | number
): void {


this.agendamentoprofissionalService
  .reativarAgendamento(
    Number(id)
  )
  .pipe(
    retry({
      count: 3,
      delay: () =>
        timer(1000)
    })
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

// =========================
// CANCELAR
// =========================

cancelarAgendamento(
id: string | number
): void {


this.agendamentoprofissionalService
  .cancelarAgendamento(
    Number(id)
  )
  .pipe(
    retry({
      count: 3,
      delay: () =>
        timer(1000)
    })
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

// =========================
// DELETAR
// =========================

deletarAgendamento(
id: string | number
): void {


this.agendamentoprofissionalService
  .deletarAgendamento(
    Number(id)
  )
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

// =========================
// LIMPAR CRIAÇÃO
// =========================

limparFormularioCriacao(): void {


this.novoAgendamento = {

  clienteId: 0,

  servicoId: 0,

  dataInicio: '',

  observacoes: '',

  status: 'Ativo'

};


this.clienteBusca.set('');

this.clienteSelecionado.set(
  null
);

this.clientesSugestoes.set([]);


this.servicoBusca.set('');

this.servicoSelecionado.set(
  null
);

this.servicosSugestoes.set([]);


}

// =========================
// LIMPAR EDIÇÃO
// =========================

limparFormularioEdicao(): void {


this.agendamentoEdicao = {

  id: 0,

  statusAgendamento: '',

  observacoes: '',

  dataInicio: ''

};


}

// =========================
// DATETIME LOCAL
// =========================

converterParaDatetimeLocal(
data: string
): string {


if (!data) {
  return '';
}

const dataConvertida =
  new Date(data);

const ajusteFuso =
  dataConvertida
    .getTimezoneOffset() * 60000;

return new Date(
  dataConvertida.getTime() -
  ajusteFuso
)
  .toISOString()
  .slice(0, 16);


}

// =========================
// ABRIR MODAL
// =========================

abrirModalAgendamento(): void {

this.limparFormularioCriacao();

this.clienteBusca.set('');
this.clienteSelecionado.set(null);
this.clientesSugestoes.set([]);

this.modalAgendamentoAberto.set(true);

if (
!this.clienteService.clientesCarregados()
) {


this.clienteService
  .buscarMeusClientes()
  .subscribe({

    next: clientes => {

      console.log(
        'Clientes carregados:',
        clientes
      );

    },

    error: erro => {

      console.error(
        'Erro ao carregar clientes:',
        erro
      );

    }

  });
}

}


// =========================
// FECHAR MODAL
// =========================

fecharModalAgendamento(): void {

this.modalAgendamentoAberto.set(
  false
);

this.limparFormularioCriacao();


}

}
