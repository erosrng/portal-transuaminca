import { CommonModule, Location  } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './../../auth.service';
import Swal from 'sweetalert2';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { API_URL } from './../../app.config';
import { API_URLINTER } from './../../app.config';

import { MatTableDataSource, MatTableModule } from '@angular/material/table'; 
import { MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input'; // Importa MatInputModule
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select'; // Importa MatSelectModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Importa MatFormFieldModule


export interface Product {
  img: string;
  descrip: string;
  preciosiniva: number;
  ivabs: number;
  preciod: number;
  ivad: number;
  totalbs: number;
  totald: number;
  cant: number;
  id_pedido: number;
  codigoa: string;
}

@Component({
  selector: 'app-carrito-page',
  imports: [
    CommonModule,
    NavBarComponent,
    SideBarComponent,
    MatTableModule,
    MatFormFieldModule, 
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSelectModule
  ],
  templateUrl: './carrito-page.component.html',
  styleUrl: './carrito-page.component.scss'
})

export class CarritoPageComponent implements OnInit, AfterViewInit {
  isLoading = false; 

  sortField: string = 'descrip'; // Campo de ordenamiento inicial
  sortDirection: 'desc' | 'asc' = 'desc'; 
  //productscar: any[] = [];
  private subscriptions: Subscription[] = []; 
  private clienteCambiadoSubscription: Subscription | undefined;

  productosEnCarritoNumber: string = '';
  productscar: Product[] = [];
  dataSource = new MatTableDataSource<Product>(this.productscar);
  displayedColumns: string[] = ['img', 'descrip', 'oprecio', 'opreciod','total', 'totald', 'cant', 'actions']; // Ajusta las columnas según tus necesidades
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalBs: string = '';
  totalUsd: number = 0;
  unidades: string = '';
  encarprod: string = '';

  search: string | null = null;
  productosEnCarritoCodigos: string[] = [];

  constructor(
    private route: Router, 
    private http: HttpClient, 
    public authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService,
    public dialog: MatDialog,
    private location: Location,
  ) {}

  ngOnInit() { 
    this.openCar();
    this.clienteCambiadoSubscription = this.portalcliLogicaService.clienteCambiado$.subscribe(() => {
      this.openCar();
    });
  }

  ngAfterViewInit(): void {

  }

  @ViewChild('productModalTemplate')
  productModalTemplate!: TemplateRef<any>;

    
  openCar() {
    const codCli = this.authService.getCodCli();
    this.sortData(this.sortField as keyof Product);

    this.isLoading = true; 
    const token = this.authService.getToken();
    const formData = new FormData();

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const apiUrl = `${API_URL}portalcli/opencardb`;
    formData.append('codCli', codCli ?? '');

    this.http.post(apiUrl,formData, { headers: headers }).subscribe({
      next: (response: any) => {
        this.revisarCarrito();
        this.productscar = response; 
        this.dataSource.data = this.productscar; // Asigna productscar al dataSource
        this.dataSource.paginator = this.paginator; // Asigna el paginador
        this.dataSource.sort = this.sort;
        this.isLoading = false;  

      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de la API:', error);
      },
    });
  }

  navigateTo(route: string, queryParams?: any) {
  this.portalcliLogicaService.navigateTo(route, queryParams);
}

  eliminareg(caller: any, idPedido: any, codigo: any) {
      this.isLoading = true;
  
      const apiUrl = `${API_URL}portalcli/eliminareg`;
      const formData = new FormData();
      const token = this.authService.getToken();
  
      const headers = new HttpHeaders({
          'X-Auth-Token': `${token}`
      });
  
      formData.append('id', idPedido);
      formData.append('codigo', codigo);
  
      this.productscar = this.productscar.filter(product => product.id_pedido !== idPedido && product.codigoa !== codigo);
      this.dataSource.data = this.productscar;
        
      this.http.post(apiUrl, formData, { headers: headers }).subscribe({
          next: (response: any) => {
              this.isLoading = false;
              if (response.status === true) {
                  // Actualiza productscar
                  this.productscar = this.productscar.filter(product => product.id_pedido !== idPedido && product.codigoa !== codigo);
                  this.revisarCarrito();
                  Swal.fire({
                      text: 'Producto eliminado',
                      icon: 'success',
                      showConfirmButton: false,
                      timer: 3000,
                      toast: true,
                      position: 'bottom-end',
                  });
              } else {
                this.alertaerror;
              }
          },
          error: (error) => {
              this.isLoading = false;
              this.alertaerror;
          },
      });
  }

  //Envia pedidos al servidor
  async enviaped() {
    Swal.showLoading(); 
    const codCli = this.authService.getCodCli();
    const formData = new FormData();
    const token = this.authService.getToken();

    //**************************************
    //Revisa que el pedido no sea menor a 20$ 
    if(this.totalUsd < 20){
      const totalhoy = await this.traetotalhoy();
      
      if(totalhoy<20){
        Swal.fire({
          icon: 'info',
          title: '<h2 style="color: #2c5530; margin: 0; font-size: 1.9rem;">Valoramos su preferencia</h2>',
          html: `
              <div style="text-align: center; padding: 10px;">
                  <p style="font-size: 1.8rem; line-height: 1.6; color: #555; text-align: left;">
                      Apreciado cliente,<br><br>
                      Agradecemos su interés en nuestros productos. Para brindarle el mejor servicio, 
                      le informamos que por política de la empresa, no procesamos el <strong style="color: #2c5530;">primer pedido del día 
                      inferior a $20 USD</strong>.<br><br>
                      Lo invitamos cordialmente a revisar nuestras <strong style="color: #e91e63;">ofertas especiales y promociones</strong> 
                      para complementar su pedido y alcanzar este valor mínimo.<br><br>
                      Estamos seguros de que encontrará opciones adicionales que serán de su agrado.
                  </p>
              </div>
          `,
          showCancelButton: true,
          confirmButtonText: '<span style="font-size: 1.8rem; font-weight: bold;">🎁 VER OFERTAS ESPECIALES</span>',
          cancelButtonText: '<span style="font-size: 1.6rem;">✕ Cancelar</span>',
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d',
          background: '#ffffff',
          iconColor: '#28a745',
          width: 600,
          padding: '2em',
          customClass: {
              popup: 'swal-popup-custom',
              confirmButton: 'swal-confirm-btn-profesional',
              cancelButton: 'swal-cancel-btn-profesional',
              title: 'swal-title-custom'
          }
      }).then((result) => {
          if (result.isConfirmed) {
              Swal.fire({
                  title: '<h3 style="color: #2c5530;">Buscando ofertas...</h3>',
                  html: `
                      <div style="text-align: center; padding: 20px;">
                          <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
                              <span class="sr-only">Cargando...</span>
                          </div>
                          <p style="margin-top: 20px; color: #666; font-size: 1.1rem;">
                              Estamos preparando las mejores ofertas para usted
                          </p>
                      </div>
                  `,
                  allowOutsideClick: false,
                  showConfirmButton: false,
                  width: 500,
                  background: '#f8f9fa'
              });
              
              setTimeout(() => {
                  this.navigateTo('/pedidos', { soloOfertas: 'S' });
              }, 1500);
          }
      });
        return;
      }

    }
    formData.append('codCli', codCli ?? '');
  
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = `${API_URL}portalcli/enviapedweb`;
    //const apiUrl = `${API_URLINTER}portalcli/enviaped/0`;
    Swal.fire({
      title: '¿Desea enviar el pedido?',
      text: "Esta acción no se puede deshacer.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Enviando pedido...',
          text: 'Por favor, espere.',
          allowOutsideClick: false, 
          didOpen: () => {
            Swal.showLoading(); 
          }
        });
  
        this.http.post(apiUrl, formData, { headers: headers }).subscribe({
          next: (response: any) => {
            //Swal.close(); 
            if (response.status) {
              this.revisarCarrito();
              Swal.fire(response.mensaje, '', 'success');
              this.productscar = [];
              this.dataSource.data = this.productscar;
              //this.enviaServer();
            } else {
              Swal.fire(response.mensaje, '', 'error');
            }
          },
          error: (error) => {
            Swal.close(); // Close the loader on error
            Swal.fire('Error al enviar el pedido', 'Por favor, intente de nuevo. Detalles: ' + error.message, 'error');
            console.error('Error de la API:', error);
          },
        });
      }
    });
  }

  //////////////////////////
  //Revisamos si ya pidio mas de 20 hoy
  async traetotalhoy(): Promise<number> {
    const codCli = this.authService.getCodCli();
    const formData = new FormData();
    const token = this.authService.getToken();
  
    formData.append('codCli', codCli ?? '');
  
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });
    const apiUrl = `${API_URLINTER}portalcli/totalhoy`;
  
    try {
      const response: any = await this.http.post(apiUrl, formData, { headers: headers }).toPromise();
      return response.saldo || 0;
    } catch (error) {
      console.error('Error al obtener total hoy', error);
      return 0;
    }
  }

  enviaServer() {
    const codCli = this.authService.getCodCli();
    const formData = new FormData();
    const token = this.authService.getToken();
  
    formData.append('codCli', codCli ?? '');
  
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });
    const apiUrl = `${API_URLINTER}portalcli/enviaserver`;
  
    // Ejecutar en segundo plano sin esperar respuesta ni mostrar interfaz al usuario
    this.http.post(apiUrl, formData, { headers: headers }).subscribe({
      next: (response: any) => {
        // Solo registrar en consola, no mostrar nada al usuario
        this.revisarCarrito();
        this.productscar = [];
        this.dataSource.data = this.productscar;
        Swal.fire(response.mensaje, '', 'success');

        //console.log('Envío al servidor completado:', response);
      },
      error: (error) => {
        // Solo registrar error en consola, no mostrar nada al usuario
        console.error('Error al enviar al servidor (background):', error);
      }
    });
}

  //Vacia carrito
  vaciacar(): void {
    Swal.fire({
      title: '¿Desea vaciar el carrito?',
      text: "Eliminar todos los productos en el mismo.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Vaciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.portalcliLogicaService.vaciacar().subscribe({
          next: (response: any) => {
            if (response.status) {
              // Vaciar this.productscar
              this.productscar = [];
  
              // Actualizar this.dataSource.data
              this.dataSource.data = this.productscar;
  
              // Actualizar el carrito
              this.revisarCarrito();
  
              Swal.fire({
                text: 'Carro vacio',
                icon: 'success',
                showConfirmButton: false,
                timer: 3000,
                toast: true,
                position: 'bottom-end',
              });
            } else {
              this.alertaerror();
            }
          },
          error: (error) => {
            this.alertaerror();
          },
        });
      }
    });
  }

  revisarCarrito() {
    this.portalcliLogicaService.revisarCarrito();
    this.subscriptions.push(
      this.portalcliLogicaService.productosEnCarrito$.subscribe((productos) => {
        // Verificar si el array tiene elementos antes de acceder a [0]
        if (productos && productos.length > 0 && productos[0].value > 0) {
          this.productosEnCarritoNumber = productos[0].value;
        } else {
          this.productosEnCarritoNumber = '0';
        }
      }),
      this.portalcliLogicaService.unidades$.subscribe((unidades) => {
        this.unidades = unidades;
      }),
      this.portalcliLogicaService.totalBs$.subscribe((totalBs) => {
        this.totalBs = totalBs;
      }),
      this.portalcliLogicaService.totalUsd$.subscribe((totalUsd) => {
        this.totalUsd = Number(totalUsd);
      }),
      this.portalcliLogicaService.encarprod$.subscribe((encarprod) => {
        this.encarprod = encarprod;
      }),
    );
  }

  validateInput(product: any, event: any) {
    product.cant = this.portalcliLogicaService.validateCant(event);
  }

  alertaerror(){
    this.portalcliLogicaService.alertaerror();
  }

  mostrarLoader(){
    this.portalcliLogicaService.mostrarLoader();
  }

  ocultarLoader(){
    this.portalcliLogicaService.ocultarLoader();
  }

  imageficha: any;
  selectedProduct: any = null;

openDialog() {
  this.dialog.open(this.productModalTemplate, {
      width: '80%',
      maxWidth: '1200px',
      data: { product: this.selectedProduct, imageUrl: this.imageficha } // Puedes pasar datos si es necesario
  });
}

  sortData(sortField: keyof Product) {
    this.sortField = sortField;
    this.productscar.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) {
            return this.sortDirection === 'asc' ? -1 : 1;
        } else if (valueA > valueB) {
            return this.sortDirection === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });

    this.dataSource.data = this.productscar;
  }
  onSortChange(sortField: string) {
    this.sortData(sortField as keyof Product);
}

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortData(this.sortField as keyof Product);
}

clear(): void {
  this.search = '';
  this.dataSource.filter = '';
}    

  // Agrega la función applyFilter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  updatecant(idPedido: string, codigo: string, existen: string, change: string) {
    const input = document.getElementById(`cantidad_${codigo}`) as HTMLInputElement;

    const existenNum = parseInt(existen); // Convertir a número correctamente

    if (input) {
        const cantidadInput = parseInt(input.value); // Obtener el valor del input y convertirlo a número

        if (cantidadInput > existenNum && change!="-") { 
            Swal.fire('Cantidad mayor a existencia', '', 'error');
            return;
        }

        let newValue = cantidadInput + ((change === '-') ? -1 : 1);

        if (newValue > 0) {
            input.value = newValue.toString();
            this.totaliza(idPedido, codigo, newValue, existenNum); // Usar existenNum
        }
    }
}


  totaliza(idPedido: string, codigo: string, cantidad: number, existen: number) {
      const apiUrl = `${API_URL}portalcli/totalizacampo`;
      const formData = new FormData();
      const token = this.authService.getToken();
  
      const headers = new HttpHeaders({
          'X-Auth-Token': `${token}`
      });
  
      formData.append('id', idPedido);
      formData.append('codigo', codigo);
      formData.append('cantidad', cantidad.toString());

      this.http.post(apiUrl, formData, { headers: headers }).subscribe({
          next: (response: any) => {
              this.isLoading = false;
              if (response.status == true) {
                  // Actualiza productscar
                  this.openCar();
                  this.revisarCarrito();
                  Swal.fire({
                      text: 'Producto Actualizado',
                      icon: 'success',
                      showConfirmButton: false,
                      timer: 3000,
                      toast: true,
                      position: 'bottom-end',
                  });
              } else {
                this.alertaerror;
              }
          },
          error: (error) => {
              this.isLoading = false;
              this.alertaerror;
          },
      });

    /* $.ajax({
        url: baseUrl + 'portalcli/totalizacampo', // Ruta al archivo PHP que realizará el update
        method: 'POST', // Método de la solicitud   
        data: { idPedido: idPedido, cantidad: value, codigo: codigo}, // Datos que se enviarán al archivo PHP
        success: function(response) {
            //opencar();
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    });
    retotalbs(codigo); */
}  

openProductModal(codigo: string) {
  Swal.showLoading();
    this.portalcliLogicaService.openProductModal(codigo).subscribe({ // Suscríbete al Observable
      next: (data) => {
        this.selectedProduct = data.product;
        this.imageficha = data.imageUrl;
        Swal.close();
      },
      error: (error) => {
        Swal.close();
        console.error('Error al obtener el producto:', error);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }


}