import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './../auth.service';
import { Router } from '@angular/router';
import { API_URL } from '../app.config';
import { API_URLINTER } from '../app.config';
import Swal from 'sweetalert2';
import { Observable, of } from 'rxjs';
import { Subject } from 'rxjs';

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

export interface Sucursal {
    codigo: string;
    sucursal: string;
    tipo: string;
    alma: string;
}

@Injectable({
  providedIn: 'root',
})

export class PortalcliLogicaService {
  //Para el carrito 
  loading: boolean = false;

  isMenuOpen: boolean = false;
  //Informacion del cliente
  private clienteDataSource = new BehaviorSubject<any>({});
  clienteData$ = this.clienteDataSource.asObservable();

  private clientesSubject = new BehaviorSubject<Clienteselect[]>([]);
  public clientes$ = this.clientesSubject.asObservable();

  private sucursalSeleccionadaSubject = new BehaviorSubject<string>('');
  sucursalSeleccionada$ = this.sucursalSeleccionadaSubject.asObservable();

  //private isMenuOpenSubject = new BehaviorSubject<boolean>(true);
  //isMenuOpen$ = this.isMenuOpenSubject.asObservable();

    constructor(
      private authService: AuthService, 
      private http: HttpClient, 
      private router: Router
    ) {}

    setSucursal(id: string) {
      this.sucursalSeleccionadaSubject.next(id);
    }

    consultarSucursales(): Observable<Sucursal[]> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({ 'X-Auth-Token': `${token}` });
  
      return this.http.post<any>(`${API_URL}portalcli/bdsucu`, {}, { headers }).pipe(
        map(res => (res.status && res.data) ? res.data : [])
      );
    }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // this.isMenuOpenSubject.next(this.isMenuOpen); // Si usas un Subject para comunicar el estado del menú
  }

  // Puedes mantener openMenu y closeMenu si quieres un control más granular,
  // pero con toggleMenu y el overlay, a menudo no son estrictamente necesarios para la funcionalidad básica.
  openMenu() {
    if (!this.isMenuOpen) {
      this.isMenuOpen = true;
      // this.isMenuOpenSubject.next(true);
    }
  }

  closeMenu() {
    if (this.isMenuOpen) { // Asegúrate de cerrar solo si está abierto
      this.isMenuOpen = false;
      // this.isMenuOpenSubject.next(false);
    }
  }
  
  consultarTarifasCliente(): Observable<any> {
    const formData = new FormData();
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();

    formData.append('codCli', codCli ?? '');


    const headers = new HttpHeaders({
      'X-Auth-Token': token || ''
    });
    
    return this.http.post<any>(`${API_URL}portalcli/traetarifas`,formData, { headers });
  }

// En portalcli-logica.service.ts
navigateTo(route: string, queryParams?: any) {
  if (queryParams) {
    this.router.navigate([route], { queryParams: queryParams });
  } else {
    this.router.navigate([route]);
  }
}

  validateCant(event: any): string {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      event.target.value = numericValue;
    }
    if (numericValue.length > 1) {
      return numericValue.slice(0, 1);
    } else {
      return numericValue;
    }
  }

  //Vacia carrito
  vaciacar(): Observable<any> {
    const codCli = this.authService.getCodCli();
    const apiUrl = `${API_URL}portalcli/vaciacar`;
    const formData = new FormData();
    const token = this.authService.getToken();
    formData.append('codCli', codCli ?? '');

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    return this.http.post(apiUrl, formData, { headers: headers }); // Devuelve el observable
  }
        
  selectedProduct: any;
  imageficha: any;

  openProductModal(codigo: string): Observable<any> { // Devuelve un Observable
    this.loading = true;
    const formData = new FormData();
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();

    formData.append('codigo', codigo);
    formData.append('codCli', codCli ?? '');

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = `${API_URL}portalcli/traeficha`;

    return new Observable(observer => {
      this.http.post(apiUrl, formData, { headers: headers }).subscribe({
        next: (response: any) => {
          this.selectedProduct = response.data.producto;
          this.imageficha = response.data.imageUrl;
          this.loading = false;
          observer.next({ product: this.selectedProduct, imageUrl: this.imageficha }); // Emite un objeto
          observer.complete();
        },
        error: (error) => {
          this.loading = false;
          observer.error(error); // Emite el error
        },
      });
    });
  }

    alertaerror(){
      Swal.fire({
        text: 'Algo salió mal',
        icon: 'error',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        position: 'bottom-end',
    });
    }

    mostrarLoader(){
      Swal.fire({
        title: 'Cargando...',
        html: 'Por favor, espere...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
    }

    ocultarLoader(){
      Swal.close();
    }

    consultarClientesDestino(termino: string = '') {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({ 'X-Auth-Token': `${token}` });
      
      // Enviamos el término de búsqueda al PHP
      const body = new FormData();
      body.append('search', termino);
    
      return this.http.post<any>(`${API_URL}portalcli/bdcdest`, body, { headers }).pipe(
        map(res => (res.status && res.data) ? res.data : [])
      );
    }

    consultarCiudades(termino: string = '', estadoCod: string = '') {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({ 'X-Auth-Token': `${token}` });
      
      const body = new FormData();
      body.append('search', termino);
      body.append('estado', estadoCod); // <--- Enviamos el estado seleccionado
    
      return this.http.post<any>(`${API_URL}portalcli/ciudades`, body, { headers }).pipe(
        map(res => (res.status && res.data) ? res.data : [])
      );
    }

    consultarEstados(termino: string = '') {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({ 'X-Auth-Token': `${token}` });
      
      // Enviamos el término de búsqueda al PHP
      const body = new FormData();
      body.append('search', termino);
    
      return this.http.post<any>(`${API_URL}portalcli/estados`, body, { headers }).pipe(
        map(res => (res.status && res.data) ? res.data : [])
      );
    }
    
    consultarRutas(termino: string = '') {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({ 'X-Auth-Token': `${token}` });
      
      // Enviamos el término de búsqueda al PHP
      const body = new FormData();
      body.append('search', termino);
    
      return this.http.post<any>(`${API_URL}portalcli/rutas`, body, { headers }).pipe(
        map(res => (res.status && res.data) ? res.data : [])
      );
    }
    
    
    formatCurrency(value: number | string): string {
      if (!value) return '';
      const num = typeof value === 'string' ? parseFloat(value) : value;
      const roundedNum = Math.round(num * 100) / 100; // Redondea a dos decimales
      const formattedValue = roundedNum.toFixed(2);
      return formattedValue.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    }

    private clienteCambiado = new Subject<string>();
    clienteCambiado$ = this.clienteCambiado.asObservable();
  
    notificarCambioCliente(codCli: string): void {
      this.clienteCambiado.next(codCli);
    }

    buscaalmacen() {
      const formData = new FormData();
      const token = this.authService.getToken();
  
      const headers = new HttpHeaders({
        'X-Auth-Token': `${token}`
      });
      const apiUrl = `${API_URL}portalcli/buscaalmacen`;
  
      formData.append('codCli', this.authService.getCodCli() ?? '');
  
      this.http.post(apiUrl, formData, { headers: headers }).subscribe({
        next: (response: any) => {
          //console.log('entre')
          this.clienteDataSource.next(response.datcli.datcli);
        },
        error: (error) => {
          console.error('Error de la API:', error);
        },
      });
    }

} 
