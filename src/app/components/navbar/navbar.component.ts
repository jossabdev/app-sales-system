import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent  implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit(){
    this.items = [
      {
        label: 'Administrador',
        items: [
          {
            label: 'Administrar cuenta',
            icon: 'pi pi-user',        
            command: () => {
              //this.update();
            }
          },
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',        
            command: () => {
              //this.delete();
            }
          }
        ]    
      }
  ];
  }
}
