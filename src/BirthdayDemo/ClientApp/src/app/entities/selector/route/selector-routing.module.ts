import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { UserRouteAccessService } from "app/core/auth/user-route-access.service";
import { SelectorComponent } from "../list/selector.component";
import { SelectorDetailComponent } from "../detail/selector-detail.component";
import { SelectorUpdateComponent } from "../update/selector-update.component";
import { SelectorRoutingResolveService } from "./selector-routing-resolve.service";

const selectorRoute: Routes = [
  {
    path: "",
    component: SelectorComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ":id/view",
    component: SelectorDetailComponent,
    resolve: {
      selector: SelectorRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: "new",
    component: SelectorUpdateComponent,
    resolve: {
      selector: SelectorRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ":id/edit",
    component: SelectorUpdateComponent,
    resolve: {
      selector: SelectorRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(selectorRoute)],
  exports: [RouterModule],
})
export class SelectorRoutingModule {}
