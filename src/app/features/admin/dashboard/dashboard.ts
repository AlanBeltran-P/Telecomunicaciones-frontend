import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, forkJoin, map } from 'rxjs';
import { ReporteService } from '../../../core/reportes/reporte.service';
import { BarraSegmentada } from '../graficos/barra-segmentada';
import { Barras } from '../graficos/barras';
import { GraficoLineas } from '../graficos/grafico-lineas';
import { etiquetaCorta, numero, pesos, pesosCorto } from './formatos';
import {
  ModoDePeriodo,
  RangosDelDashboard,
  aIso,
  calcularRangos,
  describirPeriodo,
  desdeIso,
  hoySinHora,
  mismoRango,
} from './periodo';
import { DatosDelDashboard, Tablero, armarTablero } from './tablero';

/** Años que se pueden elegir: el actual y los tres anteriores. */
const ANIOS_PARA_ELEGIR = 4;

/**
 * Dashboard del administrador: pide los tres reportes del backend
 * (GET /api/usuarios/reporte, /api/contrataciones/reporte y /api/facturas/reporte)
 * con el período elegido y dibuja indicadores y gráficos.
 */
@Component({
  selector: 'app-dashboard',
  imports: [GraficoLineas, Barras, BarraSegmentada],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly reportes = inject(ReporteService);
  private readonly hoy = hoySinHora();

  protected readonly modo = signal<ModoDePeriodo>('mes');
  protected readonly fecha = signal(this.hoy);
  protected readonly verTabla = signal(false);

  protected readonly descripcion = computed(() => describirPeriodo({ modo: this.modo(), fecha: this.fecha() }));
  protected readonly dia = computed(() => aIso(this.fecha()));
  protected readonly mes = computed(() => aIso(this.fecha()).slice(0, 7));
  protected readonly anios = Array.from({ length: ANIOS_PARA_ELEGIR }, (_, i) => this.hoy.getFullYear() - i);
  /** Con un día elegido, los gráficos muestran su mes con ese día resaltado. */
  protected readonly resaltar = computed(() => (this.modo() === 'dia' ? this.fecha().getDate() - 1 : -1));

  private readonly datos = rxResource({
    params: () => calcularRangos({ modo: this.modo(), fecha: this.fecha() }),
    stream: ({ params }) => this.pedirDatos(params),
  });

  /** Mientras llegan los datos nuevos se sigue mostrando lo anterior (más tenue), sin saltos. */
  protected readonly tablero = linkedSignal<Tablero | undefined, Tablero | undefined>({
    source: () => (this.datos.hasValue() ? armarTablero(this.datos.value(), this.hoy) : undefined),
    computation: (nuevo, anterior) => nuevo ?? anterior?.value,
  });
  protected readonly cargando = this.datos.isLoading;
  protected readonly error = this.datos.error;

  protected readonly pesos = pesos;
  protected readonly pesosCorto = pesosCorto;
  protected readonly numero = numero;
  protected readonly etiquetaCorta = etiquetaCorta;

  protected elegirModo(modo: ModoDePeriodo): void {
    this.modo.set(modo);
  }

  protected elegirFecha(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) {
      this.fecha.set(desdeIso(valor));
    }
  }

  protected elegirAnio(evento: Event): void {
    const anio = Number((evento.target as HTMLSelectElement).value);
    this.fecha.set(new Date(anio, this.fecha().getMonth(), 1));
  }

  protected volverAHoy(): void {
    this.fecha.set(this.hoy);
  }

  /** Si el rango de la evolución es el mismo que el de los totales, se pide una sola vez. */
  private pedirDatos({ totales, evolucion }: RangosDelDashboard): Observable<DatosDelDashboard> {
    const deTotales = this.reportes.todos(totales);
    if (mismoRango(totales, evolucion)) {
      return deTotales.pipe(map((reportes) => ({ totales: reportes, evolucion: reportes })));
    }
    return forkJoin({ totales: deTotales, evolucion: this.reportes.todos(evolucion) });
  }
}
