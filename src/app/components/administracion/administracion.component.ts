import { Component } from '@angular/core';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.scss']
})
export class AdministracionComponent {
  styleCard: any = { 
    height: '75%',
    width: 'auto',  
    borderRadius: '1.3rem',    
    margin: '0 1rem 1rem 0',
    fontSize: '1.2rem',
    boxShadow: '1px 2px 4px rgba($color: #000000, $alpha: 0.15)',   
    
  };

  categoria: any = {
    title: "Categorías",
    content: "Defina una categoría para agrupar los productos del negocio"
  }

  producto: any = {
    title: "Productos",
    content: "Gestione los diferentes productos del negocio"
  }

  rol: any = {
    title: "Roles",
    content: "Administre los roles de la aplicación"
  }
}
