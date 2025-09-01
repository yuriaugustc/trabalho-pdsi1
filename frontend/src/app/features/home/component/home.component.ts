import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Access } from "@core/enums/access";
import { AuthService } from "@shared/services/auth.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'home',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    TooltipModule
  ],
  templateUrl: './home.component.html'
})
export class Home implements OnInit {
  accessesEnum = Access;
  accesses: Access[] = [];
  hideSidebar = true;
  @ViewChild('aside') aside!: HTMLElement;

  constructor(
    private toast: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getAccesses()
      .then(userAccesses => {
        this.accesses = userAccesses;
      });
  }

  logout(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja realmente sair?',
      header: 'Logout',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Sair',
        severity: 'danger'
      },
      accept: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  hasAccess(page: Access) {
    return this.accesses.includes(page);
  }
}