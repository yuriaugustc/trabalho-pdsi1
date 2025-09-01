import { Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter, tap } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class SessionMonitorService {
  private lastRoute: string | null = null;

  constructor(private router: Router, private auth: AuthService) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap((event: NavigationEnd) => this.onRouteChange(event))
      )
      .subscribe();
  }

  private onRouteChange(event: NavigationEnd): void {
    if (this.lastRoute !== event.urlAfterRedirects && this.validRoute()) {
      this.lastRoute = event.urlAfterRedirects;
      if (this.auth.isAuthenticated()) {
        this.auth.refreshToken().subscribe({
          error: err => {
            this.auth.forceLogout();
          }
        });
      }
    }
  }

  private validRoute() {
    return (
      !(this.lastRoute == null && this.router.url == '/login') && // acabou de acessar a pagina
      !(this.lastRoute == null && this.router.url == '/home') && // acabou de loggar
      !(this.lastRoute == '/login' && this.router.url == '/home') && // saiu e entrou novamente
      !['', '/login'].includes(this.router.url) // está na tela de login
    );
  }
}
