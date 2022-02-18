import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { IRuleset } from "../ruleset.model";
import { RulesetService } from "../service/ruleset.service";
import { RulesetDeleteDialogComponent } from "../delete/ruleset-delete-dialog.component";

@Component({
  selector: "jhi-ruleset",
  templateUrl: "./ruleset.component.html",
})
export class RulesetComponent implements OnInit {
  rulesets?: IRuleset[];
  isLoading = false;

  constructor(
    protected rulesetService: RulesetService,
    protected modalService: NgbModal
  ) {}

  loadAll(): void {
    this.isLoading = true;

    this.rulesetService.query().subscribe(
      (res: HttpResponse<IRuleset[]>) => {
        this.isLoading = false;
        this.rulesets = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IRuleset): number {
    return item.id!;
  }

  delete(ruleset: IRuleset): void {
    const modalRef = this.modalService.open(RulesetDeleteDialogComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.ruleset = ruleset;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe((reason) => {
      if (reason === "deleted") {
        this.loadAll();
      }
    });
  }
}
