import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  mensaje: string;
  saliendo: boolean;
}

const VISIBLE_MS = 2800;
const SALIDA_MS = 400;

/** Avisos cortos abajo de la pantalla ("Pago aprobado", "Plan contratado"...). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private ultimoId = 0;

  mostrar(mensaje: string): void {
    const id = ++this.ultimoId;
    this.toasts.update((lista) => [...lista, { id, mensaje, saliendo: false }]);
    setTimeout(() => this.marcarSaliendo(id), VISIBLE_MS);
    setTimeout(() => this.quitar(id), VISIBLE_MS + SALIDA_MS);
  }

  private marcarSaliendo(id: number): void {
    this.toasts.update((lista) =>
      lista.map((toast) => (toast.id === id ? { ...toast, saliendo: true } : toast)),
    );
  }

  private quitar(id: number): void {
    this.toasts.update((lista) => lista.filter((toast) => toast.id !== id));
  }
}
