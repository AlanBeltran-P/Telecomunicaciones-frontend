import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('muestra el aviso y lo saca después de unos segundos', () => {
    const servicio = TestBed.inject(ToastService);
    servicio.mostrar('Pago aprobado');
    expect(servicio.toasts().map((toast) => toast.mensaje)).toEqual(['Pago aprobado']);

    vi.advanceTimersByTime(2800);
    expect(servicio.toasts()[0].saliendo).toBe(true);

    vi.advanceTimersByTime(400);
    expect(servicio.toasts()).toEqual([]);
  });
});
