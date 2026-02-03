import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Eliminamos Swal porque ya mostramos la info en las tarjetas directamente

import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { AuthService } from './../../auth.service';

@Component({
  selector: 'app-clicard',
  imports: [CommonModule],
  templateUrl: './clicard.component.html',
  styleUrl: './clicard.component.scss' 
})
export class ClicardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  @Input() minimal: boolean = false;
  
  // Variables simplificadas
  tarifas: any[] = []; // Ahora es un array
  cargando: boolean = false; // Coincide con tu HTML

  constructor(
    public authService: AuthService, 
    public portalcliLogicaService: PortalcliLogicaService
  ) {}

  ngOnInit() {
    this.cargarTarifasCliente();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTarifasCliente(): void {
    this.cargando = true;
    
    this.portalcliLogicaService.consultarTarifasCliente()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cargando = false;
          
          if (response.success) {
            // Asignamos la respuesta. 
            // Nota: Asegúrate de que tu API devuelva 'tarifas' o 'rows' como array.
            // Si la API devuelve los números como strings ("3.50"), los convertimos.
            const rawTarifas = response.tarifas || response.rows || [];
            
            this.tarifas = rawTarifas.map((t: any) => ({
              ...t,
              encom: parseFloat(t.encom),
              minimo: parseFloat(t.minimo),
              bulto: parseFloat(t.bulto),
              sobre: parseFloat(t.sobre),
              peso: parseFloat(t.peso),
              retiro: parseFloat(t.retiro),
              nombre: t.nombre || 'Tarifa Estándar'
            }));

          } else {
            console.warn('No se encontraron tarifas o hubo un error en la respuesta lógica');
            this.tarifas = [];
          }
        },
        error: (error) => {
          this.cargando = false;
          console.error('Error HTTP cargando tarifas:', error);
          this.tarifas = [];
        }
      });
  }

  // Método auxiliar usado en el HTML para el *ngIf
  hasValue(val: string | number): boolean {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }
}