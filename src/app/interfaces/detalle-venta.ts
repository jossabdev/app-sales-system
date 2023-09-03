import { Producto } from "./producto";
import { Venta } from "./venta";

export interface DetalleVenta{
    idVentaDet?: number,
    venta?: Venta,
    producto?: Producto,
    cantidad?: number,
    valorUnitario?: number,
    valorTotal?: number,
    estado?: string
}