import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { filter, fromEvent, withLatestFrom } from 'rxjs';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { Estados, EstadosVenta } from 'src/app/interfaces/estados';
import { GenericListResponse } from 'src/app/interfaces/generic-list-response';
import { Producto } from 'src/app/interfaces/producto';
import { ConsultaVentas, Venta } from 'src/app/interfaces/venta';
import { ProductoService } from 'src/app/services/producto.service';
import { ReportesService } from 'src/app/services/reportes.service';
import { VentaService } from 'src/app/services/venta.service';

interface EstadosVta { valor?: string };

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class VentasComponent implements OnInit, AfterViewInit {
  @ViewChild('codigoBarrasVentaNormal') codigoBarrasVentaNormalElement?: ElementRef<HTMLInputElement> ;
  onlyRoleAdmin: boolean = false;
  
  formBuscarVentas: FormGroup;
  formVerVenta: FormGroup;
  formEditarVenta: FormGroup;
  formVentaRapida: FormGroup;
  formVentaNormal: FormGroup;

  estados: EstadosVta[] = [
    {valor: EstadosVenta.activo},
    {valor: EstadosVenta.anulado}];

  ventas: Venta[] = [];
  ventasActivasParaReporte: Venta[] = [];
  ventasAnuladasParaReporte: Venta[] = [];
  ventaShow: Venta [] = [];
  detalleVenta?: DetalleVenta [];
  ventaDialog = false;
  isShowVentaDetalle = false; 
  isEditVentaDetalle = false;
  tituloDetalleVenta = 'Detalle de la venta';
  titulo = 'Ventas';
  tituloVenta = 'Ventas';
  tituloVentaRapida = 'Ventas / Venta Rápida';
  tituloVentaNormal = 'Ventas / Venta Normal';
  header = '';
  esVentaRapida = false;
  esVentaNormal = false;
  esShowVenta = true;
  realizandoVenta = false;
  productos!: Producto[];
  detalleVentaNormal : DetalleVenta[] = [];
  ventaNormal : Venta = {};
  productoStock: Producto = {};
  duracionToast = 10000;
  totalDeVentasSegunFiltros: number = 0;
  isTotalVentaSegunFiltro: boolean = false;

  constructor(private formBuilder: FormBuilder, private ventaService: VentaService, private messageService: MessageService, private confirmationService: ConfirmationService, private _productoService: ProductoService, private router: Router, private reporteService: ReportesService){
    this.onlyRoleAdmin = localStorage.getItem('Rol') === 'Administrador'? true : false;
    this.formBuscarVentas = this.formBuilder.group({
      idVenta: [],
      vendedor: [],
      cliente: [],
      fechaDesde: [],
      fechaHasta: [],
      estado: []
    });
    this.formVerVenta = this.formBuilder.group({
      idVenta: [],
      vendedor: [],
      cliente: [],
      subtotal: [],
      iva: [],
      descuento: [],
      total: [],
      fechaVenta: [],
      estado: []
    });

    this.formEditarVenta = this.formBuilder.group({
      idVenta: [],
      vendedor: [],
      cliente: [],
      subtotal: [],
      iva: [],
      descuento: [],
      total: [],
      fechaVenta: [],
      estado: []
    });

    this.formVentaRapida = this.formBuilder.group({
      producto: [],
      codigoBarras: []
    });

    this.formVentaNormal = this.formBuilder.group({
      producto: [],
      codigoBarras: [],
      cantidad: []
    });
  }

  ngOnInit(): void {
    this.buscarListadoVentas();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.codigoBarrasVentaNormalElement!.nativeElement.focus();
     // Access the input object or DOM node
     console.dir(this.codigoBarrasVentaNormalElement!.nativeElement);
    }, 5000);
    
  }

  buscarListadoVentas(){
    this.totalDeVentasSegunFiltros = 0;
    if(this.onlyRoleAdmin){
      this.ventaService.getAll()
      .subscribe({        
        next : (response: any) => {
          this.ventas = response.data; 
          this.totalDeVentasSegunFiltros = this.ventas.map(v => v.total).reduce((a, b) => a! + b!)!;
        },
        error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText, life: 8000 } )
     });
    }else{
      let ventaRequest : Venta = {};
      ventaRequest.vendedor = localStorage.getItem('User')! ;

      this.ventaService.getBy(ventaRequest)
      .subscribe({        
        next : (response: any) => {
          this.ventas = response.data; 
        },
        error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText, life: 8000 } )
     });
    }
    
  }

  buscarVentasPorFiltros(){
    this.totalDeVentasSegunFiltros = 0;
    this.isTotalVentaSegunFiltro = true;
    let ventasFiltro: any = this.formBuscarVentas.value;

    console.log(ventasFiltro);
    // validacion de estado
    if(ventasFiltro.estado){
      ventasFiltro.estado = ventasFiltro.estado.valor;
    }
        
    // validacion de fechas
    let fechaDesdeStr = "";
    let fechaHastaStr = "";
    let fechaDesde: Date = ventasFiltro.fechaDesde;
    let fechaHasta: Date = ventasFiltro.fechaHasta;

    console.log(ventasFiltro);
    // si hay rango de fecha se ignoran los demas filtros y se consulta solo por rango de fecha.
    if(fechaDesde && fechaHasta){

        fechaDesdeStr = this.formatDate(fechaDesde);
        fechaHastaStr = this.formatDate(fechaHasta); 
        let consultaVentas: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};
        
        if(!this.onlyRoleAdmin){
          consultaVentas.vendedor = localStorage.getItem('User')!
        }else{
          consultaVentas.vendedor = ventasFiltro.vendedor;
        }

        this.ventaService.getByRangoFecha(consultaVentas)
          .subscribe({        
            next : (response: any) => {
              this.ventas = response.data; 
              // sacar total de ventas consultado.
              this.totalDeVentasSegunFiltros = this.ventas
                  .filter( value => (value.estado === 'Activo'))
                  .map((value, key) => value.total)
                  .reduce((a, b) => a! + b!)!;
              
              this.ventasActivasParaReporte = this.ventas
                      .filter( value => (value.estado === 'Activo'));

              this.ventasAnuladasParaReporte = this.ventas
                      .filter( value => (value.estado === 'Anulado'));        
            },
            error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText })
        });  
    }else if(fechaDesde){
        fechaDesdeStr = this.formatDate(fechaDesde);
        let ventaFechaDesde: Venta = { fechaVenta: fechaDesdeStr };

        if(!this.onlyRoleAdmin){
          ventaFechaDesde.vendedor = localStorage.getItem('User')!
        }

        this.ventaService.getBy(ventaFechaDesde)
          .subscribe({        
            next : (response: any) => {
              this.ventas = response.data; 
              // sacar total de ventas consultado.
              this.totalDeVentasSegunFiltros = this.ventas.filter( value => (value.estado === 'Activo')).map((value, key) => value.total).reduce((a, b) => a! + b!)!;
              
              this.ventasActivasParaReporte = this.ventas
                                           .filter( value => (value.estado === 'Activo'));

              this.ventasAnuladasParaReporte = this.ventas
                                           .filter( value => (value.estado === 'Anulado'));
            },
            error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText })
        }); 
    }else{
      if(!this.onlyRoleAdmin){
        ventasFiltro.vendedor = localStorage.getItem('User')!
      }
      console.log(ventasFiltro);
      this.ventaService.getBy(ventasFiltro)
          .subscribe({        
            next : (response: any) => {
              this.ventas = response.data; 
              console.log(response.data);
              
              // sacar total de ventas consultado.
              console.log(ventasFiltro.estado);
              if((ventasFiltro.estado === 'Activo' && !ventasFiltro.vendedor) || (ventasFiltro.vendedor && !ventasFiltro.estado )|| ( ventasFiltro.vendedor && ventasFiltro.estado === 'Activo' )|| (!ventasFiltro.estado && !ventasFiltro.vendedor && !ventasFiltro.fechaDesde && !ventasFiltro.fechaHasta)){
                this.totalDeVentasSegunFiltros = this.ventas.filter( value => (value.estado === 'Activo')).map((value, key) => value.total)!.reduce((a, b) => a! + b!)!;
              }
              
              this.ventasActivasParaReporte = this.ventas
                                              .filter( value => (value.estado === 'Activo'));

              this.ventasAnuladasParaReporte = this.ventas
                                              .filter( value => (value.estado === 'Anulado'));

            },
            error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText })
          }); 

     
    }
    console.log( this.ventas );    
  }

  verDetalleVenta(venta: Venta){
    this.ventaDialog = true; 
    this.isShowVentaDetalle = true;
    this.header = this.tituloDetalleVenta + " #" + venta.idVenta;
    this.ventaShow[0] = venta;
    this.detalleVenta = venta.detalleVenta;

  }

  anularVenta(venta: Venta){
    console.log(venta);
    this.confirmationService.confirm({
      message: '¿ Está seguro que desea anular la venta con código: ' + venta.idVenta + ' ?',
      header: 'Anular venta',      
      icon: 'pi pi-exclamation-triangle', 
      accept: () => {
        this.ventaService.anularVenta(venta).subscribe( {        
            next : (response: any) => {            
              this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Venta anulada correctamente.'});          
              this.buscarListadoVentas();
            },
            error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al realizar anulación de venta', detail: response.status + ' ' + response.statusText })
         });          
      }
    });

    
  }

  limpiarFormularioBusqueda(){
    this.isTotalVentaSegunFiltro = false;
    this.formBuscarVentas.reset();    
    this.ventasActivasParaReporte = [];
    this.ventasAnuladasParaReporte = [];
  }

  padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date: Date) {
    return (
      [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        this.padTo2Digits(date.getHours()),
        this.padTo2Digits(date.getMinutes()),
        this.padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }

  cancel(){
    this.ocultarDialog();
  }

  ocultarDialog(){
    this.ventaDialog = false;    
    this.isEditVentaDetalle = false;
    this.isShowVentaDetalle = false;
  }

  obtenerTodosLosProductosEnStock(){ 
    this._productoService.getAllWithStock()
        .subscribe( {        
          next : (response: any) => {            
            this.productos = response.data
            console.log(response.data);             
          },
          error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar productos', detail: response.status + ' ' + response.statusText })
       });
  }

  habilitarVentaRapida(){
    this.esVentaRapida = true;
    this.esVentaNormal = false;
    this.esShowVenta = false;
    this.realizandoVenta = true;   
    this.obtenerTodosLosProductosEnStock();
    this.titulo = this.tituloVentaRapida;    
  }

  habilitarVentaNormal(){
    this.esVentaNormal = true;
    this.esVentaRapida = false;
    this.esShowVenta = false;
    this.realizandoVenta = true;
    this.obtenerTodosLosProductosEnStock();
    this.titulo = this.tituloVentaNormal;
    this.codigoBarrasVentaNormalElement!.nativeElement.focus();
  }

  
  realizarVentaRapida(){
    let producto : Producto = this.formVentaRapida.value.producto;
    let vendedor = ''+localStorage.getItem("User");
    let subtotal = (producto.precioVenta! / 1.12);
    let iva = (subtotal * 0.12);
    let detalle: DetalleVenta = {
      producto: producto,
      cantidad: 1,
      valorUnitario: producto.precioVenta,
      valorTotal: producto.precioVenta,
      estado: Estados.activo
    };

    let venta : Venta = {
      vendedor: vendedor,
      cliente: 'cfinal',
      subtotal: subtotal,
      iva: iva,
      descuento: 0.0,
      total: producto.precioVenta,
      estado: Estados.activo,
      detalleVenta: [
        detalle
      ]
    };
    this.ventaService.save(venta).subscribe( {        
      next : (response: any) => {            
        this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Venta realizada correctamente.',  life: this.duracionToast});          
        this.buscarListadoVentas();
        this.obtenerTodosLosProductosEnStock();
      },
      error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al realizar venta rápida', detail: response.status + ' ' + response.statusText })
   });
    
  }

  realizarVentaRapidaPorCodigoBarra(producto: Producto){
    let vendedor = ''+localStorage.getItem("User");
    let subtotal = (producto.precioVenta! / 1.12);
    let iva = (subtotal * 0.12);
    let detalle: DetalleVenta = {
      producto: producto,
      cantidad: 1,
      valorUnitario: producto.precioVenta,
      valorTotal: producto.precioVenta,
      estado: Estados.activo
    };

    let venta : Venta = {
      vendedor: vendedor,
      cliente: 'cfinal',
      subtotal: subtotal,
      iva: iva,
      descuento: 0.0,
      total: producto.precioVenta,
      estado: Estados.activo,
      detalleVenta: [
        detalle
      ]
    };
    let resumenProductosVenta = this.getResumenProductosVenta(venta);

    this.ventaService.save(venta).subscribe( {        
      next : (response: any) => {            
        this.messageService.add({ key: 'bc', severity: 'success', summary: 'Transacción exitosa', detail: 'Venta realizada correctamente.',  life: this.duracionToast});          
        this.buscarListadoVentas();
        this.obtenerTodosLosProductosEnStock();
      },
      error: (response: any) => this.messageService.add({key: 'bc', severity: 'error', summary: 'Error al realizar venta rápida', detail: response.status + ' ' + response.statusText })
   });
    
  }

  salirVenta(){
    let summaryVenta = '';
    if (this.esVentaRapida){
      summaryVenta = 'Venta rápida';
    }

    if (this.esVentaNormal){
      summaryVenta = 'Venta normal';
    }
    this.esShowVenta = true;
    this.esVentaRapida = false;
    this.esVentaNormal = false;
    this.realizandoVenta = false;
    this.titulo = this.tituloVenta;
    this.detalleVentaNormal = [];
    this.formVentaNormal.reset();
    this.formVentaRapida.reset();
    this.messageService.add({ key: 'bc', severity: 'warn', summary: 'Atención', detail: 'Ha salido de la '+ summaryVenta});    
  }

  redirect(){
    //this.router.navigateByUrl('/ventas');
    this.ngOnInit();
  }

  agregarProductoALaVenta(){
    let producto = this.formVentaNormal.value.producto;
    let cantidad = this.formVentaNormal.value.cantidad;
    let valorUnitario = producto.precioVenta;
    let valorTotal = valorUnitario * cantidad;
    
    let detalleVenta: DetalleVenta = {
      producto : producto, 
      cantidad: cantidad, 
      valorUnitario: valorUnitario, 
      valorTotal: valorTotal, 
      estado: Estados.activo
    };

    this.detalleVentaNormal.push(detalleVenta);
    this.formVentaNormal.reset();
  }

  eliminarDetalleVentaNormal(detalleVenta: DetalleVenta){
    this.detalleVentaNormal = this.detalleVentaNormal.filter((detalle) => detalle !== detalleVenta);
  }

  getTotalDetalleVentaNormal(){
    let totalArray: number[] = [];

    this.detalleVentaNormal?.forEach( detalle => {
      totalArray.push(detalle.valorTotal!);
    });

    let total = totalArray.reduce((a, b) => a + b, 0);
    return total;
  }

  realizarVentaNormal(){
    let vendedor = ''+localStorage.getItem("User");    
    let total = this.getTotalDetalleVentaNormal();

    let subtotal = (total / 1.12);
    let iva = (subtotal * 0.12);

    let venta : Venta = {
      cliente: "cfinal",
      vendedor: vendedor,
      subtotal: subtotal,
      iva: iva,
      descuento: 0.0,
      total: total,
      estado: Estados.activo,
      detalleVenta: this.detalleVentaNormal
    }

    this.ventaService.save(venta).subscribe( {        
      next : (response: any) => {            
        this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Venta realizada correctamente.',  life: this.duracionToast});          
        this.buscarListadoVentas();
        this.obtenerTodosLosProductosEnStock();
        this.salirDespuesDeVentaNormal();
      },
      error: (response: any) => {
        console.log(response)
        this.messageService.add({ severity: 'error', summary: 'Error al realizar venta normal', detail: response.error.message })
      } 
   });
  }

  salirDespuesDeVentaNormal(){  
    this.esShowVenta = true;
    this.esVentaRapida = false;
    this.esVentaNormal = false;
    this.realizandoVenta = false;
    this.titulo = this.tituloVenta;
    this.detalleVentaNormal = [];
  }

  onKeyCodigoBarrasVentaRapida(event: any) {
    let codigoBarras = '';

    if(event.key === "Enter"){
      codigoBarras = event.target.value;
      console.log('codigo: ' + codigoBarras);

      this.buscarProductoPorCodigoBarraYRealizarVenta(codigoBarras);      

    }
    
  }

  buscarProductoPorCodigoBarraYRealizarVenta(codigoBarras: string){
   let producto: Producto = { codigoBarras: codigoBarras};
   let productoEncontrado: Producto = {}
   this._productoService.getByBarCode(producto).subscribe({
    next: (response: any) => {          
      console.log(response.data);
      this.productoStock = response.data;    
      this.realizarVentaRapidaPorCodigoBarra(this.productoStock);  
      
    },
    error: (response: any) => {
      this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error al consultar stock producto', detail: response.error.message + '. Detalle de error: '+ response.error.error , life: 3000});      
    },
    complete: () => {
      
    }
   });

   setTimeout(() => 
      {
          this.formVentaRapida.reset();
          this.focusOnInputCodigoBarras();
      },
      1000);
   
  }

  buscarProductoPorCodigoBarraYCargarloEnLaVista(codigoBarras: string){
    let producto: Producto = { codigoBarras: codigoBarras};
    let productoEncontrado: Producto = {}
    this._productoService.getByBarCode(producto).subscribe({
     next: (response: any) => {          
       console.log(response.data);
       this.productoStock = response.data;    
       //this.realizarVentaRapidaPorCodigoBarra(this.productoStock); 
       let productoAvender = { producto: response.data} 
       this.formVentaNormal.patchValue(productoAvender);
       
     },
     error: (response: any) => {
       this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error al consultar stock producto', detail: response.error.message + '. Detalle de error: '+ response.error.error , life: 3000});      
     },
     complete: () => {
       
     }
    });
 
    setTimeout(() => 
       {
           this.formVentaRapida.reset();
           this.focusOnInputCodigoBarras();
       },
       1000);
    
   }

  getResumenProductosVenta(venta: Venta){
    let resumenProductosVenta = '';

    let detalleVenta: DetalleVenta[] | undefined = venta.detalleVenta;

    if(venta.estado === 'Activo' || venta.estado === 'Anulado' ){
      // concateno descripciones de los productos del detalle
      detalleVenta?.forEach( detalle => {
        resumenProductosVenta = resumenProductosVenta + detalle.producto?.nombreProducto + " ";
      });
    }
    return resumenProductosVenta;
  }

  focusOnInputCodigoBarras(){
    let inputCodigoBarras = document.getElementById(
      'input-codigo-barras',
    ) as HTMLInputElement ;

    //inputCodigoBarras?.setAttribute('autofocus', 'true') ;
    inputCodigoBarras.focus();
  }

  onKeyBusquedaProducto(event: any){
    let codigoBarras = '';

    if(event.key === "Enter"){
      codigoBarras = event.target.value;
      console.log('codigo: ' + codigoBarras);

      this.buscarProductoPorCodigoBarraYCargarloEnLaVista(codigoBarras);      

    }
  }

  generarReporteVentasActivas(){
    if(this.ventasActivasParaReporte.length > 0){
      this.reporteService.generarReporte(this.ventasActivasParaReporte, 'ReporteVentasRealizadas').subscribe({
        next: (response: any) => {          
          this.messageService.add({ key: 'bc', severity: 'success', summary: 'Reporte de ventas realizadas generado correctamente', detail: '' , life: 3000});        
        },
        error: (response: any) => {
          console.log(response);
          this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error al descargar el reporte de ventas', detail: response.name + '. Detalle de error: '+ response.message , life: 3000});          
        }
      });
    }else{
      this.messageService.add({ key: 'bc', severity: 'info', summary: 'No existen datos para generar el reporte de ventas realizadas', detail: '' , life: 3000});
    }
    
  }

  generarReporteVentasAnuladas(){
    if(this.ventasAnuladasParaReporte.length > 0){
      this.reporteService.generarReporte(this.ventasAnuladasParaReporte, 'ReporteVentasAnuladas').subscribe({
        next: (response: any) => {          
          this.messageService.add({ key: 'bc', severity: 'success', summary: 'Reporte de ventas anuladas generado correctamente', detail: '' , life: 3000}); 
        },
        error: (response: any) => {
          this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error al descargar el reporte de ventas anuladas', detail: response.name + '. Detalle de error: '+ response.message , life: 3000});          
        }
      });
    }else{
      this.messageService.add({ key: 'bc', severity: 'info', summary: 'No existen datos para generar el reporte de ventas anuladas', detail: '' , life: 3000});
    }
    
  }
}
