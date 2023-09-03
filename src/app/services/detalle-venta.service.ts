import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { GenericBasicResponse } from '../interfaces/generic-basic-response';
import { GenericListResponse } from '../interfaces/generic-list-response';
import { Venta } from '../interfaces/venta';
import { DetalleVenta } from '../interfaces/detalle-venta';

@Injectable({
  providedIn: 'root'
})
export class DetalleVentaService {

  endpoint: string = `${environment.endpointApi}${paths.detalleVentas}`
  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);

  constructor(private _httpClient: HttpClient) { }

  save(detalleVenta: DetalleVenta): any{
    console.log(detalleVenta);
    return this._httpClient.post<GenericBasicResponse<Venta>>(this.endpoint + `${paths.guardarDetalleVenta}`, detalleVenta, {headers: this.httpHeader})
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

  getBy(detalleVenta: DetalleVenta) : any{
    return this._httpClient.post<GenericListResponse<Venta>>(this.endpoint + `${paths.consultarPor}`, detalleVenta, {headers: this.httpHeader});
  }

  getAll(){    
    return this._httpClient.get<GenericListResponse<Venta>>(this.endpoint, { headers: this.httpHeader } );
  }

  update(detalleVenta: DetalleVenta){
    return this._httpClient.put<GenericBasicResponse<Venta>>(this.endpoint + `${paths.actualizarDetalleVenta}`, detalleVenta, { headers: this.httpHeader, observe: 'response' } )
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

  deleteByDetalleVenta(detalleVenta: DetalleVenta): Observable<unknown>{
    return this._httpClient.delete<GenericBasicResponse<Venta>>(this.endpoint + `${paths.eliminarDetalleVenta}`, { headers: this.httpHeader, observe: 'response', body: detalleVenta } )
    .pipe();
  }
}
