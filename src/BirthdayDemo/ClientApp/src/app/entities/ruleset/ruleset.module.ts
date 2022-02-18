import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { RulesetComponent } from "./list/ruleset.component";
import { RulesetDetailComponent } from "./detail/ruleset-detail.component";
import { RulesetUpdateComponent } from "./update/ruleset-update.component";
import { RulesetDeleteDialogComponent } from "./delete/ruleset-delete-dialog.component";
import { RulesetRoutingModule } from "./route/ruleset-routing.module";

@NgModule({
  imports: [SharedModule, RulesetRoutingModule],
  declarations: [
    RulesetComponent,
    RulesetDetailComponent,
    RulesetUpdateComponent,
    RulesetDeleteDialogComponent,
  ],
  entryComponents: [RulesetDeleteDialogComponent],
})
export class RulesetModule {}
