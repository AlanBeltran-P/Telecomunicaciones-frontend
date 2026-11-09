import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { nombreDelCliente } from '../../../core/clientes/cliente.model';
import { ClienteService } from '../../../core/clientes/cliente.service';
import { ContratacionService } from '../../../core/contrataciones/contratacion.service';
import { InstalacionService } from '../../../core/contrataciones/instalacion.service';
import { Contar } from '../../../shared/animaciones/contar';
import { armarResumenDelEmpleado } from './resumen-empleado';

/** Inicio del empleado: clientes activos, instalaciones sin técnico y suspendidas. */
@Component({
  selector: 'app-inicio-empleado',
  imports: [DatePipe, RouterLink, Contar],
  templateUrl: './inicio-empleado.html',
  styleUrl: './inicio-empleado.css',
})
export class InicioEmpleado {
  private readonly auth = inject(AuthService);
  private readonly clientes = inject(ClienteService);
  private readonly instalaciones = inject(InstalacionService);
  private readonly contrataciones = inject(ContratacionService);

  protected readonly hoy = new Date();
  protected readonly primerNombre = computed(() => this.auth.perfil()?.nombre.split(' ')[0] ?? '');
  protected readonly nombreDelCliente = nombreDelCliente;

  protected readonly datos = rxResource({
    stream: () =>
      forkJoin({
        clientes: this.clientes.buscar(),
        pendientes: this.instalaciones.pendientes(),
        suspendidas: this.contrataciones.suspendidas(),
      }).pipe(map((datos) => ({ clientes: datos.clientes, resumen: armarResumenDelEmpleado(datos) }))),
  });
}
