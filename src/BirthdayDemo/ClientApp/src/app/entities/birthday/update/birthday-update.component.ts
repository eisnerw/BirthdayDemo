import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { finalize, map } from "rxjs/operators";

import * as dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "app/config/input.constants";

import { IBirthday, Birthday } from "../birthday.model";
import { BirthdayService } from "../service/birthday.service";
import { ICategory } from "app/entities/category/category.model";
import { CategoryService } from "app/entities/category/service/category.service";

@Component({
  selector: "jhi-birthday-update",
  templateUrl: "./birthday-update.component.html",
})
export class BirthdayUpdateComponent implements OnInit {
  isSaving = false;

  categoriesSharedCollection: ICategory[] = [];

  editForm = this.fb.group({
    id: [],
    lname: [],
    fname: [],
    sign: [],
    dob: [],
    isAlive: [],
    categories: [],
  });

  constructor(
    protected birthdayService: BirthdayService,
    protected categoryService: CategoryService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ birthday }) => {
      if (birthday.id === undefined) {
        const today = dayjs().startOf("day");
        birthday.dob = today;
      }

      this.updateForm(birthday);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const birthday = this.createFromForm();
    if (birthday.id !== undefined) {
      this.subscribeToSaveResponse(this.birthdayService.update(birthday));
    } else {
      this.subscribeToSaveResponse(this.birthdayService.create(birthday));
    }
  }

  trackCategoryById(index: number, item: ICategory): number {
    return item.id!;
  }

  getSelectedCategory(
    option: ICategory,
    selectedVals?: ICategory[]
  ): ICategory {
    if (selectedVals) {
      for (const selectedVal of selectedVals) {
        if (option.id === selectedVal.id) {
          return selectedVal;
        }
      }
    }
    return option;
  }

  protected subscribeToSaveResponse(
    result: Observable<HttpResponse<IBirthday>>
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

  protected updateForm(birthday: IBirthday): void {
    this.editForm.patchValue({
      id: birthday.id,
      lname: birthday.lname,
      fname: birthday.fname,
      sign: birthday.sign,
      dob: birthday.dob ? birthday.dob.format(DATE_TIME_FORMAT) : null,
      isAlive: birthday.isAlive,
      categories: birthday.categories,
    });

    this.categoriesSharedCollection =
      this.categoryService.addCategoryToCollectionIfMissing(
        this.categoriesSharedCollection,
        ...(birthday.categories ?? [])
      );
  }

  protected loadRelationshipsOptions(): void {
    this.categoryService
      .query()
      .pipe(map((res: HttpResponse<ICategory[]>) => res.body ?? []))
      .pipe(
        map((categories: ICategory[]) =>
          this.categoryService.addCategoryToCollectionIfMissing(
            categories,
            ...(this.editForm.get("categories")!.value ?? [])
          )
        )
      )
      .subscribe(
        (categories: ICategory[]) =>
          (this.categoriesSharedCollection = categories)
      );
  }

  protected createFromForm(): IBirthday {
    return {
      ...new Birthday(),
      id: this.editForm.get(["id"])!.value,
      lname: this.editForm.get(["lname"])!.value,
      fname: this.editForm.get(["fname"])!.value,
      sign: this.editForm.get(["sign"])!.value,
      dob: this.editForm.get(["dob"])!.value
        ? dayjs(this.editForm.get(["dob"])!.value, DATE_TIME_FORMAT)
        : undefined,
      isAlive: this.editForm.get(["isAlive"])!.value,
      categories: this.editForm.get(["categories"])!.value,
    };
  }
}
