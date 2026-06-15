import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from './../../auth.service';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  userData: any;
  apiKey: string = '';
  showPedidosDropdown: boolean = false;
  showReportesDropdown: boolean = false;
  showEncomiendasDropdown: boolean = false;
  showRetirosDropdown: boolean = false;
  usuariopadre: string | null = null;

  constructor(
    public authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.authService.getToken();
  }

  navigateTo(route: string) {
    this.portalcliLogicaService.navigateTo(route);
  }

  toggleEncomiendasDropdown() {
    this.showEncomiendasDropdown = !this.showEncomiendasDropdown;
  }

  toggleRetirosDropdown() {
    this.showRetirosDropdown = !this.showRetirosDropdown;
  }

  logout() {
    this.authService.logout();
    localStorage.clear()
    sessionStorage.clear()
    this.router.navigate(['/login']);
  }
}
