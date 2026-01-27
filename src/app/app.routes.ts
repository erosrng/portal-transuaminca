import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegistrocliPageComponent } from './pages/registrocli-page/registrocli-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CarritoPageComponent } from './pages/carrito-page/carrito-page.component';
import { MiperfilPageComponent } from './pages/miperfil-page/miperfil-page.component';
import { PedidosPageComponent } from './pages/pedidos-page/pedidos-page.component';
import { TomaexcelPageComponent } from './pages/tomaexcel-page/tomaexcel-page.component';
import { PagosPageComponent } from './pages/pagos-page/pagos-page.component';
import {HistorialPedidosComponent  } from './pages/historial-pedidos/historial-pedidos.component';
import {ReclamosPageComponent  } from './pages/reclamos-page/reclamos-page.component';


import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: LoginPageComponent },
    { path: 'login', component: LoginPageComponent }, 
    { path: 'registrocli', component: RegistrocliPageComponent, canActivate: [authGuard] }, 
    { path: 'home', component: HomePageComponent, canActivate: [authGuard] },
    { path: 'carrito', component: CarritoPageComponent, canActivate: [authGuard] },
    { path: 'miperfil', component: MiperfilPageComponent, canActivate: [authGuard] },
    { path: 'pedidos', component: PedidosPageComponent, canActivate: [authGuard] },
    { path: 'tomaexcel', component: TomaexcelPageComponent, canActivate: [authGuard] },
    { path: 'pagos', component: PagosPageComponent, canActivate: [authGuard] },
    { path: 'historialpedidos', component: HistorialPedidosComponent, canActivate: [authGuard] },
    { path: 'reclamos', component: ReclamosPageComponent, canActivate: [authGuard] }

];