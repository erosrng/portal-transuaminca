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
  usuariopadre: string | null = null;
  constructor(
    public authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService,
    private router: Router
  ) {}

  ngOnInit() {
    //this.usuariopadre = this.authService.getUsuarioPadre();
    const token = this.authService.getToken();

    /*this.portalcliLogicaService.isMenuOpen$. subscribe((isOpen: boolean) => {
      this.isMenuOpen = isOpen;
    });*/
  }

  navigateTo(route: string) {
    this.portalcliLogicaService.navigateTo(route);
  }

  /*openMenuOnItemHover() {
    if (!this.isMenuOpen) {
      this.portalcliLogicaService.openMenu();
    }
  }

  closeMenuOnItemLeave() {
    if (!this.portalcliLogicaService.isMenuOpen) {
      this.portalcliLogicaService.closeMenu();
    }
  }
*/
  togglePedidosDropdown() {
    this.showPedidosDropdown = !this.showPedidosDropdown;
  }

  toggleReportesDropdown() {
    this.showReportesDropdown = !this.showReportesDropdown;
  }

  logout() {
    this.authService.logout();
    localStorage.clear()
    sessionStorage.clear()
    this.router.navigate(['/login']);
  }

  /*toggleMenu() {
    this.portalcliLogicaService.toggleMenu();
  }

  openMenu() {
    this.portalcliLogicaService.openMenu();
  }

  closeMenu() {
    this.portalcliLogicaService.closeMenu();
  }*/

  /* bajareporteunico(){
    const usuario = this.authService.getUsuario();
    const url = `${PROTEO_URL_ALONE}/reportes/ver/VTPTPRV/${usuario}`;
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes');
  }

  bajareportemaster(){
    const proveed = this.authService.getProveed();
    const url = `${PROTEO_URL_ALONE}/reportes/ver/VTASCENTRA/${proveed}`;
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,screenx=((screen.availWidth/2)-400),screeny=((screen.availHeight/2)-300)');
  }
 */
}
