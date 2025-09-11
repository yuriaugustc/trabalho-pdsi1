import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Access } from "@core/enums/access";
import { Role } from "@core/enums/role";
import { AuthService } from "@shared/services/auth.service";
import { NgxSpinnerService } from "ngx-spinner";
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
  roleEnum = Role;
  userRole!: Role;
  hideSidebar = true;
  @ViewChild('aside') aside!: HTMLElement;

  constructor(
    private spinner: NgxSpinnerService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.spinner.hide();
    this.userRole = this.authService.loggedUser!.role!;
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

  hasAccess(role: Role) {
    return this.userRole == role || this.userRole == Role.Admin;
  }
}