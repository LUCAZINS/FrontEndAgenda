import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

export interface Profissional {
  id: number;
  estabelecimentoId: number;

  nome: string;
  email: string;
  telefone: string;
  especialidade: string;

  horaAbertura: string;
  horaFechamento: string;

  imagemUrlPerfil: string | null;
  imagemUrlLogo: string | null;
  imagemUrlBanner: string | null;

  instagram: string | null;
  facebook: string | null;
  twitter: string | null;

  endereço: string | null;

  linkInstagram: string | null;
  linkFacebook: string | null;
  linkTwitter: string | null;
  linkEndereço: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarProfissional(): Observable<Profissional> {
    return this.http.get<Profissional>(
      `${this.apiUrl}/api/Profissionais/profissional/me`,
      { withCredentials: true }
    );
  }

  editarProfissional(dados: any) {

    const formData = new FormData();

    formData.append('Nome', dados.nome ?? '');
    formData.append('Email', dados.email ?? '');
    formData.append('Telefone', dados.telefone ?? '');
    formData.append('Especialidade', dados.especialidade ?? '');

    formData.append('HoraAbertura', dados.horaAbertura ?? '');
    formData.append('HoraFechamento', dados.horaFechamento ?? '');

    formData.append('Instagram', dados.instagram ?? '');
    formData.append('Facebook', dados.facebook ?? '');
    formData.append('Twitter', dados.twitter ?? '');

    formData.append('Endereço', dados.endereço ?? '');

    formData.append('LinkInstagram', dados.linkInstagram ?? '');
    formData.append('LinkFacebook', dados.linkFacebook ?? '');
    formData.append('LinkTwitter', dados.linkTwitter ?? '');
    formData.append('LinkEndereço', dados.linkEndereço ?? '');

    if (dados.foto) {
      formData.append('Foto', dados.foto);
    }

    if (dados.banner) {
      formData.append('Banner', dados.banner);
    }

    if (dados.logo) {
      formData.append('Logo', dados.logo);
    }

    return this.http.put(
      `${this.apiUrl}/api/Profissionais/profissional/me`,
      formData,
      {
        withCredentials: true
      }
    );
  }
}