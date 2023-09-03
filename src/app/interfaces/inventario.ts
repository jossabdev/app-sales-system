import { Producto } from "./producto";

export interface Inventario{
    idInventario?: number,
    producto?: Producto,
    stockInicial?: number,
    cantidadIngresados?: number,
    cantidadVendidos?: number,
    stockTotal?: number,
    estado?: string
}