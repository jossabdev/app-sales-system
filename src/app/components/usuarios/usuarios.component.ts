import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Estados } from 'src/app/interfaces/estados';
import { GenericBasicResponse } from 'src/app/interfaces/generic-basic-response';
import { Rol } from 'src/app/interfaces/rol';
import { Usuario } from 'src/app/interfaces/usuario';
import { RolService } from 'src/app/services/rol.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import * as bcrypt from "bcryptjs";

interface EstadosUsuario { valor?: string };
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class UsuariosComponent implements OnInit{
  onlyRoleAdmin: boolean = false;
  titulo: string =  'Usuarios';
  tituloCreate: string = 'Usuarios/crear';
  tituloShow: string = 'Usuarios';
  showButtonNew: boolean = true;
  isNewUsuario: boolean = false;
  isShowUsuario: boolean = true;
  usuarioDialog = false;
  isShowUsuarioDetalle = false;
  isEditUsuarioDetalle = false;
  formNuevoUsuario: FormGroup ;
  formBuscarUsuarios: FormGroup ;
  formEditarUsuario: FormGroup;
  formVerUsuario: FormGroup; 
  estados: EstadosUsuario[] = [ {valor: 'Activo'}, {valor: 'Modificado'}];
  estado = Estados.activo;
  roles: Rol[] = [];
  usuarios: Usuario[] = [];
  usuario: Usuario = {};
  saltRounds = 10;
  usuarioEnSesion: string = '';

  constructor(private formBuilder: FormBuilder, private _usuarioService: UsuarioService, private _rolService: RolService, private messageService: MessageService,  private confirmationService: ConfirmationService){
    this.onlyRoleAdmin = localStorage.getItem('Rol') === 'Administrador'? true : false;
    this.formNuevoUsuario = this.formBuilder.group({
      rol: ['', Validators.required],
      usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      email: [''],
      password: ['', Validators.required],
      estado: [{value: Estados.activo, disabled: true}, Validators.required]
    });

    this.formBuscarUsuarios = this.formBuilder.group({
      rol: [],
      usuario: [],          
      estado: []
    });

    this.formVerUsuario = this.formBuilder.group({
      idUsuario: [],
      rol: [],
      usuario: [],
      nombre: [],
      email: [],
      password:[],
      estado: [],
      disabled: [],
      locked: []
    });

    this.formEditarUsuario = this.formBuilder.group({
      idUsuario: [],
      rol: [],
      usuario: [],
      nombre:[],
      email: [],
      password: [],
      estado: [],
      disabled: [],
      locked: []
    });    
  }
  ngOnInit(): void {
    this.buscarRoles();
    this.obtenerTodosLosUsuarios();
    this.usuarioEnSesion = localStorage.getItem('User')!;
  }

  habilitarNuevoUsuario(){
    this.showButtonNew = false;    
    this.isNewUsuario = true;
    this.isShowUsuario = false;
    this.titulo = this.tituloCreate;
  }

  limpiarFormularioCreacion(){
    this.formNuevoUsuario.reset({estado: this.estado});
    this.obtenerTodosLosUsuarios();    
    this.isNewUsuario = false;
    this.isShowUsuario = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow;  
  }

  obtenerTodosLosUsuarios(){
    this._usuarioService.getAll()
    .subscribe( response => {          
      this.usuarios = response.data
      console.log(response.data);          
    });
  }

  guardarUsuario(): any{
    let nuevoUsuario : Usuario = this.formNuevoUsuario.value;
    console.log(nuevoUsuario);
    nuevoUsuario.estado = this.estado;
    let hashPassword = this.generarHashPass(nuevoUsuario.password!);
    nuevoUsuario.password = hashPassword;
    console.log(nuevoUsuario);

    return this._usuarioService.save(nuevoUsuario)
        .subscribe( {
          next : (response: any) => {
            this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Usuario guardado correctamente.'});
            this.limpiarFormularioCreacion();
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al guardar usuario', detail: response.status + ' ' + response.statusText }) 
        });
  }

  buscarUsuariosPorFiltros(){
    let usuarioFiltro: any = this.formBuscarUsuarios.value;

    if(usuarioFiltro.estado){
      usuarioFiltro.estado = usuarioFiltro.estado.valor;
    }

    console.log(usuarioFiltro);
    this._usuarioService.getBy(usuarioFiltro).subscribe({
      next : (response: any) => {
        this.usuarios = response.data;
      },
      error: (response: any) => {
        console.log('Error, usuario no encontrado. Status code: ' + response.status + ' ' + response.statusText);                      
      }
    });
  }

  buscarRoles(){
    this._rolService.getAll()
        .subscribe( response => {          
          this.roles = response.data
          console.log(response.data);          
        });
  }

  limpiarFormularioBusqueda(){
    this.formBuscarUsuarios.reset();
    this.isNewUsuario = false;
    this.isShowUsuario = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow; 
  }

  verUsuarioDetalle(usuario: Usuario){
    this.usuarioDialog = true;
    this.isShowUsuarioDetalle = true;
    this.usuario = usuario;

    this.formVerUsuario = this.formBuilder.group({
      idUsuario: [ {value: this.usuario.idUsuario, disabled: true}],
      nombre: [ {value: this.usuario.nombre, disabled: true}],
      usuario: [ {value: this.usuario.usuario, disabled: true}],
      email: [ {value: this.usuario.email, disabled: true}],
      password: [{value: this.usuario.password, disabled: true}],
      rol: [ {value: this.usuario?.rol?.rol, disabled: true}],
      disabled: [ {value: this.usuario.disabled, disabled: true}],
      locked: [ {value: this.usuario.locked, disabled: true}],
      estado: [{value: this.usuario.estado, disabled: true}]
    });
  }

  editarUsuario(usuario: Usuario){
    this.usuarioDialog = true;
    this.isEditUsuarioDetalle = true;    
    this.usuario = { ...usuario };

    //let estadoUsu = this.estados.find(estadoTmp => estadoTmp.valor === this.usuario.estado);

    let usuarioEditar = {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      email: usuario.email,
      usuario: usuario.usuario,
      password: null,
      rol: usuario.rol,
      disabled: usuario.disabled,
      locked: usuario.locked,
      estado: Estados.modificado,
    };

    // actualizamos formulario de edicion con el usuario
    this.formEditarUsuario.patchValue(usuarioEditar); 
    
    // deshabilitamos id usuario y estado para que no se pueda editar
    this.formEditarUsuario.controls['idUsuario'].disable();
    this.formEditarUsuario.controls['estado'].disable();
  }

  eliminarUsuario(usuario: Usuario){
    this.confirmationService.confirm({
      message: '¿ Está seguro que desea eliminar el usuario ' + usuario.usuario + ' ?',
      header: 'Eliminar usuario',      
      icon: 'pi pi-exclamation-triangle', 
      accept: () => {
          this._usuarioService.deleteByUsuario(usuario).subscribe();
          this.usuarios = this.usuarios.filter((val) => val.idUsuario !== usuario.idUsuario);
          this.usuario = {};
          this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Usuario eliminado', life: 3000 });
      }
    });
  }

  ejecutarEditarUsuario(){
    //console.log(this.formEditarUsuario.value);

    let usuario = this.formEditarUsuario.value;
    usuario.idUsuario = this.usuario.idUsuario;
    usuario.estado = Estados.modificado;
    // tomo el valor del objeto estado para asignar el estado 
    //usuario.estado = usuario.estado.valor;
    console.log(usuario);
    let hashPassword = '';

    if(usuario.password){
      hashPassword= this.generarHashPass(usuario.password!);
      usuario.password = hashPassword;
    }
    

    // actualizamos usuario en el back
    this._usuarioService.update(usuario)
       .subscribe({        
          next : (response: any) => {
              this.messageService.add({ severity: 'success', summary: response.body.message, detail: 'Usuario actualizado.'});

               // actualizamos usuario a nivel de vista sin recargar la pagina
              this.usuarios[this.findIndexById(this.usuario.idUsuario!)] = usuario;
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al editar usuario', detail: response.status + ' ' + response.statusText })
       });
       
    this.usuarioDialog = false;
    this.isEditUsuarioDetalle= false;
    this.isShowUsuarioDetalle = false;
  }

  ocultarDialog(){
    this.usuarioDialog = false;    
    this.isEditUsuarioDetalle = false;
    this.isShowUsuarioDetalle = false;
  }

  cancel(){
    this.ocultarDialog();
  }

  generarHashPass(plainTextPassword: string): any{
    let salt = bcrypt.genSaltSync(this.saltRounds);
    return  bcrypt.hashSync(plainTextPassword, salt);
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.usuarios.length; i++) {
        if (this.usuarios[i].idUsuario === id) {
            index = i;
            break;
        }
    }

    return index;
  }
}
