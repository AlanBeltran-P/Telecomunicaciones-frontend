import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../core/clientes/cliente.service';
import { Icono } from '../../../shared/icono/icono';

/** Lista de clientes con búsqueda por nombre, email o DNI (GET /api/clientes?busqueda=). */
@Component({
  selector: 'app-clientes',
  imports: [RouterLink, Icono],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  private readonly clientes = inject(ClienteService);

  protected readonly busqueda = signal('');
  /** Cada búsqueda nueva cancela la anterior. */
  protected readonly lista = rxResource({
    params: () => this.busqueda(),
    stream: ({ params }) => this.clientes.buscar(params),
    defaultValue: [],
  });

  protected buscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }
}
