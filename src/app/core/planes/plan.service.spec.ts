import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Plan } from './plan.model';
import { PlanService } from './plan.service';

describe('PlanService', () => {
  it('lista el catálogo con GET /api/planes', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const backend = TestBed.inject(HttpTestingController);
    const planes: Plan[] = [{ id: 1, nombre: 'Fibra 300', descripcion: null, precio: 18500 }];

    let recibidos: Plan[] = [];
    TestBed.inject(PlanService).listar().subscribe((respuesta) => (recibidos = respuesta));
    const req = backend.expectOne('/api/planes');
    expect(req.request.method).toBe('GET');
    req.flush(planes);

    expect(recibidos).toEqual(planes);
    backend.verify();
  });
});
