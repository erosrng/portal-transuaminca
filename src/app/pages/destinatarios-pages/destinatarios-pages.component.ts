import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import Swal from 'sweetalert2';
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";

import { AuthService } from './../../auth.service';
import { API_URL } from './../../app.config';
import { API_URLINTER } from './../../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatOption } from "@angular/material/core";
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { PortalcliLogicaService, Sucursal } from './../../services/portalcli-logica.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-destinatarios-pages',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDividerModule,
    SideBarComponent,
    FooterComponent,
    NavBarComponent,
    MatOption
],
  templateUrl: './destinatarios-pages.component.html',
  styleUrl: './destinatarios-pages.component.scss'
})
export class DestinatariosPagesComponent implements OnInit {
  destinatarioForm!: FormGroup;
  phonePrefixes: string[] = ['0414', '0424', '0416', '0426', '0412', '0422'];
  idTypes: string[] = ['J', 'V', 'E'];

  filteredCiudades!: Observable<any[]>;
  filteredEstados!: Observable<any[]>;
  filteredRutas!: Observable<any[]>;


  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    public authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.setupCiudadesFilters();
    this.setupEstadosFilters();
    this.setupRutasFilters();

  }


  initForm() {
    this.destinatarioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      idType: ['J', Validators.required],
      rif: ['', [Validators.required]],
      phonePrefix: ['0424', [Validators.required]], // Nuevo campo con valor por defecto
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{7}$')]],
      ciudad: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      estado: [null, [Validators.required]],
      ruta: ['', [Validators.required]],
      contacto: [''],
      direnvio: [null]
    });
  }

  setupCiudadesFilters() {
    this.filteredCiudades = combineLatest([
      this.destinatarioForm.get('ciudad')!.valueChanges.pipe(startWith('')),
      this.destinatarioForm.get('estado')!.valueChanges.pipe(startWith(''))
    ]).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(([ciudVal, estVal]) => {
        // 1. Manejo del Término de búsqueda (Ciudad)
        const term = typeof ciudVal === 'string' ? ciudVal : (ciudVal?.ciudad || '');
        
        // 2. Manejo del Estado (Evita el error TypeError: estVal is null)
        let estCod = '';
        if (estVal) {
          estCod = typeof estVal === 'object' ? estVal.codigo : estVal;
        }
  
        // Si no hay estado seleccionado, devolvemos un array vacío para no dar error
        if (!estCod && !term) return [];
  
        return this.portalcliLogicaService.consultarCiudades(term, estCod);
      })
    );
  }

  setupEstadosFilters() {
      this.filteredEstados = this.destinatarioForm.get('estado')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.portalcliLogicaService.consultarEstados(value || ''))
    );
  }

  setupRutasFilters() {
    this.filteredRutas = this.destinatarioForm.get('ruta')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const term = typeof value === 'string' ? value : value?.descrip || '';
        return this.portalcliLogicaService.consultarRutas(term);
      })
    );
  }

  displayCiudad(ciudad: any): string {
    return ciudad ? ciudad.ciudad : '';
  }

  displayEstado(estado: any): string {
    return estado ? estado.entidad : '';
  }

  displayRuta(ruta: any): string {
    return ruta ? ruta.descrip : '';
  }


  onCiudadSeleccionada(ciudad: any) {
    this.destinatarioForm.patchValue({ ciudad: ciudad.ciudad });
  }

  onEstadoSeleccionado(estado: any) {
    // 1. Seteamos el valor en el formulario (ID/Código)
    this.destinatarioForm.patchValue({ estado: estado.codigo });
    // 2. Limpiamos la ciudad previa para obligar a elegir una del nuevo estado
    this.destinatarioForm.get('ciudad')?.setValue('');
    this.destinatarioForm.patchValue({ ciudad: '' });
  }

  onRutaSeleccionada(ruta: any) {
    this.destinatarioForm.patchValue({ ruta: ruta.ruta });
  }

  guardarDestinatario(): void {
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();
  
    if (!token || !codCli) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Sesión expirada.' });
      return;
    }
  
    if (this.destinatarioForm.invalid) {
      Swal.fire({ icon: 'warning', title: 'Incompleto', text: 'Por favor llene los campos obligatorios.' });
      return;
    }
  
    Swal.fire({
      title: 'Registrando destinatario...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  
    const formData = new FormData();
    const formValues = this.destinatarioForm.getRawValue();
  
    const valorEstado = typeof formValues.estado === 'object' ? formValues.estado.codigo : formValues.estado;
    const valorCiudad = typeof formValues.ciudad === 'object' ? formValues.ciudad.ciudad : formValues.ciudad;
    const valorRuta   = typeof formValues.ruta === 'object' ? formValues.ruta.ruta : formValues.ruta;


    // 1. CONCATENACIÓN DE RIF (Ej: 'J' + '500144997' = 'J500144997')
    const rifFinal = `${formValues.idType}${formValues.rif}`;

    // 2. CONCATENACIÓN DE TELÉFONO (Ej: '0424' + '-' + '5385358' = '0424-5385358')
    const telfFinal = `${formValues.phonePrefix}-${formValues.telefono}`;

    // 3. ARMADO DEL FORMDATA
    Object.keys(formValues).forEach(key => {
      // Saltamos los campos que ahora enviamos concatenados
      if (!['idType', 'rif', 'phonePrefix', 'telefono'].includes(key)) {
        const value = formValues[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });


    // Agregamos los valores finales unificados
    formData.append('rif', rifFinal.toUpperCase());
    formData.append('telefono', telfFinal);
    formData.append('cod_cli', this.authService.getCodCli()!);
  
    formData.append('estado', valorEstado);
    formData.append('ciudad', valorCiudad);
    formData.append('ruta', valorRuta);
    // Agregar datos obligatorios de auditoría y pertenencia
    formData.append('cod_cli', codCli);
  
    const headers = new HttpHeaders({
      'X-Auth-Token': token,
    });
  
    const apiUrl = `${API_URL}portalcli/crear_destinatario`;
  
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (resp) => {
        if (resp.success) {
          Swal.fire('¡Registrado!', 'El destinatario ha sido guardado con éxito.', 'success');
          this.destinatarioForm.reset();
        } else {
          Swal.fire('Error', resp.message || 'No se pudo registrar.', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error Técnico', 'Ocurrió un error al conectar con la API.', 'error');
      }
    });
  }

  limpiarForm() {
    this.destinatarioForm.reset();
  }
}