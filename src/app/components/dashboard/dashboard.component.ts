import { Component, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { UIChart } from 'primeng/chart/chart';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { ConsultaVentas, EstadisticaVentaResponse, Venta } from 'src/app/interfaces/venta';
import { VentaService } from 'src/app/services/venta.service';

export interface Card {
    header: string,
    subheader: string,
    body: any
}

interface UltimasVentas{
    descripcion: string,
    total?: number
}

enum Meses {
  Enero = 0,
  Febrero = 1,
  Marzo = 2,
  Abril = 3,
  Mayo = 4,
  Junio = 5,
  Julio = 6,
  Agosto = 7,
  Septiembre = 8,
  Octubre = 9,
  Noviembre = 10,
  Diciembre = 11
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent{
  data: any;
  options: any;
  card: string = 'card';
  items: MenuItem[];
  itemsGanancias: MenuItem[];
  itemsVentas: MenuItem[];
  itemsProductos: MenuItem[];
  mes: string = '';
  mesStrTotalVentas: string = '';
  mesStrTotalGanancias: string = '';
  mesStrProductoTop: string = '';
  mesTotalVentas: number;
  mesTotalGanancias: number;
  mesProductoTop: number;

  labelVentas: string = 'Ultimas ventas realizadas';

  totalVentas: Card = {
    header: "Total de ventas",
    subheader: "",
    body: ""
    
  };

  totalGanancias: Card = {
    header: "Total de ganancias",
    subheader: "",
    body: 0
    
  };

  productoTop: Card = {
    header: "Producto Top",
    subheader: "",
    body: ""
    
  };


  styleCard: any = { 
    height: '28.5vh',
    borderRadius: '1.3rem',
    padding: '1rem 1.7rem',
    margin: '0 2rem 2rem 0',
    fontSize: '1.8rem',
    minWidth: '23rem',
    boxShadow: '1px 2px 4px rgba($color: #000000, $alpha: 0.15)',    
    
  };

  styleVentaCard: any = { 
    height: '45vh',
    borderRadius: '1.3rem',
    padding: '0.7rem 1.7rem',
    margin: '0 2rem 2rem 0',
    fontSize: '1.2rem',
    boxShadow: '1px 2px 4px rgba($color: #000000, $alpha: 0.15)',    
    
  };

  ultimasVentas: UltimasVentas[] = [];
  rangoFechaTotalVentas: Date[] | undefined;
  rangoFechaTotalGanancias: Date[] | undefined;
  rangoFechaProductoTop: Date[] | undefined;
  fechaActual = new Date();
  seMuestraCalendar = false;
  seMuestraCalendarGanancias = false;
  seMuestraCalendarProductoTop = false;
  estadisticasVentas?: EstadisticaVentaResponse = {labels: [], values: []};
  @ViewChild("chart") chart!: UIChart; 
  
  constructor(private _ventasService: VentaService){
    
    let mesActual = this.getMonthStr(this.fechaActual.getMonth());
    let mesAnterior1 = this.getMonthStr(this.fechaActual.getMonth() - 1);
    let mesAnterior2 = this.getMonthStr(this.fechaActual.getMonth() - 2);
    this.mesStrTotalVentas = mesActual;
    this.mesStrTotalGanancias = mesActual;
    this.mesStrProductoTop = mesActual;
    this.mesTotalVentas = this.fechaActual.getMonth();
    this.mesTotalGanancias = this.fechaActual.getMonth();
    this.mesProductoTop = this.fechaActual.getMonth();
    console.log(mesActual);
    this.items = [
        {
            label: mesActual,
            command: () => {
              this.mesStrTotalVentas = mesActual;
              this.mesTotalVentas = this.fechaActual.getMonth();
              this.getTotalVentasPorMes(this.fechaActual.getMonth());
            }
        },
        {
            label: mesAnterior1,
            command: () => {
              this.mesStrTotalVentas = mesAnterior1;
              this.mesTotalVentas = (this.fechaActual.getMonth() - 1);
              this.getTotalVentasPorMes((this.fechaActual.getMonth() - 1));
            }
        },
        {
            label: mesAnterior2,
            command: () => {
              this.mesStrTotalVentas = mesAnterior2;
              this.mesTotalVentas = (this.fechaActual.getMonth() - 2);
              this.getTotalVentasPorMes((this.fechaActual.getMonth() - 2));
            }
        },
        {
          label: 'Fechas',
          command: () => {
            this.mesTotalVentas = -1;
            this.mesStrTotalVentas = 'Fechas';
            this.seMuestraCalendar = true;
          }
      },
        
    ];

    this.itemsVentas = [
      {
        label: 'Ultimas ventas realizadas'
      }
    ];

    this.itemsGanancias = [
      {
        label: mesActual,
        command: () => {
          this.mesStrTotalGanancias = mesActual;
          this.mesTotalGanancias = this.fechaActual.getMonth();
          this.getTotalGananciasPorMes(this.fechaActual.getMonth());
        }
    },
    {
        label: mesAnterior1,
        command: () => {
          this.mesStrTotalGanancias = mesAnterior1;
          this.mesTotalGanancias = (this.fechaActual.getMonth() - 1);
          this.getTotalGananciasPorMes((this.fechaActual.getMonth() - 1));
        }
    },
    {
        label: mesAnterior2,
        command: () => {
          this.mesStrTotalGanancias = mesAnterior2;
          this.mesTotalGanancias = (this.fechaActual.getMonth() - 2);
          this.getTotalGananciasPorMes((this.fechaActual.getMonth() - 2));
        }
    },
    {
      label: 'Fechas',
      command: () => {
        this.mesTotalGanancias = -1;
        this.mesStrTotalGanancias = 'Fechas';
        this.seMuestraCalendarGanancias = true;
      }
  },
    ];

    this.itemsProductos = [
      {
        label: mesActual,
        command: () => {
          this.mesStrProductoTop = mesActual;
          this.mesProductoTop = this.fechaActual.getMonth();
          this.getProductoTopPorMes(this.fechaActual.getMonth());
        }
    },
    {
        label: mesAnterior1,
        command: () => {
          this.mesStrProductoTop = mesAnterior1;
          this.mesProductoTop = (this.fechaActual.getMonth() - 1);
          this.getProductoTopPorMes((this.fechaActual.getMonth() - 1));
        }
    },
    {
        label: mesAnterior2,
        command: () => {
          this.mesStrProductoTop = mesAnterior2;
          this.mesProductoTop = (this.fechaActual.getMonth() - 2);
          this.getProductoTopPorMes((this.fechaActual.getMonth() - 2));
        }
    },
    {
      label: 'Fechas',
      command: () => {
        this.mesProductoTop = -1;
        this.mesStrProductoTop = 'Fechas';
        this.seMuestraCalendarProductoTop = true;
      }
  },
    ];
  }
  
  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    this.obtenerEstadisticasVentas(1);// por defecto se obtienen las estadísticas de ventas de los ultimos 7 días
    this.chart
    this.data = {
        //labels: ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'],
        //labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        labels: this.estadisticasVentas?.labels,
        datasets: [            
            {
                label: 'Ventas',
                //data: [312, 220, 262, 330.50, 210, 422],
                //data: [12, 22, 25, 30.50, 10, 42, 30, 12, 43, 99.1, 10, 50, 220, 45, 88.40, 12, 22, 25, 30.50, 10, 42, 30, 12, 43, 99.1, 10, 50, 220, 45, 88.40],
                data: this.estadisticasVentas?.values,
                fill: true,
                borderColor: documentStyle.getPropertyValue('--orange-500'),
                tension: 0.1,
                backgroundColor: 'rgba(243, 21, 89, 0.2)'
            }
        ]
    };
    
    this.options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            title: {
              display: true,
              text: 'Análisis de ventas',
              align: 'start',
              fontSize: 8
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    display: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                  display: false
                }
            }
        }
    };
    this.getTotalVentasPorMes(this.fechaActual.getMonth());
    this.getTotalGananciasPorMes(this.fechaActual.getMonth());
    this.getProductoTopPorMes(this.fechaActual.getMonth());
    this.getUltimasVentas();
    
  }

  // rango de fechas
  getTotalVentasPorRangoFecha(){
    let fechaDesde;
    let fechaHasta;
    let fechaDesdeStr = "2023-07-03 00:00:00";
    let fechaHastaStr = "2023-07-10 23:59:59";

    if(this.rangoFechaTotalVentas){
      fechaDesde = this.rangoFechaTotalVentas![0];
      fechaHasta = this.rangoFechaTotalVentas![1];
      fechaDesdeStr = this.formatDate(fechaDesde);
      fechaHastaStr = this.formatDate(fechaHasta);
    }
    

    let consultaTotalVentas: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};
    this._ventasService.getTotalVentas(consultaTotalVentas).subscribe(
        response => {          
            this.totalVentas.body = response.data?.totalVentas;          
          }
    );
  }

  getTotalVentasPorMes(mes: number){
    this.seMuestraCalendar = false;

    let arrayMeses31 = [ 0,2,4,6,7,9,11];
    let arrayMeses30 = [3,5,8,10];
    let fechaDesde = new Date();
    
    let diaDesde = 1;// siempre se empezará desde el dia 1
    let diaHasta;
    let horaHastaStr= '';

    // calculo del dia hasta si no es el mes actual
    console.log(fechaDesde.getMonth());
    console.log(mes);
    if(fechaDesde.getMonth() === mes){
      diaHasta = fechaDesde.getDate();// si es mes actual, el dia hasta es el dia del momento
      console.log(diaHasta);
      horaHastaStr = (fechaDesde.getHours() < 10 ? '0' + fechaDesde.getHours() : fechaDesde.getHours()) + ':' 
                     + (fechaDesde.getMinutes() < 10 ? '0' + fechaDesde.getMinutes(): fechaDesde.getMinutes()) + ':'
                     + (fechaDesde.getSeconds() < 10 ? '0' + fechaDesde.getSeconds(): fechaDesde.getSeconds());
    }else{
      if (arrayMeses31.includes(mes)){
        diaHasta = 31;
      }else if (arrayMeses30.includes(mes)){
        diaHasta = 30;
      }else{
        let anio = fechaDesde.getFullYear();
        if (((anio % 4 == 0) && (anio % 100 != 0 )) || (anio % 400 == 0)){
          diaHasta = 29;
        }
        else{
          diaHasta = 28;
        }
      }
      horaHastaStr = '23:59:59';
    }

    // seteamos mes actual o anteriores
    
    let monthStr = ((mes + 1) < 10 ? '0' + (mes + 1): (mes + 1));
    let diaHastaStr = diaHasta < 10 ? '0' + diaHasta : diaHasta;
    let fechaDesdeStr = fechaDesde.getFullYear() + '-' + monthStr + '-0' + diaDesde + ' 00:00:00'; 
    let fechaHastaStr = fechaDesde.getFullYear() + '-' + monthStr + '-' + diaHastaStr + ' ' + horaHastaStr;
        
    let consultaTotalVentas: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};
    this._ventasService.getTotalVentas(consultaTotalVentas).subscribe(
        response => {          
            this.totalVentas.body = response.data?.totalVentas;          
          }
    );
  }

  getTotalGananciasPorMes(mes: number){
    this.seMuestraCalendarGanancias = false;

    let arrayMeses31 = [ 0,2,4,6,7,9,11];
    let arrayMeses30 = [3,5,8,10];
    let fechaDesde = new Date();
    
    let diaDesde = 1;// siempre se empezará desde el dia 1
    let diaHasta;
    let horaHastaStr= '';

    // calculo del dia hasta si no es el mes actual
    console.log(fechaDesde.getMonth());
    console.log(mes);
    if(fechaDesde.getMonth() === mes){
      diaHasta = fechaDesde.getDate();// si es mes actual, el dia hasta es el dia del momento
      console.log(diaHasta);

      horaHastaStr = (fechaDesde.getHours() < 10 ? '0' + fechaDesde.getHours() : fechaDesde.getHours()) + ':' 
                     + (fechaDesde.getMinutes() < 10 ? '0' + fechaDesde.getMinutes(): fechaDesde.getMinutes()) + ':'
                     + (fechaDesde.getSeconds() < 10 ? '0' + fechaDesde.getSeconds(): fechaDesde.getSeconds());
    }else{
      if (arrayMeses31.includes(mes)){
        diaHasta = 31;
      }else if (arrayMeses30.includes(mes)){
        diaHasta = 30;
      }else{
        let anio = fechaDesde.getFullYear();
        if (((anio % 4 == 0) && (anio % 100 != 0 )) || (anio % 400 == 0)){
          diaHasta = 29;
        }
        else{
          diaHasta = 28;
        }
      }
      horaHastaStr = '23:59:59';
    }

    // seteamos mes actual o anteriores
    
    let monthStr = ((mes + 1) < 10 ? '0' + (mes + 1): (mes + 1));
    let diaHastaStr = diaHasta < 10 ? '0' + diaHasta : diaHasta;
    let fechaDesdeStr = fechaDesde.getFullYear() + '-' + monthStr + '-0' + diaDesde + ' 00:00:00';        
    let fechaHastaStr = fechaDesde.getFullYear() + '-' + monthStr + '-' + diaHastaStr + ' ' + horaHastaStr;

    let consultaTotalGanancias: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};
    this._ventasService.getTotalGanancias(consultaTotalGanancias).subscribe(
        response => {          
            this.totalGanancias.body = response.data?.totalGanancias;          
          }
    );
  }

  getTotalGananciasPorRangoFecha(){
    let fechaDesde;
    let fechaHasta;
    let fechaDesdeStr = "2023-07-03 00:00:00";
    let fechaHastaStr = "2023-07-10 23:59:59";

    if(this.rangoFechaTotalGanancias){
      fechaDesde = this.rangoFechaTotalGanancias![0];
      fechaHasta = this.rangoFechaTotalGanancias![1];
      fechaDesdeStr = this.formatDate(fechaDesde);
      fechaHastaStr = this.formatDate(fechaHasta);
    }
    

    let consultaTotalGanancias: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};
    this._ventasService.getTotalGanancias(consultaTotalGanancias).subscribe(
        response => {          
            this.totalGanancias.body = response.data?.totalGanancias;          
          }
    );
  }

  getProductoTopPorMes(mes: number){
    this.seMuestraCalendarProductoTop = false;

    let arrayMeses31 = [ 0,2,4,6,7,9,11];
    let arrayMeses30 = [3,5,8,10];
    let fechaDesde = new Date();
    
    let diaDesde = 1;// siempre se empezará desde el dia 1
    let diaHasta;
    let horaHastaStr = '';

    // calculo del dia hasta si no es el mes actual
    console.log(fechaDesde.getMonth());
    console.log(mes);
    if(fechaDesde.getMonth() === mes){
      diaHasta = fechaDesde.getDate();// si es mes actual, el dia hasta es el dia del momento
      console.log(diaHasta);

      horaHastaStr = (fechaDesde.getHours() < 10 ? '0' + fechaDesde.getHours() : fechaDesde.getHours()) + ':' 
                     + (fechaDesde.getMinutes() < 10 ? '0' + fechaDesde.getMinutes(): fechaDesde.getMinutes()) + ':'
                     + (fechaDesde.getSeconds() < 10 ? '0' + fechaDesde.getSeconds(): fechaDesde.getSeconds());
    }else{
      if (arrayMeses31.includes(mes)){
        diaHasta = 31;
      }else if (arrayMeses30.includes(mes)){
        diaHasta = 30;
      }else{
        let anio = fechaDesde.getFullYear();
        if (((anio % 4 == 0) && (anio % 100 != 0 )) || (anio % 400 == 0)){
          diaHasta = 29;
        }
        else{
          diaHasta = 28;
        }
      }
      horaHastaStr = '23:59:59';
    }

    // seteamos mes actual o anteriores
    
    let monthStr = ((mes + 1) < 10 ? '0' + (mes + 1): (mes + 1));
    let diaHastaStr = diaHasta < 10 ? '0' + diaHasta : diaHasta;
    let fechaDesdeStr = fechaDesde.getFullYear() + '-' + monthStr + '-0' + diaDesde + ' 00:00:00';    
    let fechaHastaStr = fechaDesde.getFullYear() + '-' + monthStr + '-' + diaHastaStr + ' ' + horaHastaStr;

    
    let consultaProductoTop: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};
    this._ventasService.getProductoTop(consultaProductoTop).subscribe(
        response => {   
          if(response.data?.productoTop){
            this.productoTop.body = "" + response.data?.productoTop;
          } else{
            this.productoTop.body = "No hay producto top";
          }      
                      
          }
    );
  }

  getProductoTopPorRangoFecha(){
    let fechaDesde;
    let fechaHasta;
    let fechaDesdeStr = "2023-07-03 00:00:00";
    let fechaHastaStr = "2023-07-10 23:59:59";

    if(this.rangoFechaProductoTop){
      fechaDesde = this.rangoFechaProductoTop![0];
      fechaHasta = this.rangoFechaProductoTop![1];
      fechaDesdeStr = this.formatDate(fechaDesde);
      fechaHastaStr = this.formatDate(fechaHasta);
    }

    let consultaProductoTop: ConsultaVentas = { fechaDesde: fechaDesdeStr, fechaHasta: fechaHastaStr};
    this._ventasService.getProductoTop(consultaProductoTop).subscribe(
        response => {          
            this.productoTop.body = "" + response.data?.productoTop;          
          }
    );

  }

  getUltimasVentas(){
    let ventas: Venta[];

    this._ventasService.getAll().subscribe(
        response => {
            ventas = response.data;    

            ventas.forEach( venta => {                
                let total = venta.total;
                let descripcion = '';

                let detalleVenta: DetalleVenta[] | undefined = venta.detalleVenta;

                // concateno descripciones de los productos del detalle
                detalleVenta?.forEach( detalle => {
                    descripcion = descripcion + detalle.producto?.descripcion + " ";
                });

                let ultimasVentas: UltimasVentas = { descripcion: descripcion, total: total};

                this.ultimasVentas.push(ultimasVentas);
            })        
        }
    );
  }

  padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }
  
  // 👇️ format as "YYYY-MM-DD hh:mm:ss"
  // You can tweak the format easily
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
  
  getMonthStr(month: number){
    let monthStr: string  = '';

    switch(month){
      case Meses.Enero:
        monthStr = 'Enero';
        break;
      case Meses.Febrero:
        monthStr = 'Febrero';
        break;
      case Meses.Marzo:
        monthStr = 'Marzo';
        break;
      case Meses.Abril:
        monthStr = 'Abril';
        break;
      case Meses.Mayo:
        monthStr = 'Mayo';
        break;
      case Meses.Junio:
        monthStr = 'Junio';
        break;
      case Meses.Julio:
        monthStr = 'Julio';
        break;
      case Meses.Agosto:
        monthStr = 'Agosto';
        break;
      case Meses.Septiembre:
        monthStr = 'Septiembre';
        break;
      case Meses.Octubre:
        monthStr = 'Octubre';
        break;
      case Meses.Noviembre:
        monthStr = 'Noviembre';
        break;
      case Meses.Diciembre:
        monthStr = 'Diciembre';
        break;
    }
    console.log(monthStr);
    return monthStr;
  }

  obtenerEstadisticasVentas(opcion: number){
    this._ventasService.getEstadisticasVentasPorOpcion(opcion).subscribe(
      response => {          
        this.estadisticasVentas = response.data;
        this.data.labels = this.estadisticasVentas?.labels;
        this.data.datasets[0].data = this.estadisticasVentas?.values;   
        this.chart.refresh();     
        }
  );
  }
}
