import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

import { BirthdayDetailComponent } from "./birthday-detail.component";

describe("Component Tests", () => {
  describe("Birthday Management Detail Component", () => {
    let comp: BirthdayDetailComponent;
    let fixture: ComponentFixture<BirthdayDetailComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [BirthdayDetailComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: { data: of({ birthday: { id: 123 } }) },
          },
        ],
      })
        .overrideTemplate(BirthdayDetailComponent, "")
        .compileComponents();
      fixture = TestBed.createComponent(BirthdayDetailComponent);
      comp = fixture.componentInstance;
    });

    describe("OnInit", () => {
      it("Should load birthday on init", () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.birthday).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
  });
});
