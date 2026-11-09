import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Contar } from './contar';

@Component({
  imports: [Contar],
  template: `<span [appContar]="120"></span>`,
})
class Pantalla {}

describe('Contar', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('con movimiento reducido muestra el número final sin animar', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const fixture = TestBed.createComponent(Pantalla);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toBe('120');
  });
});
