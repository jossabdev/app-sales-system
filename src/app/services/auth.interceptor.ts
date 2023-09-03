import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('entro en intercept')
        const idToken = localStorage.getItem("Authorization");
        const user: any = localStorage.getItem("User");
        console.log(idToken);
        if (idToken) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization",
                    "Bearer " + idToken).set("user", user)
            });
            console.log(cloned.body);

            return next.handle(cloned);
        }
        else {
            console.log(req.body)
            return next.handle(req);
        }
    }
}