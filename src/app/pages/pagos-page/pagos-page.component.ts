import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, Sort } from '@angular/material/sort';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { AuthService } from './../../auth.service';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { API_URL } from './../../app.config';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { ClicardComponent } from "../../components/clicard/clicard.component";
import { Subscription } from 'rxjs';

interface FacturaSeleccionada {
  selected: boolean;
  data: {
    tipo_doc: string;
    numero: string;
    emision: string;
    entregado: string;
    vence: string;
    dias: number;
    monto: number;
    impuesto: number;
    reteiva: number;
    saldo: number;
    ppago: number;
    difc: number;
    cdolar: number;
    monto_dolar: number;
    saldo_dolar: number;
    preabono: number;
    mfactura: number;
    [key: string]: any;
  };
  montoAPagar: number; 
}

@Component({
  selector: 'app-pagos-page',
  imports: [
    NavBarComponent,
    MatCheckboxModule,
    FooterComponent,
    SideBarComponent,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    ClicardComponent
],
  templateUrl: './pagos-page.component.html',
  styleUrl: './pagos-page.component.scss'
})

export class PagosPageComponent implements OnInit {
  pagedPagos: any[] = [];
  search: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isLoading = false;
  //selectedRowsMap: { [key: string]: boolean } = {};
  selectedRowsMap: { [key: string]: FacturaSeleccionada } = {};
  selectedCount = 0;
  allPagos: any[] = [];
  showSelectedOnly = false;
  facturasACancelar: string = '';
  montoACancelar: number = 0;
  montoACancelard: number = 0;
  montoPagado: number = 0;
  montoPagadod: number = 0;

  saldoDisponible: number = 0;
montoOriginalPagado: number = 0;

isResponsiveMode: boolean = false;

displayedColumns: string[] = [
  'select', 'documento', 'emision', 'entregado', 'vence', 'dias', 
  'monto', 'impuesto', 'reteiva', 'saldo', 'ppago', 'difc', 
  'cdolar', 'monto_dolar', 'saldo_dolar', 'mfactura'
];


  @ViewChild(MatSort) sort: MatSort = new MatSort();
  private subscriptions: Subscription[] = []; 
  private clienteCambiadoSubscription: Subscription | undefined;
  

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService
  ) { }



  ngOnInit() {
    this.fetchPagos();
    this.clienteCambiadoSubscription = this.portalcliLogicaService.clienteCambiado$.subscribe(() => {
      this.fetchPagos();
    });

    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isResponsiveMode = window.innerWidth <= 576;
  }

  metodoPagoSeleccionado: string = '';
  tiposPago: string[] = []; 
  mostrarSelectorCuenta: boolean = false;
  cuentaSeleccionada: any = null;
  cuentas: any[] = []; // Datos de cuentas desde la API
  tipoPagoSeleccionado: string = '';

  identificacion: string = '';
  fechaTransferencia: string = '';
  monto: number = 0;
  numeroReferencia: string = '';
  comprobante: any = null;

  sortColumn: string = 'numero'; // Columna de ordenamiento inicial
  sortDirection: string = 'asc';

  actualizarTiposPago() {
    switch (this.metodoPagoSeleccionado) {
      case 'VES':
        this.tiposPago = ['Pago Movil / Transferencia'];
        this.mostrarSelectorCuenta = false;
        this.cuentaSeleccionada = null;
        break;
      case '$':
        this.tiposPago = ['Zelle', 'Transferencia'];
        this.mostrarSelectorCuenta = false;
        this.cuentaSeleccionada = null;
        break;
      case '€':
        this.tiposPago = ['Cuenta Custodia'];
        this.mostrarSelectorCuenta = false;
        this.cuentaSeleccionada = null;
        break;
      default:
        this.tiposPago = [];
        this.mostrarSelectorCuenta = false;
        this.cuentaSeleccionada = null;
    }
  }


  //BUSCA CUENTAS DE BANCO
  cargarCuentas() {
    this.isLoading = true;
    const formData = new FormData();
    const token = this.authService.getToken();

    const apiUrl = `${API_URL}portalcli/buscabanco`;

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    formData.append('fpago', this.metodoPagoSeleccionado);
    formData.append('tpago', this.tipoPagoSeleccionado);

    this.http.post(apiUrl, formData, { headers: headers }).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.cuentas = response.data;
        } else {
          console.error('Error al cargar cuentas:', response);
          this.cuentas = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de la API:', error);
        this.cuentas = [];
      },
    });
  }

  //METODO DE PAGO
  seleccionarMetodoPago(metodo: string) {
    this.resetearCampos();
    this.metodoPagoSeleccionado = metodo;
    this.actualizarTiposPago();
  }

  seleccionarTipoPago(tipo: string) {
    if (this.tipoPagoSeleccionado === tipo) {
      this.tipoPagoSeleccionado = ''; 
    } else {
      this.tipoPagoSeleccionado = tipo;
    }

    if (this.tipoPagoSeleccionado === 'Pago Movil / Transferencia' && this.metodoPagoSeleccionado === 'VES') {
      this.mostrarSelectorCuenta = true;
      this.cargarCuentas();
    } else {
      this.mostrarSelectorCuenta = false;
      this.cuentaSeleccionada = null;
    }
  }

  seleccionarCuenta(event: any) {
    if (event && event.value) {
      this.cuentaSeleccionada = this.cuentas.find(cuenta => cuenta.codbanc == event.value);
    } else {
      this.cuentaSeleccionada = null;
    }
  }

  resetearCampos() {
    this.tipoPagoSeleccionado = '';
    this.cuentaSeleccionada = null;
    this.identificacion = '';
    this.fechaTransferencia = '';
    this.numeroReferencia = '';
    this.comprobante = null;
    this.monto = 0;
    this.metodoPagoSeleccionado = '';
  }

  copiarAlPortapapeles(texto: string) {
    const elementoTemporal = document.createElement('textarea');
    elementoTemporal.value = texto;
    document.body.appendChild(elementoTemporal);
    elementoTemporal.select();
    document.execCommand('copy');
    document.body.removeChild(elementoTemporal);
    Swal.fire({
      text: 'Texto copiado al portapapeles',
      icon: 'success',
      showConfirmButton: false,
      timer: 3000,
      toast: true,
      position: 'bottom-end',
    });
  }

  applyFilters(event: any) {
    this.isLoading = true;
    this.search = event.target.value;
    this.currentPage = 1;
    this.fetchPagos();
  }

  //Cambio de pagina
  pageChanged(event: PageEvent) {
    if (this.showSelectedOnly) {
      // No hacemos nada si estamos mostrando solo seleccionados
      return;
    }
    
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.fetchPagos();
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.fetchPagos();
  }

  //Ordenamiendo de columnas
  sortData(sort: Sort) {
    this.sortColumn = sort.active;
    this.sortDirection = sort.direction;
    if (!sort.active || sort.direction === '') {
      this.fetchPagos();
      return;
    }

    this.sortColumn = sort.active;
    this.sortDirection = sort.direction;
    this.fetchPagos();
  }


  //TRAE LAS CUENTAS POR PAGAR
  fetchPagos() {
    this.isLoading = true;
    const formData = new FormData();
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();

    const apiUrl = `${API_URL}portalcli/facturaspago`;

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const length = this.itemsPerPage;

    formData.append('start', start.toString());
    formData.append('length', length.toString());
    formData.append('codCli', codCli ?? '');
    formData.append('search', this.search ?? '');
    formData.append('sortColumn', this.sortColumn);
    formData.append('sortDirection', this.sortDirection);

    this.http.post(apiUrl, formData, { headers: headers }).subscribe({
      next: (response: any) => {
        this.allPagos = response.data;
        this.totalPages = Math.ceil(parseInt(response.recordsTotal) / this.itemsPerPage);
        this.updatePagedPagos();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de la API:', error);
      },
    });
  }

  //Selector de todas las filas
  selectAll(event: MatCheckboxChange) {
    this.allPagos.forEach(row => {
      const rowId = this.getRowId(row);
      
      if (event.checked) {
        // Convertir a números y asegurar valores válidos
        const saldo = Number(row.saldo) || 0;
        const difc = Number(row.difc) || 0;
        const montoInicial = saldo + difc;

        this.selectedRowsMap[rowId] = {
          selected: true,
          data: {
            tipo_doc: row.tipo_doc,
            numero: row.numero,
            emision: row.emision,
            entregado: row.entregado,
            vence: row.vence,
            dias: row.dias,
            monto: row.monto,
            impuesto: row.impuesto,
            reteiva: row.reteiva,
            saldo: row.saldo || 0,
            ppago: row.ppago || 0,
            difc: row.difc || 0,
            cdolar: row.cdolar,
            monto_dolar: row.monto / row.cdolar,
            saldo_dolar: (row.saldo - (row.preabono || 0)) / row.cdolar,
            preabono: row.preabono || 0,
            mfactura: row.mfactura            
          },
          montoAPagar: montoInicial
        };
        montoAPagar: montoInicial // Establecer el monto inicial

      } else {
        if (this.selectedRowsMap[rowId]) {
          this.selectedRowsMap[rowId].selected = false;
        }
      }
    });
    
    this.updatePagedPagos();
    this.actualizarMonto();
  }

  saveSelected() {
    const selectedRows = Object.keys(this.selectedRowsMap)
      .filter(key => this.selectedRowsMap[key]);
  }

  //Guarda al momento de seleccionar fila
  getRowId(row: any): string {
    return `${row.tipo_doc}-${row.numero}`;
  }

  //CUANDO SELECCIONAMOS UNA FILA
  toggleRowSelection(row: any): void {
    const rowId = this.getRowId(row);
    
    /* if (this.saldoDisponible <= 0 && !this.selectedRowsMap[rowId]?.selected) {
      Swal.fire('Atención', 'No hay saldo disponible para agregar más facturas', 'warning');
      return;
    }
   */
    if (!this.selectedRowsMap[rowId]) {
      // Convertir a número y asegurar que no sea NaN
      const saldo = Number(row.saldo) || 0;
      const difc = Number(row.difc) || 0;
      const montoMaximo = parseFloat((saldo + difc).toFixed(2));
      
      this.selectedRowsMap[rowId] = {
        selected: false,
        data: row,
        
        montoAPagar: 0
      };
    }
  
    const factura = this.selectedRowsMap[rowId];
    
    if (!factura.selected) {
      // Convertir a número y asegurar que no sea NaN
      const saldo = Number(factura.data.saldo) || 0;
      const difc = Number(factura.data.difc) || 0;
      //const montoMaximo = parseFloat((saldo + difc).toFixed(2));
      //const montoAPagar = parseFloat((Math.min(montoMaximo, this.saldoDisponible)).toFixed(2));
      const montoAPagar = parseFloat((saldo + difc).toFixed(2));

      factura.selected = true;
      factura.montoAPagar = montoAPagar;
      this.saldoDisponible = parseFloat((this.saldoDisponible - montoAPagar).toFixed(2));
    } else {
      this.saldoDisponible = parseFloat((this.saldoDisponible + Number(factura.montoAPagar || 0)).toFixed(2));
      factura.selected = false;
      factura.montoAPagar = 0;
    }

    this.updatePagedPagos();
    this.actualizarFacturasACancelar();
    this.actualizarMonto();
  }

  // Verifica si la factura está pagada completamente
  isFacturaPagadaCompleta(key: string): boolean {
    const factura = this.selectedRowsMap[key];
    const saldo = Number(factura.data.saldo) || 0;
    const difc = Number(factura.data.difc) || 0;
    const totalFactura = saldo + difc;
    const montoAPagar = Number(factura.montoAPagar) || 0;
    
    return montoAPagar >= totalFactura - 0.01; // Margen de 0.01 por redondeo
  }

  // Calcula el porcentaje pagado de la factura
  getPorcentajePagado(key: string): number {
    const factura = this.selectedRowsMap[key];
    const saldo = Number(factura.data.saldo) || 0;
    const difc = Number(factura.data.difc) || 0;
    const totalFactura = saldo + difc;
    const montoAPagar = Number(factura.montoAPagar) || 0;
    
    if (totalFactura <= 0) return 100;
    return Math.min(100, Math.round((montoAPagar / totalFactura) * 100));
  }

    getSelectedKeys(): string[] {
      return Object.keys(this.selectedRowsMap).filter(key => this.selectedRowsMap[key].selected);
    }
    
    // Validar el monto de una factura específica
    validarMontoFactura(key: string): void {
      const factura = this.selectedRowsMap[key];
      const maxMonto = factura.data.saldo + factura.data.difc;
      factura.montoAPagar = parseFloat(factura.montoAPagar.toFixed(2));
      if (factura.montoAPagar! > maxMonto) {
        factura.montoAPagar = maxMonto;
        Swal.fire({
          title: 'Atención',
          text: `No puede pagar más de ${maxMonto.toFixed(2)} por esta factura`,
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
      }
      
      if (factura.montoAPagar! <= 0) {
        factura.montoAPagar = 0.01;
      }
      
      this.actualizarMonto();
    }

  //CAMBIA DE PAGINA
  updatePagedPagos() {
    this.pagedPagos = this.allPagos.map(row => {
      const rowId = this.getRowId(row);
      return {
        ...row,
        selected: this.selectedRowsMap[rowId]?.selected || false
      };
    });
    this.filterSelectedRows();
  }

  //Muestra solo las facturas seleccionadas con el chulito
  toggleShowSelectedOnly(event: MatCheckboxChange) {
    this.isLoading = true;
    this.showSelectedOnly = event.checked;
    
    if (this.showSelectedOnly) {
      this.currentPage = 1; // Resetear a la primera página
    }
    
    this.filterSelectedRows();
    this.isLoading = false;
  }

  //Filtra las filas seleccionadas
  filterSelectedRows() {
    if (this.showSelectedOnly) {
      // Mostrar solo las filas seleccionadas con todos sus campos
      this.pagedPagos = Object.keys(this.selectedRowsMap)
        .filter(key => this.selectedRowsMap[key]?.selected)
        .map(key => {
          const factura = this.selectedRowsMap[key];
          return {
            ...factura.data,
            selected: true
          };
        });
    } else {
      // Mostrar todas las filas con paginación normal
      this.pagedPagos = this.allPagos.map(row => {
        const rowId = this.getRowId(row);
        return {
          ...row,
          selected: this.selectedRowsMap[rowId]?.selected || false
        };
      });
    }
    
    this.updateSelectedCount();
    this.actualizarFacturasACancelar();
    this.actualizarMonto();
  }

  updateSelectedCount() {
    this.selectedCount = Object.keys(this.selectedRowsMap)
      .filter(key => this.selectedRowsMap[key]?.selected).length;
  }


  // Actualizar el campo de texto aquí
  actualizarFacturasACancelar() {
    const facturas = Object.keys(this.selectedRowsMap)
      .filter(key => this.selectedRowsMap[key]?.selected)
      .map(key => key.replace('-', ''));
    this.facturasACancelar = 'PAGA: ' + facturas.join(', ');
  }
  montoAPagar: number = 0;

  //ACTUALIZA EL MONTO EN BASE A LAS FILAS SELECCIONADAS
  actualizarMonto(): void {
    let totalMonto = 0;
    let totalMontod = 0;

    Object.keys(this.selectedRowsMap).forEach(key => {
      if (!this.selectedRowsMap[key]?.selected) return;

      const factura = this.selectedRowsMap[key];
      console.log(factura)

      const monto = parseFloat((factura.montoAPagar || 0).toFixed(2)); 
      const montod = this.metodoPagoSeleccionado === '$' ? parseFloat((monto / factura.data.cdolar).toFixed(2)) : 0;      
      totalMonto += monto;
      totalMontod += montod;
    });
    
    this.montoACancelar = parseFloat(totalMonto.toFixed(2));
    this.montoACancelard = parseFloat(totalMontod.toFixed(2));
    // Validación de consistencia
    /* if (totalMonto > this.montoOriginalPagado) {
      console.error('Error: El monto aplicado excede el saldo original');
      this.recalcularMontos();
    } */
  }


  // Este método para validar el monto
  validarMontoAPagar() {
    const maxMonto = this.metodoPagoSeleccionado === 'VES' ? this.montoACancelar : this.montoACancelard;
    
    if (this.montoAPagar > maxMonto) {
      this.montoAPagar = maxMonto;
      Swal.fire({
        title: 'Atención',
        text: `No puede cancelar más de ${maxMonto.toFixed(2)} ${this.metodoPagoSeleccionado === 'VES' ? 'Bs' : '$'}`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
    
    if (this.montoAPagar <= 0) {
      this.montoAPagar = 0.01;
    }
  }

  formatearMonto(monto: number): string {
    return monto.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

comprobanteFile: File | null = null;
comprobanteNombre: string = '';
comprobanteError: string = '';
maxFileSize = 5 * 1024 * 1024;
allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

//importa el comprobante del pago
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Validar tipo de archivo
    if (!this.allowedTypes.includes(file.type)) {
      this.comprobanteError = 'Formato de archivo no permitido';
      this.comprobanteFile = null;
      this.comprobanteNombre = '';
      return;
    }
    
    // Validar tamaño
    if (file.size > this.maxFileSize) {
      this.comprobanteError = 'El archivo excede el tamaño máximo de 5MB';
      this.comprobanteFile = null;
      this.comprobanteNombre = '';
      return;
    }
    
    // Si pasa las validaciones
    this.comprobanteError = '';
    this.comprobanteFile = file;
    this.comprobanteNombre = file.name;
  }
}

//ENVIA PAGO
  async enviapago() {
    this.isLoading = true; 
    const codCli = this.authService.getCodCli();
  
    // Validar datos obligatorios
    if (!this.numeroReferencia || !this.montoACancelar) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios', 'error');
      this.isLoading = false;
      return;
    }
  
    // Validar archivo si es requerido
    if (this.cuentaSeleccionada && !this.archivoComprobante) {
      Swal.fire('Error', 'Debe adjuntar el comprobante de pago', 'error');
      this.isLoading = false;
      return;
    }
  
    // Obtener facturas seleccionadas
    const facturasSeleccionadas = Object.keys(this.selectedRowsMap)
      .filter(key => this.selectedRowsMap[key]?.selected)
      .map(key => {
        const facturaData = this.selectedRowsMap[key].data;
        const montoAPagar = this.selectedRowsMap[key].montoAPagar ?? (facturaData.saldo + facturaData.difc);
        return {
          ...facturaData,
          montoAPagar: montoAPagar
        };
      });
  
    if (facturasSeleccionadas.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos una factura', 'error');
      this.isLoading = false;
      return;
    }
  
    // Mostrar confirmación
    const confirmResult = await this.mostrarConfirmacionPago(facturasSeleccionadas);
    if (!confirmResult.isConfirmed) {
      this.isLoading = false;
      return;
    }
  
    // Registrar el pago primero
    const resultadoPago = await this.registrarPago(facturasSeleccionadas, codCli);
    
    if (resultadoPago?.success && this.archivoComprobante) {
      // Si el pago se registró correctamente y hay archivo, enviarlo
      await this.enviarComprobante(resultadoPago.idPago);
    }
  
    this.isLoading = false;
  }
  
  // Función para mostrar la confirmación del pago
  private async mostrarConfirmacionPago(facturasSeleccionadas: any[]): Promise<any> {
    const simboloMoneda = this.metodoPagoSeleccionado === 'VES' ? 'Bs ' : '$ ';
    const totalFormateado = simboloMoneda + this.montoAPagar.toFixed(2);
    
    const detallesFacturas = facturasSeleccionadas.map(f => {
      const montoFormateado = simboloMoneda + f.montoAPagar.toFixed(2);
      return `
        <div class="d-flex justify-content-between border-bottom pb-1 mb-1">
          <span>${f.tipo_doc}-${f.numero}</span>
          <span>${montoFormateado}</span>
        </div>
      `;
    }).join('');
  
    return await Swal.fire({
      title: '¿Desea enviar el pago?',
      html: `
        <div class="text-left">
          <p>Total a pagar: <strong>${totalFormateado}</strong></p>
          <p>Facturas seleccionadas: ${facturasSeleccionadas.length}</p>
          <div class="mt-2" style="max-height: 200px; overflow-y: auto;">
            ${detallesFacturas}
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });
  }
  
  // Función para registrar el pago (sin el archivo)
  private async registrarPago(facturasSeleccionadas: any[], codCli: string | null): Promise<any> {
    const formData = new FormData();
    const token = this.authService.getToken();
  
    // Datos generales del pago
    formData.append('codCli', codCli ?? '');
    formData.append('descripcion', this.facturasACancelar);
    formData.append('referencia', this.numeroReferencia);
    formData.append('monto', this.montoACancelar.toString());
    
    // Datos del banco si existe cuenta seleccionada
    if (this.cuentaSeleccionada) {
      formData.append('codigo_banco', this.cuentaSeleccionada.codbanc);
      formData.append('banco', this.cuentaSeleccionada.banco);
      formData.append('cuenta', this.cuentaSeleccionada.numcuent);
    }
  
    // Tipo de pago y moneda
    formData.append('tipo_pago', this.tipoPagoSeleccionado);
    formData.append('moneda', this.metodoPagoSeleccionado);
  
    // Agregar el detalle de cada factura
    facturasSeleccionadas.forEach((factura, index) => {
      formData.append(`facturas[${index}][tipo_doc]`, factura.tipo_doc);
      formData.append(`facturas[${index}][numero]`, factura.numero);
      formData.append(`facturas[${index}][monto]`, factura.monto.toString());
      formData.append(`facturas[${index}][abono]`, factura.montoAPagar.toString());
      formData.append(`facturas[${index}][ppago]`, factura.ppago?.toString() || '0');
      formData.append(`facturas[${index}][difc]`, factura.difc?.toString() || '0');
      formData.append(`facturas[${index}][cdolar]`, factura.cdolar?.toString() || '1');
      formData.append(`facturas[${index}][preabono]`, factura.preabono?.toString() || '0');
    });
  
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    
    try {
      Swal.showLoading();
      const response: any = await this.http.post(`${API_URL}portalcli/enviapago`, formData, { headers }).toPromise();
      
      if (response?.status) {
        const resumenPago = `
          <p>${response.mensaje}</p>
          <div class="mt-3 text-left">
            <p><strong>Referencia:</strong> ${this.numeroReferencia}</p>
            <p><strong>Total pagado:</strong> ${this.metodoPagoSeleccionado === 'VES' ? 'Bs ' : '$ '}${this.montoAPagar.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
          </div>
        `;
        
        Swal.fire({
          title: 'Pago registrado',
          html: resumenPago,
          icon: 'success'
        });
        
        this.resetearCampos();
        this.fetchPagos();
        
        return { success: true, idPago: response.idPago };
      } else {
        Swal.fire('Error', response?.mensaje || 'Ocurrió un error al procesar el pago', 'error');
        return { success: false };
      }
    } catch (error) {
      console.error('Error de la API:', error);
      Swal.fire('Error', 'Ocurrió un error al enviar el pago', 'error');
      return { success: false };
    }
  }

  
archivoComprobante: File | null = null;

handleFileUpload(event: any) {
  const file = event.target.files[0];
  
  // Validaciones
  if (!file) {
    this.archivoComprobante = null;
    return;
  }

  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire('Error', 'El archivo no debe exceder los 5MB', 'error');
    event.target.value = ''; // Limpiar input
    this.archivoComprobante = null;
    return;
  }

  // Validar tipo de archivo
  const validExtensions = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!validExtensions.includes(file.type)) {
    Swal.fire('Error', 'Formato de archivo no válido. Use JPG, PNG o PDF', 'error');
    event.target.value = ''; // Limpiar input
    this.archivoComprobante = null;
    return;
  }

  // Si pasa las validaciones, almacenar el archivo
  this.archivoComprobante = file;
  Swal.fire('Éxito', 'Archivo cargado correctamente', 'success');
}

private async enviarComprobante(idPago: string): Promise<void> {
  if (!this.archivoComprobante) return;

  const formData = new FormData();
  const token = this.authService.getToken();

  formData.append('comprobante', this.archivoComprobante);
  formData.append('idPago', idPago);
    
  const headers = new HttpHeaders({
    'X-Auth-Token': `${token}`
  });
  
  
  try {
    const response: any = await this.http.post(`${API_URL}portalcli/guardar_comprobante`, formData, { headers }).toPromise();
    if (response?.success) {
      Swal.fire('Éxito', 'Comprobante subido correctamente', 'success');
    } else {
      Swal.fire('Advertencia', 'El pago se registró pero hubo un error al subir el comprobante', 'warning');
    }
  } catch (error) {
    console.error('Error al subir comprobante:', error);
    Swal.fire('Advertencia', 'El pago se registró pero hubo un error al subir el comprobante', 'warning');
  }
}

//LOGICA PARA DISTRIBUIR EL MONTO TRANSFERIDO POR EL CLIENTE

// Actualiza cuando cambia el monto pagado
actualizarSaldoDisponible(): void {
  if (this.montoPagado <= 0) {
    this.montoPagado = 0.01;
  }
  
  // Resetear todo al cambiar el monto principal
  this.montoOriginalPagado = this.montoPagado;
  this.saldoDisponible = this.montoPagado;
  
  // Limpiar selecciones existentes
  Object.keys(this.selectedRowsMap).forEach(key => {
    this.selectedRowsMap[key].selected = false;
    this.selectedRowsMap[key].montoAPagar = 0;
  });
  
  this.updatePagedPagos();
  this.actualizarFacturasACancelar();
}

distribuirSaldoAFacturas(): void {
  this.saldoDisponible = this.montoOriginalPagado;
  
  // Primero, resetear todos los montos a pagar
  Object.keys(this.selectedRowsMap).forEach(key => {
    if (this.selectedRowsMap[key].selected) {
      this.selectedRowsMap[key].montoAPagar = 0;
    }
  });
  
  // Luego, distribuir el saldo
  Object.keys(this.selectedRowsMap).forEach(key => {
    if (this.selectedRowsMap[key].selected && this.saldoDisponible > 0) {
      const factura = this.selectedRowsMap[key].data;
      const montoMaximo = factura.saldo + factura.difc;
      const montoAPagar = Math.min(montoMaximo, this.saldoDisponible);
      
      this.selectedRowsMap[key].montoAPagar = montoAPagar;
      this.saldoDisponible -= montoAPagar;
    }
  });
  
  this.actualizarMonto();
}

recalcularMontos(): void {
  let saldoRestante = this.montoOriginalPagado;
  
  Object.keys(this.selectedRowsMap).forEach(key => {
    if (this.selectedRowsMap[key].selected) {
      const factura = this.selectedRowsMap[key];
      const montoMaximo = factura.data.saldo + factura.data.difc;
      const montoAPagar = Math.min(montoMaximo, saldoRestante);
      
      factura.montoAPagar = montoAPagar;
      saldoRestante -= montoAPagar;
      
      // Si no queda saldo, deseleccionar las siguientes
      if (saldoRestante <= 0) {
        factura.selected = false;
        factura.montoAPagar = 0;
        saldoRestante = 0;
      }
    }
  });
  
  this.saldoDisponible = saldoRestante;
  this.updatePagedPagos();
  this.actualizarMonto();
}

}