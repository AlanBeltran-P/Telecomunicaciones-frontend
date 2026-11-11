import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CargaDePagina } from './shared/carga-de-pagina/carga-de-pagina';
import { Toasts } from './shared/toast/toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toasts, CargaDePagina],
  templateUrl: './app.html',
})
export class App {}
