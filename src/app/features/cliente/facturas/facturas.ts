import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Factura, INSIGNIA_DE_FACTURA } from '../../../core/facturacion/factura.model';
import { FacturaService } from '../../../core/facturacion/factura.service';
import { nombreDelMedio } from '../../../core/facturacion/medio-de-pago';
import { Icono } from '../../../shared/icono/icono';
import { PagarFactura } from './pagar-factura';

/** Facturas del cliente (GET /api/facturas/mias), con pago desde la tabla. */
@Component({
  selector: 'app-facturas',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, Icono, PagarFactura],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css',
})
export class Facturas {
  private readonly facturaService = inject(FacturaService);

  protected readonly facturas = rxResource({
    stream: () => this.facturaService.mias(),
    defaultValue: [],
  });
  /** La que se está pagando; null con el modal cerrado. */
  protected readonly aPagar = signal<Factura | null>(null);
  protected readonly insignia = INSIGNIA_DE_FACTURA;
  protected readonly nombreDelMedio = nombreDelMedio;

  protected registrarPago(pagada: Factura): void {
    this.facturas.update((lista) => lista.map((f) => (f.id === pagada.id ? pagada : f)));
    this.aPagar.set(null);
  }
}
