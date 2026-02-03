import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
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
  totald: number;
}

@Component({
  selector: 'app-historial-encomiendas',
  standalone: true,
  imports: [
    MatSidenavModule, MatIconModule, CommonModule,
    SideBarComponent, NavBarComponent, FooterComponent,
    MatTableModule, MatPaginatorModule
  ],
  templateUrl: './historial-encomiendas.component.html',
  styleUrl: './historial-encomiendas.component.scss'
})
export class HistorialEncomiendasComponent implements OnInit {
  isLoading = false;
  historialPedidos: Encomienda[] = [];
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
          Swal.close();
        },
        error: () => {
          Swal.fire('Error', 'Error al obtener datos', 'error');
        }
      });
  }

  getPaginatedData(): Encomienda[] {
    const start = this.pageIndex * this.pageSize;
    return this.historialPedidos.slice(start, start + this.pageSize);
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
    const url = `${PROTEO_URL_ALONEINTER}formatos/ver/REPARTO2/${reparto}`;
    window.open(url, '_blank');
  }
}