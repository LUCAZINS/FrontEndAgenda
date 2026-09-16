import 
{ 
  Component, 
  OnInit, 
  ChangeDetectorRef, 
  signal, 
  computed 
} 
from '@angular/core';import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService, AuthStatus } from '../../../auth/auth';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoogleService } from '../../../../service/googleservice';
import { ProfissionalService } from '../../../../service/profissionalservice';
import { Agendamento, AgendamentoprofissionalService } from '../../../../service/AgendamentoprofissionalService';
import { SignalrService } from '../../../../service/SingnalService';
@Component({
  selector: 'app-home-pages',
  standalone: true,
  imports: [ RouterOutlet, RouterLink, CommonModule ],
  templateUrl: './home-pages.html',
  styleUrl: './home-pages.css',
})
export class HomePages implements OnInit {
  usuario: AuthStatus | null = null;
  nomeDoProfissional: string = 'Buscando profissional...';
  usuarioAutenticado: boolean = false;
  imagemUrlPerfil: string | null = null;
  imagemUrlLogo: string | null = null;
  imagemUrlBanner: string | null = null;

get agendamentosHoje() {
  return this.AgendamentoprofissionalService.agendamentosHoje;
}

   constructor(
    private http: HttpClient,
    private googleService: GoogleService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    public AgendamentoprofissionalService: AgendamentoprofissionalService,
    private ProfissionalService: ProfissionalService,
    private signalrService: SignalrService
  ) {}

   async ngOnInit(): Promise<void> {

  console.log('🏠 HOME INICIOU');

  this.carregarStatusUsuario();
  this.carregarProfissional();

  // Busca os agendamentos de hoje ao abrir a Home
  this.AgendamentoprofissionalService
    .BuscarServicosDeHoje()
    .subscribe({
      next: dados => {
        console.log('Agendamentos de hoje:', dados);
      },
      error: erro => {
        console.error('Erro ao buscar agendamentos de hoje:', erro);
      }
    });


  // ============================
  // SIGNALR
  // ============================

  try {

    await this.signalrService.iniciarConexao();

    console.log('🟢 SignalR conectado na Home');


    // NOVO AGENDAMENTO
    this.signalrService.ouvirNovoAgendamento(agendamento => {

      console.log(
        '🟢 Novo agendamento recebido na Home:',
        agendamento
      );

      this.AgendamentoprofissionalService
        .adicionarNoCache(agendamento);

    });


    // STATUS ALTERADO
    this.signalrService.ouvirStatusAlterado(dados => {

      console.log(
        '🟡 Status alterado:',
        dados
      );

      this.AgendamentoprofissionalService
        .atualizarStatusNoCache(
          dados.id,
          dados.statusAgendamento
        );

    });


    // AGENDAMENTO DELETADO
    this.signalrService.ouvirDeletaragendameneto(id => {

      console.log(
        '🔴 Agendamento deletado:',
        id
      );

      this.AgendamentoprofissionalService
        .removerDoCache(id);

    });


    // AGENDAMENTO ATUALIZADO
    this.signalrService.ouvirAgendamentoAtualizado(agendamento => {

      console.log(
        '🔵 Agendamento atualizado:',
        agendamento
      );

      this.AgendamentoprofissionalService
        .atualizarNoCache(agendamento);

    });


  } catch (erro) {

    console.error(
      '❌ Erro ao iniciar SignalR na Home:',
      erro
    );

  }

}

    buscarAgendamentosDeHoje(): void {

    this.AgendamentoprofissionalService
      .BuscarServicosDeHoje()
      .subscribe({

        next: (agendamentos) => {

          console.log(
            'Agendamentos de hoje no componente:',
            agendamentos
          );

        },

        error: (erro) => {

          console.error(
            'Erro ao buscar agendamentos de hoje:',
            erro
          );

        }

      });
  }

  carregarProfissional(): void {
  this.ProfissionalService.buscarProfissional().subscribe({
    next: (profissional) => {
      this.nomeDoProfissional = profissional.nome;
      this.imagemUrlPerfil = profissional.imagemUrlPerfil;
      this.imagemUrlLogo = profissional.imagemUrlLogo;
      this.cdr.detectChanges();
    },
    error: (erro) => {
      console.error('Erro ao buscar profissional:', erro);
      this.imagemUrlPerfil = null;

      this.cdr.detectChanges();
    }
  });
}

  // ✂️ MÉTODO ADICIONADO: Extrai apenas a primeira palavra do nome
  obterPrimeiroNome(nomeCompleto: string): string {
    if (!nomeCompleto || nomeCompleto === 'Buscando profissional...') {
      return '...';
    }
    
    // .trim() remove espaços extras nas pontas
    // .split(' ') corta o nome nos espaços e o [0] pega a primeira palavra
    return nomeCompleto.trim().split(' ')[0];
  }

      carregarStatusUsuario(): void {
      this.googleService.carregarStatusUsuario().subscribe({
        next: (resposta) => {
          this.usuario = resposta;

          if (resposta && resposta.role === 'Profissional' && resposta.nome) {
            this.nomeDoProfissional = resposta.nome;
          } else {
            this.nomeDoProfissional = 'Profissional não identificado';
          }

          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao buscar status do profissional', erro);
          this.nomeDoProfissional = 'Erro ao carregar';
          this.cdr.detectChanges();
        }
      });
    }

mostrarBarraAgendamentos(): boolean {
  console.log('URL atual:', this.router.url);

  return this.router.url.includes('/Auth/Profissional/home') &&
         !this.router.url.includes('/Auth/Profissional/servicos') &&
         !this.router.url.includes('/agendamentos');
}
  logout(): void {

    this.authService.logout()
      .subscribe({
        next: () => {
          this.usuarioAutenticado = false;
          this.router.navigate(['/Auth/login/Profissional'])
        },

        error: erro => {

          console.error(
            'Erro ao realizar logout:',
            erro
          );

        }
      });

  }


}
