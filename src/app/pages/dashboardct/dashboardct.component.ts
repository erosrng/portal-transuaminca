import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";

import { MatSidenavModule } from '@angular/material/sidenav';
//import { CtDetallePedidoComponent } from '../ct-detalle-pedido/ct-detalle-pedido.component';
import Swal from 'sweetalert2';

// Interfaces para datos de ejemplo
interface PedidoCT {
  id: string;
  numeroPedido: string;
  fechaPedido: Date;
  representante: {
    id: string;
    nombre: string;
    codigo: string;
  };
  cliente: {
    id: string;
    nombre: string;
    codigo: string;
    ciudad: string;
  };
  cantidadSolicitada: number;
  cantidadCargada: number;
  porcentajeOtorgado: number;
  estado: 'COMPLETO' | 'PARCIAL' | 'PENDIENTE' | 'RECHAZADO';
  valorTotal: number;
}

interface ResumenRepresentante {
  representanteId: string;
  representanteNombre: string;
  totalPedidos: number;
  totalSolicitado: number;
  totalCargado: number;
  porcentajePromedio: number;
  valorTotal: number;
}


@Component({
  selector: 'app-dashboardct',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    NavBarComponent,
    SideBarComponent,
    FooterComponent,
    MatSidenavModule
  ],
  templateUrl: './dashboardct.component.html',
  styleUrl: './dashboardct.component.scss'
})
/*
@Component({
  selector: 'app-ct-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    NavBarComponent,
    SideBarComponent,
    FooterComponent,
    MatSidenavModule
  ],
  templateUrl: './ct-dashboard.component.html',
  styleUrls: ['./ct-dashboard.component.scss']
})*/
export class DashboardctComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Datos de ejemplo para el CT
  pedidosEjemplo: PedidoCT[] = [
    {
      id: '1',
      numeroPedido: 'PED-2024-001',
      fechaPedido: new Date('2024-01-15'),
      representante: { id: 'REP001', nombre: 'Juan Pérez', codigo: 'JP' },
      cliente: { id: 'CLI001', nombre: 'Droguería Central', codigo: 'DC001', ciudad: 'Bogotá' },
      cantidadSolicitada: 150,
      cantidadCargada: 145,
      porcentajeOtorgado: 96.7,
      estado: 'COMPLETO',
      valorTotal: 1250000
    },
    {
      id: '2',
      numeroPedido: 'PED-2024-002',
      fechaPedido: new Date('2024-01-16'),
      representante: { id: 'REP002', nombre: 'María Gómez', codigo: 'MG' },
      cliente: { id: 'CLI002', nombre: 'Farmacia Salud', codigo: 'FS002', ciudad: 'Medellín' },
      cantidadSolicitada: 200,
      cantidadCargada: 180,
      porcentajeOtorgado: 90.0,
      estado: 'PARCIAL',
      valorTotal: 980000
    },
    {
      id: '3',
      numeroPedido: 'PED-2024-003',
      fechaPedido: new Date('2024-01-17'),
      representante: { id: 'REP001', nombre: 'Juan Pérez', codigo: 'JP' },
      cliente: { id: 'CLI003', nombre: 'Hospital San José', codigo: 'HSJ003', ciudad: 'Cali' },
      cantidadSolicitada: 300,
      cantidadCargada: 270,
      porcentajeOtorgado: 90.0,
      estado: 'PARCIAL',
      valorTotal: 2100000
    },
    {
      id: '4',
      numeroPedido: 'PED-2024-004',
      fechaPedido: new Date('2024-01-18'),
      representante: { id: 'REP003', nombre: 'Carlos Rodríguez', codigo: 'CR' },
      cliente: { id: 'CLI004', nombre: 'Droguería La Esperanza', codigo: 'DLE004', ciudad: 'Barranquilla' },
      cantidadSolicitada: 100,
      cantidadCargada: 100,
      porcentajeOtorgado: 100.0,
      estado: 'COMPLETO',
      valorTotal: 750000
    },
    {
      id: '5',
      numeroPedido: 'PED-2024-005',
      fechaPedido: new Date('2024-01-19'),
      representante: { id: 'REP002', nombre: 'María Gómez', codigo: 'MG' },
      cliente: { id: 'CLI005', nombre: 'Farmacia El Ahorro', codigo: 'FEA005', ciudad: 'Cartagena' },
      cantidadSolicitada: 80,
      cantidadCargada: 60,
      porcentajeOtorgado: 75.0,
      estado: 'PARCIAL',
      valorTotal: 420000
    }
  ];

  // Filtros
  fechaInicio: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  fechaFin: Date = new Date();
  estadoFiltro: string = 'TODOS';
  representanteFiltro: string = 'TODOS';

  // Datos filtrados
  pedidosFiltrados: PedidoCT[] = [];
  resumenRepresentantes: ResumenRepresentante[] = [];

  // Columnas de la tabla
  columnas: string[] = [
    'numeroPedido',
    'fecha',
    'representante',
    'cliente',
    'solicitado',
    'cargado',
    'porcentaje',
    'valorTotal',
    'estado',
    'acciones'
  ];

  // Sidebar
  toggleMenu = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.filtrarPedidos();
    this.calcularResumen();
  }

  filtrarPedidos(): void {
    let filtrados = [...this.pedidosEjemplo];

    // Filtrar por fecha
    filtrados = filtrados.filter(pedido => {
      const fechaPedido = new Date(pedido.fechaPedido);
      return fechaPedido >= this.fechaInicio && fechaPedido <= this.fechaFin;
    });

    // Filtrar por estado
    if (this.estadoFiltro !== 'TODOS') {
      filtrados = filtrados.filter(pedido => pedido.estado === this.estadoFiltro);
    }

    // Filtrar por representante
    if (this.representanteFiltro !== 'TODOS') {
      filtrados = filtrados.filter(pedido => 
        pedido.representante.id === this.representanteFiltro
      );
    }

    this.pedidosFiltrados = filtrados;
    this.calcularResumen();
  }

  calcularResumen(): void {
    const resumenMap = new Map<string, ResumenRepresentante>();

    this.pedidosFiltrados.forEach(pedido => {
      const repId = pedido.representante.id;
      const repNombre = pedido.representante.nombre;

      if (!resumenMap.has(repId)) {
        resumenMap.set(repId, {
          representanteId: repId,
          representanteNombre: repNombre,
          totalPedidos: 0,
          totalSolicitado: 0,
          totalCargado: 0,
          porcentajePromedio: 0,
          valorTotal: 0
        });
      }

      const resumen = resumenMap.get(repId)!;
      resumen.totalPedidos++;
      resumen.totalSolicitado += pedido.cantidadSolicitada;
      resumen.totalCargado += pedido.cantidadCargada;
      resumen.valorTotal += pedido.valorTotal;
    });

    // Calcular porcentaje promedio por representante
    resumenMap.forEach(resumen => {
      if (resumen.totalSolicitado > 0) {
        resumen.porcentajePromedio = (resumen.totalCargado / resumen.totalSolicitado) * 100;
      }
    });

    this.resumenRepresentantes = Array.from(resumenMap.values())
      .sort((a, b) => b.valorTotal - a.valorTotal);
  }

  getColorEstado(estado: string): string {
    const colores: {[key: string]: string} = {
      'COMPLETO': 'primary',
      'PARCIAL': 'accent',
      'PENDIENTE': 'warn',
      'RECHAZADO': 'warn'
    };
    return colores[estado] || '';
  }

  getClasePorcentaje(porcentaje: number): string {
    if (porcentaje >= 95) return 'porcentaje-alto';
    if (porcentaje >= 80) return 'porcentaje-medio';
    if (porcentaje >= 60) return 'porcentaje-bajo';
    return 'porcentaje-muy-bajo';
  }

  verDetallePedido(pedido: PedidoCT): void {
    /* this.dialog.open(CtDetallePedidoComponent, {
      width: '800px',
      data: { pedido }
    }); */
  }

  getPorcentajeGeneral(): number {
    const totalSolicitado = this.resumenRepresentantes.reduce((sum, r) => sum + r.totalSolicitado, 0);
    const totalCargado = this.resumenRepresentantes.reduce((sum, r) => sum + r.totalCargado, 0);
    
    if (totalSolicitado === 0) return 0;
    return (totalCargado / totalSolicitado) * 100;
  }
  
  exportarExcel(): void {
    Swal.fire({
      title: 'Exportando...',
      text: 'Generando archivo Excel',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        // Simular exportación
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Exportación completada',
            text: 'El archivo se descargará automáticamente',
            timer: 2000,
            showConfirmButton: false
          });
          
          // Aquí iría la lógica real de exportación
          this.simularDescargaExcel();
        }, 1500);
      }
    });
  }

  private simularDescargaExcel(): void {
    const datos = this.pedidosFiltrados.map(p => ({
      'Número Pedido': p.numeroPedido,
      'Fecha': p.fechaPedido.toLocaleDateString(),
      'Representante': p.representante.nombre,
      'Cliente': p.cliente.nombre,
      'Solicitado': p.cantidadSolicitada,
      'Cargado': p.cantidadCargada,
      '% Otorgado': `${p.porcentajeOtorgado.toFixed(2)}%`,
      'Valor Total': `$${p.valorTotal.toLocaleString()}`,
      'Estado': p.estado
    }));

    console.log('Datos para exportar:', datos);
    // Aquí implementarías la lógica real de exportación a Excel
  }

  resetFiltros(): void {
    this.fechaInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.fechaFin = new Date();
    this.estadoFiltro = 'TODOS';
    this.representanteFiltro = 'TODOS';
    this.filtrarPedidos();
  }

  openMenu(event: any): void {
    this.toggleMenu = !this.toggleMenu;
  }
}