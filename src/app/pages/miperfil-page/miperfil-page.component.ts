import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { ClicardComponent } from "../../components/clicard/clicard.component";
import { HistorialpedComponent } from "../../components/historialped/historialped.component";

import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { AuthService } from './../../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from './../../app.config';
import { API_URLINTER } from './../../app.config';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-miperfil-page',
  imports: [
    CommonModule,
    NavBarComponent,
    FooterComponent,
    SideBarComponent,
    ClicardComponent,
    FormsModule
],
  templateUrl: './miperfil-page.component.html',
  styleUrl: './miperfil-page.component.scss'
})
export class MiperfilPageComponent implements OnInit {
  fichaData: any = {};
  nuevaContrasena = '';
  confirmarContrasena = '';
  prefijoTelefono = '0414';
  contrasenaActual = '';
  contrasenaValida = false;
  contrasenaInvalida = false;
  isLoading = false;

  ngOnInit() {
    const token = this.authService.getToken();

    this.cargarDatosCliente();
  }

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService
  ) { }

  cargarDatosCliente() {
    this.portalcliLogicaService.clienteData$.subscribe(data => {
      if (data) {
        let telefono = data.telefono || '';
        telefono = telefono.replace(/\D/g, '');
        this.fichaData = {
          cliente: data.cliente,
          nombre: data.nombre,
          correoElectronico: data.email,
          telefono: telefono.substring(4),
          contacto: data.contacto,
          direccion: data.direccion,
        };
        this.prefijoTelefono = telefono.substring(0, 4) || '0414';
      }
    });
  }

  verificarContrasena() {
    const old_pws = this.contrasenaActual;
    const token = this.authService.getToken();

    const formData = new FormData();
    formData.append('old_pws', old_pws);

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    this.http.post(`${API_URL}portalcli/buscaopws`, formData, { headers: headers }).subscribe({
      next: (response: any) => {
        if (response.status==false) {
          this.contrasenaInvalida = true;
          this.contrasenaValida = false;
        } else {
          this.contrasenaValida = true;
          this.contrasenaInvalida = false;
        }
      },
      error: (error) => {
        console.error('Error al verificar contraseña:', error);
        this.contrasenaInvalida = true;
        this.contrasenaValida = false;
      },
    });
  }


  actualizarDatos(formData: any) {
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
      });
      return;
    }
  
    const data = new FormData();
    data.append('correoElectronico', formData.correoElectronico);
    data.append('telefono', this.prefijoTelefono + formData.telefono);
    data.append('contacto', formData.contacto);
    //data.append('direccion', formData.direccion);
    if (this.nuevaContrasena) {
      data.append('nuevaContrasena', this.nuevaContrasena);
      data.append('contrasenaActual', this.contrasenaActual);
    }
  
    const headers = new HttpHeaders({
      'X-Auth-Token': `${this.authService.getToken()}`,
    });
    const apiUrl = `${API_URL}portalcli/actualizar_perfil`;
    const apiUrl2 = `${API_URLINTER}portalcli/actualizar_perfil`;
  
    Swal.fire({
      title: '¿Desea actualizar su ficha?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Crear observables para ambas peticiones
        const request1 = this.http.post(apiUrl, data, { headers: headers });
        const request2 = this.http.post(apiUrl2, data, { headers: headers });
  
        // Ejecutar ambas peticiones en paralelo
        forkJoin([request1, request2]).subscribe({
          next: ([response1, response2]) => {
            //console.log('Datos actualizados en ambos servidores:', response1, response2);
            Swal.fire({
              icon: 'success',
              title: 'Actualizado',
              text: 'Su ficha ha sido actualizada en todos los sistemas.',
            }).then(() => { 
              window.location.reload();
            });
            
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al actualizar datos:', error);
            let errorMessage = 'Error al actualizar datos.';
            
            // Puedes personalizar el mensaje de error según qué petición falló
            if (Array.isArray(error)) {
              // Si es un array de errores (forkJoin puede devolver esto)
              errorMessage = 'Error al actualizar en uno o más servidores.';
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
            });
          }
        });
      }
    });
  }
  
  // Método auxiliar para cerrar el modal y limpiar campos
  cerrarModal() {
    const modal = document.getElementById('actualizarDatosModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
      this.contrasenaActual = '';
      this.nuevaContrasena = '';
      this.confirmarContrasena = '';
    }
  }


  alertaerror() {
    this.portalcliLogicaService.alertaerror();
  }

  mostrarLoader() {
    this.portalcliLogicaService.mostrarLoader();
  }

  ocultarLoader() {
    this.portalcliLogicaService.ocultarLoader();
  }
}