import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';

type Pestana = 'ingresar' | 'registro';
type CampoRegistro = 'nombre' | 'email' | 'contrasena' | 'dni' | 'telefono';

/** Cuentas de ejemplo del modo mock (src/app/core/mock/datos/usuarios.mock.ts). */
const CUENTAS_DEMO = [
  { rol: 'Cliente', email: 'cliente@systematele.com' },
  { rol: 'Empleado', email: 'empleado@systematele.com' },
  { rol: 'Técnico', email: 'tecnico@systematele.com' },
  { rol: 'Administrador', email: 'admin@systematele.com' },
];
const CONTRASENA_DEMO = 'demo1234';

/** Ingresar y crear cuenta (POST /api/auth/login y /api/auth/registro). */
@Component({
  selector: 'app-acceso',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css',
})
export class Acceso {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Viene de la ruta: /login o /registro */
  readonly pestana = input<Pestana>('ingresar');
  /** ?volver=/cliente/facturas cuando un guard mandó al login */
  readonly volver = input<string>();

  protected readonly pestanaActiva = linkedSignal(() => this.pestana());
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly modoDemo = environment.usarMock;
  protected readonly cuentasDemo = CUENTAS_DEMO;

  protected readonly ingreso = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    contrasena: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  // Mismas reglas que CrearClienteRequest en el backend
  protected readonly registro = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{7,8}$/)],
    }),
    telefono: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9+()\- ]{6,20}$/)],
    }),
  });

  protected elegirPestana(pestana: Pestana): void {
    this.pestanaActiva.set(pestana);
    this.error.set(null);
  }

  protected ingresar(): void {
    if (this.ingreso.valid) {
      this.enviar(this.auth.login(this.ingreso.getRawValue()));
    }
  }

  protected crearCuenta(): void {
    if (this.registro.valid) {
      this.enviar(this.auth.registrar(this.registro.getRawValue()));
    }
  }

  /** Modo demo: entra con la cuenta de ejemplo de ese rol. */
  protected entrarComo(email: string): void {
    this.ingreso.setValue({ email, contrasena: CONTRASENA_DEMO });
    this.ingresar();
  }

  protected campoInvalido(campo: CampoRegistro): boolean {
    const control = this.registro.controls[campo];
    return control.invalid && control.touched;
  }

  private enviar(pedido: Observable<unknown>): void {
    this.enviando.set(true);
    this.error.set(null);
    pedido.subscribe({
      next: () => void this.router.navigateByUrl(this.volver() ?? this.auth.rutaDeInicio()),
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }
}
