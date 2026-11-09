import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ContratacionService } from '../../../core/contrataciones/contratacion.service';
import { DebitoService } from '../../../core/facturacion/debito.service';
import { FacturaService } from '../../../core/facturacion/factura.service';
import { Contar } from '../../../shared/animaciones/contar';
import { Icono } from '../../../shared/icono/icono';
import { PasosDeInstalacion } from '../pasos-de-instalacion';
import { armarResumen } from './resumen';

/** Resumen del cliente: números clave, lo que requiere atención y la instalación en curso. */
@Component({
  selector: 'app-inicio',
  imports: [CurrencyPipe, DatePipe, RouterLink, Contar, Icono, PasosDeInstalacion],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  private readonly auth = inject(AuthService);
  private readonly contrataciones = inject(ContratacionService);
  private readonly facturas = inject(FacturaService);
  private readonly debito = inject(DebitoService);

  protected readonly hoy = new Date();
  protected readonly primerNombre = computed(() => this.auth.perfil()?.nombre.split(' ')[0] ?? '');

  protected readonly resumen = rxResource({
    params: () => this.contrataciones.cambios(),
    stream: () =>
      forkJoin({
        contrataciones: this.contrataciones.misContrataciones(),
        facturas: this.facturas.mias(),
        debito: this.debito.consultar(),
      }).pipe(map(armarResumen)),
  });
}
