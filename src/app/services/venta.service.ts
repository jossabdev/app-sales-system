import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ConsultaVentas, ConsultaVentasResponse, EstadisticaVentaResponse, Venta } from '../interfaces/venta';
import { GenericBasicResponse } from '../interfaces/generic-basic-response';
import { Observable, map } from 'rxjs';
import { GenericListResponse } from '../interfaces/generic-list-response';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  endpoint: string = `${environment.endpointApi}${paths.ventas}`
  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);

  constructor(private _httpClient: HttpClient) { }

  save(venta: Venta): any{
    console.log(venta);
    return this._httpClient.post<GenericBasicResponse<Venta>>(this.endpoint + `${paths.guardarVenta}`, venta, {headers: this.httpHeader})
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

  getBy(venta: Venta) : any{
    return this._httpClient.post<GenericListResponse<Venta>>(this.endpoint + `${paths.consultarPor}`, venta, {headers: this.httpHeader});
  }

  getByRangoFecha(consultaVenta: ConsultaVentas) : any{
    return this._httpClient.post<GenericListResponse<Venta>>(this.endpoint + `${paths.consultarPorRangoFecha}`, consultaVenta, {headers: this.httpHeader});
  }

  getAll(){    
    return this._httpClient.get<GenericListResponse<Venta>>(this.endpoint, { headers: this.httpHeader } );
  }

  update(venta: Venta){
    return this._httpClient.put<GenericBasicResponse<Venta>>(this.endpoint + `${paths.actualizarVenta}`, venta, { headers: this.httpHeader, observe: 'response' } )
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

  deleteByVenta(venta: Venta): Observable<unknown>{
    return this._httpClient.delete<GenericBasicResponse<Venta>>(this.endpoint + `${paths.eliminarVenta}`, { headers: this.httpHeader, observe: 'response', body: venta } )
    .pipe();
  }

  getTotalVentas(consultaVenta: ConsultaVentas){
    return this._httpClient.post<GenericBasicResponse<ConsultaVentasResponse>>(this.endpoint + `${paths.obtenerTotalDeVentas}`, consultaVenta, {headers: this.httpHeader});
  }

  getTotalGanancias(consultaVenta: ConsultaVentas){
    return this._httpClient.post<GenericBasicResponse<ConsultaVentasResponse>>(this.endpoint + `${paths.obtenerTotalDeGanancias}`, consultaVenta, {headers: this.httpHeader});
  }

  getProductoTop(consultaVenta: ConsultaVentas){
    return this._httpClient.post<GenericBasicResponse<ConsultaVentasResponse>>(this.endpoint + `${paths.obtenerProductoTop}`, consultaVenta, {headers: this.httpHeader});
  }

  getEstadisticasVentasPorOpcion(opcion: number){
    return this._httpClient.get<GenericBasicResponse<EstadisticaVentaResponse>>(this.endpoint + `${paths.obtenerEstadisticasVentasPorOpcion}` + '/'+ opcion , {headers: this.httpHeader});
  }

  anularVenta(venta: Venta){
    
    return this._httpClient.post<GenericBasicResponse<Venta>>(this.endpoint + `${paths.anularVenta}`, venta, {headers: this.httpHeader})
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

  getTotalInversion(){
    return this._httpClient.get<GenericBasicResponse<ConsultaVentasResponse>>(this.endpoint + `${paths.obtenerTotalDeInversion}`, {headers: this.httpHeader});
  }
}
