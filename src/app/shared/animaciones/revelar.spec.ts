import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Revelar } from './revelar';

@Component({
  imports: [Revelar],
  template: `<div appRevelar>Hola</div>`,
})
class Pantalla {}

/** IntersectionObserver de mentira: guarda el callback para disparar la entrada a mano. */
class ObservadorFalso {
  static ultimo: ObservadorFalso;
  constructor(readonly avisar: IntersectionObserverCallback) {
    ObservadorFalso.ultimo = this;
  }
  observe(): void {}
  disconnect(): void {}
  entrarEnPantalla(): void {
    this.avisar([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
  }
}

describe('Revelar', () => {
  afterEach(() => vi.unstubAllGlobals());

  async function crear(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(Pantalla);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('[appRevelar]') as HTMLElement;
  }

  it('marca el bloque para los estilos de aparición', async () => {
    const bloque = await crear();
    expect(bloque.hasAttribute('data-revelar')).toBe(true);
  });

  it('sin IntersectionObserver aparece directo', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const bloque = await crear();
    expect(bloque.classList).toContain('revelado');
  });

  it('aparece recién cuando entra en pantalla', async () => {
    vi.stubGlobal('IntersectionObserver', ObservadorFalso);
    const fixture = TestBed.createComponent(Pantalla);
    await fixture.whenStable();
    const bloque = (fixture.nativeElement as HTMLElement).querySelector('[appRevelar]')!;
    expect(bloque.classList).not.toContain('revelado');

    ObservadorFalso.ultimo.entrarEnPantalla();
    await fixture.whenStable();
    expect(bloque.classList).toContain('revelado');
  });
});
