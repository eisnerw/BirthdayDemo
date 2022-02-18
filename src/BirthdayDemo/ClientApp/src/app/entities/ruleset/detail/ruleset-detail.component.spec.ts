import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

import { RulesetDetailComponent } from "./ruleset-detail.component";

describe("Component Tests", () => {
  describe("Ruleset Management Detail Component", () => {
    let comp: RulesetDetailComponent;
    let fixture: ComponentFixture<RulesetDetailComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [RulesetDetailComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: { data: of({ ruleset: { id: 123 } }) },
          },
        ],
      })
        .overrideTemplate(RulesetDetailComponent, "")
        .compileComponents();
      fixture = TestBed.createComponent(RulesetDetailComponent);
      comp = fixture.componentInstance;
    });

    describe("OnInit", () => {
      it("Should load ruleset on init", () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.ruleset).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
  });
});
