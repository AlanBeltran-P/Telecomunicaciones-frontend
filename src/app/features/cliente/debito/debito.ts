import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DebitoService } from '../../../core/facturacion/debito.service';
import { MedioDePago } from '../../../core/facturacion/factura.model';
import { opcionDeMedio, tokenDePagoSimulado } from '../../../core/facturacion/medio-de-pago';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Icono } from '../../../shared/icono/icono';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';
import { SelectorDeMedio } from '../selector-de-medio';

/** Débito automático (GET/PUT/DELETE /api/facturas/debito-automatico). */
@Component({
  selector: 'app-debito',
  imports: [DatePipe, Icono, Modal, SelectorDeMedio],
  templateUrl: './debito.html',
  styleUrl: './debito.css',
})
export class Debito {
  private readonly debitoService = inject(DebitoService);
  private readonly toasts = inject(ToastService);

  /** null: no tiene débito activo. */
  protected readonly debito = rxResource({ stream: () => this.debitoService.consultar() });
  protected readonly eligiendoMedio = signal(false);
  protected readonly medio = signal<MedioDePago>('TARJETA_CREDITO');
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly opcionDeMedio = opcionDeMedio;

  protected abrirEleccion(): void {
    this.medio.set(this.debito.value()?.medio ?? 'TARJETA_CREDITO');
    this.error.set(null);
    this.eligiendoMedio.set(true);
  }

  protected guardar(): void {
    const medio = this.medio();
    this.enviando.set(true);
    this.error.set(null);
    this.debitoService.activar({ medio, tokenDePago: tokenDePagoSimulado(medio) }).subscribe({
      next: (activo) => {
        this.debito.set(activo);
        this.eligiendoMedio.set(false);
        this.enviando.set(false);
        this.toasts.mostrar('Medio de pago guardado. Débito automático activo.');
      },
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  protected desactivar(): void {
    this.enviando.set(true);
    this.debitoService.desactivar().subscribe({
      next: () => {
        this.debito.set(null);
        this.enviando.set(false);
        this.toasts.mostrar('Débito automático desactivado');
      },
      error: (error: unknown) => {
        this.toasts.mostrar(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }
}
