import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { take, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers:[ConfirmationService]
})
export class LoginComponent {
  loginFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private confirmationService: ConfirmationService){
    if(localStorage.getItem('Authorization')){      
        this.router.navigateByUrl('/');      
    }

    this.loginFormGroup = this.formBuilder.group({
      username: '',
      password: ''
    });
  }

  ejecutarLogin(){
    let usrLogin = this.loginFormGroup.value;

    if(usrLogin.username !== '' && usrLogin.password !== ''){
      this.authService.login(usrLogin)
      .subscribe( {        
        next : (response: any) => {
          console.log("User is logged in");
          setTimeout(() => {
            this.router.navigateByUrl('/');
          }, 1000);          
          
        },
        error: (response: any) => {    
          console.log(response);      
          console.log('Ha ocurrido un error al iniciar sesión. Valide que sus credenciales sean correctas y que el usuario no esté bloqueado o deshabilitado Status code: ' + response.error.status + ' ' + response.error.error);
          this.confirmationService.confirm({
            message: 'Valide que sus credenciales sean correctas y que el usuario no esté bloqueado o deshabilitado. Error técnico: ' + response.error.status + ' ' + response.error.error + ' - ' + response.error.message,
            header: 'Error al iniciar sesión',      
            icon: 'pi pi-exclamation-triangle', 
            accept: () => {
              this.loginFormGroup.reset();
            },
            
          });
          
        }
      });
    }
    
  }

  cancel(){
    this.loginFormGroup.reset();
  }
}
