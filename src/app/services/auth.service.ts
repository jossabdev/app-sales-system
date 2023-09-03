import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';
import { UserLogin } from '../interfaces/login';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
import jwt_decode from 'jwt-decode';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  endpoint: string = `${environment.endpointApi}${paths.login}`;

  constructor(private _httpClient: HttpClient) { }

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
              map((response) => {

                if(response.ok){
                  let authToken = response.headers.get('Authorization');
                  this.setSession(authToken);
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
  }

  public isLoggedIn() {
      return moment().isBefore(this.getExpiration());
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


