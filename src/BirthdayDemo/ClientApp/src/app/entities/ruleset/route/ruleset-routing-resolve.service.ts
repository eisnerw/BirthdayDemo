import { Injectable } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { Observable, of, EMPTY } from "rxjs";
import { mergeMap } from "rxjs/operators";

import { IRuleset, Ruleset } from "../ruleset.model";
import { RulesetService } from "../service/ruleset.service";

@Injectable({ providedIn: "root" })
export class RulesetRoutingResolveService implements Resolve<IRuleset> {
  constructor(protected service: RulesetService, protected router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IRuleset> | Observable<never> {
    const id = route.params["id"];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((ruleset: HttpResponse<Ruleset>) => {
          if (ruleset.body) {
            return of(ruleset.body);
          } else {
            this.router.navigate(["404"]);
            return EMPTY;
          }
        })
      );
    }
    return of(new Ruleset());
  }
}
