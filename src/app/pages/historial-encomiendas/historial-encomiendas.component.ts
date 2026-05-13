import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { AuthService } from '../../auth.service';
import { API_URLINTER, PROTEO_URL_ALONEINTER } from './../../app.config';
import Swal from 'sweetalert2';

interface Encomienda {
  numero: string;
  fecha: string;
  nomcli_org: string;
  codcli_des: string;
  nomcli_des: string;
  nrofact: string;
  factura: string;
  reparto: string;
  entregado: string;
  totald: number;
}

@Component({
  selector: 'app-historial-encomiendas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSidenavModule, MatIconModule, 
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    SideBarComponent, NavBarComponent, FooterComponent
  ],
  templateUrl: './historial-encomiendas.component.html',
  styleUrl: './historial-encomiendas.component.scss'
})
export class HistorialEncomiendasComponent implements OnInit {
  isLoading = false;
  historialPedidos: Encomienda[] = [];
  historialFiltrado: Encomienda[] = [];
  
  // Variables de Filtro
  searchTerm: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  pageSize = 10;
  pageIndex = 0;

  constructor(private http: HttpClient, public authService: AuthService) { }

  ngOnInit(): void {
    this.cargarHistorialPedidos();
  }

  cargarHistorialPedidos() {
    Swal.showLoading();
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'X-Auth-Token': `${token}` });
    const payload = { 
      usuario: localStorage.getItem('usuario'),
      cmatriz: localStorage.getItem('cmatriz') 
    };

    this.http.post<{ status: boolean; data: Encomienda[] }>(`${API_URLINTER}portalcli/triangulatotal`, payload, { headers })
      .subscribe({
        next: (res) => {
          this.historialPedidos = res.data || [];
          this.aplicarFiltros(); // Inicializa el array filtrado
          Swal.close();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo obtener el historial', 'error');
        }
      });
  }

  aplicarFiltros() {
    this.pageIndex = 0; // Reiniciar paginación al filtrar
    const term = this.searchTerm.toLowerCase().trim();
    
    this.historialFiltrado = this.historialPedidos.filter(p => {
      // 1. Filtro de búsqueda general
      const matchSearch = 
        p.numero?.toLowerCase().includes(term) || 
        p.nomcli_des?.toLowerCase().includes(term) ||
        p.nrofact?.toLowerCase().includes(term) ||
        p.factura?.toLowerCase().includes(term);

      // 2. Filtro de fechas
      // Convertimos la fecha del pedido (YYYY-MM-DD) a objeto Date para comparar
      const fechaP = new Date(p.fecha + 'T00:00:00'); 
      const desde = this.fechaDesde ? new Date(this.fechaDesde + 'T00:00:00') : null;
      const hasta = this.fechaHasta ? new Date(this.fechaHasta + 'T00:00:00') : null;

      let matchFecha = true;
      if (desde && hasta) {
        matchFecha = fechaP >= desde && fechaP <= hasta;
      } else if (desde) {
        matchFecha = fechaP >= desde;
      } else if (hasta) {
        matchFecha = fechaP <= hasta;
      }

      return matchSearch && matchFecha;
    });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.aplicarFiltros();
  }

  getPaginatedData(): Encomienda[] {
    const start = this.pageIndex * this.pageSize;
    return this.historialFiltrado.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onPageSizeChange(event: any) {
    this.pageSize = +event.target.value;
    this.pageIndex = 0;
  }

  imprimirEtiquetas(numero: string) {
    const url = `${PROTEO_URL_ALONEINTER}formatos/ver/ENCOETIC/${numero}/id`;
    window.open(url, '_blank');
  }

  abrirReparto(reparto: string) {
    if (!reparto) {
      Swal.fire('Info', 'Esta encomienda aún no tiene un reparto asignado', 'info');
      return;
    }
    const url = `${PROTEO_URL_ALONEINTER}formatos/ver/REPARTO2/${reparto}`;
    window.open(url, '_blank');
  }
}