import { Rol } from "./rol";

export interface Usuario{
    idUsuario?: number,
    rol?: Rol,
    usuario?: string,
    nombre?: string,
    email?: string,
    password?: string,
    locked?: boolean,
    disabled?: boolean,
    estado?: string    
}