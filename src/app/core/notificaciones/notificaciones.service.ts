import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { mensajeDeError } from '../http/mensaje-error';
import { Notificacion } from './notificacion.model';

/**
 * Avisos del cliente. La campana y la pantalla de notificaciones comparten esta lista:
 * lo que se marca como leído en una se ve enseguida en la otra.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notificaciones`;
  private readonly avisos = signal<Notificacion[]>([]);

  readonly lista = this.avisos.asReadonly();
  readonly noLeidas = computed(() => this.avisos().filter((aviso) => !aviso.leida).length);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  cargar(): void {
    this.cargando.set(true);
    this.http.get<Notificacion[]>(`${this.url}/mias`).subscribe({
      next: (avisos) => {
        this.avisos.set(avisos);
        this.error.set(null);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  marcarLeida(aviso: Notificacion): void {
    if (aviso.leida) {
      return;
    }
    this.http.put<Notificacion>(`${this.url}/${aviso.id}/leida`, null).subscribe({
      next: (leida) => this.reemplazar(leida),
      error: (error: unknown) => this.error.set(mensajeDeError(error)),
    });
  }

  /** El backend no tiene "marcar todas": se marcan una por una. */
  marcarTodas(): void {
    this.avisos().forEach((aviso) => this.marcarLeida(aviso));
  }

  private reemplazar(actualizada: Notificacion): void {
    this.avisos.update((avisos) =>
      avisos.map((aviso) => (aviso.id === actualizada.id ? actualizada : aviso)),
    );
  }
}
