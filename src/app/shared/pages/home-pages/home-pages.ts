import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStatus } from '../../../auth/auth';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-pages',
  standalone: true,
  imports: [ RouterOutlet, RouterLink, CommonModule ],
  templateUrl: './home-pages.html',
  styleUrl: './home-pages.css',
})
export class HomePages implements OnInit {
  usuario: AuthStatus | null = null;
  // 🔄 Nome da variável alterado para refletir o Profissional
  nomeDoProfissional: string = 'Buscando profissional...';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarStatusUsuario();
  }

  carregarStatusUsuario(): void {
    this.http.get<AuthStatus>('http://localhost:5000/api/google/status', { withCredentials: true })
      .subscribe({
        next: (resposta) => {
          this.usuario = resposta;
          
          // 🔄 Valida se o usuário está logado e se a Role é 'Profissional'
          if (resposta && resposta.role === 'Profissional' && resposta.nome) {
            this.nomeDoProfissional = resposta.nome;
          } else {
            this.nomeDoProfissional = 'Profissional não identificado';
          }

          // 🚀 Força a atualização da tela imediatamente (sem precisar clicar)
          this.cdr.detectChanges(); 
        },
        error: (erro) => {
          console.error('Erro ao buscar status do profissional', erro);
          this.nomeDoProfissional = 'Erro ao carregar';
          this.cdr.detectChanges();
        }
      });
  }
}
