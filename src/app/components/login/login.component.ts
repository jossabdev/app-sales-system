import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
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
          this.router.navigateByUrl('/');
          
        },
        error: (response: any) => {
          console.log('Error, usuario o clave incorrecta. Status code: ' + response.status + ' ' + response.statusText);
          this.confirmationService.confirm({
            message: 'Usuario o clave incorrecta',
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
