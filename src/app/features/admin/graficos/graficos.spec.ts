import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarraSegmentada } from './barra-segmentada';
import { Barras } from './barras';
import { GraficoLineas } from './grafico-lineas';

describe('GraficoLineas', () => {
  let fixture: ComponentFixture<GraficoLineas>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(GraficoLineas);
    fixture.componentRef.setInput('periodos', ['2026-11-01', '2026-11-02', '2026-11-03']);
    fixture.componentRef.setInput('series', [
      { nombre: 'Altas', color: 'red', valores: [3, 7, 5] },
      { nombre: 'Bajas', color: 'blue', valores: [1, 0, 2] },
    ]);
    await fixture.whenStable();
  });

  function elemento(selector: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(selector);
  }

  it('dibuja una línea por serie y lo describe para lectores de pantalla', () => {
    expect(fixture.nativeElement.querySelectorAll('.grafico-lineas__linea').length).toBe(2);
    expect(elemento('svg')?.getAttribute('aria-label')).toBe('Altas y Bajas por período');
  });

  it('con las flechas muestra los valores de cada período', async () => {
    const zona = elemento('.grafico__zona') as HTMLElement;
    zona.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    await fixture.whenStable();

    const detalle = elemento('.grafico-lineas__detalle')?.textContent ?? '';
    expect(detalle).toContain('2 nov');
    expect(detalle).toContain('7');
  });

  it('al salir del gráfico esconde el detalle', async () => {
    const zona = elemento('.grafico__zona') as HTMLElement;
    zona.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await fixture.whenStable();
    zona.dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(elemento('.grafico-lineas__detalle')).toBeNull();
  });
});

describe('Barras', () => {
  it('el valor más grande ocupa toda la pista', async () => {
    const fixture = TestBed.createComponent(Barras);
    fixture.componentRef.setInput('items', [
      { nombre: 'Fibra 300', valor: 50, texto: '50' },
      { nombre: 'Fibra 1000', valor: 25, texto: '25' },
    ]);
    await fixture.whenStable();
    const rellenos = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.barra__relleno'),
    ).map((relleno) => relleno.style.width);
    expect(rellenos).toEqual(['100%', '50%']);
  });

  it('sin datos lo dice', async () => {
    const fixture = TestBed.createComponent(Barras);
    fixture.componentRef.setInput('items', []);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Sin datos en el período.');
  });
});

describe('BarraSegmentada', () => {
  it('muestra el porcentaje de cada parte y omite las que están en cero', async () => {
    const fixture = TestBed.createComponent(BarraSegmentada);
    fixture.componentRef.setInput('partes', [
      { nombre: 'Pagadas', valor: 80, color: 'green' },
      { nombre: 'Pendientes', valor: 20, color: 'yellow' },
      { nombre: 'Vencidas', valor: 0, color: 'red' },
    ]);
    await fixture.whenStable();
    const segmentos = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.segmento'),
    ).map((segmento) => segmento.textContent?.trim());
    expect(segmentos).toEqual(['80%', '20%']);
    expect(fixture.nativeElement.textContent).not.toContain('Vencidas');
  });
});
