import { Injectable } from '@angular/core';
import { Categoria } from './../interfaces/categoria';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { GenericListResponse } from './../interfaces/generic-list-response';
import { GenericBasicResponse } from './../interfaces/generic-basic-response';
import { map } from 'rxjs/internal/operators/map';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  endpoint: string = `${environment.endpointApi}${paths.categorias}`;

  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);
  
  
  constructor( private http: HttpClient) { 
  }

  save(categoria: Categoria): any{
    console.log(categoria);
    return this.http.post<GenericBasicResponse<Categoria>>(this.endpoint + `${paths.guardarCategoria}` , categoria, {headers: this.httpHeader, observe: 'response' } )
                    .pipe(
                      map((response: HttpResponse<GenericBasicResponse<any>>) => {
                        return response;                        
                      }),
                    );
  }

  getAll(){    
    return this.http.get<GenericListResponse<Categoria>>(this.endpoint, { headers: this.httpHeader } );
  }

  getBy(categoria: Categoria) : any{
    return this.http.post<GenericListResponse<Categoria>>(this.endpoint + `${paths.consultarPor}`, categoria, {headers: this.httpHeader});
  }

  update(categoria: Categoria){
    return this.http.put<GenericBasicResponse<Categoria>>(this.endpoint + `${paths.actualizarCategoria}`, categoria, {headers: this.httpHeader, observe: 'response' } )
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

  deleteByCategoria(categoria: Categoria): Observable<unknown>{
    return this.http.delete<GenericBasicResponse<Categoria>>(this.endpoint + `${paths.eliminarCategoria}`, {headers: this.httpHeader, observe: 'response', body: categoria } )
    .pipe();
  }
}
