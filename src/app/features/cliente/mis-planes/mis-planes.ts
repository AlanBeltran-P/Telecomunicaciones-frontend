import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { INSIGNIA_DE_CONTRATACION } from '../../../core/contrataciones/contratacion.model';
import { ContratacionService } from '../../../core/contrataciones/contratacion.service';
import { Icono } from '../../../shared/icono/icono';
import { PasosDeInstalacion } from '../pasos-de-instalacion';

/** Planes contratados y en qué estado está cada uno (GET /api/contrataciones/mias). */
@Component({
  selector: 'app-mis-planes',
  imports: [CurrencyPipe, DatePipe, RouterLink, Icono, PasosDeInstalacion],
  templateUrl: './mis-planes.html',
  styleUrl: './mis-planes.css',
})
export class MisPlanes {
  private readonly contrataciones = inject(ContratacionService);

  protected readonly lista = rxResource({
    params: () => this.contrataciones.cambios(),
    stream: () => this.contrataciones.misContrataciones(),
    defaultValue: [],
  });
  protected readonly insignia = INSIGNIA_DE_CONTRATACION;
}
