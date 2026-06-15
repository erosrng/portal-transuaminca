import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import Swal from 'sweetalert2';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { PortalcliLogicaService, Sucursal } from './../../services/portalcli-logica.service';
import { API_URL } from './../../app.config';
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
  selector: 'app-retiros-pages',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    NavBarComponent,
    SideBarComponent,
    FooterComponent,
    ClicardComponent
  ],
  templateUrl: './retiros-pages.component.html',
  styleUrl: './retiros-pages.component.scss'
})
export class RetirosPagesComponent implements OnInit, OnDestroy {
  retiroForm!: FormGroup;
  private destroy$ = new Subject<void>();
  codCli: string | null = null;

  enviaControl = new FormControl<string | Clienteselect>('');
  recibeControl = new FormControl<string | Clienteselect>('');
  clientes: Clienteselect[] = [];
  filteredEnvia: Observable<Clienteselect[]> | undefined;
  filteredRecibe: Observable<Clienteselect[]> | undefined;

  origenControl = new FormControl('');
  destinoControl = new FormControl('');
  filteredCiudadesOrigen!: Observable<any[]>;
  filteredCiudadesDestino!: Observable<any[]>;

  sucursales: Sucursal[] = [];

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

  today: string = new Date().toISOString().split('T')[0];

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

    const nombre = this.authService.getNombre();
    this.retiroForm.patchValue({
      solicitante: this.authService.getCodCli(),
      nomSolicitante: nombre,
      fecha: this.today
    });

    this.clienteSubscription = this.portalcliLogicaService.clienteData$.subscribe(
      (cliente) => {
        // cliente data disponible si es necesario
      }
    );

    this.retiroForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateArchivoValidacion();
    });

    this.portalcliLogicaService.consultarTarifasCliente().subscribe(resp => {
      if (resp.success && resp.tarifas) {
        this.valoresTarifa = resp.tarifas;
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

  cargarClientes() {
    this.portalcliLogicaService.consultarClientesDestino().subscribe(data => {
      this.clientes = data;
      this.setupFilters();
      this.setupCiudadesFilters();
    });
  }

  private setupFilters() {
    this.filteredEnvia = this.enviaControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const searchTerm = typeof value === 'string' ? value : value?.nombre;
        return this.portalcliLogicaService.consultarClientesDestino(searchTerm || '');
      })
    );

    this.filteredRecibe = this.recibeControl.valueChanges.pipe(
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
    this.retiroForm.patchValue({ origen: ciudad.id });
  }

  onCiudadDestinoSeleccionada(ciudad: any) {
    this.retiroForm.patchValue({ destino: ciudad.id });
  }

  displayCiudad(ciudad: any): string {
    return ciudad ? ciudad.ciudad : '';
  }

  displayFn(cliente: Clienteselect): string {
    return cliente && cliente.cliente ? cliente.cliente : '';
  }

  onEnviaSeleccionado(cliente: Clienteselect): void {
    this.retiroForm.patchValue({
      envia: cliente.cliente,
      nomEnvia: cliente.nombre,
      rutaRetiro: cliente.ruta
    });
  }

  onRecibeSeleccionado(cliente: Clienteselect): void {
    this.retiroForm.patchValue({
      recibe: cliente.cliente,
      nomRecibe: cliente.nombre,
      rutaEntrega: cliente.ruta
    });
  }

  private initForm(): void {
    this.retiroForm = this.fb.group({
      fecha: [{ value: this.today, disabled: true }],
      sucursal: ['', Validators.required],
      despacho: ['S'],
      prioridad: ['N'],
      tipo: ['B'],
      planificada: ['N'],
      solicitante: [{ value: '', disabled: true }],
      nomSolicitante: [{ value: '', disabled: true }],
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      rutaRetiro: [{ value: '', disabled: true }],
      envia: ['', Validators.required],
      nomEnvia: [{ value: '', disabled: true }],
      rutaEntrega: [{ value: '', disabled: true }],
      recibe: ['', Validators.required],
      nomRecibe: [{ value: '', disabled: true }],
      direcRetiro: ['', Validators.required],
      direcEntrega: ['', Validators.required],
      factura: ['', Validators.required],
      monto: [null],
      contenido: ['', [Validators.required, Validators.minLength(3)]],
      numBultos: [1, [Validators.required, Validators.min(1)]],
      moneda: [''],
      cobro: ['Porcentaje'],
      subtotal: [{ value: '0,00', disabled: true }],
      total: [{ value: '0,00', disabled: true }],
      tarifa: [{ value: '0,00', disabled: true }],
      subtotald: [{ value: '0,00', disabled: true }],
      totald: [{ value: '0,00', disabled: true }],
      tarifad: [{ value: '0,00', disabled: true }],
      neto: [{ value: '0,00', disabled: true }],
      netod: [{ value: '0,00', disabled: true }],
      archivoValidacion: [false, Validators.requiredTrue]
    });

    this.retiroForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(100)
    ).subscribe(() => {
      this.calcularTotales();
    });
  }

  // ========== MANEJO DE ARCHIVOS ==========

  private processFile(file: File): void {
    this.fileError = null;
    this.filePreview = null;

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showFileError('El archivo excede los 5MB');
      return;
    }

    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      this.showFileError('Formato no válido. Solo se permite PDF');
      return;
    }

    if (this.isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.filePreview = e.target.result;
      reader.readAsDataURL(file);
    } else {
      this.filePreview = 'assets/icons/pdf-icon.png';
    }

    this.archivoComprobante = file;
    this.updateArchivoValidacion();
  }

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
    this.retiroForm.get('archivoValidacion')?.setValue(tieneArchivo, { emitEvent: false });
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

  // ========== TOTALIZAR ==========

  calcularTotales(): void {
    const form = this.retiroForm.getRawValue();
    const cantidad = parseFloat(form.numBultos) || 0;
    const tipo = form.tipo || 'B';

    if (cantidad <= 0 || this.valoresTarifa.length === 0) {
      this.retiroForm.get('neto')?.setValue('0,00', { emitEvent: false });
      this.retiroForm.get('netod')?.setValue('0,00', { emitEvent: false });
      this.retiroForm.get('subtotal')?.setValue('0,00', { emitEvent: false });
      this.retiroForm.get('subtotald')?.setValue('0,00', { emitEvent: false });
      this.retiroForm.get('total')?.setValue('0,00', { emitEvent: false });
      this.retiroForm.get('totald')?.setValue('0,00', { emitEvent: false });
      this.retiroForm.get('tarifa')?.setValue('0,00', { emitEvent: false });
      this.retiroForm.get('tarifad')?.setValue('0,00', { emitEvent: false });
      return;
    }

    let opcionesTarifas: { grupotari: string | number, monto: number }[] = [];

    this.valoresTarifa.forEach((t: TarifaDetalle) => {
      let xBulto = (tipo === 'B' && t.bulto > 0) ? cantidad * t.bulto : 0;
      let xSobre = (tipo === 'S' && t.sobre > 0) ? cantidad * t.sobre : 0;
      let xRetiro = (t.retiro && t.retiro > 0) ? t.retiro : 0;

      let subtotalTarifa = Math.max(xBulto, xSobre, xRetiro);

      if (subtotalTarifa > 0 && subtotalTarifa < t.minimo) {
        subtotalTarifa = t.minimo;
      }

      if (subtotalTarifa > 0) {
        opcionesTarifas.push({ grupotari: t.grupotari, monto: subtotalTarifa });
      }
    });

    if (opcionesTarifas.length > 0) {
      const ganadora = opcionesTarifas.reduce((prev, current) => (prev.monto > current.monto) ? prev : current);
      this.idTarifaSeleccionada = ganadora.grupotari;

      const tarifaBS = ganadora.monto * this.dolarcambio;

      this.retiroForm.get('subtotald')?.setValue(this.formatNumberToDisplay(ganadora.monto), { emitEvent: false });
      this.retiroForm.get('subtotal')?.setValue(this.formatNumberToDisplay(tarifaBS), { emitEvent: false });
      this.retiroForm.get('totald')?.setValue(this.formatNumberToDisplay(ganadora.monto), { emitEvent: false });
      this.retiroForm.get('total')?.setValue(this.formatNumberToDisplay(tarifaBS), { emitEvent: false });
      this.retiroForm.get('tarifad')?.setValue(this.formatNumberToDisplay(ganadora.monto), { emitEvent: false });
      this.retiroForm.get('tarifa')?.setValue(this.formatNumberToDisplay(tarifaBS), { emitEvent: false });
      this.retiroForm.get('netod')?.setValue(this.formatNumberToDisplay(ganadora.monto), { emitEvent: false });
      this.retiroForm.get('neto')?.setValue(this.formatNumberToDisplay(tarifaBS), { emitEvent: false });
    }
  }

  private formatNumberToDisplay(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  // ========== ENVÍO ==========

  onSubmit(): void {
    this.formSubmitted = true;

    if (!this.archivoComprobante || this.fileError) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo requerido',
        text: 'Debe adjuntar la factura digital para continuar',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (this.retiroForm.invalid) {
      Object.keys(this.retiroForm.controls).forEach(key => {
        const control = this.retiroForm.get(key);
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

    Swal.fire({
      title: '¿Confirmar retiro?',
      text: '¿Está seguro de crear esta solicitud de retiro?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enviarRetiro();
      }
    });
  }

  private enviarRetiro(): void {
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

    Swal.fire({
      title: 'Enviando solicitud...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData = new FormData();
    const formValues = this.retiroForm.getRawValue();

    Object.keys(formValues).forEach(key => {
      if (key === 'archivoValidacion') return;

      let value = formValues[key];

      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    formData.append('cod_cli', codCli);
    if (this.idTarifaSeleccionada !== undefined && this.idTarifaSeleccionada !== null) {
      formData.append('grupotari', this.idTarifaSeleccionada.toString());
    }

    if (this.archivoComprobante) {
      formData.append('factura_digital', this.archivoComprobante, this.archivoComprobante.name);
    }

    const headers = new HttpHeaders({
      'X-Auth-Token': token,
    });

    const apiUrl = `${API_URL}portalcli/crear_retiro`;

    this.http.post<any>(apiUrl, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (event: any) => {
        if (event.type === 4) {
          this.handleResponse(event.body);
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private handleResponse(response: any): void {
    if (response.status === true) {
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        html: `
          <div style="text-align: left;">
            <p><strong>Solicitud de retiro registrada correctamente</strong></p>
            <p><strong>Número:</strong> ${response.data?.id || 'N/A'}</p>
          </div>
        `,
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.resetForm();
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: response.message || 'No se pudo registrar la solicitud de retiro',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  private handleError(error: any): void {
    let errorMessage = 'Error al conectar con el servidor. Intente nuevamente.';

    if (error.status === 401) {
      errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
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
    this.retiroForm.reset({
      despacho: 'S',
      prioridad: 'N',
      tipo: 'B',
      planificada: 'N',
      numBultos: 1,
      moneda: '',
      cobro: 'Porcentaje',
      fecha: this.today,
      solicitante: this.authService.getCodCli(),
      nomSolicitante: this.authService.getNombre()
    });

    this.enviaControl.setValue('');
    this.recibeControl.setValue('');
    this.origenControl.setValue('');
    this.destinoControl.setValue('');

    this.archivoComprobante = null;
    this.filePreview = null;
    this.fileError = null;
    this.formSubmitted = false;
    this.resetFileInput();
  }

  isInvalid(fieldName: string): boolean {
    const field = this.retiroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  isFileInvalid(): boolean {
    return this.formSubmitted && (!this.archivoComprobante || !!this.fileError);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.retiroForm.get(fieldName);

    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('minlength')) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    if (field.hasError('min')) {
      return `El valor mínimo es 1`;
    }

    return 'Campo inválido';
  }
}
