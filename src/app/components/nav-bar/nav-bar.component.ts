import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from './../../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from './../../app.config';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  categoriaSeleccionada: { grupo: string; nom_grup: string } | null = null;
  searchTermNavbar: string = '';
  rutaActual: string = '';
  searchParam: string = ''; // Nueva variable

  userData: any;
  apiKey: string = '';
  isMenuOpen: boolean = true;

  totalBs: string = '';
  totalUsd: string = '';
  unidades: string = '';

  private subscriptions: Subscription[] = [];
  clientes: { cliente: string; nombre: string; rifci: string }[] | null = null;
  grup: { grupo: string; nom_grup: string }[] | null = null;
  codCli: string | null = null;

  constructor(
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
    private http: HttpClient,
    public portalcliLogicaService: PortalcliLogicaService
  ) {}

  ngOnInit() {
    this.rutaActual = this.route.snapshot.url.join('/');
    this.codCli = this.authService.getCodCli();
    this.clientes = this.authService.getClientes();
    this.grup = this.authService.getLgrup();
    this.portalcliLogicaService.buscaalmacen();
  }

  toggleMenu() {
    this.portalcliLogicaService.toggleMenu();
  }

  openMenuOnHover() {
    this.portalcliLogicaService.openMenu();
  }

  closeMenuOnLeave() {
    this.portalcliLogicaService.closeMenu();
  }

  navigateTo(route: string, queryParams?: any) {
    this.portalcliLogicaService.navigateTo(route, queryParams);
  }
  onClienteSeleccionado(cliente: { cliente: string; nombre: string; rifci: string }): void {
    this.authService.setCodCli(cliente.cliente);
    this.portalcliLogicaService.buscaalmacen();
    if (this.rutaActual == 'carrito' || this.rutaActual == 'pedidos' || this.rutaActual == 'pagos') {
      this.portalcliLogicaService.notificarCambioCliente(cliente.cliente);
    }
  }


  getNombreClienteSeleccionado(): string {
    const codCli = this.authService.getCodCli();
    if (!this.clientes) {
      return `(${codCli}) ${this.authService.getNombre()}`;
    }
    const clienteSeleccionado = this.clientes.find((cliente) => cliente.cliente === codCli);

    const value = clienteSeleccionado ? `${clienteSeleccionado.nombre}`
        : `${this.authService.getNombre()}`;
    localStorage.removeItem('nameFarmaActiva')
    localStorage.setItem('nameFarmaActiva', value)

    return clienteSeleccionado
      ? `(${clienteSeleccionado.cliente}) ${clienteSeleccionado.nombre}`
      : `(${codCli}) ${this.authService.getNombre()}`;

  }
}
