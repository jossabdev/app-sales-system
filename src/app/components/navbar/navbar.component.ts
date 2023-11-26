import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent  implements OnInit {
  items: MenuItem[] | undefined;
  nombre: string = '';
  rol: string = '';

  constructor( private authService: AuthService,  private router: Router, private _usuarioService: UsuarioService){
    this.consultarUsuarioyRol();    
  }

  ngOnInit(){
    
    this.items = [
      {
        label: this.rol,
        items: [
         /* se comenta para la siguiente version
         {
            label: 'Administrar cuenta',
            icon: 'pi pi-user',        
            command: () => {
              //this.update();
            }
          },*/
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',        
            command: () => {
              this.logout();
            }
          }
        ]    
      }
  ];
  }

  logout(){   
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  consultarUsuarioyRol(){
    let user = localStorage.getItem('User')!;
    let usuario: Usuario = { usuario: user};
    let rol;
    this._usuarioService.getBy(usuario).subscribe({
      next : (response: any) => {
        let usuarioCompleto = response.data[0]; 
        console.log(usuarioCompleto);
        this.nombre = usuarioCompleto.nombre;
        this.rol = usuarioCompleto.rol.rol; 
        rol = usuarioCompleto.rol.rol; 
       // localStorage.setItem('Rol', rol);
      },
      error: (response: any) => {
        console.log('Error, usuario no encontrado. Status code: ' + response.status + ' ' + response.statusText);                      
      }
    });

    return rol;
  }
}
