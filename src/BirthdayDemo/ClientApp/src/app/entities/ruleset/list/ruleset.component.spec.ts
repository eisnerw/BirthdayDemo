import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";

import { RulesetService } from "../service/ruleset.service";

import { RulesetComponent } from "./ruleset.component";

describe("Component Tests", () => {
  describe("Ruleset Management Component", () => {
    let comp: RulesetComponent;
    let fixture: ComponentFixture<RulesetComponent>;
    let service: RulesetService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [RulesetComponent],
      })
        .overrideTemplate(RulesetComponent, "")
        .compileComponents();

      fixture = TestBed.createComponent(RulesetComponent);
      comp = fixture.componentInstance;
      service = TestBed.inject(RulesetService);

      const headers = new HttpHeaders().append("link", "link;link");
      jest.spyOn(service, "query").mockReturnValue(
        of(
          new HttpResponse({
            body: [{ id: 123 }],
            headers,
          })
        )
      );
    });

    it("Should call load all on init", () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.rulesets?.[0]).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
