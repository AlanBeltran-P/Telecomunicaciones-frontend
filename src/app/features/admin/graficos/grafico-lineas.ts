import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { etiquetaCorta, numero } from '../dashboard/formatos';
import { SerieDeGrafico, armarGeometria, periodoMasCercano } from './geometria';

/** Alto mínimo; dentro de una .tarjeta--grafico se estira hasta el alto de la fila. */
const ALTO_MINIMO = 240;

type Formato = (valor: number) => string;

/**
 * Gráfico de líneas en SVG, con una cruz que sigue al puntero (o a las flechas del teclado)
 * y muestra los valores de ese período.
 */
@Component({
  selector: 'app-grafico-lineas',
  templateUrl: './grafico-lineas.html',
  styleUrl: './grafico-lineas.css',
  host: { class: 'grafico' },
})
export class GraficoLineas {
  readonly periodos = input.required<string[]>();
  readonly series = input.required<SerieDeGrafico[]>();
  readonly formatoEje = input<Formato>(numero);
  readonly formatoValor = input<Formato>(numero);
  /** Período a destacar con una franja (el día elegido); -1 si ninguno. */
  readonly resaltar = input(-1);
  /** Cuántos períodos tienen datos; los siguientes todavía no pasaron. */
  readonly cantidadConDatos = input<number | null>(null);

  private readonly ancho = signal(0);
  private readonly altoDisponible = signal(0);
  protected readonly alto = computed(() => Math.max(ALTO_MINIMO, this.altoDisponible()));
  /** Período bajo el puntero; null si no hay ninguno marcado. */
  protected readonly indice = signal<number | null>(null);

  private readonly conDatos = computed(() => this.cantidadConDatos() ?? this.periodos().length);
  protected readonly geometria = computed(() =>
    this.ancho() > 0
      ? armarGeometria(this.ancho(), this.alto(), this.periodos(), this.series(), this.conDatos())
      : null,
  );
  protected readonly descripcion = computed(
    () => `${this.series().map((serie) => serie.nombre).join(' y ')} por período`,
  );
  protected readonly etiquetaCorta = etiquetaCorta;

  /** Lo que muestra el cuadrito del período marcado. */
  protected readonly detalle = computed(() => {
    const indice = this.indice();
    const geometria = this.geometria();
    if (indice === null || !geometria) {
      return null;
    }
    return {
      x: geometria.xs[indice],
      titulo: etiquetaCorta(this.periodos()[indice]),
      filas: this.series().map((serie, s) => ({
        color: serie.color,
        nombre: serie.nombre,
        valor: this.formatoValor()(serie.valores[indice]),
        y: geometria.ys[s][indice],
      })),
    };
  });

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    // El SVG se dibuja al tamaño de su lugar y se vuelve a dibujar si cambia
    afterNextRender(() => {
      this.ancho.set(elemento.clientWidth || 640);
      this.altoDisponible.set(elemento.clientHeight);
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const observador = new ResizeObserver(([entrada]) => {
        this.ancho.set(entrada.contentRect.width);
        this.altoDisponible.set(entrada.contentRect.height);
      });
      observador.observe(elemento);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }

  protected seguirPuntero(evento: PointerEvent): void {
    const geometria = this.geometria();
    const svg = (evento.currentTarget as SVGElement).ownerSVGElement;
    if (!geometria || !svg || this.conDatos() === 0) {
      return;
    }
    const caja = svg.getBoundingClientRect();
    const xEnSvg = ((evento.clientX - caja.left) * geometria.ancho) / caja.width;
    this.indice.set(periodoMasCercano(geometria, xEnSvg, this.conDatos()));
  }

  protected moverConTeclado(evento: KeyboardEvent): void {
    const movimiento = ({ ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[evento.key];
    if (!movimiento || this.conDatos() === 0) {
      return;
    }
    evento.preventDefault();
    const actual = this.indice() ?? this.conDatos() - 1;
    this.indice.set(Math.max(0, Math.min(this.conDatos() - 1, actual + movimiento)));
  }
}
