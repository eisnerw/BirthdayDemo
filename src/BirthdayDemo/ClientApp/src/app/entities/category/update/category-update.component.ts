import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";

import { ICategory, Category } from "../category.model";
import { CategoryService } from "../service/category.service";

@Component({
  selector: "jhi-category-update",
  templateUrl: "./category-update.component.html",
})
export class CategoryUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    categoryName: [],
    selected: [],
    notCategorized: [],
    focusType: [],
    focusId: [],
    jsonString: [],
    description: [],
  });

  constructor(
    protected categoryService: CategoryService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ category }) => {
      this.updateForm(category);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const category = this.createFromForm();
    if (category.id !== undefined) {
      this.subscribeToSaveResponse(this.categoryService.update(category));
    } else {
      this.subscribeToSaveResponse(this.categoryService.create(category));
    }
  }

  protected subscribeToSaveResponse(
    result: Observable<HttpResponse<ICategory>>
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

  protected updateForm(category: ICategory): void {
    this.editForm.patchValue({
      id: category.id as any,
      categoryName: category.categoryName as any,
      selected: category.selected as any,
      notCategorized: category.notCategorized as any,
      focusType: category.focusType as any,
      focusId: category.focusId as any,
      jsonString: category.jsonString as any,
      description: category.description as any,
    });
  }

  protected createFromForm(): ICategory {
    return {
      ...new Category(),
      id: this.editForm.get(["id"])!.value,
      categoryName: this.editForm.get(["categoryName"])!.value,
      selected: this.editForm.get(["selected"])!.value,
      notCategorized: this.editForm.get(["notCategorized"])!.value,
      focusType: this.editForm.get(["focusType"])!.value,
      focusId: this.editForm.get(["focusId"])!.value,
      jsonString: this.editForm.get(["jsonString"])!.value,
      description: this.editForm.get(["description"])!.value,
    };
  }
}
