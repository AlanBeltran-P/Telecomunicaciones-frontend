import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { cuandoSeVea, prefiereMenosMovimiento } from './cuando-se-vea';

const DURACION_MS = 1200;

/** Número que cuenta desde 0 hasta el valor al entrar en pantalla: <span [appContar]="120"></span> */
@Directive({
  selector: '[appContar]',
  host: { '[textContent]': 'valor()' },
})
export class Contar {
  readonly appContar = input.required<number>();
  protected readonly valor = signal(0);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const dejarDeObservar = cuandoSeVea(elemento, () => this.animar());
      destroyRef.onDestroy(dejarDeObservar);
    });
  }

  private animar(): void {
    const destino = this.appContar();
    const sinAnimacion = prefiereMenosMovimiento() || typeof requestAnimationFrame === 'undefined';
    if (sinAnimacion) {
      this.valor.set(destino);
      return;
    }
    const inicio = performance.now();
    const cuadro = (ahora: number) => {
      // El tiempo del cuadro puede ser apenas anterior a "inicio": se acota entre 0 y 1
      const progreso = Math.min(Math.max((ahora - inicio) / DURACION_MS, 0), 1);
      this.valor.set(Math.round(destino * (1 - (1 - progreso) ** 3)));
      if (progreso < 1) {
        requestAnimationFrame(cuadro);
      }
    };
    requestAnimationFrame(cuadro);
  }
}
