import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";

import { IRuleset, Ruleset } from "../ruleset.model";
import { RulesetService } from "../service/ruleset.service";

@Component({
  selector: "jhi-ruleset-update",
  templateUrl: "./ruleset-update.component.html",
})
export class RulesetUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    name: [],
    jsonString: [],
  });

  constructor(
    protected rulesetService: RulesetService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ruleset }) => {
      this.updateForm(ruleset);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const ruleset = this.createFromForm();
    /*
    if (ruleset.id !== undefined) {
      this.subscribeToSaveResponse(this.rulesetService.update(ruleset));
    } else {
      this.subscribeToSaveResponse(this.rulesetService.create(ruleset));
    }
    */
  }

  protected subscribeToSaveResponse(
    result: Observable<HttpResponse<IRuleset>>
  ): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(ruleset: IRuleset): void {
    this.editForm.patchValue({
      id: ruleset.id,
      name: ruleset.name,
      jsonString: ruleset.jsonString,
    });
  }

  protected createFromForm(): IRuleset {
    return {
      ...new Ruleset(),
      id: this.editForm.get(["id"])!.value,
      name: this.editForm.get(["name"])!.value,
      jsonString: this.editForm.get(["jsonString"])!.value,
    };
  }
}
