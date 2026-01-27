import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './../../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from './../../app.config';

@Component({
  selector: 'app-historialped',
  imports: [CommonModule],
  templateUrl: './historialped.component.html',
  styleUrl: './historialped.component.scss',
})
export class HistorialpedComponent {
  isLoading = false;
  historialPedidos: any[] = [];
  detallesPedido: any[] = [];
  pedidoSeleccionado: any;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.traeHistorial();
  }

  traeHistorial() {
    this.isLoading = true;
    const formData = new FormData();
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();

    formData.append('codCli', codCli ?? '');

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`,
    });
    const apiUrl = `${API_URL}portalcli/historialped`;

    this.http.post(apiUrl, formData, { headers: headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          this.historialPedidos = response.data;
        } else {
          console.error('Respuesta de la API sin datos:', response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de la API:', error);
      },
    });
  }

  showdetail(pedido: any) {
    this.isLoading = true;
    this.pedidoSeleccionado = pedido; // Guardar el pedido seleccionado

    const headers = new HttpHeaders({
      'X-Auth-Token': `${this.authService.getToken()}`,
    });
    const apiUrl = `${API_URL}portalcli/detalle_pedido/${pedido.pedido}`;

    this.http.post(apiUrl, {}, { headers: headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data && response.data.detalleped) {
          this.detallesPedido = response.data.detalleped;
          this.openDetailsModal();
        } else {
          console.error('Respuesta de la API sin datos de detalleped:', response);
          this.detallesPedido = []; // Asegura que detallesPedido esté vacío en caso de error
          this.openDetailsModal(); // Abre el modal incluso si no hay datos
        }
      },
      error: (error) => {
        console.error('Error al obtener detalles del pedido:', error);
        this.isLoading = false;
        this.detallesPedido = []; // Asegura que detallesPedido esté vacío en caso de error
        this.openDetailsModal(); // Abre el modal incluso si hay error
      },
    });
  }

  openDetailsModal() {
    const myModal = new (window as any).bootstrap.Modal(document.getElementById('detallesPedidoModal'));
    myModal.show();
  }
}