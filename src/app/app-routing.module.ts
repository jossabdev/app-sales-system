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

const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'administracion', component: AdministracionComponent },
  {path: 'categoria', component: CategoriaComponent },  
  {path: 'producto', component: ProductoComponent },
  {path: 'rol', component: RolComponent },  
  {path: 'inventario', component: InventarioComponent},
  {path: 'ventas', component: VentasComponent},
  {path: 'usuarios', component: UsuariosComponent},
  {path: 'login', component: LoginComponent},
  {path: 'settings', component: SettingsComponent },
  {path: 'about', component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }