import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from './environments/environment';
import { provideSpinnerConfig } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { definePreset } from '@primeng/themes';
import { AuthInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthService } from '@shared/services/auth.service';
import { SessionMonitorService } from '@shared/services/session-monitor.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      appRoutes, 
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), 
      withEnabledBlockingInitialNavigation()
    ),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => sessionStorage.getItem(environment.jwtSessionKey),
          allowedDomains: [environment.domain], // Domínios que podem receber o token
          disallowedRoutes: [`${environment.apiUrl}/auth/login`], // URLs que não devem ter o token
        }
      })
    ),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    //{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAnimationsAsync(),
    provideSpinnerConfig({ type: 'ball-fussion' }),
    ConfirmationService,
    MessageService,
    AuthService,
    //SessionMonitorService,
    providePrimeNG(
      {
        ripple: true,
        theme: { 
          options: { darkModeSelector: '.app-dark' },
          preset: definePreset(
            Aura, 
            {
              semantic: {
                primary: {
                  50:  '#eaf5ff',
                  100: '#d4ebff',
                  200: '#a9d8ff',
                  300: '#7dc4ff',
                  400: '#51b1ff',
                  500: '#2890fc',
                  600: '#2173c9',
                  700: '#1a5ca0',
                  800: '#144674',
                  900: '#0d304a',
                  950: '#081f30',
                }
              }
            }
          ), 
        }, 
      }
    ),
  ]
};
