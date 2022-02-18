import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { IRuleset } from "../ruleset.model";
import { RulesetService } from "../service/ruleset.service";

@Component({
  templateUrl: "./ruleset-delete-dialog.component.html",
})
export class RulesetDeleteDialogComponent {
  ruleset?: IRuleset;

  constructor(
    protected rulesetService: RulesetService,
    protected activeModal: NgbActiveModal
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.rulesetService.delete(id).subscribe(() => {
      this.activeModal.close("deleted");
    });
  }
}
