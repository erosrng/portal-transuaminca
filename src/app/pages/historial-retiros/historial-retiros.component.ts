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

interface Retiro {
  id: string;
  numero: string;
  fecha: string;
  prioridad: string;
  nom_sol: string;
  nomcli_org: string;
  nomcli_des: string;
  nrofact: string;
  monto: number;
  estatus: string;
  planificada: string;
  fplanifica: string;
  frecibido: string;
  fentregado: string;
  contenido: string;
  direcret: string;
  direcent: string;
}

@Component({
  selector: 'app-historial-retiros',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSidenavModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    SideBarComponent, NavBarComponent, FooterComponent
  ],
  templateUrl: './historial-retiros.component.html',
  styleUrl: './historial-retiros.component.scss'
})
export class HistorialRetirosComponent implements OnInit {
  isLoading = false;
  historialRetiros: Retiro[] = [];
  historialFiltrado: Retiro[] = [];

  searchTerm: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  pageSize = 10;
  pageIndex = 0;

  constructor(private http: HttpClient, public authService: AuthService) { }

  ngOnInit(): void {
    this.cargarHistorialRetiros();
  }

  cargarHistorialRetiros() {
    Swal.showLoading();
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'X-Auth-Token': `${token}` });
    const payload = { codCli: localStorage.getItem('usuario') };

    this.http.post<{ status: boolean; data: Retiro[] }>(`${API_URLINTER}portalcli/retiros`, payload, { headers })
      .subscribe({
        next: (res) => {
          this.historialRetiros = res.data || [];
          this.aplicarFiltros();
          Swal.close();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo obtener el historial de retiros', 'error');
        }
      });
  }

  aplicarFiltros() {
    this.pageIndex = 0;
    const term = this.searchTerm.toLowerCase().trim();

    this.historialFiltrado = this.historialRetiros.filter(r => {
      const matchSearch =
        r.numero?.toLowerCase().includes(term) ||
        r.nomcli_des?.toLowerCase().includes(term) ||
        r.nom_sol?.toLowerCase().includes(term) ||
        r.nrofact?.toLowerCase().includes(term) ||
        r.contenido?.toLowerCase().includes(term);

      const fechaR = new Date(r.fecha + 'T00:00:00');
      const desde = this.fechaDesde ? new Date(this.fechaDesde + 'T00:00:00') : null;
      const hasta = this.fechaHasta ? new Date(this.fechaHasta + 'T00:00:00') : null;

      let matchFecha = true;
      if (desde && hasta) {
        matchFecha = fechaR >= desde && fechaR <= hasta;
      } else if (desde) {
        matchFecha = fechaR >= desde;
      } else if (hasta) {
        matchFecha = fechaR <= hasta;
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

  getPaginatedData(): Retiro[] {
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

  imprimirOrden(numero: string) {
    const url = `${PROTEO_URL_ALONEINTER}formatos/ver/RETIROS/${numero}`;
    window.open(url, '_blank');
  }

  getEstatusLabel(estatus: string): string {
    const map: Record<string, string> = { P: 'Pendiente', R: 'Retirado', E: 'Entregado' };
    return map[estatus] || estatus;
  }

  getEstatusClass(estatus: string): string {
    const map: Record<string, string> = { P: 'status-pendiente', R: 'status-retirado', E: 'status-entregado' };
    return map[estatus] || '';
  }
}
