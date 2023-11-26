import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';
import { UserLogin } from '../interfaces/login';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, map, take } from 'rxjs';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  endpoint: string = `${environment.endpointApi}${paths.login}`;

  constructor(private _httpClient: HttpClient, private _usuarioService: UsuarioService) { }

 /* login(userLogin: UserLogin){
    return this._httpClient.post(this.endpoint, userLogin, { observe: 'response' } )
          .subscribe(resp => {
            let authToken = resp.headers.get('Authorization');
            this.setSession(authToken);
            return resp.headers.get('Authorization');
          }, error =>{
            throw error;
          })
          ;
  }*/

  login(userLogin: UserLogin){
    return this._httpClient.post(this.endpoint, userLogin, { observe: 'response' })
            .pipe(
              take(1),
              map((response) => {

                if(response.ok){
                  let authToken = response.headers.get('Authorization');
                  this.setSession(authToken);
                                  
                  let usuario: Usuario = { usuario: userLogin.username};
                 
                  this._usuarioService.getBy(usuario).subscribe({
                    next : (response: any) => {
                      let usuarioCompleto = response.data[0]; 
                      console.log(usuarioCompleto);

                      let nombre = usuarioCompleto.nombre;
                      localStorage.setItem('Nombre', nombre);
                      let rol = usuarioCompleto.rol.rol;                       
                      localStorage.setItem('Rol', rol);
                    },
                    error: (response: any) => {
                      console.log('Error, usuario no encontrado. Status code: ' + response.status + ' ' + response.statusText);                      
                    }
                  });

                  return response.headers.get('Authorization');
                }else{              
                  throw response;
                }
                                        
              }),
            );
  }

  decodeToken(token: string): string {
    return jwt_decode(token);
  }

  private setSession(token: any) {    
    let tokenDecoded: string = this.decodeToken(token);
    let tokenObj = JSON.parse(JSON.stringify(tokenDecoded));
    const expiresAt = tokenObj.exp;
    const user = tokenObj.sub;
    localStorage.setItem('Authorization', token);
    localStorage.setItem('User', user);
    localStorage.setItem("ExpiresAt", JSON.stringify(expiresAt.valueOf()));
    console.log('is loggedin: '+ this.isLoggedIn());
    console.log(this.getExpiration().format());

    
  }          

  logout() {
      localStorage.removeItem("Authorization");
      localStorage.removeItem("ExpiresAt");
      localStorage.removeItem("User");
      localStorage.removeItem("Nombre");
      localStorage.removeItem("Rol");
  }

  public isLoggedIn(): Observable<boolean>{
      let isloggedIn = moment().isBefore(this.getExpiration());
      return isloggedIn ? new BehaviorSubject<boolean>(true): new BehaviorSubject<boolean>(false);
  }

  isLoggedOut() {
      return !this.isLoggedIn();
  }

  getExpiration() {
      const expiration:any = localStorage.getItem("ExpiresAt");
      const expiresAt = JSON.parse(expiration);
      return moment.unix(expiresAt);
  }

}


