import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputNumberInputEvent } from 'primeng/inputnumber';
import { Estados } from 'src/app/interfaces/estados';
import { GenericBasicResponse } from 'src/app/interfaces/generic-basic-response';
import { GenericListResponse } from 'src/app/interfaces/generic-list-response';
import { Inventario } from 'src/app/interfaces/inventario';
import { Producto } from 'src/app/interfaces/producto';
import { InventarioService } from 'src/app/services/inventario.service';
import { ProductoService } from 'src/app/services/producto.service';

interface EstadosProd { valor: string };

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class InventarioComponent implements OnInit{
  onlyRoleAdmin: boolean = false;
  showButtonNew = true;
  isNewInventario = false;
  isShowInventario = true;
  tituloShow: string = "Inventario";
  tituloCreate: string = "Inventario / crear";
  titulo : string = this.tituloShow;
  disableInputEstadoWhenCreate : boolean = false;
  estado = Estados.activo;
  productos!: Producto[];
  formNuevoInventario: FormGroup ;
  formBuscarInventarios: FormGroup;
  formEditarInventario!: FormGroup;
  formVerInventario!: FormGroup;
  estados: EstadosProd[] = [{valor: 'Activo'}, {valor: 'Modificado'}];
  inventarios!: Inventario[];
  inventarioDialog = false;
  isShowInventarioDetalle = false;
  isEditInventarioDetalle = false;
  inventario!: Inventario;
  cantidadIngresados: number = 0;
  
  constructor(private _formBuilder: FormBuilder, private _inventarioService: InventarioService, private _productoService: ProductoService, private messageService: MessageService,  private confirmationService: ConfirmationService){
    this.onlyRoleAdmin = localStorage.getItem('Rol') === 'Administrador'? true : false;
    
    this.formNuevoInventario = this._formBuilder.group({
      producto: ['', Validators.required],
      stockInicial: ['', Validators.required],
      estado: [{value: Estados.activo, disabled: true}, Validators.required]
    });

    this.formBuscarInventarios = this._formBuilder.group({
      idInventario: [],
      producto: [],
      stockInicial: [],
      cantidadIngresados: [],
      cantidadVendidos: [],
      stockTotal: [],
      estado: []
    });

    this.formEditarInventario = this._formBuilder.group({
      idInventario: [],
      producto: [],
      stockInicial: [],
      cantidadIngresados: [],
      cantidadVendidos: [],
      stockTotal: [],
      estado: [],
      nuevaCantidadIngresados: [],
      nuevaCantidadQuitados: [],
    });
  }
  ngOnInit(): void {
    this.obtenerTodosLosProductos();
    this.obtenerTodosLosInventarios();
  }

  // funciones
  habilitarNuevoInventario(){          
    this.showButtonNew = false;    
    this.isNewInventario = true;
    this.isShowInventario = false;
    this.titulo = this.tituloCreate;
    this.disableInputEstadoWhenCreate = true;  
  }

  limpiarFormularioCreacion(){
    this.formNuevoInventario.reset({estado: this.estado});
    this.obtenerTodosLosInventarios();
    this.isNewInventario = false;
    this.isShowInventario = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow;  
  }

  limpiarFormularioBusqueda(){
    this.formBuscarInventarios.reset();
    this.isNewInventario = false;
    this.isShowInventario = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow; 
   }

  guardarInventario(): any {
    let nuevoInventario: Inventario = this.formNuevoInventario.value;
    nuevoInventario.estado = this.estado;
    nuevoInventario.stockTotal = nuevoInventario.stockInicial;
    nuevoInventario.cantidadIngresados = 0;
    nuevoInventario.cantidadVendidos = 0;

    console.log(nuevoInventario);
    return this._inventarioService.save(nuevoInventario)
        .subscribe( {
          next : (response: any) => {            
            console.log(response);
            this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Inventario guardado correctamente.'});
            this.limpiarFormularioCreacion();             
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al crear el inventario', detail:  response.error.message })
       });
  }

  obtenerTodosLosProductos(){ 
    this._productoService.getAll()
        .subscribe( {
          next : (response: any) => {            
            this.productos = response.data
            console.log(response.data);             
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar productos', detail: response.status + ' ' + response.statusText })
       });
  }

  obtenerTodosLosInventarios(){ 
    this._inventarioService.getAll()
        .subscribe( {        
          next : (response: any) => {            
            this.inventarios = response.data
            console.log(response.data);             
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar la lista de inventario', detail: response.status + ' ' + response.statusText })
       });
  }

  buscarInventariosPorFiltros(){
    let inventarioFiltro: any = this.formBuscarInventarios.value;

    if(inventarioFiltro.estado){
      inventarioFiltro.estado = inventarioFiltro.estado.valor;
    }

    console.log(inventarioFiltro);
    this._inventarioService.getBy(inventarioFiltro)
        .subscribe( (response: GenericListResponse<Inventario>) => {
          this.inventarios = response.data;
          console.log(response.data);       
        });
  }

  verInventarioDetalle(inventario: Inventario){
    this.inventarioDialog = true;
    this.isShowInventarioDetalle = true;
    this.inventario = inventario;
    console.log(this.inventario);
    this.formVerInventario = this._formBuilder.group({
      idInventario: [ {value: this.inventario.idInventario, disabled: true}],
      producto: [ {value: this.inventario.producto?.nombreProducto, disabled: true}],
      stockInicial: [ {value: this.inventario.stockInicial, disabled: true}],
      cantidadIngresados: [ {value: this.inventario.cantidadIngresados, disabled: true}],
      cantidadVendidos: [ {value: this.inventario.cantidadVendidos, disabled: true}],
      stockTotal: [ {value: this.inventario.stockTotal, disabled: true}],
      estado: [{value: this.inventario.estado, disabled: true}]
    });
  }

   editarInventario(inventario: Inventario){
    this.inventarioDialog = true;
    this.isEditInventarioDetalle = true;    
    this.inventario = { ...inventario };

    let estadoAct = this.estados.find(estadoTmp => estadoTmp.valor === this.inventario.estado);
    

    let inventarioEditar = {
      idInventario: this.inventario.idInventario,
      producto: this.inventario.producto?.nombreProducto,
      stockInicial: this.inventario.stockInicial,
      cantidadIngresados: this.inventario.cantidadIngresados,  
      cantidadVendidos: this.inventario.cantidadVendidos,
      stockTotal: this.inventario.stockTotal,
      estado: this.inventario.estado,
      nuevaCantidadIngresados: 0,
      nuevaCantidadQuitados: 0
    };

    // actualizamos formulario de edicion con la categoria seleccionada
    this.formEditarInventario.patchValue(inventarioEditar); 
    
    // deshabilitamos para que no se pueda editar
    this.formEditarInventario.controls['idInventario'].disable();
    this.formEditarInventario.controls['producto'].disable();
    this.formEditarInventario.controls['stockInicial'].disable();
    this.formEditarInventario.controls['stockTotal'].disable();    
    this.formEditarInventario.controls['cantidadIngresados'].disable();    
    this.formEditarInventario.controls['cantidadVendidos'].disable();
    this.formEditarInventario.controls['estado'].disable();
  }

   ejecutarEditarInventario(){
    console.log(this.formEditarInventario.value);

    let inventario = this.formEditarInventario.value;
    inventario.idInventario = this.inventario.idInventario;
    
    // tomo el valor del objeto estado para asignar el estado 
    //inventario.estado = inventario.estado.valor;
    console.log(inventario);

    let cantidadIngresados = inventario.nuevaCantidadIngresados;
    let cantidadQuitados = inventario.nuevaCantidadQuitados;

    if (cantidadIngresados > 0 && cantidadQuitados > 0){
      this.messageService.add({ severity: 'info', summary: 'Atención', detail: 'No se puede aumentar y disminuir stock al mismo tiempo. Favor escoger solo una opción' });
        
    }else{
      if(cantidadIngresados > 0){
        inventario.cantidadIngresados = cantidadIngresados;
        inventario.nuevaCantidadIngresados = null;
      }else{
        
        let stockTotal = this.inventario.stockTotal;
        let stockTotalRestado = stockTotal! - cantidadQuitados;
        inventario.stockTotal = stockTotalRestado;
        inventario.nuevaCantidadQuitados = null;    
      }

      console.log(inventario);
      inventario.estado = Estados.modificado;

      // actualizamos inventario en el back
      this._inventarioService.update(inventario)
         .subscribe({        
            next : (response: any) => {
                this.messageService.add({ severity: 'success', summary: response.body.message, detail: 'Inventario actualizado.'});
                let inventarioActualizado: Inventario = response.body.data;
                 // actualizamos inventario a nivel de vista sin recargar la pagina 
                console.log(inventarioActualizado);             
                this.inventarios[this.findIndexById(inventario.idInventario)] = inventarioActualizado;
                
                //habilitamos los dos campos
                this.formEditarInventario.get('nuevaCantidadQuitados')?.enable();
                this.formEditarInventario.get('nuevaCantidadIngresados')?.enable();
            },
            error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al editar inventario', detail: response.status + ' ' + response.statusText })
         });
                
      this.inventarioDialog = false;
      this.isEditInventarioDetalle= false;
      this.isShowInventarioDetalle = false;
    }
      
  } 


  eliminarInventario(inventario: Inventario){
    this.confirmationService.confirm({
      message: '¿ Está seguro que desea eliminar el inventario del producto ' + inventario.producto?.nombreProducto + ' ?',
      header: 'Eliminar inventario',      
      icon: 'pi pi-exclamation-triangle', 
      accept: () => {
          this._inventarioService.deleteByInventario(inventario).subscribe();
          this.inventarios = this.inventarios.filter((val) => val.idInventario !== inventario.idInventario);
          this.inventario = {};
          this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Inventario eliminado', life: 3000 });
      }
    });
 }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.inventarios.length; i++) {
      if (this.inventarios[i].idInventario === id) {
          index = i;
          break;
      }
    }

    return index;
  }

  ocultarDialog(){
    this.inventarioDialog = false;    
    this.isEditInventarioDetalle = false;
    this.isShowInventarioDetalle = false;
  }

  cancel(){
    this.ocultarDialog();
  }

  getSeverity(stock: number) {
    if(stock > 10){
      return 'success'
    }else if (stock >=1 && stock <= 10){
      return 'warning'
    }else{
      return 'danger'
    }    
  }
  getSeverityText(stock: number){
    if(stock > 10){
      return 'In Stock'
    }else if (stock >=1 && stock <= 10){
      return 'Low Stock'
    }else{
      return 'Out of Stock'
    }
  }


  deshabilitarHabilitarAgregarUnidades(event: InputNumberInputEvent){
    //const elemento = event.target as HTMLInputElement;
    
    if(parseInt(event.value) > 0){
      this.formEditarInventario.get('nuevaCantidadQuitados')?.disable();
    }else{
      this.formEditarInventario.get('nuevaCantidadQuitados')?.enable();
    }
  }

  deshabilitarHabilitarQuitarUnidades(event: InputNumberInputEvent){
    //const elemento = event.target as HTMLInputElement;
    
    if(parseInt(event.value) > 0){
      this.formEditarInventario.get('nuevaCantidadIngresados')?.disable();
    }else{
      this.formEditarInventario.get('nuevaCantidadIngresados')?.enable();
    }
  }
}
