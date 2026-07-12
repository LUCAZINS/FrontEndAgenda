import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginGoogle } from './shared/component/LoginGoogle/login-google';
import { Profissionalcomponent } from "./shared/component/AgendamentoProfissional/profissionalcomponent";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginGoogle, Profissionalcomponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FrontEndAgenda');
}
