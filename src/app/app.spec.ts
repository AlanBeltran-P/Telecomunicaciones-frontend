import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  it('arma el fondo animado y la pila de avisos', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const pantalla = fixture.nativeElement as HTMLElement;
    expect(pantalla.querySelector('.fondo-luces')).not.toBeNull();
    expect(pantalla.querySelector('.toasts')).not.toBeNull();
  });
});
