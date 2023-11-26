import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdministracionComponent } from './components/administracion/administracion.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { CategoriaComponent } from './components/administracion/categoria/categoria.component';
import { ProductoComponent } from './components/administracion/producto/producto.component';
import { RolComponent } from './components/administracion/rol/rol.component';
import { LoginComponent } from './components/login/login.component';
import { AboutComponent } from './components/sidenav/about/about.component';
import { SettingsComponent } from './components/sidenav/settings/settings.component';
import { AuthGuard, HasRole } from './services/auth-guard.service';
import { PrivateContentComponent } from './components/private-content/private-content.component';

const routes: Routes = [    
  {path: 'login', component: LoginComponent},  
  {
    path: '', component: PrivateContentComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full', canMatch: [HasRole]},
      {path: 'dashboard', component: DashboardComponent ,  canActivate: [AuthGuard], canMatch: [HasRole]},
      {path: 'administracion', component: AdministracionComponent ,  canActivate: [AuthGuard], canMatch: [HasRole]},
      {path: 'categoria', component: CategoriaComponent ,  canActivate: [AuthGuard], canMatch: [HasRole]},  
      {path: 'producto', component: ProductoComponent ,  canActivate: [AuthGuard], canMatch: [HasRole]},
      {path: 'rol', component: RolComponent ,  canActivate: [AuthGuard], canMatch: [HasRole]},  
      {path: 'inventario', component: InventarioComponent,  canActivate: [AuthGuard],},
      {path: 'ventas', component: VentasComponent,  canActivate: [AuthGuard],},
      {path: 'usuarios', component: UsuariosComponent,  canActivate: [AuthGuard], canMatch: [HasRole]},      
      {path: 'settings', component: SettingsComponent,  canActivate: [AuthGuard], },
      {path: 'about', component: AboutComponent,  canActivate: [AuthGuard], }
    ]
  }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }