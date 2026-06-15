import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegistrocliPageComponent } from './pages/registrocli-page/registrocli-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MiperfilPageComponent } from './pages/miperfil-page/miperfil-page.component';
import { PagosPageComponent } from './pages/pagos-page/pagos-page.component';
import {HistorialEncomiendasComponent  } from './pages/historial-encomiendas/historial-encomiendas.component';
import {EncomiendasPagesComponent  } from './pages/encomiendas-pages/encomiendas-pages.component';
import { DestinatariosPagesComponent } from './pages/destinatarios-pages/destinatarios-pages.component';
import { RetirosPagesComponent } from './pages/retiros-pages/retiros-pages.component';
import { HistorialRetirosComponent } from './pages/historial-retiros/historial-retiros.component';


import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: LoginPageComponent },
    { path: 'login', component: LoginPageComponent }, 
    { path: 'registrocli', component: RegistrocliPageComponent, canActivate: [authGuard] }, 
    { path: 'home', component: HomePageComponent, canActivate: [authGuard] },
    { path: 'miperfil', component: MiperfilPageComponent, canActivate: [authGuard] },
    { path: 'pagos', component: PagosPageComponent, canActivate: [authGuard] },
    { path: 'destinatarios', component: DestinatariosPagesComponent, canActivate: [authGuard] },
    { path: 'historialencomiendas', component: HistorialEncomiendasComponent, canActivate: [authGuard] },
    { path: 'encomiendas', component: EncomiendasPagesComponent, canActivate: [authGuard] },
    { path: 'retiros', component: RetirosPagesComponent, canActivate: [authGuard] },
    { path: 'historialretiros', component: HistorialRetirosComponent, canActivate: [authGuard] }

];