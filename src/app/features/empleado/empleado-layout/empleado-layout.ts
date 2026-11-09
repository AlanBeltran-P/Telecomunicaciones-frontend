import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Cliente } from '../../../core/clientes/cliente.model';
import { ClienteFormulario } from '../cliente-formulario/cliente-formulario';

/** Barra superior del empleado ("+ Nuevo cliente") arriba de cada pantalla del área. */
@Component({
  selector: 'app-empleado-layout',
  imports: [RouterOutlet, ClienteFormulario],
  template: `
    <div class="barra-superior">
      <button type="button" class="boton boton--primario" (click)="creandoCliente.set(true)">
        + Nuevo cliente
      </button>
    </div>

    <router-outlet />

    <app-cliente-formulario
      [abierto]="creandoCliente()"
      (guardado)="irALaFicha($event)"
      (cerrar)="creandoCliente.set(false)"
    />
  `,
  // Mismo espaciado que .contenido, que es donde se dibuja
  host: { style: 'display: grid; gap: var(--espacio-6); align-content: start' },
})
export class EmpleadoLayout {
  private readonly router = inject(Router);
  protected readonly creandoCliente = signal(false);

  protected irALaFicha(cliente: Cliente): void {
    this.creandoCliente.set(false);
    void this.router.navigate(['/empleado/clientes', cliente.id]);
  }
}
