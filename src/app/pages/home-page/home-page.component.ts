import { CommonModule } from '@angular/common';
import { Component, OnInit,ViewEncapsulation, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';

import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { ClicardComponent } from "../../components/clicard/clicard.component";
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';
import { PortalcliLogicaService } from '../../services/portalcli-logica.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { API_URL } from "../../app.config";
import { Observable, throwError } from 'rxjs'; // Asegúrate de importar Observable y throwError
import { catchError, map, finalize } from 'rxjs/operators'; // Importa map y finalize
import { Subscription, takeUntil, Subject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';

declare var bootstrap: any;

export interface OfertaDetalle {
  lista: string;
  descuento: string; // O number si siempre es un número
}


export interface ApiResponse {
  draw: string;
  recordsTotal: string;
  recordsFiltered: string;
}

// --- Nuevas Interfaces para Proveedores ---
export interface Provider {
  proveed: string; // Añadido para el nombre del archivo de imagen
  name: string;
  imageSrc: string;
}

export interface ApiResponseProviders {
  status: boolean;
  data: {
    cana_total: number;
    proveed: string; 
    nombre: string;  
    rif: string;
  }[];
}
// --- Fin Nuevas Interfaces ---
export interface PublicidadItem {
  prefijo: string;
  proveedor: string;
  nombre_proveedor: string;
  titulo: string;
  plantilla: string; // 'HB', 'HS1', 'HS2', 'PB', 'PS'
  descrip: string;
  url: string[];
}

export interface ApiResponsePublicidad {
  status: boolean;
  message: string;
  data: PublicidadItem[];
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    FooterComponent,
    SideBarComponent,
    ClicardComponent,
    CarouselModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomePageComponent implements OnInit {
  mainImages: any[] = []; 
  leftImages: any[] = []; 
  rightImages: any[] = []; 

  shuffledMainImages: any[] = [];
  shuffledLeftImages: any[] = [];
  shuffledRightImages: any[] = [];

  userData: any;
  apiKey: string = '';
  isMenuOpen: boolean = false;

  isLoading: boolean = false; 
  isLoadingProviders: boolean = false; 

  error: any;
  selectedProduct: any = null;

  currentPage: number = 1;
  itemsPerPage: number = 20;
  search: string = '';
  categoria: string = '';
  filterMarca: string = '';
  filterLote: string = '';
  orderBy: string = '';
  orderDirection: string = '';
  // Variables para el modal de imagen
  showFloatingModal = false;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    dotsEach: false,
    center: true,
    navSpeed: 800,
    navText: ['<i class="fa-solid fa-chevron-left"></i>', '<i class="fa-solid fa-chevron-right"></i>'],
    responsive: {
      0: { items: 1 },
      640: { items: 2 },
      768: { items: 3 },
      1024: { items: 5 }
    },
    nav: true

  };

  // Carrusel de Proveedores: ya no tiene datos quemados
  providers: Provider[] = [];

  providersCarouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    dotsEach: false,
    navSpeed: 800,
    navText: ['<i class="fa-solid fa-chevron-left"></i>', '<i class="fa-solid fa-chevron-right"></i>'],
    responsive: {
      0: { items: 3 },
      480: { items: 4 },
      768: { items: 5 },
      992: { items: 6 },
      1200: { items: 7 }
    },
    nav: true,
    autoplay: true,
    autoplayTimeout: 6000,
    autoplayHoverPause: true
  };

  constructor(
      private authService: AuthService,
      public portalcliLogicaService: PortalcliLogicaService,
      private route: ActivatedRoute,
      private router: Router,
      private http: HttpClient
  ) { }

  ngOnInit() {
    //this.fetchPublicidad();

    setTimeout(() => {
      this.showImageModal();
    }, 600);    // this.loadCarouselProviders();
  }

    
  ngAfterViewInit() {
    // Inicializar carruseles después de que se carguen las imágenes
    setTimeout(() => {
      this.initializeCarousels();
    }, 500);
  }

   // Método para mostrar imagen
  showImageModal(): void {
    // URL de la imagen que quieres mostrar
    this.showFloatingModal = true;
  }
  
  // Método para cerrar el modal
  closeModal(): void {
    this.showFloatingModal = false;
  }
  
  // Método para mostrar una imagen específica
  showCustomImage(imageUrl: string): void {
    this.showFloatingModal = true;
  }

    // Nuevo método para obtener las imágenes de publicidad desde la API
   /*  fetchPublicidad(): void {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        'X-Auth-Token': `${token}`
      });
  
      const apiUrl = `${API_URL}portalcli/publiweb`;
      const body = {
        area: '' // Solo necesitamos estas áreas para la página de inicio
      };
  
      this.http.post<ApiResponsePublicidad>(apiUrl, body, { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
        .subscribe({
          next: (response: ApiResponsePublicidad) => {
            if (response.data) {
              this.processPublicidadData(response.data);
              this.shuffleAllImages();
            } else {
              console.warn('No se encontraron imágenes de publicidad:', response.message);
              this.setDefaultImages(); // Fallback a imágenes por defecto si no hay datos
            }
          },
          error: (error) => {
            console.error('Error al cargar publicidad:', error);
            this.setDefaultImages(); // Fallback a imágenes por defecto en caso de error
          }
        });
    } */
  
    // Procesar los datos de la API y organizarlos por plantilla
    private processPublicidadData(publicidadData: PublicidadItem[]): void {
      // Limpiar arrays
      this.mainImages = [];
      this.leftImages = [];
      this.rightImages = [];
      
      publicidadData.forEach(item => {
        // Verificar que tenga URLs válidas y no esté vacío
        if (item.url && item.url.length > 0) {
          
          // Recorrer TODAS las URLs del item, no solo la primera
          item.url.forEach((url, index) => {
            if (url && url.trim() !== '') { // Validar que la URL no esté vacía
              const imageData = {
                src: url,
                alt: item.titulo || `Publicidad ${item.prefijo}`,
                descrip: item.descrip || '',
                plantilla: item.plantilla,
                prefijo: item.prefijo,
                proveedor: item.proveedor,
                nombre_proveedor: item.nombre_proveedor
              };
    
              // Organizar por tipo de plantilla
              switch (item.plantilla) {
                case 'HB': // Home Big - Carrusel principal
                  this.mainImages.push(imageData);
                  break;
                case 'HS1': // Home Small 1 - Carrusel izquierdo
                  this.leftImages.push(imageData);
                  break;
                case 'HS2': // Home Small 2 - Carrusel derecho
                  this.rightImages.push(imageData);
                  break;
                case 'PB': // Puedes agregar más casos si necesitas
                case 'PS':
                  // Opcional: agregar a algún array adicional
                  break;
              }
            }
          });
          
        } else {
          console.warn('Item sin URLs válidas:', item.prefijo, item.titulo);
        }
      });  
      
      // Log para debug
      console.log('Main Images encontradas:', this.mainImages.length);
      console.log('Left Images encontradas:', this.leftImages.length);
      console.log('Right Images encontradas:', this.rightImages.length);
      
      // Si algún array está vacío, usar imágenes por defecto para esa sección
      if (this.mainImages.length === 0) {
        this.mainImages = this.getDefaultMainImages();
        console.log('Usando imágenes por defecto para main');
      }
      if (this.leftImages.length === 0) {
        this.leftImages = this.getDefaultLeftImages();
      }
      if (this.rightImages.length === 0) {
        this.rightImages = this.getDefaultRightImages();
      }
    }
  
    // Imágenes por defecto como fallback
    private setDefaultImages(): void {
      this.mainImages = this.getDefaultMainImages();
      this.leftImages = this.getDefaultLeftImages();
      this.rightImages = this.getDefaultRightImages();
    }
  
    private getDefaultMainImages(): any[] {
      return [
        //{ src: "https://insuaminca.org/insuaminca/assets/images/Publicidad Diamante/PUBLICIDAD LARGA (HOME E INVENTARIO)/banner.jpg", alt: "Banner 1" },
      ];
    }
  
    private getDefaultLeftImages(): any[] {
      return [
        //{ src: "https://insuaminca.org/insuaminca/assets/images/Publicidad Standard/PUBLICIDAD LARGA STANDARD/banner24.jpg", alt: "Banner 24" },
      ];
    }
  
    private getDefaultRightImages(): any[] {
      return [
       // { src: "https://insuaminca.org/insuaminca/assets/images/Publicidad Standard/PUBLICIDAD LARGA STANDARD/banner28.png", alt: "Banner 28" },
      ];
    }
  
    // Función para mezclar cualquier array de imágenes (mantener la existente)
    shuffleArray(array: any[]): any[] {
      let arrayCopy = [...array];
      for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
      }
      return arrayCopy;
    }
  
    // Mezclar todas las imágenes (modificada para usar los nuevos arrays)
    shuffleAllImages() {
      this.shuffledMainImages = this.shuffleArray(this.mainImages);
      this.shuffledLeftImages = this.shuffleArray(this.leftImages);
      this.shuffledRightImages = this.shuffleArray(this.rightImages);
      
      // Reinicializar carruseles después de mezclar
      setTimeout(() => {
        this.initializeCarousels();
      }, 100);
    }
  
    // Función mejorada para inicializar carruseles
    initializeCarousels() {
      const carruseles = [
        'carouselExampleIndicators',
        'promotionCarousel3', 
        'promotionCarousel4'
      ];
      
      carruseles.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          // Disposes existing carousel if any
          const existing = bootstrap.Carousel.getInstance(element);
          if (existing) {
            existing.dispose();
          }
          
          // Initialize new carousel
          new bootstrap.Carousel(element, {
            interval: 3000,
            ride: 'carousel'
          });
        }
      });
    }


  // --- Método para cargar los proveedores del carrusel ---
  /* loadCarouselProviders(): void {
    this.isLoadingProviders = true; 
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'X-Auth-Token': `${token}`
    });

    const apiUrl = `${API_URL}portalcli/carruselaliado`; 

    this.http.post<ApiResponseProviders>(apiUrl, {}, { headers: headers }).pipe(
      map(response => {
        if (response.status && response.data) {
          return response.data.map(item => ({
            proveed: item.proveed,
            name: item.nombre,   
            imageSrc: `./assets/images/logoprv/${item.proveed}.png`, 
          }));
        } else {
          console.warn('API de proveedores no devolvió datos o el estado es false:', response);
          return []; 
        }
      }),
      catchError(this.handleError),
      finalize(() => {
        this.isLoadingProviders = false;
      })
    ).subscribe({
      next: (data: Provider[]) => {
        this.providers = data;
      },
      error: (error) => {
        console.error('Error al cargar los proveedores del carrusel:', error);
      }
    });
  } */

  //método handleError existente, se reutiliza para proveedores ---
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ocurrió un error del lado del cliente o de la red:', error.error);
      Swal.fire('Error de Conexión', 'No se pudo conectar con el servidor. Revisa tu conexión a internet.', 'error');
    } else {
      console.error(
          `El backend retornó el código ${error.status}, el cuerpo era: `, error.error);
      Swal.fire('Error del Servidor', 'Ocurrió un problema al obtener los datos. Por favor, inténtalo de nuevo.', 'error');
    }
    return throwError(() => new Error('Algo malo sucedió; por favor, inténtalo de nuevo más tarde.'));
  }

  formatOfertasTooltip(ofertas: string | null | OfertaDetalle[] | undefined): string {
    if (Array.isArray(ofertas) && ofertas.length > 0) {
      return ofertas.map(oferta => `${oferta.lista} (Descuento: ${oferta.descuento}%)`).join('\n');
    } else if (typeof ofertas === 'string' && ofertas.trim() !== '') {
      return ofertas;
    }
    return 'Sin ofertas disponibles';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

    imageficha: any;

  Proveedselect(proveedselect: any) {
    let currentSearch = '';
    this.route.queryParams.subscribe((params) => {
      currentSearch = params['search'] || '';
      currentSearch = params['categoria'] || '';
      currentSearch = params['categorianombre'] || '';

    });

    if (proveedselect) {
      this.router.navigate(['/pedidos'], {
        queryParams: {
          search: currentSearch, 
          proveedselect: proveedselect,
          categorianombre: currentSearch,
          categoria: currentSearch,
        },
      });
    } else {
      this.router.navigate(['/pedidos'], {
        queryParams: {
          search: currentSearch, 
          categoria: '',
          proveedselect: '',
        },
      });
    }
  }

}
