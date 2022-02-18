jest.mock("@angular/router");

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpResponse } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { of, Subject } from "rxjs";

import { BirthdayService } from "../service/birthday.service";
import { IBirthday, Birthday } from "../birthday.model";
import { ICategory } from "app/entities/category/category.model";
import { CategoryService } from "app/entities/category/service/category.service";

import { BirthdayUpdateComponent } from "./birthday-update.component";

describe("Component Tests", () => {
  describe("Birthday Management Update Component", () => {
    let comp: BirthdayUpdateComponent;
    let fixture: ComponentFixture<BirthdayUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let birthdayService: BirthdayService;
    let categoryService: CategoryService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [BirthdayUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(BirthdayUpdateComponent, "")
        .compileComponents();

      fixture = TestBed.createComponent(BirthdayUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      birthdayService = TestBed.inject(BirthdayService);
      categoryService = TestBed.inject(CategoryService);

      comp = fixture.componentInstance;
    });

    describe("ngOnInit", () => {
      it("Should call Category query and add missing value", () => {
        const birthday: IBirthday = { id: 456 };
        const categories: ICategory[] = [{ id: 71802 }];
        birthday.categories = categories;

        const categoryCollection: ICategory[] = [{ id: 68779 }];
        jest
          .spyOn(categoryService, "query")
          .mockReturnValue(of(new HttpResponse({ body: categoryCollection })));
        const additionalCategories = [...categories];
        const expectedCollection: ICategory[] = [
          ...additionalCategories,
          ...categoryCollection,
        ];
        jest
          .spyOn(categoryService, "addCategoryToCollectionIfMissing")
          .mockReturnValue(expectedCollection);

        activatedRoute.data = of({ birthday });
        comp.ngOnInit();

        expect(categoryService.query).toHaveBeenCalled();
        expect(
          categoryService.addCategoryToCollectionIfMissing
        ).toHaveBeenCalledWith(categoryCollection, ...additionalCategories);
        expect(comp.categoriesSharedCollection).toEqual(expectedCollection);
      });

      it("Should update editForm", () => {
        const birthday: IBirthday = { id: 456 };
        const categories: ICategory = { id: 63023 };
        birthday.categories = [categories];

        activatedRoute.data = of({ birthday });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(birthday));
        expect(comp.categoriesSharedCollection).toContain(categories);
      });
    });

    describe("save", () => {
      it("Should call update service on save for existing entity", () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Birthday>>();
        const birthday = { id: 123 };
        jest.spyOn(birthdayService, "update").mockReturnValue(saveSubject);
        jest.spyOn(comp, "previousState");
        activatedRoute.data = of({ birthday });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: birthday }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(birthdayService.update).toHaveBeenCalledWith(birthday);
        expect(comp.isSaving).toEqual(false);
      });

      it("Should call create service on save for new entity", () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Birthday>>();
        const birthday = new Birthday();
        jest.spyOn(birthdayService, "create").mockReturnValue(saveSubject);
        jest.spyOn(comp, "previousState");
        activatedRoute.data = of({ birthday });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: birthday }));
        saveSubject.complete();

        // THEN
        expect(birthdayService.create).toHaveBeenCalledWith(birthday);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it("Should set isSaving to false on error", () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Birthday>>();
        const birthday = { id: 123 };
        jest.spyOn(birthdayService, "update").mockReturnValue(saveSubject);
        jest.spyOn(comp, "previousState");
        activatedRoute.data = of({ birthday });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error("This is an error!");

        // THEN
        expect(birthdayService.update).toHaveBeenCalledWith(birthday);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe("Tracking relationships identifiers", () => {
      describe("trackCategoryById", () => {
        it("Should return tracked Category primary key", () => {
          const entity = { id: 123 };
          const trackResult = comp.trackCategoryById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });
    });

    describe("Getting selected relationships", () => {
      describe("getSelectedCategory", () => {
        it("Should return option if no Category is selected", () => {
          const option = { id: 123 };
          const result = comp.getSelectedCategory(option);
          expect(result === option).toEqual(true);
        });

        it("Should return selected Category for according option", () => {
          const option = { id: 123 };
          const selected = { id: 123 };
          const selected2 = { id: 456 };
          const result = comp.getSelectedCategory(option, [
            selected2,
            selected,
          ]);
          expect(result === selected).toEqual(true);
          expect(result === selected2).toEqual(false);
          expect(result === option).toEqual(false);
        });

        it("Should return option if this Category is not selected", () => {
          const option = { id: 123 };
          const selected = { id: 456 };
          const result = comp.getSelectedCategory(option, [selected]);
          expect(result === option).toEqual(true);
          expect(result === selected).toEqual(false);
        });
      });
    });
  });
});
