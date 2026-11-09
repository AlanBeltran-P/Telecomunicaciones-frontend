import { ComponentFixture, TestBed } from '@angular/core/testing';
import { textoEnPantalla } from '../testing/pantalla';
import { Modal } from './modal';

describe('Modal', () => {
  let fixture: ComponentFixture<Modal>;
  let cierres: number;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('titulo', '¿Cerrar sesión?');
    fixture.componentRef.setInput('abierto', true);
    cierres = 0;
    fixture.componentInstance.cerrar.subscribe(() => cierres++);
    await fixture.whenStable();
  });

  function elemento(selector: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(selector) as HTMLElement;
  }

  it('abierto muestra el título', () => {
    expect(elemento('.modal').classList).toContain('modal--abierto');
    expect(textoEnPantalla(fixture)).toContain('¿Cerrar sesión?');
  });

  it('se cierra al tocar el fondo', () => {
    elemento('.modal').click();
    expect(cierres).toBe(1);
  });

  it('tocar adentro de la caja no lo cierra', () => {
    elemento('.modal__caja').click();
    expect(cierres).toBe(0);
  });

  it('se cierra con Escape', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cierres).toBe(1);
  });

  it('cerrado no se puede usar con el teclado ni responde a Escape', async () => {
    fixture.componentRef.setInput('abierto', false);
    await fixture.whenStable();
    expect(elemento('.modal').hasAttribute('inert')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cierres).toBe(0);
  });
});
