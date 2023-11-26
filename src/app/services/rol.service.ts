import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Rol } from '../interfaces/rol';
import { GenericListResponse } from '../interfaces/generic-list-response';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  endpoint: string = `${environment.endpointApi}${paths.roles}`
  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);

  constructor(private _httpClient: HttpClient) { }
  

  getAll(){    
    return this._httpClient.get<GenericListResponse<Rol>>(this.endpoint, { headers: this.httpHeader } )
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
}
