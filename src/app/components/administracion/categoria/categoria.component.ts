import { Component, OnInit } from '@angular/core';
import { Categoria } from '../../../interfaces/categoria';
import { Estados } from '../../../interfaces/estados';
import { CategoriaService } from '../../../services/categoria.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { GenericBasicResponse } from 'src/app/interfaces/generic-basic-response';
import { GenericListResponse } from 'src/app/interfaces/generic-list-response';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';

interface EstadosCat { valor?: string };

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class CategoriaComponent implements OnInit{
  onlyRoleAdmin: boolean = false;
  displayedColumns: string[] = ['idCategoria', 'nombreCategoria', 'estado']; 
  categorias!: Categoria[] ; 
  formNuevacategoria: FormGroup ;
  formBuscarCategorias: FormGroup;
  formEditarCategoria!: FormGroup;
  formVerCategoria!: FormGroup;
  //formEstados: FormGroup;// must be a form control
  tituloShow: string = "Administración / Categoría";
  tituloCreate: string = "Administración / Categoría / crear";
  titulo : string = this.tituloShow;
  showButtonNew = true;
  isNewCategoria = false;
  isShowCategoria = true;
  estado = Estados.activo;
  estados: EstadosCat[] = [ {valor: 'Activo'}, {valor: 'Modificado'}];
  categoriaDialog = false;
  categoria!: Categoria;
  categoriaEditar!: Categoria;
  submitted: boolean = false;
  isShowCategoriaDetalle = false;
  isEditCategoriaDetalle = false;

  constructor(private formBuilder: FormBuilder, private categoriaService: CategoriaService, private messageService: MessageService,  private confirmationService: ConfirmationService) {
    this.onlyRoleAdmin = localStorage.getItem('Rol') === 'Administrador'? true : false;
    this.formNuevacategoria = this.formBuilder.group({
      nombreCategoria: ['', Validators.required],
      estado: [{value: Estados.activo, disabled: true}, Validators.required]
    });

    this.formBuscarCategorias = this.formBuilder.group({
      idCategoria: [],
      nombreCategoria: [],
      estado: []
    });

    this.formEditarCategoria = this.formBuilder.group({
      idCategoria: [ {disabled: true}],
      nombreCategoria: [],
      estado: []
    });

  }
 

  ngOnInit(): void {
    
    this.obtenerTodasLasCategorias();
  }

   limpiarFormularioCreacion(){
    this.formNuevacategoria.reset({estado: this.estado});
    this.obtenerTodasLasCategorias();    
    this.isNewCategoria = false;
    this.isShowCategoria = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow;  
   }

   limpiarFormularioBusqueda(){
    this.formBuscarCategorias.reset();
    this.isNewCategoria = false;
    this.isShowCategoria = true;
    this.showButtonNew = true; 
    this.titulo = this.tituloShow; 
   }

   habilitarNuevaCategoria(){          
    this.showButtonNew = false;    
    this.isNewCategoria = true;
    this.isShowCategoria = false;
    this.titulo = this.tituloCreate;
   }

   obtenerTodasLasCategorias(){ 
    this.categoriaService.getAll()
        .subscribe( response => {          
          this.categorias = response.data; 
          console.log(this.categorias);          
        });
   }

   buscarCategoriaPorFiltros(){
    let categoriaFiltro: any = this.formBuscarCategorias.value;

    if(categoriaFiltro.estado){
      categoriaFiltro.estado = categoriaFiltro.estado.valor;
    }
    
    console.log(categoriaFiltro);
    this.categoriaService.getBy(categoriaFiltro)
        .subscribe( (response: GenericListResponse<Categoria>) => {
          this.categorias = response.data; 
          console.log(this.categorias);       
        });
   }

   guardarCategoria(): any{
    let nuevaCategoria : Categoria = this.formNuevacategoria.value;
    nuevaCategoria.estado = this.estado;

    this.categoriaService.save(nuevaCategoria)
       .subscribe( (response: HttpResponse<GenericBasicResponse<Categoria>>) => {
        console.log(response);   
        this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Categoría guardada correctamente.'});
        console.log(response.headers.keys());
        this.limpiarFormularioCreacion();
       });    
   }

  editarCategoria(categoria: Categoria){
    this.categoriaDialog = true;
    this.isEditCategoriaDetalle = true;    
    this.categoria = { ...categoria };

    let estadoAct = this.estados.find(estadoTmp => estadoTmp.valor === this.categoria.estado);

    let categoriaEditar = {
      idCategoria: categoria.idCategoria,
      nombreCategoria: categoria.nombreCategoria,
      estado: estadoAct
    };

    // actualizamos formulario de edicion con la categoria seleccionada
    this.formEditarCategoria.patchValue(categoriaEditar); 
    
    // deshabilitamos id categoria para que no se pueda editar
    this.formEditarCategoria.controls['idCategoria'].disable();
  }

  verCategoriaDetalle(categoria: Categoria){
    this.categoriaDialog = true;
    this.isShowCategoriaDetalle = true;
    this.categoria = categoria;

    this.formVerCategoria = this.formBuilder.group({
      idCategoria: [ {value: this.categoria.idCategoria, disabled: true}],
      nombreCategoria: [ {value: this.categoria.nombreCategoria, disabled: true}],
      estado: [{value: this.categoria.estado, disabled: true}]
    });
  }

  ejecutarEditarCategoria(){
    console.log(this.formEditarCategoria.value);

    let categoria = this.formEditarCategoria.value;
    categoria.idCategoria = this.categoria.idCategoria;
    
    // tomo el valor del objeto estado para asignar el estado 
    categoria.estado = categoria.estado.valor;

    // actualizamos categoria en el back
    this.categoriaService.update(categoria)
       .subscribe({        
          next : (response: any) => {
              this.messageService.add({ severity: 'success', summary: response.body.message, detail: 'Categoría actualizada.'});

               // actualizamos categoria a nivel de vista sin recargar la pagina
              this.categorias[this.findIndexById(this.categoria.idCategoria!)] = categoria;
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al editar categoría', detail: response.status + ' ' + response.statusText })
       });
       
    this.categoriaDialog = false;
    this.isEditCategoriaDetalle = false;
    this.isShowCategoriaDetalle = false;
  }


  eliminarCategoria(categoria: Categoria){
    this.confirmationService.confirm({
      message: '¿ Está seguro que desea eliminar la categoría ' + categoria.nombreCategoria + ' ?',
      header: 'Eliminar categoría',      
      icon: 'pi pi-exclamation-triangle', 
      accept: () => {
          this.categoriaService.deleteByCategoria(categoria).subscribe();
          this.categorias = this.categorias.filter((val) => val.idCategoria !== categoria.idCategoria);
          this.categoria = {};
          this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Categoría eliminada', life: 3000 });
      }
  });
  }

  ocultarDialog(){
    this.categoriaDialog = false;
    this.submitted = false;
    this.isEditCategoriaDetalle = false;
    this.isShowCategoriaDetalle = false;
  }

  cancel(){
    this.ocultarDialog();
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.categorias.length; i++) {
        if (this.categorias[i].idCategoria === id) {
            index = i;
            break;
        }
    }

    return index;
  }
}
