import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { ClicardComponent } from "../../components/clicard/clicard.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// --- ¡Nuevas importaciones de Angular Material! ---
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { AuthService } from './../../auth.service';
import { API_URL } from './../../app.config';
import { API_URLINTER } from './../../app.config';
import { URLSOLAINTER } from './../../app.config';
import { URLSOLA } from './../../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

import {MatExpansionModule} from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import {CarritoPageComponent} from "../carrito-page/carrito-page.component";
import {ProgressSpinner} from "primeng/progressspinner";

interface GrupoCliente {
  clienteId: string;
  clienteNombre: string;
  productos: any[]; // Array de productos de ese cliente
  subtotalBs: number;
  subtotalUsd: number;
  totalUnidades: number;
}

interface ProductData {
  id_pedido: string;
  cliente: string;
  nombre: string;
  codigoa: string;
  barras: string;
  descrip: string;
  existen: string;
  oprecio: string; 
  opreciod: string;
  total: string; 
  totald: string;
  precio: string; 
  preciod: string; 
  iva: string;
  cant: string; 
  segmento: number;
  tasa: string;
  lote: string;
  vence: string;
  img: string;
  descu: number;
}

@Component({
  selector: 'app-tomaexcel-page',
  standalone: true,
    imports: [
        CommonModule,
        NavBarComponent,
        FooterComponent,
        SideBarComponent,
        ClicardComponent,
        FormsModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatExpansionModule,
        MatSnackBarModule,
        CarritoPageComponent,
        ProgressSpinner,
    ],
  templateUrl: './tomaexcel-page.component.html',
  styleUrl: './tomaexcel-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TomaexcelPageComponent implements OnInit, OnDestroy {
  esgrupo: any;
  selectedProduct: any = null;

  loading: boolean = false;
  // --- Mantenemos esta variable, ngModel se enlazará a ella ---
  tipoCarga = '';
  groupedClientData: GrupoCliente[] = [];
  mostrarSoloIndividual = false;

  constructor(
    public authService: AuthService,
    public portalcliLogicaService: PortalcliLogicaService,
    private route: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  jsonData: any;
  jsonExcel: any;
  fileName: string = '';
  habilitarCargar: boolean = false; 
  private subscriptions: Subscription[] = []; 
  
  productosEnCarritoNumber: string = '';
  productosEnCarrito: any[] = [];

  ngOnInit(): void {
    this.esgrupo = this.authService.getCmatriz();
    if(this.esgrupo){
      this.Procesarpedido();
    }else {
        this.tipoCarga = 'individual'
        this.mostrarSoloIndividual = true;
    }
    this.revisarCarrito();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onFileChangeIndividual(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx')) {
        this.fileName = file.name;
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
          const binarystr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];

          this.jsonData = XLSX.utils.sheet_to_json(ws);
          this.jsonExcel = XLSX.utils.sheet_to_json(ws, {header: 1});

          Swal.fire({
            text: 'Presione cargar archivo para procesar pedido',
            icon: 'info',
            showConfirmButton: false,
            timer: 9000,
            toast: true,
            position: 'bottom-end',
          });
        };

        reader.readAsBinaryString(file);
      } else {
        Swal.fire({
            text: 'Por favor, seleccione un archivo .xlsx',
            icon: 'error',
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            position: 'bottom-end',
        });

        this.fileName = '';
        this.jsonData = null;
      }
    } else {
      Swal.fire({
        text: 'Por favor, seleccione un archivo .xlsx',
        icon: 'error',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        position: 'bottom-end',
    });
      this.fileName = '';
      this.jsonData = null;
    }
  }

  showloading(): void {
      Swal.fire({
          title: 'Cargando Archivo',
          text: 'espere un momento',
      });
  }

    cargarArchivo(): void {
        Swal.showLoading();
        this.loading = true; // Indicar que la carga ha comenzado

        // 1. Validar que tenemos datos para procesar
        if (!this.jsonExcel || this.jsonExcel.length === 0) {
            Swal.fire({
                text: 'No hay datos en el archivo para cargar. Por favor, seleccione un archivo .xlsx válido.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            this.loading = false;
            return;
        }

        // 2. Encontrar los índices de "Codigo" y "Pedido" y la fila de encabezados
        let codigoIndex: number = -1;
        let pedidoIndex: number = -1;
        let descripcionIndex: number = -1;
        let headerRowIndex: number = -1;

        // Iterar solo en las primeras filas para encontrar los encabezados (ej. primeras 20 filas para mayor flexibilidad)
        for (let i = 0; i < Math.min(this.jsonExcel.length, 20); i++) {
            const currentRow = this.jsonExcel[i];

            if (Array.isArray(currentRow) && currentRow.some(cell => typeof cell === 'string')) {
                const foundCodigo = currentRow.indexOf("Codigo");
                const foundPedido = currentRow.indexOf("Pedido");
                const foundDescripcion = currentRow.indexOf("Descripcion");

                if (foundCodigo !== -1 && foundPedido !== -1) {
                    codigoIndex = foundCodigo;
                    pedidoIndex = foundPedido;
                    descripcionIndex = foundDescripcion;
                    headerRowIndex = i;
                    break;
                }
            }
        }

        // 3. Validar que se encontraron las columnas y la fila de encabezados
        if (codigoIndex === -1 || pedidoIndex === -1 || headerRowIndex === -1) {
            Swal.fire({
                title: 'Columnas no encontradas',
                text: 'No se pudieron encontrar las columnas "Codigo" y "Pedido" en el archivo. Asegúrese de que existen y están bien escritas.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            this.loading = false;
            return;
        }

        console.log("Índice de 'Codigo':", codigoIndex);
        console.log("Índice de 'Pedido':", pedidoIndex);
        console.log("Índice de 'Descripcion':", descripcionIndex);
        console.log("Fila de encabezados encontrada en el índice:", headerRowIndex);

        const codigosVaciosOInvalidos: any[][] = []; // Renombrado para reflejar que incluye cantidades inválidas
        const promises: Promise<any>[] = [];

        Swal.fire({
            title: 'Procesando archivo...',
            text: 'Agregando productos al carrito. Por favor, espere.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 4. Procesar las filas de datos reales (empezando DESPUÉS de la fila de encabezados)
        for (let i = headerRowIndex + 1; i < this.jsonExcel.length; i++) {
            const row = this.jsonExcel[i];

            // Validar que la fila es un array y tiene suficientes columnas
            if (Array.isArray(row) && row.length > Math.max(codigoIndex, pedidoIndex)) {
                let codigoProducto: string = String(row[codigoIndex] || '').trim().replace(/[^a-zA-Z0-9]/g, '');
                let descripcionProducto: string = String(row[descripcionIndex] || '').trim().replace(/[^a-zA-Z0-9]/g, '');
                const cantidadPedido: number = Number(row[pedidoIndex]); // Obtener la cantidad del pedido

                // **Nueva verificación: Cantidad válida y mayor a 0, y código existente**
                if (codigoProducto && !isNaN(cantidadPedido) && cantidadPedido > 0) {
                    promises.push(
                        this.portalcliLogicaService.agregarAlCarrito({ codigo: codigoProducto }, cantidadPedido, '').toPromise()
                            .then((response: any) => {
                                if (!response.status) {
                                    // Si la respuesta no es exitosa, guardamos la fila completa
                                    codigosVaciosOInvalidos.push(row);
                                }
                            })
                            .catch((error: any) => {
                                console.error(`Error al agregar el producto ${descripcionProducto} al carrito:`, error);
                                // También agregamos la fila si hay un error en la llamada
                                codigosVaciosOInvalidos.push(row);
                            })
                    );
                } else {
                    // Si el código no existe, o la cantidad es NaN o menor/igual a 0
                    console.warn(`Producto no procesado: Código '${descripcionProducto}' o cantidad '${cantidadPedido}' inválida. Fila:`, row);
                    // codigosVaciosOInvalidos.push(row);
                }
            } else {
                // En caso de que la fila no sea un array o no tenga suficientes columnas
                console.warn(`Fila ${i} es inválida o no tiene suficientes columnas para 'Codigo' o 'Pedido'. Fila:`, row);
                codigosVaciosOInvalidos.push(row); // También registramos estas filas para el reporte
            }
        }

        // 5. Esperar que todas las promesas se resuelvan
        Promise.all(promises)
            .then(() => {
                Swal.close();

                if (codigosVaciosOInvalidos.length > 0) {
                    console.log('Productos no procesados o con errores:', codigosVaciosOInvalidos);

                    let contenidoAlerta = '';
                    codigosVaciosOInvalidos.forEach((fila) => {
                        const codigo = fila[codigoIndex] || 'N/A';
                        const descrip = fila[descripcionIndex] || 'N/A';
                        const cantidad = fila[pedidoIndex]; // Obtenemos la cantidad original
                        contenidoAlerta += `- Código: ${descrip} (Pedido: ${cantidad || 'N/A'})<br>`;
                    });

                    Swal.fire({
                        title: 'Algunos productos no se cargaron',
                        html: 'Los siguientes productos no se agregaron al carrito, posiblemente por falta de existencia, o porque ya están en el carrito:<br><br>' + contenidoAlerta,
                        icon: 'warning',
                        width: '600px',
                        heightAuto: false,
                        scrollbarPadding: false,
                        customClass: {
                            container: 'swal-container',
                        },
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    }).then(() => {
                        this.route.navigate(['/carrito']);
                    });
                } else {
                    Swal.fire({
                        title: '¡Carga completa!',
                        text: 'Todos los productos válidos del archivo se agregaron correctamente al carrito.',
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    }).then(() => {
                        this.route.navigate(['/carrito']);
                    });
                }
            })
            .catch(error => {
                Swal.close();
                Swal.fire('Error en la carga', 'Hubo un problema inesperado al procesar el archivo. Por favor, intente de nuevo.', 'error');
                console.error('Error al procesar el archivo completo:', error);
            })
            .finally(() => {
                this.loading = false;
                this.revisarCarrito(); // Si tienes un método para actualizar el carrito global
                this.fileName = '';
                this.jsonData = null;
                this.jsonExcel = []; // Limpiar el array de arrays
            });
    }


    bajaexcel() {
    Swal.showLoading();    
    const formData = new FormData();
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();

    formData.append('codCli', codCli ?? '');
    
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = `${API_URLINTER}portalcli/traesegme`;
  
    this.http.post(apiUrl, formData, { headers: headers }).subscribe({
      next: (response: any) => {
        Swal.close();
        window.location.href = `${URLSOLAINTER}generador/${response.archivo}`;
      },
      error: (error) => {
        console.error('Error de la API:', error);
        Swal.fire('Error', 'No se pudo descargar el listado. Intente de nuevo.', 'error');
      },
    });
  }

  bajaexcelgrupo() {
    Swal.showLoading();
    
    const formData = new FormData();
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });
    const apiUrl = `${API_URLINTER}portalcli/getfile`;
  
    this.http.post(apiUrl, formData, { 
      headers: headers,
      responseType: 'blob'
    }).subscribe({
      next: (response: Blob) => { // <-- Expect the response as a Blob
        const nombreGrupo: string = this.authService.getCmatriz() || 'grupo'; // Fallback for safety
        
        // No need for Swal.showLoading() here again.
        
        try {
            const url = window.URL.createObjectURL(response);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pedidoInsuaminca_${nombreGrupo}.xlsx`; // Set the desired filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // Clean up the URL object
            Swal.close(); // Close loader on successful download
            // Optional: Show a success message
            Swal.fire({
                icon: 'success',
                title: '¡Descarga completada!',
                text: 'El archivo Excel se ha descargado correctamente.',
                showConfirmButton: false,
                timer: 2000,
                toast: true,
                position: 'bottom-end'
            });
        } catch (downloadError) {
            console.error('Error al procesar la descarga del archivo:', downloadError);
            Swal.close(); // Ensure loader is closed even if there's a processing error
            Swal.fire({
                icon: 'error',
                title: 'Ocurrió un error al generar la descarga',
                text: 'Intente nuevamente. Si el error persiste, contacte a soporte.',
                showCancelButton: false,
            });
        }
      },
      error: (error) => {
        Swal.close(); // Close loader on any API error
        console.error('Error de la API al descargar el archivo:', error);
        let errorMessage = 'No se pudo descargar el listado. Intente de nuevo.';
        // Optionally, if the error contains a readable message (e.g., from a JSON error body)
        // you might extract it, but for a blob error, it's often a network issue.
        Swal.fire('Error', errorMessage, 'error');
      },
    });
}

onFileChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
      this.readFile(file);
  }
}

readFile(file: File): void {
  const reader: FileReader = new FileReader();
  try {
      reader.onload = (e: any) => {
          try {
              const binaryString: string = e.target.result;
              const workbook: XLSX.WorkBook = XLSX.read(binaryString, {type: 'binary'});
              const sheetName: string = workbook.SheetNames[0]; // Suponemos que solo hay una hoja
              const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
              this.processExcelData(worksheet);
          } catch (e) {
              this.showError();
          }
      };

      reader.onerror = (error) => {
          console.error('Error al leer el archivo:', error);
          this.showError();
      };

      reader.readAsBinaryString(file);
  } catch (e) {
     this.showError();
  }

}

processExcelData(worksheet: XLSX.WorkSheet): void {
  Swal.fire({
    title: 'Cargando archivo...',
    text: 'Por favor, espere.',
    allowOutsideClick: false, 
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
  if (jsonData && jsonData.length > 2) {
      // const
      const headersNames = jsonData[0].filter(header => header !== null && header !== undefined);
      const headersCodigos = jsonData[1].filter(header => header !== null && header !== undefined);
      const pedidosRealizados: any[] = [];
      const dataRows: any[] = jsonData.slice(2).map(row => {return row})


      headersNames.forEach((item, index) => {
          if (index > 4) {
              pedidosRealizados.push({
                  nombreCliente: item,
                  codigoCliente: headersCodigos[index - 5],
                  indexPedido: index,
                  pedido: [],
              });
          }
      });

      // //console.log(pedidosRealizados)

      pedidosRealizados.forEach((item, index) => {
          dataRows.forEach((row) => {
              if (row[item.indexPedido]) {
                  item.pedido.push({
                      Codigo: row[0],
                      Unidades: this.formatearCantidad(row[item.indexPedido])
                  });
              }
          })
      });

      const pedidoFinales: any[] = pedidosRealizados.filter(item => item.pedido.length > 0)

      if (pedidoFinales.length > 0) {
        console.log(pedidoFinales);
        //let contadorLlamadasAggPedido = 0; // Para contar cuántas veces se llama agg_pedido
      
        // Itera sobre cada cliente con un pedido (item en pedidoFinales)
        pedidoFinales.forEach((clientePedido) => {
          const codigoCliente = clientePedido.codigoCliente; 
      
          clientePedido.pedido.forEach((producto: { Codigo: any; Unidades: any; }) => {
            const codigoProducto = producto.Codigo;
            const unidadesProducto = producto.Unidades;
      
            this.agg_pedido(codigoProducto, unidadesProducto, codigoCliente);
            //contadorLlamadasAggPedido++;
          });
        });
      
        this.Procesarpedido();
      }
      
      /* this.dataSource = pedidoFinales;
      console.log(this.dataSource) */
      Swal.close()

  } else {
      console.warn('El archivo Excel no tiene suficientes filas o la estructura esperada.');
      this.jsonData = null;
      Swal.fire({
          icon: 'error',
          title: 'El archivo Excel no tiene suficientes filas o la estructura esperada.',
          text: 'intente nuevamente, si continua el error pongase en contacto con nosotros',
          showCancelButton: false,
      });
  }
}

formatearCantidad(cantidadString: string): number {
  const sinPuntosMiles = cantidadString.replace(/\./g, '');

  // Verificar si hay una coma decimal
  if (sinPuntosMiles.includes(',')) {
      // Si hay una coma, la mantenemos y eliminamos cualquier punto restante (por si acaso)
      return parseFloat(sinPuntosMiles.replace(/\./g, ''));
  } else {
      // Si no hay coma, simplemente devolvemos la cadena sin los puntos de miles
      return parseFloat(sinPuntosMiles);
  }
}

agg_pedido(codigo: any, cantidad: number, cliente: any) {

  const token = this.authService.getToken();
  const formData = new FormData();

  const headers = new HttpHeaders({
    'X-Auth-Token': `${token}`
  });

  formData.append('codigo', codigo);
  formData.append('cana', cantidad.toString());
  formData.append('codCli', cliente);

  const apiUrl = `${API_URL}agg_pedido/agg_pedido`;

  //return this.http.post(apiUrl, formData, { headers: headers });

  this.http.post(apiUrl, formData, { headers: headers }).subscribe({
        next: (response: any) => {
           let mensaje = response.mensaje;
                  if (typeof mensaje === 'object') {
                    mensaje = JSON.stringify(mensaje);
                  }
                  Swal.fire({
                    text: mensaje == 'Producto Agregado' ? 'Pedido agregado exitosamente!' : mensaje,
                    icon: mensaje == 'Producto Agregado' ? 'success' : 'error',
                    showConfirmButton: false,
                    timer: 3000,
                    toast: true,
                    position: 'bottom-end',
                  });
          this.cdr.detectChanges(); 
        },
        error: (error) => {
          console.error('Error de la API:', error);
          this.cdr.detectChanges(); 
        },
      });
}

showError() {
  Swal.fire({
      icon: 'error',
      title: 'Error al leer el archivo',
      text: 'intente nuevamente, si continua el error pongase en contacto con nosotros',
      showCancelButton: false,
  })
}

  revisarCarrito() {
    this.portalcliLogicaService.revisarCarrito();
    const sub = this.portalcliLogicaService.productosEnCarrito$.subscribe((productos) => {
      //if (productos && productos.length > 0 && productos[0].value !== undefined) {
        this.productosEnCarritoNumber = productos[0].value.toString();
        this.cdr.detectChanges();
      /* } else {
        this.productosEnCarritoNumber = '0';
      } */
    });
    this.subscriptions.push(sub);
  }

  Procesarpedido() {
    Swal.showLoading()
    const formData = new FormData();
    const token = this.authService.getToken();
    const codCli = this.authService.getCodCli();

    formData.append('codCli', codCli ?? '');

    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const apiUrl = `${API_URL}portalcli/carritocm`;
  
    this.http.post(apiUrl, formData, { headers: headers }).subscribe({
      next: (response: any) => {
        // Asegúrate de que `response` contiene los datos directamente,
        this.groupedClientData = this.groupProductsByClient(response); // <-- Asigna un NUEVO ARRAY aquí
        this.calculateFinalOrderSummary();

        Swal.close();
        this.cdr.detectChanges();

      },
      error: (error) => {
        Swal.close();
        console.error('Error de la API:', error);
        this.cdr.detectChanges();
      },
    });
  }
  unidadescm: number = 0;
  encarprodcm: number = 0;
  totalBscm: number = 0;
  totalUsdcm: number = 0;

  calculateFinalOrderSummary() {
    this.unidadescm = 0;
    this.totalBscm = 0;
    this.totalUsdcm = 0;
    this.encarprodcm = this.groupedClientData.length;

    let totalProductosDiferentesEnCarrito = 0; 

    this.groupedClientData.forEach(clientGroup => {
      this.unidadescm += clientGroup.totalUnidades;
      this.totalBscm += clientGroup.subtotalBs;
      this.totalUsdcm += clientGroup.subtotalUsd;
      totalProductosDiferentesEnCarrito += clientGroup.productos.length; 
    });

    this.encarprodcm = totalProductosDiferentesEnCarrito;
  }

  private groupProductsByClient(products: any[]): GrupoCliente[] {
    const grouped: { [key: string]: GrupoCliente } = {};

    products.forEach(product => {
      const clientId = product.cliente;
      if (!grouped[clientId]) {
        grouped[clientId] = {
          clienteId: clientId,
          clienteNombre: product.nombre, 
          productos: [],
          subtotalBs: 0,
          subtotalUsd: 0,
          totalUnidades: 0
        };
      }
      grouped[clientId].productos.push(product);
      grouped[clientId].subtotalBs += parseFloat(product.total || 0); // Asumiendo 'total' es el subtotal en Bs.
      grouped[clientId].subtotalUsd += parseFloat(product.totald || 0); // Asumiendo 'totald' es el subtotal en Usd.
      grouped[clientId].totalUnidades += parseInt(product.cant || 0); // Asumiendo 'cant' es la cantidad.
    });

    return Object.values(grouped);
  }

      vaciacarcm(): void {
        const apiUrl = `${API_URL}portalcli/vaciacarcm`;
        const formData = new FormData();
        const token = this.authService.getToken();
    
        const headers = new HttpHeaders({
          'X-Auth-Token': `${token}`
        });
  
        Swal.fire({
          title: '¿Desea vaciar el carrito del grupo?',
          text: "Eliminar todos los productos en el mismo.",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Vaciar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.http.post(apiUrl, formData, { headers: headers }).subscribe({
              next: (response: any) => {
                if (response.status) {
                  this.productosEnCarrito = [];
                  this.Procesarpedido(); 
                  this.revisarCarrito();
                  this.cdr.detectChanges();
  
                  Swal.fire({
                    text: 'Carro vacio',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 3000,
                    toast: true,
                    position: 'bottom-end',
                  });
                } else {
                   Swal.fire({
                      icon: 'error',
                      title: 'Error al vaciar carrito',
                      showCancelButton: false,
                  })
                }
              },
              error: (error) => {
                 Swal.fire({
                      icon: 'error',
                      title: 'Error al vaciar carrito',
                      showCancelButton: false,
                  })
              },
            });
          }
        });
      }
      onQuantityChange(product: ProductData, event: Event) {
        const inputElement = event.target as HTMLInputElement;
        let newQuantity = parseInt(inputElement.value);
        const existenciaDisponible = parseInt(product.existen || '0', 10); 
    
        // Validación para asegurarse de que sea un número válido y no esté vacío
        if (isNaN(newQuantity) || inputElement.value.trim() === '') {
          inputElement.value = product.cant;
          this.snackBar.open('Por favor, introduce una cantidad válida.', 'Cerrar', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
          return;
        }
    
        // Asegurarse de que la cantidad no sea negativa (ya que min="1" en HTML lo evita, pero es bueno validarlo en TS)
        if (newQuantity < 0) {
            newQuantity = 1; // O puedes dejarlo en 0 y esperar la lógica de eliminación
            inputElement.value = '1'; // Actualiza el input visualmente
            this.snackBar.open('La cantidad no puede ser negativa. Se ha establecido a 1.', 'Cerrar', {
              duration: 3000,
              panelClass: ['warning-snackbar']
            });
        }
    
        if (newQuantity > existenciaDisponible) {
          this.snackBar.open(`La cantidad no puede ser mayor que la existencia disponible (${existenciaDisponible}). Se ha ajustado a la máxima.`, 'Cerrar', {
            duration: 5000,
            panelClass: ['warning-snackbar']
          });
          newQuantity = existenciaDisponible; // <--- Ajusta la cantidad a la existencia máxima
          inputElement.value = newQuantity.toString(); 
          return;
        }
    
        // Llama a tu función para modificar la cantidad
        this.modificarCantidad(product, newQuantity);
      }

        modificarCantidad(product: ProductData, newQuantity: number) {
          if (newQuantity <= 0) {
            this.snackBar.open('La cantidad debe ser mayor a cero. Para eliminar el producto, usa el botón de eliminar.', 'Cerrar', {
              duration: 5000, 
              panelClass: ['warning-snackbar'] 
            });
            
            if (newQuantity === 0) {
              if (confirm(`¿Estás seguro de que quieres eliminar "${product.descrip}" del carrito?`)) {
                this.eliminarItem(product);
              }
            }
            return;
          }
      
          Swal.showLoading();
          const formData = new FormData();
          const token = this.authService.getToken();
          const codCli = this.authService.getCodCli();
      
          formData.append('id', product.id_pedido);
          formData.append('codigo', product.codigoa);
          formData.append('cantidad', newQuantity.toString());
      
          const headers = new HttpHeaders({
            'X-Auth-Token': `${token}`
          });
          const apiUrl = `${API_URL}portalcli/totalizacampo`; 
        
          this.http.post(apiUrl, formData, { headers: headers }).subscribe({
            next: (response: any) => {
              if (response.status == true) {
                this.Procesarpedido(); 
      
                this.snackBar.open('Cantidad actualizada correctamente.', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar', 'snackbar-with-icon'] 
                });
              } else {
                this.snackBar.open(response.message || 'Error al actualizar la cantidad.', 'Cerrar', {
                  duration: 5000,
                  panelClass: ['error-snackbar', 'snackbar-with-icon'] 
                });
              }
              Swal.close();
            },
            error: (error) => {
              Swal.close(); 
              console.error('Error de la API al modificar cantidad:', error);
              this.snackBar.open('Ocurrió un error al conectar con el servidor.', 'Cerrar', {
                duration: 5000,
                panelClass: ['error-snackbar'] // Clase CSS para personalizar el estilo
              });
            },
          });
        }
    
          eliminarItem(product: ProductData) {
            Swal.fire({
              title: '¿Estás seguro?',
              html: `¿Realmente deseas eliminar **"${product.descrip}"** del carrito? Esta acción no se puede deshacer.`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33', 
              cancelButtonColor: '#3085d6', 
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.showLoading(); 
                const formData = new FormData();
                const token = this.authService.getToken();
          
                formData.append('id', product.id_pedido);
                formData.append('codigo', product.codigoa);
          
                const headers = new HttpHeaders({
                  'X-Auth-Token': `${token}`
                });
                const apiUrl = `${API_URL}portalcli/eliminareg`; 
              
                this.http.post(apiUrl, formData, { headers: headers }).subscribe({
                  next: (response: any) => {
                    if (response.status == true) {
                      this.snackBar.open('Producto eliminado correctamente.', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                      });
                      // Después de la eliminación exitosa, recarga los datos del carrito
                      this.Procesarpedido(); 
                      // La detección de cambios para la tabla final del carrito ya está en Procesarpedido()
                    } else {
                      this.snackBar.open(response.message || 'Error al eliminar el producto.', 'Cerrar', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                      });
                    }
                    Swal.close(); 
                    this.cdr.detectChanges();
                  },
                  error: (error) => {
                    Swal.close(); 
                    console.error('Error de la API al eliminar ítem:', error);
                    this.snackBar.open('Ocurrió un error al conectar con el servidor.', 'Cerrar', {
                      duration: 5000,
                      panelClass: ['error-snackbar']
                    });
                    this.cdr.detectChanges();
                  },
                });
              } else {
                this.snackBar.open('Eliminación cancelada.', 'Cerrar', {
                  duration: 2000,
                  panelClass: ['info-snackbar'] 
                });
              }
            });
          }
          imageficha: any;

            openProductModal(codigo: string) {
              this.cdr.detectChanges();

              Swal.showLoading();
                this.portalcliLogicaService.openProductModal(codigo).subscribe({ // Suscríbete al Observable
                  next: (data) => {
                    this.selectedProduct = data.product;
                    this.imageficha = data.imageUrl;
                    Swal.close();
                    this.cdr.detectChanges();
          
                  },
                  error: (error) => {
                    this.cdr.detectChanges();
                    Swal.close();
                    console.error('Error al obtener el producto:', error);
                  },
                });
              }
          
                  enviapedcm(){
                      const formData = new FormData();
                      const token = this.authService.getToken();
                  
                      const headers = new HttpHeaders({
                        'X-Auth-Token': `${token}`
                      });
                      const apiUrl = `${API_URL}portalcli/enviacm`;
                    
                      Swal.fire({
                        
                      title: '¿Desea enviar los pedidos del grupo?',
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
                                    allowOutsideClick: false, // Prevent closing by clicking outside
                                    didOpen: () => {
                                      Swal.showLoading(); // Show the actual loading spinner
                                    }
                                  });
                            
                          this.http.post(apiUrl, formData, { headers: headers }).subscribe({
                            next: (response: any) => {
                              console.log(response)
                              if (response.status) {
                                Swal.close();
                                this.Procesarpedido(); 
                                Swal.fire(response.mensaje, '', 'success');
                                this.productosEnCarrito = [];
                              } else {
                                Swal.fire(response.mensaje, '', 'error');
                                Swal.close();
                              }
                            },
                            error: (error) => {
                              Swal.close();
                              Swal.fire(error, '', 'error');
                              console.error('Error de la API:', error);
                            },
                          });
                      }
                      });
                  }
              

}
