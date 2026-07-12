import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginGoogle } from './shared/components/login-google/login-google';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginGoogle],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FrontEndAgenda');
}
