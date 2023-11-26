import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../interfaces/producto';
import { GenericBasicResponse } from '../interfaces/generic-basic-response';
import { map } from 'rxjs/internal/operators/map';
import { GenericListResponse } from '../interfaces/generic-list-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  endpoint: string = `${environment.endpointApi}${paths.productos}`
  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);

  constructor(private _httpClient: HttpClient) { }

  save(producto: Producto): any{
    console.log(producto);
    return this._httpClient.post<GenericBasicResponse<Producto>>(this.endpoint + `${paths.guardarProducto}`, producto, {headers: this.httpHeader})
                    .pipe(
                      map((response: GenericBasicResponse<any>) => {
                        if(response.code === 0){
                          return response;
                        }else{
                          throw response;
                        }
                      }),
                    );
  }

  getBy(producto: Producto) : any{
    return this._httpClient.post<GenericListResponse<Producto>>(this.endpoint +  `${paths.consultarPor}`, producto, {headers: this.httpHeader});
  }

  getByBarCode(producto: Producto) : any{
    return this._httpClient.post<GenericListResponse<Producto>>(this.endpoint +  `${paths.obtenerProductoEnStockPorCodigoBarras}`, producto, {headers: this.httpHeader});
  }

  getAll(){    
    return this._httpClient.get<GenericListResponse<Producto>>(this.endpoint, { headers: this.httpHeader } )
    .pipe(
      map((response: GenericListResponse<any>) => {
        if(response.code === 0){
          return response;                    
        }else{
          throw response;
        }        
      }),
    );
  }

  getAllWithStock(){    
    return this._httpClient.get<GenericListResponse<Producto>>(this.endpoint +  `${paths.obtenerTodosLosProductosEnStock}`, { headers: this.httpHeader } )
    .pipe(
      map((response: GenericListResponse<any>) => {
        if(response.code === 0){
          return response;                    
        }else{
          throw response;
        }        
      }),
    );
  }

  update(producto: Producto){
    return this._httpClient.put<GenericBasicResponse<Producto>>(this.endpoint + `${paths.actualizarProducto}`, producto, {headers: this.httpHeader, observe: 'response' } )
    .pipe(
      map((response: HttpResponse<GenericBasicResponse<any>>) => {
        if(response.body?.code === 0){
          return response;                    
        }else{
          throw response;
        }
        
      }),
    );
  }

  deleteByProducto(producto: Producto): Observable<unknown>{
    return this._httpClient.delete<GenericBasicResponse<Producto>>(this.endpoint + `${paths.eliminarProducto}` , {headers: this.httpHeader, observe: 'response', body: producto } )
    .pipe();
  }
}
