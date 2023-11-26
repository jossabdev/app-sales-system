import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { GenericListResponse } from '../interfaces/generic-list-response';
import { Usuario } from '../interfaces/usuario';
import { Observable, map } from 'rxjs';
import { GenericBasicResponse } from '../interfaces/generic-basic-response';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  endpoint: string = `${environment.endpointApi}${paths.usuarios}`
  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);

  constructor(private _httpClient: HttpClient) { }
  

  getAll(){    
    return this._httpClient.get<GenericListResponse<Usuario>>(this.endpoint, { headers: this.httpHeader } )
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

  getBy(usuario: Usuario) : any{
    return this._httpClient.post<GenericListResponse<Usuario>>(this.endpoint +  `${paths.consultarPor}`, usuario, {headers: this.httpHeader});
  }

  save(usuario: Usuario): any{
    console.log(usuario);
    return this._httpClient.post<GenericBasicResponse<Usuario>>(this.endpoint + `${paths.guardarUsuario}`, usuario, {headers: this.httpHeader})
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

  update(usuario: Usuario){
    return this._httpClient.put<GenericBasicResponse<Usuario>>(this.endpoint + `${paths.actualizarUsuario}`, usuario, {headers: this.httpHeader, observe: 'response' } )
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

  deleteByUsuario(usuario: Usuario): Observable<unknown>{
    return this._httpClient.delete<GenericBasicResponse<Usuario>>(this.endpoint + `${paths.eliminarUsuario}` , {headers: this.httpHeader, observe: 'response', body: usuario } )
    .pipe();
  }
}
