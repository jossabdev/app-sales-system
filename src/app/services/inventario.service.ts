import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Inventario } from '../interfaces/inventario';
import { GenericBasicResponse } from '../interfaces/generic-basic-response';
import { GenericListResponse } from '../interfaces/generic-list-response';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  endpoint: string = `${environment.endpointApi}${paths.inventarios}`
  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);

  constructor(private _httpClient: HttpClient) { }

  save(inventario: Inventario): any{
    console.log(inventario);
    return this._httpClient.post<GenericBasicResponse<Inventario>>(this.endpoint + `${paths.guardarInventario}`, inventario, {headers: this.httpHeader})
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

  getBy(inventario: Inventario) : any{
    return this._httpClient.post<GenericListResponse<Inventario>>(this.endpoint + `${paths.consultarPor}`, inventario, {headers: this.httpHeader});
  }

  getAll(){    
    return this._httpClient.get<GenericListResponse<Inventario>>(this.endpoint, { headers: this.httpHeader } );
  }

  update(inventario: Inventario){
    return this._httpClient.put<GenericBasicResponse<Inventario>>(this.endpoint + `${paths.actualizarInventario}`, inventario, { headers: this.httpHeader, observe: 'response' } )
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

  deleteByInventario(inventario: Inventario): Observable<unknown>{
    return this._httpClient.delete<GenericBasicResponse<Inventario>>(this.endpoint + `${paths.eliminarInventario}`, { headers: this.httpHeader, observe: 'response', body: inventario } )
    .pipe();
  }
}
