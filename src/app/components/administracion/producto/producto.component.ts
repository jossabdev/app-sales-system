import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Categoria } from 'src/app/interfaces/categoria';
import { Estados } from 'src/app/interfaces/estados';
import { GenericBasicResponse } from 'src/app/interfaces/generic-basic-response';
import { GenericListResponse } from 'src/app/interfaces/generic-list-response';
import { Producto } from 'src/app/interfaces/producto';
import { CategoriaService } from 'src/app/services/categoria.service';
import { ProductoService } from 'src/app/services/producto.service';

interface EstadosProd { valor: string };

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class ProductoComponent implements OnInit{
  tituloShow: string = "Administración / Producto";
  tituloCreate: string = "Administración / Producto / crear";
  titulo : string = this.tituloShow;
  showButtonNew = true;
  isNewProducto = false;
  isShowProducto = true;
  estado = Estados.activo;
  disableInputEstadoWhenCreate : boolean = false;
  categorias!: Categoria[] ;
  productos!: Producto[];
  formNuevoProducto: FormGroup ;
  formBuscarProductos: FormGroup;
  formEditarProducto!: FormGroup;
  formVerProducto!: FormGroup;
  estados: EstadosProd[] = [{valor: 'Activo'}, {valor: 'Modificado'}];

  productoDialog = false;
  producto!: Producto;
  productoEditar!: Producto;
  isShowProductoDetalle = false;
  isEditProductoDetalle = false;

  constructor(private _formBuilder: FormBuilder, private _categoriaService: CategoriaService, private _productoService: ProductoService, private messageService: MessageService,  private confirmationService: ConfirmationService){
    this.formNuevoProducto = this._formBuilder.group({
      nombreProducto: ['', Validators.required],
      descripcion: ['', Validators.required],
      codigoBarras: [''],
      categoria: ['', Validators.required],
      costo: [, Validators.required],
      precioVenta: [, Validators.required],
      estado: [{value: Estados.activo, disabled: true}, Validators.required]
    });

    this.formBuscarProductos = this._formBuilder.group({
      idProducto: [],
      nombreProducto: [],
      descripcion: [],
      codigoBarras: [],
      categoria: [],
      costo: [],
      precioVenta: [],
      estado: []
    });

    this.formEditarProducto = this._formBuilder.group({
      idProducto: [],
      nombreProducto: [],
      descripcion: [],
      codigoBarras: [],
      categoria: [],
      costo: [],
      precioVenta: [],
      estado: []
    });
  }

  ngOnInit(): void {
  
    this.obtenerTodasLasCategoriasActivas();
    this.obtenerTodosLosProductos();
  }

  // funciones
  habilitarNuevoProducto(){          
    this.showButtonNew = false;    
    this.isNewProducto = true;
    this.isShowProducto = false;
    this.titulo = this.tituloCreate;
    this.disableInputEstadoWhenCreate = true;  
  }
  
  limpiarFormularioCreacion(){
    this.formNuevoProducto.reset({estado: this.estado});
    //this.obtenerTodasLasCategorias();    
    this.isNewProducto = false;
    this.isShowProducto = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow;  
  }

  guardarProducto(): any{
    let nuevoProducto : Producto = this.formNuevoProducto.value;
    nuevoProducto.estado = this.estado;
    console.log(nuevoProducto);
    return this._productoService.save(nuevoProducto)
        .subscribe( (response: GenericBasicResponse<Producto>) => {
        console.log(response);
        this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Producto guardado correctamente.'});
        });
  }

  obtenerTodasLasCategoriasActivas() {
    let categoriaFiltro: Categoria = {estado: this.estado};
    this._categoriaService.getBy(categoriaFiltro)
        .subscribe( (response: GenericListResponse<Categoria>) => {
          if(response.code === 0){
            this.categorias = response.data;
          }   
        });    
  }

  limpiarFormularioBusqueda(){
    this.formBuscarProductos.reset();
    this.isNewProducto = false;
    this.isShowProducto = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow; 
   }
  
  buscarProductosPorFiltros(){
    let productoFiltro: any = this.formBuscarProductos.value;

    if(productoFiltro.estado){
      productoFiltro.estado = productoFiltro.estado.valor;
    }

    console.log(productoFiltro);
    this._productoService.getBy(productoFiltro)
        .subscribe( (response: GenericListResponse<Producto>) => {
          this.productos = response.data;
          console.log(response.data);       
        });
   }

   obtenerTodosLosProductos(){ 
    this._productoService.getAll()
        .subscribe( response => {          
          this.productos = response.data
          console.log(response.data);          
        });
   }

  verProductoDetalle(producto: Producto){
    this.productoDialog = true;
    this.isShowProductoDetalle = true;
    this.producto = producto;

    this.formVerProducto = this._formBuilder.group({
      idProducto: [ {value: this.producto.idProducto, disabled: true}],
      nombreProducto: [ {value: this.producto.nombreProducto, disabled: true}],
      descripcion: [ {value: this.producto.descripcion, disabled: true}],
      codigoBarras: [ {value: this.producto.codigoBarras, disabled: true}],
      categoria: [ {value: this.producto?.categoria?.nombreCategoria, disabled: true}],
      costo: [ {value: this.producto.costo, disabled: true}],
      precioVenta: [ {value: this.producto.precioVenta, disabled: true}],
      estado: [{value: this.producto.estado, disabled: true}]
    });
  }

   editarProducto(producto: Producto){
    this.productoDialog = true;
    this.isEditProductoDetalle = true;    
    this.producto = { ...producto };

    let estadoAct = this.estados.find(estadoTmp => estadoTmp.valor === this.producto.estado);

    let productoEditar = {
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      descripcion: producto.descripcion,
      codigoBarras: producto.codigoBarras,
      categoria: producto.categoria,
      costo: producto.costo,
      precioVenta: producto.precioVenta,
      estado: estadoAct
    };

    // actualizamos formulario de edicion con la categoria seleccionada
    this.formEditarProducto.patchValue(productoEditar); 
    
    // deshabilitamos id producto para que no se pueda editar
    this.formEditarProducto.controls['idProducto'].disable();
   }

   ejecutarEditarProducto(){
    console.log(this.formEditarProducto.value);

    let producto = this.formEditarProducto.value;
    producto.idProducto = this.producto.idProducto;
    
    // tomo el valor del objeto estado para asignar el estado 
    producto.estado = producto.estado.valor;

    // actualizamos producto en el back
    this._productoService.update(producto)
       .subscribe({        
          next : (response: any) => {
              this.messageService.add({ severity: 'success', summary: response.body.message, detail: 'Producto actualizado.'});

               // actualizamos producto a nivel de vista sin recargar la pagina
              this.productos[this.findIndexById(this.producto.idProducto!)] = producto;
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al editar producto', detail: response.status + ' ' + response.statusText })
       });
       
    this.productoDialog = false;
    this.isEditProductoDetalle= false;
    this.isShowProductoDetalle = false;
  }
  eliminarProducto(producto: Producto){
    this.confirmationService.confirm({
      message: '¿ Está seguro que desea eliminar el producto ' + producto.nombreProducto + ' ?',
      header: 'Eliminar producto',      
      icon: 'pi pi-exclamation-triangle', 
      accept: () => {
          this._productoService.deleteByProducto(producto).subscribe();
          this.productos = this.productos.filter((val) => val.idProducto !== producto.idProducto);
          this.producto = {};
          this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Producto eliminado', life: 3000 });
      }
    });
  }

  ocultarDialog(){
    this.productoDialog = false;    
    this.isEditProductoDetalle = false;
    this.isShowProductoDetalle = false;
  }

  cancel(){
    this.ocultarDialog();
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.productos.length; i++) {
        if (this.productos[i].idProducto === id) {
            index = i;
            break;
        }
    }

    return index;
  }
}
