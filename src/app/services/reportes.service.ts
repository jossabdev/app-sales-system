import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { paths } from '../interfaces/paths';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Venta } from '../interfaces/venta';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  endpoint: string = `${environment.endpointApi}${paths.reportes}`
  idToken = localStorage.getItem("Authorization");
  user: any = localStorage.getItem("User");
  httpHeader: HttpHeaders = new HttpHeaders().set('Authorization', 'Bearer '+ this.idToken)
                                             .set('user', this.user);

  constructor(private _httpClient: HttpClient) { }

  generarReporte(listaVentas: Venta [], tipoVenta: string): any{
    console.log(listaVentas);
    let fecha: Date = new Date();
    
    return this._httpClient.post<any>(this.endpoint + `${paths.generarReporteVenta}`, listaVentas, { headers: this.httpHeader, responseType: 'blob' as 'json', observe: 'response'},  )
            .pipe(
            map((response: any) => {
              if(response.ok){                
                let fileName = tipoVenta + '_'+ this.formatDate(fecha) + '.xlsx';               
                this.downLoadFile(response.body, "application/ms-excel", fileName);                    
              }else{                
                throw response;
              }              
            }),
            )
                    
  }


  /**
   * Method is use to download file.
   * @param data - Array Buffer data
   * @param type - type of the document.
   */
  downLoadFile(data: any, type: string, fileName: string) {
    let a = document.createElement('a');
    a.setAttribute('style',  'display: none');
    document.body.appendChild(a);
    
    let blob = new Blob([data], { type: type});
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
   
  }

  formatDate(date: Date) {
    return (
      [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        this.padTo2Digits(date.getHours()),
        this.padTo2Digits(date.getMinutes()),
        this.padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }

  padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }
}
