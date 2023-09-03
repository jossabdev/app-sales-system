import { Categoria } from "./categoria";

export interface Producto {
    idProducto?: number,
    nombreProducto?: string,
    descripcion?: string,
    codigoBarras?: string,
    categoria?: Categoria,
    costo?: number,
    precioVenta?: number,
    estado?: string
}