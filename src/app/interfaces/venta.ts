import { DetalleVenta } from "./detalle-venta";

export interface Venta{
    idVenta?: number,
    vendedor?: string,
    cliente?: string,
    subtotal?: number,
    iva?: number,
    descuento?: number,
    total?: number,
    fechaVenta?: string,
    estado?: string,
    detalleVenta?: DetalleVenta []
}

export interface ConsultaVentas{
    fechaDesde: string,
    fechaHasta: string,
    vendedor?: string,
}

export interface ConsultaVentasResponse{
    totalVentas?: number,
    totalGanancias?: number,
    productoTop?: string,
    totalInversion?: number
}

export interface EstadisticaVentaResponse{
    labels: string [],
    values: number []
}