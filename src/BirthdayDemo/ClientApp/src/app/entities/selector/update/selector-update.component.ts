import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { finalize, map } from "rxjs/operators";

import { ISelector, Selector } from "../selector.model";
import { SelectorService } from "../service/selector.service";
import { RulesetService } from '../../ruleset/service/ruleset.service';
import { IStoredRuleset } from 'app/shared/model/ruleset.model';

@Component({
  selector: "jhi-selector-update",
  templateUrl: "./selector-update.component.html",
})
export class SelectorUpdateComponent implements OnInit {
  isSaving = false;
  rulesets: IStoredRuleset[] = [];

  editForm = this.fb.group({
    id: [],
    name: [],
    rulesetName: [],
    action: [],
    actionParameter: [],
    description: [],
  });

  constructor(
    protected selectorService: SelectorService,
    protected activatedRoute: ActivatedRoute,
    protected rulesetService: RulesetService,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ selector }) => {
      this.updateForm(selector);
      this.rulesetService
      .query({ filter: 'selector-is-null' })
      .pipe(
        map((res: HttpResponse<IStoredRuleset[]>) => res.body ?? [])
      )
      .subscribe((resBody: IStoredRuleset[]) => {
        this.rulesets = resBody;
      });

    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const selector = this.createFromForm();
    if (selector.id !== undefined) {
      this.subscribeToSaveResponse(this.selectorService.update(selector));
    } else {
      this.subscribeToSaveResponse(this.selectorService.create(selector));
    }
  }

  updateForm(selector: ISelector): void {
    this.editForm.patchValue({
      id: selector.id as any,
      name: selector.name as any,
      rulesetName: selector.rulesetName as any,
      action: selector.action as any,
      actionParameter: selector.actionParameter as any,
      description: selector.description as any,
    });
  }

  protected subscribeToSaveResponse(
    result: Observable<HttpResponse<ISelector>>
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
  protected createFromForm(): ISelector {
    return {
      ...new Selector(),
      id: this.editForm.get(["id"])!.value,
      name: this.editForm.get(["name"])!.value,
      rulesetName: this.editForm.get(['rulesetName'])!.value,
      action: this.editForm.get(['action'])!.value,
      actionParameter: this.editForm.get(['actionParameter'])!.value,
      description: this.editForm.get(['description'])!.value,
    };
  }
}
