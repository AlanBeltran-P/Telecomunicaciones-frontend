import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Cliente } from '../../../core/clientes/cliente.model';
import { ClienteService } from '../../../core/clientes/cliente.service';
import { mensajeDeError } from '../../../core/http/mensaje-error';
import { Modal } from '../../../shared/modal/modal';
import { ToastService } from '../../../shared/toast/toast.service';

type Campo = 'nombre' | 'email' | 'contrasena' | 'dni' | 'telefono';

/**
 * Alta (POST /api/clientes) o edición (PUT /api/clientes/{id}) de un cliente.
 * Sin cliente es un alta y pide la contraseña inicial; con cliente edita sus datos.
 */
@Component({
  selector: 'app-cliente-formulario',
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './cliente-formulario.html',
})
export class ClienteFormulario {
  private readonly clientes = inject(ClienteService);
  private readonly toasts = inject(ToastService);

  readonly abierto = input(false);
  /** El cliente a editar; null para dar de alta uno nuevo. */
  readonly cliente = input<Cliente | null>(null);
  readonly guardado = output<Cliente>();
  readonly cerrar = output<void>();

  protected readonly esAlta = computed(() => this.cliente() === null);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  // Mismas reglas que CrearClienteRequest / EditarClienteRequest en el backend
  protected readonly formulario = new FormGroup({
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

  constructor() {
    // Cada vez que se abre, arranca con los datos del cliente (o vacío para un alta)
    effect(() => {
      if (this.abierto()) {
        this.cargarDatos(this.cliente());
      }
    });
  }

  protected campoInvalido(campo: Campo): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    this.pedido().subscribe({
      next: (cliente) => {
        this.enviando.set(false);
        this.toasts.mostrar(this.esAlta() ? 'Cliente creado' : 'Datos del cliente guardados');
        this.guardado.emit(cliente);
      },
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  private pedido(): Observable<Cliente> {
    const { contrasena, ...datos } = this.formulario.getRawValue();
    const cliente = this.cliente();
    return cliente
      ? this.clientes.editar(cliente.id, datos)
      : this.clientes.crear({ ...datos, contrasena });
  }

  private cargarDatos(cliente: Cliente | null): void {
    this.error.set(null);
    this.formulario.reset({
      nombre: cliente?.nombre ?? '',
      email: cliente?.email ?? '',
      contrasena: '',
      dni: cliente?.dni ?? '',
      telefono: cliente?.telefono ?? '',
    });
    // Al editar la contraseña no se toca: el campo no se muestra ni se valida
    const contrasena = this.formulario.controls.contrasena;
    if (cliente) {
      contrasena.disable();
    } else {
      contrasena.enable();
    }
  }
}
