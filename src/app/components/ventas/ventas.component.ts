import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { Estados, EstadosVenta } from 'src/app/interfaces/estados';
import { GenericListResponse } from 'src/app/interfaces/generic-list-response';
import { Producto } from 'src/app/interfaces/producto';
import { ConsultaVentas, Venta } from 'src/app/interfaces/venta';
import { ProductoService } from 'src/app/services/producto.service';
import { VentaService } from 'src/app/services/venta.service';

interface EstadosVta { valor?: string };

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class VentasComponent implements OnInit {
  formBuscarVentas: FormGroup;
  formVerVenta: FormGroup;
  formEditarVenta: FormGroup;
  formVentaRapida: FormGroup;

  estados: EstadosVta[] = [
    {valor: EstadosVenta.activo},
    {valor: EstadosVenta.modificado},
    {valor: EstadosVenta.anulado},
    {valor: EstadosVenta.eliminado}];

  ventas: Venta[] = [];
  ventaShow: Venta [] = [];
  detalleVenta?: DetalleVenta [];
  ventaDialog = false;
  isShowVentaDetalle = false; 
  isEditVentaDetalle = false;
  tituloDetalleVenta = 'Detalle de la venta';
  header = '';
  esVentaRapida = false;
  esVentaNormal = false;
  esShowVenta = true;
  realizandoVenta = false;
  productos!: Producto[];

  
  constructor(private formBuilder: FormBuilder, private ventaService: VentaService, private messageService: MessageService, private confirmationService: ConfirmationService, private _productoService: ProductoService){
    this.formBuscarVentas = this.formBuilder.group({
      idVenta: [],
      vendedor: [],
      cliente: [],
      fechaVenta: [],
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
  }

  ngOnInit(): void {
    this.buscarListadoVentas();
  }

  buscarListadoVentas(){
    this.ventaService.getAll()
    .subscribe({        
      next : (response: any) => {
        this.ventas = response.data; 
      },
      error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText })
   });
  }

  buscarVentasPorFiltros(){
    let ventasFiltro: any = this.formBuscarVentas.value;

    // validacion de estado
    if(ventasFiltro.estado){
      ventasFiltro.estado = ventasFiltro.estado.valor;
    }
        
    // validacion de fechas
    let fechaDesde;
    let fechaHasta;
    let fechaDesdeStr = "";
    let fechaHastaStr = "";
    let rangoFechaVentas: Date [] = ventasFiltro.fechaVenta;

    // si hay rango de fecha se ignoran los demas filtros y se consulta solo por rango de fecha.
    if(rangoFechaVentas){
      fechaDesde = rangoFechaVentas![0];
      fechaHasta = rangoFechaVentas![1];

      if(fechaDesde && fechaHasta){
        fechaDesdeStr = this.formatDate(fechaDesde);
        fechaHastaStr = this.formatDate(fechaHasta); 
        let consultaVentas: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};

        this.ventaService.getByRangoFecha(consultaVentas)
          .subscribe({        
            next : (response: any) => {
              this.ventas = response.data; 
            },
            error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText })
        });  
      }else if(fechaDesde){
        fechaDesdeStr = this.formatDate(fechaDesde);
        ventasFiltro.fechaVenta = fechaDesdeStr;
        this.ventaService.getBy(ventasFiltro)
          .subscribe({        
            next : (response: any) => {
              this.ventas = response.data; 
            },
            error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText })
        }); 
      }
      
    }else{
      this.ventaService.getBy(ventasFiltro)
      .subscribe({        
        next : (response: any) => {
          this.ventas = response.data; 
        },
        error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al consultar listado de ventas', detail: response.status + ' ' + response.statusText })
    }); 
    }
          
  }

  verDetalleVenta(venta: Venta){
    this.ventaDialog = true; 
    this.isShowVentaDetalle = true;
    this.header = this.tituloDetalleVenta + " #" + venta.idVenta;
    this.ventaShow[0] = venta;
    this.detalleVenta = venta.detalleVenta;

  }

  editarVenta(venta: Venta){
    this.isEditVentaDetalle = true;
  }

  eliminarVenta(venta: Venta){

  }

  limpiarFormularioBusqueda(){
    this.formBuscarVentas.reset();    
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

  ejecutarEditarVenta(){
    

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
    this.esShowVenta = false;
    this.realizandoVenta = true;
    this.obtenerTodosLosProductosEnStock();
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
        this.messageService.add({ severity: 'success', summary: 'Transacción exitosa', detail: 'Venta realizada correctamente.'});          
        this.buscarListadoVentas();
        this.obtenerTodosLosProductosEnStock();
      },
      error: (response: any) => this.messageService.add({ severity: 'error', summary: 'Error al realizar venta rápida', detail: response.status + ' ' + response.statusText })
   });
    
  }

  salirVenta(){
    this.esShowVenta = true;
    this.esVentaRapida = false;
    this.esVentaNormal = false;
    this.realizandoVenta = false;
  }
}
