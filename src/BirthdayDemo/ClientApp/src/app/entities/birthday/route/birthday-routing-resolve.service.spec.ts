jest.mock("@angular/router");

import { TestBed } from "@angular/core/testing";
import { HttpResponse } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { of } from "rxjs";

import { IBirthday, Birthday } from "../birthday.model";
import { BirthdayService } from "../service/birthday.service";

import { BirthdayRoutingResolveService } from "./birthday-routing-resolve.service";

describe("Service Tests", () => {
  describe("Birthday routing resolve service", () => {
    let mockRouter: Router;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let routingResolveService: BirthdayRoutingResolveService;
    let service: BirthdayService;
    let resultBirthday: IBirthday | undefined;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Router, ActivatedRouteSnapshot],
      });
      mockRouter = TestBed.inject(Router);
      mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
      routingResolveService = TestBed.inject(BirthdayRoutingResolveService);
      service = TestBed.inject(BirthdayService);
      resultBirthday = undefined;
    });

    describe("resolve", () => {
      it("should return IBirthday returned by find", () => {
        // GIVEN
        service.find = jest.fn((id) => of(new HttpResponse({ body: { id } })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService
          .resolve(mockActivatedRouteSnapshot)
          .subscribe((result) => {
            resultBirthday = result;
          });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultBirthday).toEqual({ id: 123 });
      });

      it("should return new IBirthday if id is not provided", () => {
        // GIVEN
        service.find = jest.fn();
        mockActivatedRouteSnapshot.params = {};

        // WHEN
        routingResolveService
          .resolve(mockActivatedRouteSnapshot)
          .subscribe((result) => {
            resultBirthday = result;
          });

        // THEN
        expect(service.find).not.toBeCalled();
        expect(resultBirthday).toEqual(new Birthday());
      });

      it("should route to 404 page if data not found in server", () => {
        // GIVEN
        jest
          .spyOn(service, "find")
          .mockReturnValue(
            of(new HttpResponse({ body: null as unknown as Birthday }))
          );
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService
          .resolve(mockActivatedRouteSnapshot)
          .subscribe((result) => {
            resultBirthday = result;
          });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultBirthday).toEqual(undefined);
        expect(mockRouter.navigate).toHaveBeenCalledWith(["404"]);
      });
    });
  });
});
