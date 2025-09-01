import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastModule } from 'primeng/toast';
import { Translation } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { SessionMonitorService } from '@shared/services/session-monitor.service';

@Component({
  selector: 'app-root',
  imports: [
    ConfirmDialogModule,
    RouterModule,
    ToastModule,
    NgxSpinnerModule
  ],
  template: `
    <p-toast />
    <p-confirmDialog />
    <ngx-spinner [fullScreen]="true" type="ball-fussion" size="medium"></ngx-spinner>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'EmpregUFU';

  constructor(
    private config: PrimeNG,
    private http: HttpClient,
    private sessionMonitor: SessionMonitorService
  ) {
    this.http.get('./assets/translate/pt-br.json').subscribe({
      next: (translate: Translation) => {
        this.config.setTranslation(translate);
      },
      error: (err) => {
        console.error(err)
      }
    });
  }
}
