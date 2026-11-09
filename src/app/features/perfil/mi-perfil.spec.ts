import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Perfil } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { textoEnPantalla } from '../../shared/testing/pantalla';
import { MiPerfil } from './mi-perfil';

const ANA: Perfil = {
  id: 10,
  nombre: 'Ana Pérez',
  email: 'cliente@systematele.com',
  rol: 'CLIENTE',
  dni: '35123456',
  telefono: '11 5555-1234',
};

describe('MiPerfil', () => {
  let fixture: ComponentFixture<MiPerfil>;

  async function abrirCon(perfil: Perfil): Promise<void> {
    TestBed.inject(AuthService).perfil.set(perfil);
    fixture = TestBed.createComponent(MiPerfil);
    await fixture.whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MiPerfil],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('muestra los datos de la cuenta', async () => {
    await abrirCon(ANA);
    const texto = textoEnPantalla(fixture);

    expect(texto).toContain('Ana Pérez');
    expect(texto).toContain('Cliente');
    expect(texto).toContain('cliente@systematele.com');
    expect(texto).toContain('35123456');
    expect(texto).toContain('11 5555-1234');
    expect(texto).toContain('comunicate con atención al cliente');
  });

  it('el personal no tiene DNI ni teléfono y cambia sus datos con un administrador', async () => {
    await abrirCon({ ...ANA, nombre: 'Martín Ruiz', rol: 'EMPLEADO', dni: null, telefono: null });
    const texto = textoEnPantalla(fixture);

    expect(texto).not.toContain('DNI');
    expect(texto).not.toContain('Teléfono');
    expect(texto).toContain('hablá con un administrador');
  });
});
