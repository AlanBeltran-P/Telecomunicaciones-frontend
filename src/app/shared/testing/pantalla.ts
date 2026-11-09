import { ComponentFixture } from '@angular/core/testing';

// Ayudas para usar una pantalla en los tests como lo haría una persona.

export function textoEnPantalla(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

export async function clickEnBoton(
  fixture: ComponentFixture<unknown>,
  texto: string,
): Promise<void> {
  const botones = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
  const boton = botones.find((b) => b.textContent?.includes(texto));
  if (!boton) {
    throw new Error(`No hay ningún botón con el texto "${texto}"`);
  }
  boton.click();
  await fixture.whenStable();
}

export async function escribir(
  fixture: ComponentFixture<unknown>,
  nombreInput: string,
  valor: string,
): Promise<void> {
  const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
    `input[name="${nombreInput}"]`,
  );
  if (!input) {
    throw new Error(`No hay ningún input con name="${nombreInput}"`);
  }
  input.value = valor;
  input.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}
