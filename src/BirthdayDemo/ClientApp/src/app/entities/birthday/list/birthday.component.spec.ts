import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";

import { BirthdayService } from "../service/birthday.service";

import { BirthdayComponent } from "./birthday.component";

describe("Component Tests", () => {
  describe("Birthday Management Component", () => {
    let comp: BirthdayComponent;
    let fixture: ComponentFixture<BirthdayComponent>;
    let service: BirthdayService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [BirthdayComponent],
      })
        .overrideTemplate(BirthdayComponent, "")
        .compileComponents();

      fixture = TestBed.createComponent(BirthdayComponent);
      comp = fixture.componentInstance;
      service = TestBed.inject(BirthdayService);

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
      expect(comp.birthdays?.[0]).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
