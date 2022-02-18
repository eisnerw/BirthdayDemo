jest.mock("@angular/router");

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpResponse } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { of, Subject } from "rxjs";

import { RulesetService } from "../service/ruleset.service";
import { IRuleset, Ruleset } from "../ruleset.model";

import { RulesetUpdateComponent } from "./ruleset-update.component";

describe("Component Tests", () => {
  describe("Ruleset Management Update Component", () => {
    let comp: RulesetUpdateComponent;
    let fixture: ComponentFixture<RulesetUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let rulesetService: RulesetService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [RulesetUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(RulesetUpdateComponent, "")
        .compileComponents();

      fixture = TestBed.createComponent(RulesetUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      rulesetService = TestBed.inject(RulesetService);

      comp = fixture.componentInstance;
    });

    describe("ngOnInit", () => {
      it("Should update editForm", () => {
        const ruleset: IRuleset = { id: 456 };

        activatedRoute.data = of({ ruleset });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(ruleset));
      });
    });

    describe("save", () => {
      it("Should call update service on save for existing entity", () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Ruleset>>();
        const ruleset = { id: 123 };
        jest.spyOn(rulesetService, "update").mockReturnValue(saveSubject);
        jest.spyOn(comp, "previousState");
        activatedRoute.data = of({ ruleset });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: ruleset }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(rulesetService.update).toHaveBeenCalledWith(ruleset);
        expect(comp.isSaving).toEqual(false);
      });

      it("Should call create service on save for new entity", () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Ruleset>>();
        const ruleset = new Ruleset();
        jest.spyOn(rulesetService, "create").mockReturnValue(saveSubject);
        jest.spyOn(comp, "previousState");
        activatedRoute.data = of({ ruleset });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: ruleset }));
        saveSubject.complete();

        // THEN
        expect(rulesetService.create).toHaveBeenCalledWith(ruleset);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it("Should set isSaving to false on error", () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Ruleset>>();
        const ruleset = { id: 123 };
        jest.spyOn(rulesetService, "update").mockReturnValue(saveSubject);
        jest.spyOn(comp, "previousState");
        activatedRoute.data = of({ ruleset });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error("This is an error!");

        // THEN
        expect(rulesetService.update).toHaveBeenCalledWith(ruleset);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });
  });
});
