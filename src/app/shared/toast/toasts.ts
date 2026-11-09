import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toasts',
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class.toast--saliendo]="toast.saliendo">{{ toast.mensaje }}</div>
      }
    </div>
  `,
})
export class Toasts {
  protected readonly toasts = inject(ToastService).toasts;
}
