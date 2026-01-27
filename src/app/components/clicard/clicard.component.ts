import { CommonModule } from '@angular/common';
import {Component, Input} from '@angular/core';
import { PortalcliLogicaService } from './../../services/portalcli-logica.service';
import { AuthService } from './../../auth.service';


@Component({
  selector: 'app-clicard',
  imports: [CommonModule],
  templateUrl: './clicard.component.html',
  styleUrl: './clicard.component.scss'
})
export class ClicardComponent {
  tasa: number=0;
  @Input() minimal: boolean = false;

  constructor(
    public authService: AuthService, 
    public portalcliLogicaService: PortalcliLogicaService
  ) { 
    this.tasa = this.authService.getTasa(); 
  }


  ngOnInit() {
    this.tasa = this.authService.getTasa(); 
  }


  formatCurrency(value: number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '0.00'; // O algún valor predeterminado
    }
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return numericValue.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
