import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { MatRadioModule } from '@angular/material/radio';
import Swal from 'sweetalert2';

import { API_URL } from './../../app.config';
import { API_URLINTER } from './../../app.config';

import { AuthService } from './../../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Reclamo {
  numero: string;
  factura: string;
  fecha: string;
  cod_cli: string;
  nombre_cliente: string;
  almacen: string;
  total_reclamado: number;
  observaciones: string;
  estado: string;
}

interface DetalleReclamo {
  numero: string;
  factura: string;
  codigo: string;
  desca: string;
  cana: number;
  preca: number;
  precad: number;
  tota: number;
  totad: number;
  motivo: string;
  lote: string;
  flote: string | null;
  id: number;
}


interface Factura {
  id: string;
  numero: string;
  fecha: Date;
  cliente: string;
  almacen: string;
  dolarcambio: string;
  almacendes: string;
  total: number;
}

interface ProductoFactura {
  id: number;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  preciod: number;
  lote: string;
  flote?: string; 
  cantidadReclamar: number;
  motivoReclamo: string;
  motivoId?: string;
  observacion: string;
  subtotal?: number;
}

@Component({
  selector: 'app-reclamos-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatTooltipModule,
    MatRadioModule,
    NavBarComponent,
    SideBarComponent,
    FooterComponent
  ],
  templateUrl: './reclamos-page.component.html',
  styleUrl: './reclamos-page.component.scss'
})
export class ReclamosPageComponent implements OnInit {
  // Stepper
  isLinear = true;
  
  // Formularios
  facturaForm: FormGroup;
  productosForm: FormGroup;
  resumenForm: FormGroup;

  // Para la tabla de productos seleccionados
  displayedColumns: string[] = ['seleccion', 'codigo', 'nombre', 'lote', 'vencimiento', 'cantidadComprada', 'cantidadReclamar', 'motivo', 'acciones'];
  productosSeleccionados: ProductoFactura[] = [];

  // Estado
  facturaSeleccionada: Factura | null = null;
  totalReclamado = 0;
  totalReclamadoD = 0;

  productosReclamadosCount = 0;
  productosFactura: ProductoFactura[] = [];
  motivosReclamo: any[] = [];

  // Variables nuevas
  isLoadingMotivos = false;
  isLoadingFactura = false;
  facturaEncontrada: any = null;
  errorFactura = '';
  numeroFacturaActual = '';
  isLoadingProductos = false; 

  reclamosAnteriores: Reclamo[] = [];
  isLoadingReclamos = false;
  mostrarReclamos = false;
  
  // Variables para detalle de reclamo
  detalleReclamo: DetalleReclamo[] = [];
  reclamoSeleccionado: Reclamo | null = null;
  isLoadingDetalle = false;
  mostrarDetalle = false;

  // Variables para subir foto
  archivoSeleccionado: File | null = null;
  nombreArchivo = '';
  isLoadingArchivo = false;
  maxFileSize = 5 * 1024 * 1024; // 5MB en bytes
  archivosPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    // Paso 1: Selección de factura
    this.facturaForm = this.fb.group({
      numeroFactura: ['', [Validators.required, Validators.minLength(3)]] 
    });

    // Paso 2: Productos a reclamar
    this.productosForm = this.fb.group({
      productos: this.fb.array([])
    });

    // Paso 3: Resumen y observaciones
    this.resumenForm = this.fb.group({
      observacionesGenerales: ['', [Validators.required, Validators.minLength(10)]],
      archivoReclamo: [null] 
    });
  }

    ngOnInit(): void {
      // Inicializar con datos de ejemplo
      //this.inicializarProductosForm();
      this.cargarReclamosAnteriores();
    }

  // Método para cargar reclamos anteriores
  cargarReclamosAnteriores(): void {
    if (this.isLoadingReclamos) return;
    
    this.isLoadingReclamos = true;
    
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();
    
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const formData = new FormData();
    formData.append('cod_cli', codCli ?? '');

    const apiUrl = `${API_URLINTER}portalcli/ultimos_reclamos`;
    
    this.http.post<{
      status: boolean, 
      data: any[],
      message?: string
    }>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.isLoadingReclamos = false;
        
        if (response.status && response.data && response.data.length > 0) {
          this.reclamosAnteriores = response.data.map(item => ({
            numero: item.numero || '',
            factura: item.factura || '',
            fecha: item.fecha || '',
            cod_cli: item.cod_cli || '',
            nombre_cliente: item.nombre_cliente || '',
            almacen: item.almacen || '',
            total_reclamado: this.parseNumber(item.total_reclamado) || 0,
            observaciones: item.observaciones || '',
            estado: item.estado || 'Pendiente'
          }));
        } else {
          // Si no hay reclamos, mostrar array vacío
          this.reclamosAnteriores = [];
        }
      },
      error: (error) => {
        this.isLoadingReclamos = false;
        console.error('Error al cargar reclamos anteriores:', error);
        this.reclamosAnteriores = [];
      }
    });
  }

  // Método para refrescar reclamos
  refrescarReclamos(): void {
    this.cargarReclamosAnteriores();
  }

  // Método para cargar detalle de un reclamo (sin cambios)
  cargarDetalleReclamo(numeroReclamo: string, reclamo: Reclamo): void {
    // Si ya está mostrando el detalle de este reclamo, cerrarlo
    if (this.mostrarDetalle && this.reclamoSeleccionado?.numero === numeroReclamo) {
      this.cerrarDetalle();
      return;
    }
    
    this.isLoadingDetalle = true;
    this.reclamoSeleccionado = reclamo;
    this.mostrarDetalle = true;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const formData = new FormData();
    formData.append('numero_reclamo', numeroReclamo);

    const apiUrl = `${API_URLINTER}portalcli/detalle_reclamo`;
    
    this.http.post<{
      status: boolean, 
      data: any[],
      message?: string
    }>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.isLoadingDetalle = false;
        
        if (response.status && response.data && response.data.length > 0) {
          this.detalleReclamo = response.data.map(item => ({
            numero: item.numero || '',
            factura: item.factura || '',
            codigo: item.codigo || '',
            desca: item.desca || '',
            cana: this.parseNumber(item.cana) || 0,
            preca: this.parseNumber(item.preca) || 0,
            precad: this.parseNumber(item.precad) || 0,
            tota: this.parseNumber(item.tota) || 0,
            totad: this.parseNumber(item.totad) || 0,
            motivo: item.motivo || '',
            lote: item.lote || '',
            flote: item.flote || null,
            id: parseInt(item.id) || 0
          }));
        } else {
          this.detalleReclamo = [];
        }
      },
      error: (error) => {
        this.isLoadingDetalle = false;
        console.error('Error al cargar detalle del reclamo:', error);
        this.detalleReclamo = [];
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el detalle del reclamo',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Método para cerrar el detalle
  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.reclamoSeleccionado = null;
    this.detalleReclamo = [];
  }

  /* onStepChange(event: any): void {
    if (event.selectedIndex === 1 && this.numeroFacturaActual) { 
      // Step 2 es índice 1 - Cargar productos y motivos al entrar
      this.cargarProductosFactura(this.numeroFacturaActual);
      this.cargarMotivosReclamo(); // <-- Agrega esta línea
    } 
    else if (event.selectedIndex === 0) { 
      // Step 1 es índice 0 - Limpiar selecciones al volver
      this.productosSeleccionados = [];
      this.totalReclamado = 0;
      this.productosReclamadosCount = 0;
    }
  } */

    // En el onStepChange, puedes limpiar también los reclamos
  onStepChange(event: any): void {
    if (event.selectedIndex === 1 && this.numeroFacturaActual) { 
      // Step 2 es índice 1
      this.cargarProductosFactura(this.numeroFacturaActual);
      this.cargarMotivosReclamo();
    } 
    else if (event.selectedIndex === 0) { 
      // Step 1 es índice 0
      this.productosSeleccionados = [];
      this.totalReclamado = 0;
      this.totalReclamadoD = 0;
      this.productosReclamadosCount = 0;
      // Opcional: cerrar detalles de reclamos si están abiertos
      this.cerrarDetalle();
    }
  }

  // Método para buscar factura en API
  buscarFactura(): void {
    const numeroFactura = this.facturaForm.get('numeroFactura')?.value;
    
    if (!numeroFactura || numeroFactura.length < 3) {
      return;
    }

    this.isLoadingFactura = true;
    this.facturaEncontrada = null;
    this.errorFactura = '';

    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();
    
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const formData = new FormData();
    formData.append('factura', numeroFactura);
    formData.append('codCli', codCli ?? '');

    // NOTA: Cambia esta URL por la correcta de tu API
    const apiUrl = `${API_URLINTER}portalcli/buscafacrecla`;
    
    this.http.post<{
      status: boolean, 
      hay: boolean, 
      message: string,
      factura?: any
    }>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.isLoadingFactura = false;
        
        if (response.status && response.hay && response.factura) {
          // Factura encontrada y válida
          Swal.fire({
            icon: 'success',
            title: 'Factura encontrada',
            text: response.message || `Factura ${numeroFactura} cargada correctamente`,
            timer: 2000,
            showConfirmButton: false
          });
          
          // Transformar datos de la API al formato que espera tu componente
          this.facturaEncontrada = {
            numero: response.factura.numero || numeroFactura,
            fecha: response.factura.fecha ? new Date(response.factura.fecha) : new Date(),
            cliente: this.authService.getNombre() || 'Cliente', // Obtener del AuthService si está disponible
            total: this.parseNumber(response.factura.totalgd) || 0,
            dolarcambio: this.parseNumber(response.factura.dolarcambio) || 0,
            almacen: response.factura.almacen,
            almacendes: response.factura.almacendes,
            cod_cli: response.factura.cod_cli
          };
          
          //this.cargarProductosFactura(numeroFactura);
          this.numeroFacturaActual = numeroFactura
        } else {
          // Factura no encontrada o inválida
          this.errorFactura = response.message || `No se encontró la factura "${numeroFactura}"`;
          
          Swal.fire({
            icon: 'error',
            title: 'Factura no válida',
            text: response.message || `La factura ${numeroFactura} no es válida para reclamos`,
            confirmButtonColor: '#d33'
          });
        }
      },
      error: (error) => {
        this.isLoadingFactura = false;
        this.errorFactura = 'Error al conectar con el servidor';
        console.error('Error al buscar factura:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // Agrega este método de utilidad para parsear números
  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    // Si ya es número, devolverlo
    if (typeof value === 'number') {
      return value;
    }
    
    // Si es string, convertir
    if (typeof value === 'string') {
      // Remover comas, puntos (dependiendo del formato)
      const cleanValue = value.replace(/[^0-9.-]+/g, '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }

  //******************* */
  // Método para cargar productos de la factura
  cargarProductosFactura(numeroFactura: string): void {
    if (!numeroFactura) return;
    
    this.isLoadingProductos = true
    this.productosFactura = [];
    
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();
    
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const formData = new FormData();
    formData.append('numero', numeroFactura); // Cambié 'numa' por 'numero' para coincidir con tu query
    formData.append('codCli', codCli ?? '');

    // Ajusta esta URL según tu endpoint
    const apiUrl = `${API_URLINTER}portalcli/productos_factura`;
    
    this.http.post<{
      status: boolean, 
      data: any, 
      message?: string,
      total?: number
    }>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.isLoadingProductos = false;
        
        // Verifica si data es un objeto o array
        let productosData: any[] = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            // Si es array, úsalo directamente
            productosData = response.data;
          } else {
            // Si es objeto, conviértelo a array
            productosData = [response.data];
          }
        }
        
        if (response.status && productosData.length > 0) {
          // Transformar datos de la API a tu formato
          this.productosFactura = productosData.map((item, index) => ({
            id: parseInt(item.id) || index + 1,
            codigo: item.codigoa || '',
            descripcion: item.desca || '',
            cantidad: this.parseNumber(item.cana || 0),
            precio: this.parseNumber(item.preca || 0),
            preciod: this.parseNumber(item.precad || 0),
            lote: item.lote || '',
            flote: item.flote === '0000-00-00' ? '' : item.flote, // <-- Maneja fechas inválidas
            cantidadReclamar: 0,
            motivoReclamo: '',
            observacion: '',
            subtotal: this.parseNumber(item.cana || 0) * this.parseNumber(item.preca || 0)
          }));
                    
          // Inicializar el formulario de productos
          this.inicializarProductosForm();
        } else {
          console.warn('No se encontraron productos:', response.message);
          Swal.fire({
            icon: 'warning',
            title: 'Sin productos',
            text: response.message || 'No se encontraron productos para esta factura',
            timer: 1500,
            showConfirmButton: false
          });
        }
      },
    });
  }

  // Método para cargar motivos desde API
  cargarMotivosReclamo(): void {
    this.isLoadingMotivos = true;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
  
    const formData = new FormData();
    
    const apiUrl = `${API_URLINTER}portalcli/motivos_reclamo`;
    
    this.http.post<{
      status: boolean, 
      data: any[],
      message?: string
    }>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.isLoadingMotivos = false;
        
        if (response.status && response.data && response.data.length > 0) {
          this.motivosReclamo = response.data.map(item => ({
            id: item.id || '', // <-- Asegurar que tenemos ID
            motivo: item.motivo || '',
          }));          
        } else {
          // Si la API falla, usar motivos por defecto con IDs
          this.motivosReclamo = [
          ];
        }
      },
      error: (error) => {
        this.isLoadingMotivos = false;
        console.error('Error al cargar motivos:', error);
        
        this.motivosReclamo = [
          { id: '1', motivo: 'Producto vencido', descripcion: '' },
          { id: '2', motivo: 'Producto dañado', descripcion: '' },
          { id: '3', motivo: 'Error en lote', descripcion: '' },
          { id: '4', motivo: 'Cantidad incorrecta', descripcion: '' }
        ];
      }
    });
  }
  // Método para verificar si una fecha es futura
  esFechaFutura(fechaString: string): boolean {
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      return fecha > hoy;
    } catch (e) {
      return false;
    }
  }

  // Calcular total reclamado
  calcularTotalReclamado(): number {
    return this.productosSeleccionados.reduce((total, producto) => {
      return total + (producto.cantidadReclamar * producto.precio);
    }, 0);
  }

  calcularTotalReclamadoD(): number {
    return this.productosSeleccionados.reduce((total, producto) => {
      return total + (producto.cantidadReclamar * producto.preciod);
    }, 0);
  }

  // Calcular cantidad total
  calcularCantidadTotal(): number {
    return this.productosSeleccionados.reduce((total, producto) => {
      return total + producto.cantidadReclamar;
    }, 0);
  }

  // Método cuando se cambia manualmente el número
  onNumeroFacturaChange(): void {
    this.facturaEncontrada = null;
    this.errorFactura = '';
  }


  // Actualiza el método inicializarProductosForm para usar productosFactura
  inicializarProductosForm(): void {
    const productosArray = this.productosForm.get('productos') as FormArray;
    productosArray.clear();
    
    this.productosFactura.forEach(producto => {
      productosArray.push(this.fb.group({
        seleccionado: [false],
        id: [producto.id],
        codigo: [producto.codigo],
        descripcion: [producto.descripcion],
        cantidadComprada: [producto.cantidad],
        cantidadReclamar: [0, [Validators.min(0), Validators.max(producto.cantidad)]],
        precio: [producto.precio],
        lote: [producto.lote],
        flote: [producto.flote],
        motivoId: [''], // Para el ID (lo que selecciona el usuario)
        motivoReclamo: [''], // Para el texto (se llena automáticamente)
        observacion: ['']
      }));
    });
  }


  // Seleccionar/deseleccionar producto
  toggleProducto(producto: ProductoFactura, index: number): void {
    const productosArray = this.productosForm.get('productos') as FormArray;
    const productoForm = productosArray.at(index);
    const seleccionado = productoForm.get('seleccionado')?.value;
    
    if (seleccionado) {
      // Cuando se selecciona, HACER requerido el motivo
      productoForm.get('motivoReclamo')?.setValidators([Validators.required]);
      productoForm.get('cantidadReclamar')?.setValidators([
        Validators.required, 
        Validators.min(1), 
        Validators.max(producto.cantidad)
      ]);
    } else {
      // Cuando se deselecciona, REMOVER requerido
      productoForm.get('motivoReclamo')?.clearValidators();
      productoForm.get('cantidadReclamar')?.clearValidators();
      productoForm.get('cantidadReclamar')?.setValidators([
        Validators.min(0), 
        Validators.max(producto.cantidad)
      ]);
      
      // Resetear valores
      productoForm.get('cantidadReclamar')?.setValue(0);
      productoForm.get('motivoReclamo')?.setValue('');
      productoForm.get('motivoId')?.setValue(''); // <-- AÑADE ESTA LÍNEA
    }
    
    // Actualizar estado de validación
    productoForm.get('motivoReclamo')?.updateValueAndValidity();
    productoForm.get('cantidadReclamar')?.updateValueAndValidity();
    
    // Lógica de productosSeleccionados
    if (seleccionado) {
      const cantidadReclamar = productoForm.get('cantidadReclamar')?.value || 0;
      const motivoReclamo = productoForm.get('motivoReclamo')?.value || '';
      const motivoId = productoForm.get('motivoId')?.value || ''; // <-- OBTENER motivoId DEL FORMULARIO
      
      if (!this.productosSeleccionados.find(p => p.id === producto.id)) {
        this.productosSeleccionados.push({
          ...producto,
          cantidadReclamar: cantidadReclamar,
          motivoReclamo: motivoReclamo,
          motivoId: motivoId // <-- AÑADIR motivoId AQUÍ (LÍNEA CLAVE)
        });
      }
    } else {
      this.productosSeleccionados = this.productosSeleccionados.filter(p => p.id !== producto.id);
    }
    
    this.calcularTotales();
  }

  // Remover producto del reclamo
  removerProducto(productoId: number): void {
    this.productosSeleccionados = this.productosSeleccionados.filter(p => p.id !== productoId);
    
    const productosArray = this.productosForm.get('productos') as FormArray;
    const index = this.productosFactura.findIndex(p => p.id === productoId);
    
    if (index >= 0) {
      const productoForm = productosArray.at(index);
      if (productoForm) {
        productoForm.get('seleccionado')?.setValue(false); // Esto es clave
      }
    }
    
    this.calcularTotales();
  }

  // Actualizar cantidad a reclamar
  actualizarCantidad(producto: ProductoFactura, index: number, event: any): void {
    const cantidadInput = event.target.value;
    const cantidadMaxima = producto.cantidad;
    
    // Validar que no sea mayor a la cantidad de la factura
    let cantidadValida = cantidadInput;
    if (Number(cantidadInput) > cantidadMaxima) {
      cantidadValida = cantidadMaxima;
      
      // Mostrar alerta
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad excedida',
        text: `La cantidad no puede ser mayor a ${cantidadMaxima} (cantidad facturada)`,
        timer: 2000,
        showConfirmButton: false
      });
    }
    
    const productosArray = this.productosForm.get('productos') as FormArray;
    const productoForm = productosArray.at(index);
    
    // Actualizar en el formulario
    productoForm.get('cantidadReclamar')?.setValue(cantidadValida);
    
    // Actualizar en productos seleccionados
    const productoSeleccionado = this.productosSeleccionados.find(p => p.id === producto.id);
    if (productoSeleccionado) {
      productoSeleccionado.cantidadReclamar = Number(cantidadValida);
    }
    
    this.calcularTotales();
  }
  

  //Si un producto esta listo para enviarse a reclamo
  productoCompleto(productoId: number): boolean {
    const producto = this.productosSeleccionados.find(p => p.id === productoId);
    if (!producto) return false;
    
    return producto.cantidadReclamar > 0 && 
           producto.motivoReclamo !== '' && 
           producto.motivoReclamo !== null;
  }

    // Actualizar motivo
  actualizarMotivo(producto: ProductoFactura, index: number, event: any): void {
    const motivoId = event.value; // Es el ID seleccionado
    console.log('Motivo ID seleccionado:', motivoId);
    
    const productosArray = this.productosForm.get('productos') as FormArray;
    const productoForm = productosArray.at(index);
    
    // Encontrar el motivo completo por ID
    const motivoCompleto = this.motivosReclamo.find(m => m.id === motivoId);
    
    if (motivoCompleto) {
      // Guardar ID en motivoId y texto en motivoReclamo
      productoForm.get('motivoId')?.setValue(motivoCompleto.id);
      productoForm.get('motivoReclamo')?.setValue(motivoCompleto.motivo);
      
      // Actualizar en productos seleccionados
      const productoSeleccionado = this.productosSeleccionados.find(p => p.id === producto.id);
      if (productoSeleccionado) {
        productoSeleccionado.motivoReclamo = motivoCompleto.motivo;
        productoSeleccionado.motivoId = motivoCompleto.id;
      }
    }
    
    this.calcularTotales();
  }

  // Calcular totales
  calcularTotales(): void {
    this.totalReclamado = this.productosSeleccionados.reduce((total, producto) => {
      return total + (producto.cantidadReclamar * producto.precio);
    }, 0);

    this.totalReclamadoD = this.productosSeleccionados.reduce((totald, producto) => {
      return totald + (producto.cantidadReclamar * producto.preciod);
    }, 0);
    
    this.productosReclamadosCount = this.productosSeleccionados.length;
  }

  //Revisamos si hay productos seleccionados con la informacion solicitada para enviar 
  validarReclamo(): boolean {
    // Validar que haya al menos un producto seleccionado
    if (this.productosSeleccionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin productos',
        text: 'Debe seleccionar al menos un producto para reclamar',
        confirmButtonColor: '#d33'
      });
      return false;
    }
    
    // Validar que todos los productos seleccionados tengan cantidad y motivo
    const productosIncompletos = this.productosSeleccionados.filter(p => 
      p.cantidadReclamar <= 0 || !p.motivoReclamo
    );
    
    if (productosIncompletos.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Productos incompletos',
        html: `${productosIncompletos.length} producto(s) no tienen cantidad o motivo especificado`,
        confirmButtonColor: '#d33'
      });
      return false;
    }
    
    return true;
  }
 
    // Método para manejar la selección de archivo
    onFileSelected(event: any): void {
      const file: File = event.target.files[0];
      
      if (!file) return;
      
      // Validar tipo de archivo
      if (!this.archivosPermitidos.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Tipo de archivo no permitido',
          text: 'Solo se permiten archivos JPG, JPEG, PNG o GIF',
          confirmButtonColor: '#d33'
        });
        this.limpiarArchivo();
        return;
      }
      
      // Validar tamaño de archivo
      if (file.size > this.maxFileSize) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo demasiado grande',
          text: 'El archivo no debe exceder los 5MB',
          confirmButtonColor: '#d33'
        });
        this.limpiarArchivo();
        return;
      }
      
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
      
      // Actualizar el control del formulario
      this.resumenForm.patchValue({
        archivoReclamo: file
      });
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Archivo seleccionado',
        text: `${file.name} (${this.formatFileSize(file.size)})`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  
      // Método para formatear tamaño de archivo
   formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Método para limpiar archivo seleccionado
  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.resumenForm.patchValue({
      archivoReclamo: null
    });
    
    // Limpiar input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

   // Modifica el método enviarReclamo para incluir la foto
  // En tu componente TypeScript, actualiza el método enviarReclamo
  async enviarReclamo(): Promise<void> {
    // Primero validar el reclamo
    if (!this.validarReclamo()) {
      return;
    }
    
    // Luego verificar formularios
    if (this.facturaForm.valid && this.resumenForm.valid) {
      // Mostrar confirmación SweetAlert2
      const resultado = await Swal.fire({
        title: '¿Confirmar envío?',
        html: `
          <div style="text-align: left;">
            <p><strong>¿Está seguro de enviar este reclamo?</strong></p>
            <p><strong>Factura:</strong> ${this.facturaEncontrada?.numero}</p>
            <p><strong>Productos a reclamar:</strong> ${this.productosSeleccionados.length}</p>
            <p><strong>Total a reclamar:</strong> $${this.totalReclamado.toFixed(2)}</p>
            <p class="text-muted" style="font-size: 0.9em;">
              <i class="fas fa-info-circle"></i> Esta acción no se puede deshacer
            </p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, enviar reclamo',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        allowOutsideClick: false
      });
      
      // Si el usuario cancela, salir
      if (!resultado.isConfirmed) {
        Swal.fire({
          title: 'Cancelado',
          text: 'El reclamo no fue enviado',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
      
      // Deshabilitar botón mientras se procesa
      const enviarBtn = document.querySelector('button[color="primary"]') as HTMLButtonElement;
      if (enviarBtn) enviarBtn.disabled = true;
      
      try {
        // 1. Enviar el reclamo
        const numeroReclamo = await this.enviarReclamoAPI();
        
        if (numeroReclamo) {
          // 2. Si hay archivo, subirlo
          if (this.archivoSeleccionado) {
            await this.subirArchivoReclamo(numeroReclamo);
          }
        }
      } finally {
        // Rehabilitar botón si algo falló
        if (enviarBtn) enviarBtn.disabled = false;
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonColor: '#d33'
      });
    }
  }

  // Método para subir el archivo
  subirArchivoReclamo(numeroReclamo: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.archivoSeleccionado || !numeroReclamo) {
        resolve(true); // No hay archivo, continuar
        return;
      }
      
      this.isLoadingArchivo = true;
      
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        'X-Auth-Token': `${token}`
      });
      
      const formData = new FormData();
      formData.append('numero_reclamo', numeroReclamo);
      formData.append('foto_reclamo', this.archivoSeleccionado);
      
      const apiUrl = `${API_URLINTER}portalcli/guardar_foto_reclamo`;
      
      this.http.post<{
        success: boolean,
        message: string,
        filename?: string
      }>(apiUrl, formData, { headers }).subscribe({
        next: (response) => {
          this.isLoadingArchivo = false;
          
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Foto guardada',
              text: response.message,
              timer: 2000,
              showConfirmButton: false
            });
            resolve(true);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al subir foto',
              text: response.message || 'No se pudo guardar la foto del reclamo',
              confirmButtonColor: '#d33'
            });
            resolve(false);
          }
        },
        error: (error) => {
          this.isLoadingArchivo = false;
          console.error('Error al subir foto:', error);
          
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo subir la foto',
            confirmButtonColor: '#d33'
          });
          resolve(false);
        }
      });
    });
  }


  // Modifica enviarReclamoAPI para devolver el número de reclamo
  private async enviarReclamoAPI(): Promise<string | null> {
    return new Promise((resolve) => {
      const token = this.authService.getToken();
      const codCli = this.authService.getCodCli();
      const nombreCliente = this.authService.getNombre();
      
      const headers = new HttpHeaders({
        'X-Auth-Token': `${token}`
      });
    
      // Crear FormData
      const formData = new FormData();
      
      // Datos de la factura para tabla RECLA
      formData.append('factura_numero', this.facturaEncontrada.numero);
      formData.append('cod_cli', this.facturaEncontrada.cod_cli || codCli || '');
      formData.append('nombre_cliente', nombreCliente || this.facturaEncontrada.cliente || '');
      formData.append('almacen', this.facturaEncontrada.almacen);
      formData.append('total_reclamado', this.totalReclamado.toString());
      formData.append('observaciones', this.resumenForm.get('observacionesGenerales')?.value || '');
      
      // Agregar productos para tabla ITRECLA
      const productosFormateados = this.productosSeleccionados.map(p => {
        return {
          codigo: p.codigo,
          descripcion: p.descripcion,
          cantidad_facturada: p.cantidad,
          cantidad_reclamada: p.cantidadReclamar,
          precio: p.precio,
          lote: p.lote,
          flote: p.flote,
          motivo_id: p.motivoId,
          subtotal: p.cantidadReclamar * p.precio
        };
      });
      
      formData.append('productos', JSON.stringify(productosFormateados));
      
      const apiUrl = `${API_URLINTER}portalcli/crear_reclamo`;
      
      this.http.post<{status: boolean, message: string, numero_reclamo?: string, id_reclamo?: number}>(
        apiUrl, 
        formData, 
        { headers }
      ).subscribe({
        next: (response) => {
          if (response.status) {
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '¡Reclamo enviado!',
              html: `
                <div style="text-align: left;">
                  <p><strong>Número de Reclamo:</strong> ${response.numero_reclamo}</p>
                  <p><strong>Factura:</strong> ${this.facturaEncontrada.numero}</p>
                  <p><strong>Total Reclamado:</strong> $${this.totalReclamado.toFixed(2)}</p>
                  <p><strong>Productos:</strong> ${this.productosSeleccionados.length}</p>
                </div>
              `,
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#6cc32c'
            }).then(() => {
              this.resetFormCompleto();
              window.location.reload();
            });
            
            resolve(response.numero_reclamo || null);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al enviar',
              text: response.message || 'No se pudo registrar el reclamo',
              confirmButtonColor: '#d33'
            });
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Error al enviar reclamo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            confirmButtonColor: '#d33'
          });
          resolve(null);
        }
      });
    });
  }


  // Enviar reclamo
  /* enviarReclamo(): void {
    // Primero validar el reclamo
    if (!this.validarReclamo()) {
      return;
    }
    
    // Luego verificar formularios
    if (this.facturaForm.valid && this.resumenForm.valid) {
      const reclamoData = {
        factura: this.facturaEncontrada,
        productos: this.productosSeleccionados.map(p => ({
          codigo: p.codigo,
          descripcion: p.descripcion,
          cantidad_facturada: p.cantidad,
          cantidad_reclamada: p.cantidadReclamar,
          precio: p.precio,
          lote: p.lote,
          motivo: p.motivoId,
          observacion: p.observacion || '',
          subtotal: p.cantidadReclamar * p.precio
        })),
        resumen: this.resumenForm.value,
        total_reclamado: this.totalReclamado,
      };
  
      console.log('Datos del reclamo listos para enviar:', reclamoData);
      
      // Aquí iría la llamada real a la API
      this.enviarReclamoAPI(reclamoData);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonColor: '#d33'
      });
    }
  }

  enviarReclamoAPI(reclamoData: any): void {
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();
    const nombreCliente = this.authService.getNombre();
    
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
  
    // Crear FormData
    const formData = new FormData();
    
    // Datos de la factura para tabla RECLA
    formData.append('factura_numero', this.facturaEncontrada.numero);
    formData.append('dolarcambio', this.facturaEncontrada.dolarcambio);
    formData.append('cod_cli', this.facturaEncontrada.cod_cli || codCli || '');
    formData.append('nombre_cliente', nombreCliente || this.facturaEncontrada.cliente || '');
    formData.append('almacen', this.facturaEncontrada.almacen);
    formData.append('total_reclamado', this.totalReclamado.toString());
    formData.append('observaciones', this.resumenForm.get('observacionesGenerales')?.value || '');
    
    // Agregar productos para tabla ITRECLA
    const productosFormateados = this.productosSeleccionados.map(p => {
      return {
        codigo: p.codigo,
        descripcion: p.descripcion,
        cantidad_facturada: p.cantidad,
        cantidad_reclamada: p.cantidadReclamar,
        precio: p.precio,
        lote: p.lote,
        flote: p.flote,
        motivo_id: p.motivoId,
        subtotal: p.cantidadReclamar * p.precio
      };
    });
    
    formData.append('productos', JSON.stringify(productosFormateados));
    
    const apiUrl = `${API_URLINTER}portalcli/crear_reclamo`;
    
    this.http.post<{status: boolean, message: string, numero_reclamo?: string, id_reclamo?: number}>(
      apiUrl, 
      formData, 
      { headers }
    ).subscribe({
      next: (response) => {
        if (response.status) {
          Swal.fire({
            title: '¡Reclamo enviado!',
            html: `
              <div style="text-align: left;">
                <p><strong>Número de Reclamo:</strong> ${response.numero_reclamo}</p>
                <p><strong>Factura:</strong> ${this.facturaEncontrada.numero}</p>
                <p><strong>Total Reclamado:</strong> $${this.totalReclamadoD.toFixed(2)}</p>
                <p><strong>Productos:</strong> ${this.productosSeleccionados.length}</p>
              </div>
            `,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#6cc32c'
          }).then(() => {
            //this.resetForm();
            this.resetFormCompleto();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al enviar',
            text: response.message || 'No se pudo registrar el reclamo',
            confirmButtonColor: '#d33'
          });
        }
      },
      error: (error) => {
        console.error('Error al enviar reclamo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor',
          confirmButtonColor: '#d33'
        });
      }
    });
  } */
  
  resetFormCompleto(): void {
    // Resetear formularios
    this.facturaForm.reset();
    this.productosForm.reset();
    this.resumenForm.reset();
    
    // Limpiar archivo
    this.limpiarArchivo();
    
    // Limpiar todo
    this.productosSeleccionados = [];
    this.productosFactura = [];
    this.facturaEncontrada = null;
    this.totalReclamado = 0;
    this.productosReclamadosCount = 0;
    this.errorFactura = '';
    this.numeroFacturaActual = '';
    this.isLoadingFactura = false;
    this.isLoadingProductos = false;
    this.isLoadingArchivo = false;
    
    // Limpiar FormArray
    const productosArray = this.productosForm.get('productos') as FormArray;
    productosArray.clear();
    
    // Resetear stepper manualmente (sin ViewChild)
    const stepperElement = document.querySelector('mat-stepper');
    if (stepperElement) {
      this.irAlStep1();
    }
  }

  
  // Método para ir al step 1
  irAlStep1(): void {
    // Resetear el formulario de factura para que esté listo para nueva búsqueda
    this.facturaForm.get('numeroFactura')?.setValue('');
    
    // También puedes usar window.location o router si prefieres
    // window.location.reload(); // Opción nuclear pero efectiva
  }

  // Resetear formulario
  resetForm(): void {
    this.facturaForm.reset({
      prioridad: 'media'
    });
    this.productosForm.reset();
    this.resumenForm.reset({
      requiereDevolucion: false,
      contactoPreferido: 'email'
    });
    
    this.facturaSeleccionada = null;
    this.productosSeleccionados = [];
    this.totalReclamado = 0;
    this.productosReclamadosCount = 0;
    
    // Reinicializar array de productos
    const productosArray = this.productosForm.get('productos') as FormArray;
    productosArray.clear();
    this.inicializarProductosForm();
  }


  // Validar si requiere fecha de devolución
  get requiereDevolucion(): boolean {
    return this.resumenForm.get('requiereDevolucion')?.value;
  }

  // Método para seleccionar/deseleccionar todos los productos
  /* toggleAll(event: any): void {
    const checked = event.checked;
    const productosArray = this.productosForm.get('productos') as FormArray;
    
    // Actualizar todos los checkboxes
    productosArray.controls.forEach((control, index) => {
      control.get('seleccionado')?.setValue(checked);
      
      // Si se marca, agregar a productos seleccionados
      if (checked) {
        const producto = this.productosFactura[index]; // <-- Cambiado de productosEjemplo a productosFactura
        if (producto && !this.productosSeleccionados.find(p => p.id === producto.id)) {
          this.productosSeleccionados.push({...producto});
        }
      } else {
        // Si se desmarca, limpiar productos seleccionados
        this.productosSeleccionados = [];
      }
    });
    
    this.calcularTotales();
  } */

    // Método para seleccionar/deseleccionar todos los productos
// Método para seleccionar/deseleccionar todos los productos
toggleAll(event: any): void {
  const checked = event.checked;
  const productosArray = this.productosForm.get('productos') as FormArray;
  
  productosArray.controls.forEach((control, index) => {
    const producto = this.productosFactura[index];
    if (!producto) return;
    
    // Marcar/desmarcar checkbox
    control.get('seleccionado')?.setValue(checked);
    
    if (checked) {
      // Configurar validadores requeridos (igual que en toggleProducto)
      control.get('motivoReclamo')?.setValidators([Validators.required]);
      control.get('cantidadReclamar')?.setValidators([
        Validators.required, 
        Validators.min(1), 
        Validators.max(producto.cantidad)
      ]);
      
      // Verificar si ya existe en la lista de seleccionados
      const existe = this.productosSeleccionados.find(p => p.id === producto.id);
      if (!existe) {
        // Agregar con valores vacíos (el usuario los completará)
        this.productosSeleccionados.push({
          ...producto,
          cantidadReclamar: 0, // Vacío por defecto
          motivoReclamo: '',   // Vacío por defecto
          motivoId: '',        // Vacío por defecto
          observacion: ''
        });
      }
    } else {
      // Remover validadores requeridos
      control.get('motivoReclamo')?.clearValidators();
      control.get('cantidadReclamar')?.clearValidators();
      control.get('cantidadReclamar')?.setValidators([
        Validators.min(0), 
        Validators.max(producto.cantidad)
      ]);
      
      // Resetear valores en el formulario
      control.get('cantidadReclamar')?.setValue(0);
      control.get('motivoReclamo')?.setValue('');
      control.get('motivoId')?.setValue('');
      
      // Remover de la lista de seleccionados
      this.productosSeleccionados = this.productosSeleccionados.filter(
        p => p.id !== producto.id
      );
    }
    
    // Actualizar validación
    control.get('motivoReclamo')?.updateValueAndValidity();
    control.get('cantidadReclamar')?.updateValueAndValidity();
  });
  
  this.calcularTotales();
}
  

// También necesitas este método para obtener los controles del FormArray
getProductoControl(index: number, controlName: string): any {
  const productosArray = this.productosForm.get('productos') as FormArray;
  return productosArray.at(index).get(controlName);
}
}