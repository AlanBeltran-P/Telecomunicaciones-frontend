import { DestroyRef, Directive, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { cuandoSeVea } from './cuando-se-vea';

/** Aparece suavemente al entrar en pantalla (estilos .con-js [data-revelar] de base.css). */
@Directive({
  selector: '[appRevelar]',
  host: { 'data-revelar': '', '[class.revelado]': 'revelado()' },
})
export class Revelar {
  protected readonly revelado = signal(false);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const dejarDeObservar = cuandoSeVea(elemento, () => this.revelado.set(true));
      destroyRef.onDestroy(dejarDeObservar);
    });
  }
}
