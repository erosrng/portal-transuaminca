import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { Subject, Observable,Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { PortalcliLogicaService, Sucursal } from './../../services/portalcli-logica.service';
import { API_URL } from './../../app.config';
import { API_URLINTER } from './../../app.config';

import { AuthService } from './../../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClicardComponent } from "../../components/clicard/clicard.component";

export interface Clienteselect {
  cliente: string;
  nombre: string;
  rifci: string;
  direc: string;
  telefono: string;
  ciudad: string;
  estado: string;
  contacto: string;
  ruta: string;
}

export interface TarifaDetalle {
  id: string;
  grupotari: string;
  nombre: string;
  encom: number;
  bulto: number;
  sobre: number;
  minimo: number;
  peso: number;
  retiro?: number;
  volumen?: number;
  distancia?: number;
}

@Component({
  selector: 'app-encomiendas-pages',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
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
    FooterComponent,
    ClicardComponent
],
  templateUrl: './encomiendas-pages.component.html',
  styleUrl: './encomiendas-pages.component.scss'
})
export class EncomiendasPagesComponent implements OnInit, OnDestroy {
  encomiendaForm!: FormGroup;
  private destroy$ = new Subject<void>();
  codCli: string | null = null;
  clienteControl = new FormControl<string | Clienteselect>('');
  clientes: Clienteselect[] = [];
  filteredOptions: Observable<Clienteselect[]> | undefined;
  clienteData: any = {
    cliente: null,
    nombre: null,
    rifci: null,
    direc: null,
    telefono: null,
    ciudad: null,
    estado: null,
    contacto: null,
    ruta: null,
  };

  // Variables para el autocomplete de ciudades
  origenControl = new FormControl('');
  destinoControl = new FormControl('');
  filteredCiudadesOrigen!: Observable<any[]>;
  filteredCiudadesDestino!: Observable<any[]>;

  sucursales: Sucursal[] = [];

  // Variables para manejo de archivos
  @ViewChild('fileUpload') fileInput!: ElementRef;
  private subscriptions: Subscription[] = []; 
  private clienteSubscription: Subscription = new Subscription();

  archivoComprobante: File | null = null;
  filePreview: string | null = null;
  fileError: string | null = null;
  isDragOver = false;
  formSubmitted = false;
  dolarcambio = 0;
  valoresTarifa: TarifaDetalle[] = [];
  idTarifaSeleccionada: string | number = '';
  constructor(
    private fb: FormBuilder,
    public http: HttpClient,
    public authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarClientes();
    this.cargarSucursales();
    this.dolarcambio = this.authService.getTasa();

    this.clienteSubscription = this.portalcliLogicaService.clienteData$.subscribe(
      (cliente) => {
        this.clienteData = cliente;
        //console.log('Cliente actualizado:', this.clienteData);
      }
    );
    
    // Suscribirse a cambios para validar archivo
    this.encomiendaForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateArchivoValidacion();
    });

   // En tu ngOnInit, ajusta la asignación para depurar
    this.portalcliLogicaService.consultarTarifasCliente().subscribe(resp => {
        if (resp.success && resp.tarifas) {
          this.valoresTarifa = resp.tarifas; // Guardamos el array de objetos
          this.calcularTotales();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarSucursales() {
    this.portalcliLogicaService.consultarSucursales().subscribe(data => {
      this.sucursales = data;
    });
  }

  onSucursalChange(event: any) {
    const codigo = event.target.value;
    this.portalcliLogicaService.setSucursal(codigo);
  }

  cargarClientes() {
    this.portalcliLogicaService.consultarClientesDestino().subscribe(data => {
      this.clientes = data;
      this.setupFilter();
      this.setupCiudadesFilters();
    });
  }

  private setupFilter() {
    this.filteredOptions = this.clienteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const searchTerm = typeof value === 'string' ? value : value?.nombre;
        return this.portalcliLogicaService.consultarClientesDestino(searchTerm || '');
      })
    );
  }

  setupCiudadesFilters() {
    this.filteredCiudadesOrigen = this.origenControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.portalcliLogicaService.consultarCiudades(value || ''))
    );

    this.filteredCiudadesDestino = this.destinoControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.portalcliLogicaService.consultarCiudades(value || ''))
    );
  }

  onCiudadOrigenSeleccionada(ciudad: any) {
    this.encomiendaForm.patchValue({ origen: ciudad.id });
  }

  onCiudadDestinoSeleccionada(ciudad: any) {
    this.encomiendaForm.patchValue({ destino: ciudad.id });
  }

  displayCiudad(ciudad: any): string {
    return ciudad ? ciudad.ciudad : '';
  }

  displayFn(cliente: Clienteselect): string {
    return cliente && cliente.cliente ? cliente.cliente : '';
  }

  onClienteSeleccionado(cliente: Clienteselect): void {
    this.encomiendaForm.patchValue({
      destinatario: cliente.cliente,
      nombre: cliente.nombre,
      direccion: cliente.direc,
      ruta: cliente.ruta
    });
  }

  private initForm(): void {
    this.encomiendaForm = this.fb.group({
      // Información de entrega
      destinatario: ['', [Validators.required, Validators.minLength(3)]],
      nombre: [{ value: '', disabled: true }],
      direccion: [{ value: '', disabled: true }, Validators.required],
      ruta: [{ value: '', disabled: true }],
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      sucursal: ['', Validators.required],
      contenido: ['', [Validators.required, Validators.minLength(5)]],
      resguardar: [false],
      // Datos de envío
      peso: [null, [Validators.required, Validators.min(0.1), Validators.max(1000)]],
      tipoEnvio: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(100)]],

      // Datos de facturación
      factura: ['', Validators.required],
      valorMercancia: [null],
      valorMercanciaDolar: [null, [Validators.required, Validators.min(0)]],
      netoD: [null, [Validators.required, Validators.min(0)]],

      // Campo virtual para validación de archivo
      archivoValidacion: [false, Validators.requiredTrue]
    });

    // Suscribirse a cambios para recalcular automáticamente
    this.encomiendaForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(100) // Bajamos a 100ms para mayor fluidez
    ).subscribe(() => {
      this.calcularTotales();
    });
  }

  

  // ========== MANEJO DE ARCHIVOS MEJORADO ==========

  private processFile(file: File): void {
    this.fileError = null;
    this.filePreview = null;
  
    if (!file) return;
  
    // 1. Validar Tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showFileError('El archivo excede los 5MB');
      return;
    }
  
    // 2. Validar Tipo (PDF e Imágenes)
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      this.showFileError('Formato no válido. Solo se permite PDF');
      return;
    }
  
    // 3. Manejo de vista previa
    if (this.isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.filePreview = e.target.result;
      reader.readAsDataURL(file);
    } else {
      // Si es PDF, podrías poner una ruta a un icono de PDF local o dejarlo nulo
      this.filePreview = 'assets/icons/pdf-icon.png'; 
    }
  
    this.archivoComprobante = file;
    this.updateArchivoValidacion();
  }
  
  // Helper para el HTML
  isPdfFile(file: File | null): boolean {
    return file ? file.type === 'application/pdf' : false;
  }
  
  private showFileError(msg: string) {
    this.fileError = msg;
    Swal.fire({ icon: 'error', title: 'Archivo inválido', text: msg });
    this.resetFileInput();
  }

  private updateArchivoValidacion(): void {
    const tieneArchivo = !!this.archivoComprobante && !this.fileError;
    this.encomiendaForm.get('archivoValidacion')?.setValue(tieneArchivo, { emitEvent: false });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }



  removeFile(): void {
    this.archivoComprobante = null;
    this.filePreview = null;
    this.fileError = null;
    this.resetFileInput();
    this.updateArchivoValidacion();
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getFileName(): string {
    if (!this.archivoComprobante) return '';
    const name = this.archivoComprobante.name;
    return name.length > 30 ? name.substring(0, 30) + '...' : name;
  }

  getFileSize(): string {
    if (!this.archivoComprobante) return '';
    const size = this.archivoComprobante.size;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }



  // ========== MANEJO DE FORMULARIO ==========

  filterNonNumeric(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
    if (allowedKeys.indexOf(event.key) !== -1) return;

    if (event.key === ' ' || isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }

  formatCurrency(event: any) {
    let value = event.target.value;

    value = value.replace(/\D/g, '');

    if (value === '') {
      this.encomiendaForm.get('valorMercanciaDolar')?.setValue('');
      return;
    }

    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const formattedValue = new Intl.NumberFormat('de-DE', options).format(
      parseFloat(value) / 100
    );

    event.target.value = formattedValue;
    this.encomiendaForm.get('valorMercanciaDolar')?.setValue(formattedValue, { emitEvent: false });
  }

  onBlurCurrency(event: any) {
    if (event.target.value === '') return;
    this.formatCurrency(event);
  }

    // ========== TOTALIZAR ==========
    calcularTotales(): void {
      const form = this.encomiendaForm.getRawValue();
      const valorDeclarado = this.parseCurrency(form.valorMercanciaDolar) || 0;
      const cantidad = parseFloat(form.cantidad) || 0;
      const peso = parseFloat(form.peso) || 0;
      const tipo = form.tipoEnvio;
    
      let montosEncontrados: number[] = [];
      let opcionesTarifas: { grupotari: string | number, monto: number }[] = [];

      this.valoresTarifa.forEach((t: TarifaDetalle) => {
        // Calculamos todas las posibilidades para ESTA tarifa
        let xBulto = (tipo === 'Bulto(s)' && t.bulto > 0) ? cantidad * t.bulto : 0;
        let xSobre = (tipo === 'Sobre(s)' && t.sobre > 0) ? cantidad * t.sobre : 0;
        let xPeso = (peso > 0 && t.peso > 0) ? peso * t.peso : 0;
        let xPorcentaje = (t.encom > 0 && valorDeclarado > 0) ? valorDeclarado * (t.encom / 100) : 0;
    
        // El subtotal de esta tarifa es el mayor entre sus propios parámetros
        let subtotalTarifa = Math.max(xBulto, xSobre, xPeso, xPorcentaje);
    
        // Aplicar mínimo de la tarifa si hubo algún cálculo
        if (subtotalTarifa > 0 && subtotalTarifa < t.minimo) {
          subtotalTarifa = t.minimo;
        }
        
        if (subtotalTarifa > 0) {
          opcionesTarifas.push({ grupotari: t.grupotari, monto: subtotalTarifa });
        }
      });
    
      // SELECCIÓN DE LA TARIFA MÁS ALTA DEL CLIENTE
      let netoD = montosEncontrados.length > 0 ? Math.max(...montosEncontrados) : 0;
    
      // CÁLCULO DEL RESGUARDO (SEGURO 1% ADICIONAL)
      if (form.resguardar && valorDeclarado > 0) {
        const seguro = valorDeclarado * 0.01;
        this.encomiendaForm.get('seguroD')?.setValue(this.formatNumberToDisplay(seguro), { emitEvent: false });

        netoD += seguro; 
      }
    
      if (opcionesTarifas.length > 0) {
        // Ordenamos para obtener la más alta
        const ganadora = opcionesTarifas.reduce((prev, current) => (prev.monto > current.monto) ? prev : current);
        
        let netoD = ganadora.monto;
        this.idTarifaSeleccionada = ganadora.grupotari; // <--- AQUÍ GUARDAMOS EL ID
    
        // CÁLCULO DEL RESGUARDO
        if (form.resguardar && valorDeclarado > 0) {
          netoD += (valorDeclarado * 0.01); 
        }
    
        this.encomiendaForm.get('netoD')?.setValue(this.formatNumberToDisplay(netoD), { emitEvent: false });
      }
    }
  // ========== ENVÍO DEL FORMULARIO ==========

  // Helper para formatear de número a string "0,00" para el input
  private formatNumberToDisplay(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
    
  // Helper para convertir el string de la máscara "1.250,50" a número 1250.50
  private parseCurrency(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    // Quita puntos de miles y cambia coma por punto decimal
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }

  onSubmit(): void {
    this.formSubmitted = true;

    // Validar archivo primero
    if (!this.archivoComprobante || this.fileError) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo requerido',
        text: 'Debe adjuntar una factura válida para continuar',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Validar formulario
    if (this.encomiendaForm.invalid) {
      Object.keys(this.encomiendaForm.controls).forEach(key => {
        const control = this.encomiendaForm.get(key);
        control?.markAsTouched();
      });

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos obligatorios correctamente',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Mostrar confirmación
    Swal.fire({
      title: '¿Confirmar envío?',
      text: '¿Está seguro de crear esta encomienda?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enviarEncomienda();
      }
    });
  }

  private enviarEncomienda(): void {
    // Obtener datos del usuario autenticado
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();
    
    if (!token || !codCli) {
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    // Mostrar carga
    Swal.fire({
      title: 'Enviando encomienda...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    // Preparar FormData para enviar
    const formData = new FormData();
    const formValues = this.encomiendaForm.getRawValue();
  
    // Agregar campos del formulario
    Object.keys(formValues).forEach(key => {
      if (key !== 'archivoValidacion') {
        let value = formValues[key];

        if (key === 'valorMercanciaDolar' && value) {
          const valorDolar = parseFloat(value);
          const valorBolivares = valorDolar * this.dolarcambio;
          formData.append('valorMercancia', valorBolivares.toFixed(2));
        }

        if (key === 'netoD') {
          value = this.parseCurrency(value);
          const netoDolar = parseFloat(value);
          const netoBS = netoDolar * this.dolarcambio;
          formData.append('netoBs', netoBS.toFixed(2));
        }

        if (key === 'seguroD') {
          value = this.parseCurrency(value);
          const seguroDolar = parseFloat(value);
          const seguroBS = seguroDolar * this.dolarcambio;
          formData.append('seguroBs', seguroBS.toFixed(2));
        }

        if (key === 'resguardar') {
          value = value ? 'S' : 'N';
        }

        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });
  
    // Agregar campos adicionales requeridos por la API
    formData.append('cod_cli', codCli);
    formData.append('nomcli_org', this.clienteData?.nombre);
    if (this.idTarifaSeleccionada !== undefined && this.idTarifaSeleccionada !== null) {
      formData.append('grupotari', this.idTarifaSeleccionada.toString());
    }
    
    // Agregar archivo de factura si existe
    if (this.archivoComprobante) {
      formData.append('factura_digital', this.archivoComprobante, this.archivoComprobante.name);
    }
  
    // Configurar headers con token de autenticación
    const headers = new HttpHeaders({
      'X-Auth-Token': token,
    });
  
    // URL de la API para crear encomienda (debes definirla en app.config o servicio)
    const apiUrl = `${API_URL}portalcli/crear_encomienda`; 
  
    // Enviar a la API con progreso
    this.http.post<any>(apiUrl, formData, { 
      headers: headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (event: any) => {
        // Manejar progreso de upload si quieres mostrar barra de progreso
        if (event.type === 1) {
          // Evento de progreso (upload)
          if (event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            // Puedes mostrar progreso en el Swal si quieres:
            // Swal.update({ text: `Enviando... ${progress}%` });
          }
        } else if (event.type === 4) {
          // Respuesta completa
          this.handleEncomiendaResponse(event.body);
        }
      },
      error: (error) => {
        this.handleEncomiendaError(error);
      }
    });
  }
  
  // Manejar respuesta exitosa
  private handleEncomiendaResponse(response: any): void {
    if (response.status === true) {
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        html: `
          <div style="text-align: left;">
            <p><strong>Encomienda registrada correctamente</strong></p>
            <p><strong>Número de encomienda:</strong> ${response.data.id || 'N/A'}</p>
          </div>
        `,
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonText: 'Imprimir guía',
        cancelButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.cancel) {
          this.resetForm();
          // Si quieres imprimir la guía cuando se cancela
         /*  if (result.dismiss === Swal.DismissReason.cancel) {
            this.imprimirGuia(response.data);
          } */
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: response.message || 'No se pudo registrar la encomienda',
        confirmButtonText: 'Aceptar'
      });
    }
  }
  
  // Manejar errores de la API
  private handleEncomiendaError(error: any): void {   
    let errorMessage = 'Error al conectar con el servidor. Intente nuevamente.';
    
    if (error.status === 401) {
      errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
      // Opcional: redirigir al login
      // this.authService.logout();
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos enviados al servidor.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor. Por favor, contacte al administrador.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonText: 'Aceptar'
    });
  }
  

  private resetForm(): void {
    this.encomiendaForm.reset({
      cantidad: 1,
      tipoEnvio: '',
      // ... otros valores por defecto
    });

    this.clienteControl.setValue('');
    this.origenControl.setValue('');
    this.destinoControl.setValue('');
    
    this.archivoComprobante = null;
    this.filePreview = null;
    this.fileError = null;
    this.formSubmitted = false;
    this.resetFileInput();
  }

  // ========== HELPERS PARA VALIDACIÓN ==========

  isInvalid(fieldName: string): boolean {
    const field = this.encomiendaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  isFileInvalid(): boolean {
    return this.formSubmitted && (!this.archivoComprobante || !!this.fileError);
  }

  // Helper para mostrar errores específicos
  getErrorMessage(fieldName: string): string {
    const field = this.encomiendaForm.get(fieldName);
    
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field.hasError('minlength')) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }
    
    if (field.hasError('min')) {
      const minValue = field.errors['min'].min;
      return `El valor mínimo es ${minValue}`;
    }
    
    if (field.hasError('max')) {
      const maxValue = field.errors['max'].max;
      return `El valor máximo es ${maxValue}`;
    }

    return 'Campo inválido';
  }
}