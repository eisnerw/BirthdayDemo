import { Injectable } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { Observable, of, EMPTY } from "rxjs";
import { mergeMap } from "rxjs/operators";

import { ISelector, Selector } from "../selector.model";
import { SelectorService } from "../service/selector.service";

@Injectable({ providedIn: "root" })
export class SelectorRoutingResolveService implements Resolve<ISelector> {
  constructor(protected service: SelectorService, protected router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<ISelector> | Observable<never> {
    const id = route.params["id"];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((selector: HttpResponse<Selector>) => {
          if (selector.body) {
            return of(selector.body);
          } else {
            this.router.navigate(["404"]);
            return EMPTY;
          }
        })
      );
    }
    return of(new Selector());
  }
}
