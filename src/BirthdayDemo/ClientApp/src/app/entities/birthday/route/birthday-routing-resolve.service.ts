import { Injectable } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { Observable, of, EMPTY } from "rxjs";
import { mergeMap } from "rxjs/operators";

import { IBirthday, Birthday } from "../birthday.model";
import { BirthdayService } from "../service/birthday.service";

@Injectable({ providedIn: "root" })
export class BirthdayRoutingResolveService implements Resolve<IBirthday> {
  constructor(protected service: BirthdayService, protected router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IBirthday> | Observable<never> {
    const id = route.params["id"];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((birthday: HttpResponse<Birthday>) => {
          if (birthday.body) {
            return of(birthday.body);
          } else {
            this.router.navigate(["404"]);
            return EMPTY;
          }
        })
      );
    }
    return of(new Birthday());
  }
}
