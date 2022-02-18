import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { UserRouteAccessService } from "app/core/auth/user-route-access.service";
import { BirthdayComponent } from "../list/birthday.component";
import { BirthdayDetailComponent } from "../detail/birthday-detail.component";
import { BirthdayUpdateComponent } from "../update/birthday-update.component";
import { BirthdayRoutingResolveService } from "./birthday-routing-resolve.service";

const birthdayRoute: Routes = [
  {
    path: "",
    component: BirthdayComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ":id/view",
    component: BirthdayDetailComponent,
    resolve: {
      birthday: BirthdayRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: "new",
    component: BirthdayUpdateComponent,
    resolve: {
      birthday: BirthdayRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ":id/edit",
    component: BirthdayUpdateComponent,
    resolve: {
      birthday: BirthdayRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(birthdayRoute)],
  exports: [RouterModule],
})
export class BirthdayRoutingModule {}
