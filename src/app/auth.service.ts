// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface DecodedToken {
  usuario: string;
  nombre: string;
  logged_in: boolean;
  tipo_u: string;
  almacen: string;
  tasa: string;
  cmatriz: string;
  lgrup: { grupo: string; nom_grup: string;}[];
  clientes: { cliente: string; nombre: string; rifci: string }[];
  API_TIME: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;
  private decodedToken: DecodedToken | null = null;
  private jwtHelper = new JwtHelperService();
  private _codCli: string | null = null;
  private isHandlingSessionExpired = false;

  constructor(private router: Router) {
    this.validateAndLoadToken();
  }

  private validateAndLoadToken(): void {
    //console.log('AuthService: validateAndLoadToken() ejecutado.');
    const storedToken = localStorage.getItem('token');

    // Obtener la URL actual para verificar si es la ruta de login
    const currentUrl = this.router.url;
    const isLoginPage = currentUrl === '/login';

    if (!storedToken) {
      //console.log('AuthService: No hay token en localStorage.');
      this.token = null;
      this.decodedToken = null;

      // Solo llama a handleSessionExpired si NO estamos en la página de login
      if (!isLoginPage) {
        //console.log('AuthService: No hay token y NO estamos en la página de login. Iniciando proceso de expiración/logout.');
        this.handleSessionExpired(null);
      } else {
        //console.log('AuthService: No hay token, pero estamos en la página de login. No se muestra alerta ni se redirige.');
      }
      return;
    }

    try {
      //console.log('AuthService: Intentando decodificar token:', storedToken);
      const decoded = this.jwtHelper.decodeToken(storedToken);
      if (!decoded) {
        //console.error('AuthService: Decodificación de token fallida (malformado).');
        throw new Error('AuthService: Decodificación de token fallida (malformado)..');
      }

      if (this.jwtHelper.isTokenExpired(storedToken)) {
        //console.error('AuthService: Token expirado.');
        throw new Error('Token is expired.');
      }

      this.token = storedToken;
      this.decodedToken = decoded;
      //console.log('AuthService: Token válido cargado y decodificado en memoria.');
    } catch (error) {
      //console.error('AuthService: Error CRÍTICO durante la validación de token (decodificación o expiración):', error);
      this.token = null;
      this.decodedToken = null;

      // Solo llama a handleSessionExpired si NO estamos en la página de login
      if (!isLoginPage) {
        //console.log('AuthService: Token inválido/expirado y NO estamos en la página de login. Iniciando proceso de expiración/logout.');
        this.handleSessionExpired(storedToken); // Pasa el token problemático
      } else {
        //console.log('AuthService: Token inválido/expirado, pero estamos en la página de login. No se muestra alerta ni se redirige.');
      }
    }
    //console.log('AuthService: Fin de validateAndLoadToken().');
  }


  setToken(token: string) {
    localStorage.setItem('token', token);
    this.validateAndLoadToken();
  }

  getToken(): string | null {
    if (this.token && this.decodedToken && !this.jwtHelper.isTokenExpired(this.token)) {
      return this.token;
    }
    this.validateAndLoadToken();
    return this.token;
  }

  removeToken() {
    this.token = null;
    this.decodedToken = null;
    localStorage.removeItem('token');
  }

  getUsuario(): string | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.usuario : null;
  }

  getNombre(): string | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.nombre : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.decodedToken && this.decodedToken.logged_in;
  }

  getTipoU(): string | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.tipo_u : null;
  }

  getAlmacen(): string | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.almacen : null;
  }

  getTasa(): number {
    this.getToken();
    if (!this.decodedToken || this.decodedToken.tasa === undefined || this.decodedToken.tasa === null) {
      return 0;
    }
    const parsedTasa = parseFloat(this.decodedToken.tasa);
    return isNaN(parsedTasa) ? 0 : parsedTasa;
  }

  getCmatriz(): string | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.cmatriz : null;
  }

  getApiTime(): number | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.API_TIME : null;
  }

  logout(): void {
    localStorage.clear();
    this.removeToken();
    this.isHandlingSessionExpired = false;
    this.router.navigate(['/login']);
  }

  // Modificado para aceptar un token como argumento opcional
  async handleSessionExpired(invalidToken: string | null = null): Promise<void> {
    if (this.isHandlingSessionExpired) {
      return;
    }
    this.isHandlingSessionExpired = true;


    let alertText = 'Tu sesión ha caducado o el token es inválido. Serás redirigido al inicio de sesión.';
    if (invalidToken) {
      // Recorta el token para que no sea excesivamente largo en la alerta
      const displayToken = invalidToken.length > 50 ? invalidToken.substring(0, 50) + '...' : invalidToken;
      alertText += `\n\nToken afectado: ${displayToken}`;
    } else {
      alertText += `\n\nToken no disponible o nulo.`;
    }

    await Swal.fire({
      icon: 'warning',
      title: 'Sesión Expirada',
      text: alertText, 
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    this.logout();
  }

  getCodCli(): string | null {
    //if (!this._codCli) {
      this._codCli = localStorage.getItem('codCli');
      if (!this._codCli) {
        if (this.isLoggedIn()) {
            this._codCli = this.getUsuario();
            localStorage.setItem('codCli', this._codCli || '');
        } else {
            this._codCli = null;
        }
      }
    //}
    //console.log(this._codCli);
    return this._codCli;
  }

  setCodCli(codCli: string | null): void {
    this._codCli = codCli;
    localStorage.setItem('codCli', codCli || '');
  }

  getClientes(): { cliente: string; nombre: string; rifci: string }[] | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.clientes : null;
  }

  getLgrup(): { grupo: string; nom_grup: string; }[] | null {
    this.getToken();
    return this.decodedToken ? this.decodedToken.lgrup : null;
  }

    getNombreFarmaciaActiva() {
        return localStorage.getItem('nameFarmaActiva')
    }
}
