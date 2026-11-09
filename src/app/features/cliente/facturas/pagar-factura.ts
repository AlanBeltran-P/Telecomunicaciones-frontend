import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { Factura, MedioDePago } from '../../../core/facturacion/factura.model';
import { FacturaService } from '../../../core/facturacion/factura.service';
import { tokenDePagoSimulado } from '../../../core/facturacion/medio-de-pago';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';
import { SelectorDeMedio } from '../selector-de-medio';

/** Modal para pagar una factura (POST /api/facturas/{id}/pagos). */
@Component({
  selector: 'app-pagar-factura',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, Modal, SelectorDeMedio],
  templateUrl: './pagar-factura.html',
})
export class PagarFactura {
  private readonly facturas = inject(FacturaService);
  private readonly toasts = inject(ToastService);

  /** La factura a pagar; null con el modal cerrado. */
  readonly factura = input<Factura | null>(null);
  readonly pagada = output<Factura>();
  readonly cerrar = output<void>();

  protected readonly medio = signal<MedioDePago>('TARJETA_DEBITO');
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected confirmar(factura: Factura): void {
    const medio = this.medio();
    this.enviando.set(true);
    this.error.set(null);
    this.facturas.pagar(factura.id, { medio, tokenDePago: tokenDePagoSimulado(medio) }).subscribe({
      next: (pagada) => {
        this.enviando.set(false);
        this.toasts.mostrar('Pago aprobado');
        this.pagada.emit(pagada);
      },
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  protected cancelar(): void {
    this.error.set(null);
    this.cerrar.emit();
  }
}
