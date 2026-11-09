import { DatePipe, formatDate } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { InstalacionService } from '../../../core/contrataciones/instalacion.service';
import { Contar } from '../../../shared/animaciones/contar';
import { Icono } from '../../../shared/icono/icono';

/** Instalaciones que ya hizo el técnico (GET /api/instalaciones/realizadas). */
@Component({
  selector: 'app-historial',
  imports: [DatePipe, Contar, Icono],
  templateUrl: './historial.html',
})
export class Historial {
  private readonly instalaciones = inject(InstalacionService);

  protected readonly lista = rxResource({
    stream: () => this.instalaciones.realizadas(),
    defaultValue: [],
  });

  /** 'YYYY-MM' del mes actual: las fechas de este mes empiezan así. */
  private readonly mesActual = formatDate(new Date(), 'yyyy-MM', 'en');
  protected readonly esteMes = computed(() =>
    this.lista.hasValue()
      ? this.lista.value().filter((i) => i.fechaInstalacion?.startsWith(this.mesActual)).length
      : 0,
  );
}
