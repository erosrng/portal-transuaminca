import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Asegúrate de importar HttpClientModule aquí
import { API_URLINTER } from '../../app.config';
import { API_URL } from '../../app.config';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrocli-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    HttpClientModule 
  ],
  templateUrl: './registrocli-page.component.html',
  styleUrl: './registrocli-page.component.scss'
})
export class RegistrocliPageComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  msjRif: string = '';
  nombreCli: string = '';
  isRifChecked: boolean = false; // Nueva propiedad para controlar si el RIF ha sido validado con éxito
  selected = 'J';
  idTypes: string[] = ['J', 'V', 'E'];
  phonePrefixes: string[] = ['0414', '0424', '0416', '0426', '0412', '0422'];

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      idType: ['J', Validators.required],
      rif: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
      // Todos los campos debajo del RIF se inicializan deshabilitados
      nombre: [{ value: '', disabled: true }, Validators.required],
      apellido: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phonePrefix: [{ value: '', disabled: true }, Validators.required],
      phoneNumber: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[0-9]{7}$')]],
      password: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(4)]],
      confirmPassword: [{ value: '', disabled: true }, Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Asegurarse de que los campos estén deshabilitados al cargar la página
    this.disableFormFields();
  }

  // Validador personalizado para que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ 'mismatch': true });
      return { 'mismatch': true };
    } else {
      // Si coinciden o uno de los campos es nulo (ej. al inicio), limpia el error
      if (form.get('confirmPassword')?.hasError('mismatch')) {
        form.get('confirmPassword')?.setErrors(null);
      }
      return null;
    }
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else if (field === 'confirmPassword') {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  // Nuevo método para deshabilitar los campos del formulario (excepto Tipo y RIF)
  private disableFormFields(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      if (key !== 'idType' && key !== 'rif') {
        this.registerForm.get(key)?.disable();
      }
    });
    this.isRifChecked = false; // Resetear el estado de validación del RIF
  }

  // Nuevo método para habilitar los campos del formulario
  private enableFormFields(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.enable();
    });
    this.isRifChecked = true; // El RIF ha sido validado
  }

  // Método para buscar el RIF y controlar la habilitación de campos
  checkRif(): void {
    const idTypeControl = this.registerForm.get('idType');
    const rifControl = this.registerForm.get('rif');

    // Limpiar mensaje y deshabilitar campos por si se vuelve a intentar
    this.msjRif = '';
    this.disableFormFields(); // Deshabilita los campos antes de la nueva verificación

    // Validar localmente Tipo y RIF antes de llamar a la API
    if (idTypeControl?.invalid || rifControl?.invalid) {
      idTypeControl?.markAsTouched();
      rifControl?.markAsTouched();
      this.msjRif = 'Por favor, selecciona un Tipo y un RIF válidos.';
      return;
    }

    this.isLoading = true;
    this.spinner.show();

    const tipo = idTypeControl?.value;
    const rif = rifControl?.value;

    const apiUrl = `${API_URLINTER}logincli/buscacliente`; // Asegúrate de que API_URL esté configurada correctamente

    // Crear FormData para enviar los datos por separado
    const formData = new FormData();
    formData.append('tipoRif', tipo); // Envía 'tipo'
    formData.append('rif', rif);   // Envía 'rif'

    this.http.post(apiUrl, formData).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.isLoading = false;

        if (response.status == true) { 
          this.msjRif = response.mensaje;
          this.nombreCli='Rif de: '+response.data.nombre
          this.enableFormFields(); 

        } else { // RIF no encontrado o algún otro mensaje de error de la API
          this.msjRif = response.mensaje;
          this.disableFormFields(); // Mantiene los campos deshabilitados
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.isLoading = false;
        console.error('Error al verificar RIF:', error);
        this.msjRif = 'Error de conexión al verificar el RIF. Intenta de nuevo más tarde.';
        this.disableFormFields(); // Mantiene los campos deshabilitados en caso de error
      },
    });
  }

  creausuario(): void {
    // Verificar si el RIF ha sido chequeado y encontrado
    if (!this.isRifChecked) {
      this.msjRif = 'Por favor, verifica el RIF antes de enviar el formulario.';
      this.registerForm.get('idType')?.markAsTouched();
      this.registerForm.get('rif')?.markAsTouched();
      return;
    }

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.spinner.show();

      const formDataToSend = this.registerForm.getRawValue();
      delete formDataToSend.confirmPassword; // Don't send confirmPassword to the backend

      // --- Start of FormData population ---
      const formData = new FormData();
      formData.append('idType', formDataToSend.idType);
      formData.append('rif', formDataToSend.rif);
      formData.append('password', formDataToSend.password);
      formData.append('email', formDataToSend.email);
      formData.append('nombre', formDataToSend.nombre);
      formData.append('apellido', formDataToSend.apellido);
      formData.append('phonePrefix', formDataToSend.phonePrefix);
      formData.append('phoneNumber', formDataToSend.phoneNumber);
      //console.log('Datos del formulario a enviar a la API de registro:', formDataToSend);

      const apiUrl = `${API_URLINTER}logincli/guardar_usuario`; 

      this.http.post(apiUrl, formData).subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.isLoading = false;

          if (response.success === true) { // Check for 'success: true' as per your PHP
            Swal.fire({
              icon: 'success',
              title: '¡Registro exitoso!',
              text: 'Se ha enviado su usuario al correo proporcionado.',
              confirmButtonText: 'Entendido'
            }).then(() => {
              this.registerForm.reset();
              this.disableFormFields();
              this.msjRif = '';
              this.nombreCli = '';
              this.router.navigate(['/login']).then(() => {
                window.location.reload();
              });
            });
            this.registerForm.reset(); // Reset the form
            this.disableFormFields(); // Disable fields after successful registration
            this.msjRif = ''; // Clear message
            this.nombreCli = ''; // Clear pharmacy name

            // Redirect to login page and reload
            this.router.navigate(['/login']).then(() => {
              window.location.reload(); // Reload the page after navigation
            });

          } else { // Handle API error message
            const errorMessage = response.error || 'Hubo un error al guardar el usuario. Intenta de nuevo.';
            Swal.fire({
              icon: 'error',
              title: 'Error de registro',
              text: errorMessage,
              confirmButtonText: 'Cerrar'
            });
            console.error('API Error:', response);
          }
        },
        error: (error) => {
          this.spinner.hide();
          this.isLoading = false;
          console.error('Error in registration API call:', error);
          let errorMessage = 'Error de conexión al intentar registrarse. Por favor, intenta de nuevo más tarde.';
          if (error.error && error.error.error) { // Check for error.error.error if your backend sends it like that
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          alert(`Error de registro: ${errorMessage}`);
        },
      });
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      // Marca todos los campos como "touched" para que los mensajes de error sean visibles
      this.registerForm.markAllAsTouched();
    }
  }
}