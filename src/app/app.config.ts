// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './auth.service';
import { NgxSpinnerModule } from 'ngx-spinner';

// *** Importación clave para las animaciones ***
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
// ***********************************************

//URL PARA TRABAJAR
export const API_URL = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transuaminca/api/';
export const URLSOLA = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/';
export const PROTEO_URL_ALONE = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transuaminca/';

export const API_URLINTER = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transuaminca/api/';
export const URLSOLAINTER = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/';
export const PROTEO_URL_ALONEINTER = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transuaminca/'; 


//PROXY PRACTICA
/* export const API_URL = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transu/api/';
export const URLSOLA = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/';
export const PROTEO_URL_ALONE = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transu/';

export const API_URLINTER = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transu/api/';
export const URLSOLAINTER = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/';
export const PROTEO_URL_ALONEINTER = 'https://ancient-meadow-8bfe.proteo-api.workers.dev/transu/'; */


//export const API_URL = 'https://d2wnvkodoh477y.cloudfront.net/practica/api/'; 
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false || 'none'
        }
      }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(NgxSpinnerModule),
    provideAnimationsAsync()
  ]
};
