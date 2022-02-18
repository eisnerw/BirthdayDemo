import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { UserRouteAccessService } from "app/core/auth/user-route-access.service";
import { RulesetComponent } from "../list/ruleset.component";
import { RulesetDetailComponent } from "../detail/ruleset-detail.component";
import { RulesetUpdateComponent } from "../update/ruleset-update.component";
import { RulesetRoutingResolveService } from "./ruleset-routing-resolve.service";

const rulesetRoute: Routes = [
  {
    path: "",
    component: RulesetComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ":id/view",
    component: RulesetDetailComponent,
    resolve: {
      ruleset: RulesetRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: "new",
    component: RulesetUpdateComponent,
    resolve: {
      ruleset: RulesetRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ":id/edit",
    component: RulesetUpdateComponent,
    resolve: {
      ruleset: RulesetRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(rulesetRoute)],
  exports: [RouterModule],
})
export class RulesetRoutingModule {}
