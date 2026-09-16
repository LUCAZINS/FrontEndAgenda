import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfissionalService } from '../../../../service/profissionalservice';

@Component({
  selector: 'app-perfil-prof',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-prof-component.html',
  styleUrl: './perfil-prof-component.css'
})
export class PerfilProfComponent implements OnInit {

  profissional: any = null;
  carregando = true;
  erro = '';
  editando = false;
  salvando = false;
  erroEdicao = '';

  formulario = {
  nome: '',
  email: '',
  telefone: '',
  especialidade: '',

  horaAbertura: '',
  horaFechamento: '',

  instagram: '',
  facebook: '',
  twitter: '',

  endereco: '',

  linkInstagram: '',
  linkFacebook: '',
  linkTwitter: '',
  linkEndereco: ''
};

fotoSelecionada: File | null = null;
bannerSelecionado: File | null = null;
logoSelecionado: File | null = null;

previewFoto: string | null = null;
previewBanner: string | null = null;
previewLogo: string | null = null;

  constructor(
    private profissionalService: ProfissionalService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPerfil();
  }

  carregarPerfil(): void {
    this.carregando = true;
    this.erro = '';

    this.profissionalService.buscarProfissional().subscribe({
      next: (dados) => {
        console.log('Profissional:', dados);

        this.profissional = dados;
        this.carregando = false;
        this.changeDetectorRef.detectChanges();
      },

      error: (erro) => {
        console.error('Erro ao carregar perfil:', erro);

        this.erro = 'Não foi possível carregar o perfil.';
        this.carregando = false;
      }
    });
  }

abrirEdicao(): void {

  this.formulario = {
    nome: this.profissional.nome ?? '',
    email: this.profissional.email ?? '',
    telefone: this.profissional.telefone ?? '',
    especialidade: this.profissional.especialidade ?? '',

    horaAbertura: this.profissional.horaAbertura ?? '',
    horaFechamento: this.profissional.horaFechamento ?? '',

    instagram: this.profissional.instagram ?? '',
    facebook: this.profissional.facebook ?? '',
    twitter: this.profissional.twitter ?? '',

    endereco: this.profissional.endereco ?? '',

    linkInstagram: this.profissional.linkInstagram ?? '',
    linkFacebook: this.profissional.linkFacebook ?? '',
    linkTwitter: this.profissional.linkTwitter ?? '',
    linkEndereco: this.profissional.linkEndereco ?? ''
  };

  this.fotoSelecionada = null;
  this.bannerSelecionado = null;
  this.logoSelecionado = null;

  this.previewFoto = null;
  this.previewBanner = null;
  this.previewLogo = null;

  this.erroEdicao = '';
  this.editando = true;
}


salvarPerfil(): void {

  this.salvando = true;
  this.erroEdicao = '';
  this.carregando = true;

  const dados = {
    nome: this.formulario.nome,
    email: this.formulario.email,
    telefone: this.formulario.telefone,
    especialidade: this.formulario.especialidade,

    horaAbertura: this.formulario.horaAbertura,
    horaFechamento: this.formulario.horaFechamento,

    instagram: this.formulario.instagram,
    facebook: this.formulario.facebook,
    twitter: this.formulario.twitter,

    endereco: this.formulario.endereco,

    linkInstagram: this.formulario.linkInstagram,
    linkFacebook: this.formulario.linkFacebook,
    linkTwitter: this.formulario.linkTwitter,
    linkEndereco: this.formulario.linkEndereco,

    foto: this.fotoSelecionada,
    banner: this.bannerSelecionado,
    logo: this.logoSelecionado
  };

  this.profissionalService.editarProfissional(dados)
    .subscribe({

      next: (dadosAtualizados) => {

        console.log('Perfil atualizado:', dadosAtualizados);

        this.profissional = {
          ...this.profissional,
          ...dadosAtualizados
        };

        this.salvando = false;
        this.editando = false;
        this.carregando = false;

        this.fotoSelecionada = null;
        this.bannerSelecionado = null;
        this.logoSelecionado = null;

        this.previewFoto = null;
        this.previewBanner = null;
        this.previewLogo = null;

        this.changeDetectorRef.detectChanges();
      },

      error: (erro) => {

        console.error('Erro ao editar perfil:', erro);

        this.erroEdicao =
          erro.error?.message ||
          'Não foi possível salvar as alterações.';

        this.salvando = false;
        this.carregando = false;

        this.changeDetectorRef.detectChanges();
      }

    });
}


fecharEdicao(): void {

  this.editando = false;

  this.fotoSelecionada = null;
  this.bannerSelecionado = null;
  this.logoSelecionado = null;

  this.previewFoto = null;
  this.previewBanner = null;
  this.previewLogo = null;

  this.erroEdicao = '';
}

selecionarFoto(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0)
    return;

  const arquivo = input.files[0];

  this.fotoSelecionada = arquivo;

  this.previewFoto = URL.createObjectURL(arquivo);
}

selecionarLogo(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0)
    return;

  const arquivo = input.files[0];

  this.logoSelecionado = arquivo;

  this.previewLogo = URL.createObjectURL(arquivo);
}

selecionarBanner(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0)
    return;

  const arquivo = input.files[0];

  this.bannerSelecionado = arquivo;

  this.previewBanner = URL.createObjectURL(arquivo);
}

}