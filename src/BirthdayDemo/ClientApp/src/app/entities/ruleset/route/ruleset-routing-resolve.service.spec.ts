jest.mock("@angular/router");

import { TestBed } from "@angular/core/testing";
import { HttpResponse } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { of } from "rxjs";

import { IRuleset, Ruleset } from "../ruleset.model";
import { RulesetService } from "../service/ruleset.service";

import { RulesetRoutingResolveService } from "./ruleset-routing-resolve.service";

describe("Service Tests", () => {
  describe("Ruleset routing resolve service", () => {
    let mockRouter: Router;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let routingResolveService: RulesetRoutingResolveService;
    let service: RulesetService;
    let resultRuleset: IRuleset | undefined;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Router, ActivatedRouteSnapshot],
      });
      mockRouter = TestBed.inject(Router);
      mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
      routingResolveService = TestBed.inject(RulesetRoutingResolveService);
      service = TestBed.inject(RulesetService);
      resultRuleset = undefined;
    });

    describe("resolve", () => {
      it("should return IRuleset returned by find", () => {
        // GIVEN
        service.find = jest.fn((id) => of(new HttpResponse({ body: { id } })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService
          .resolve(mockActivatedRouteSnapshot)
          .subscribe((result) => {
            resultRuleset = result;
          });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultRuleset).toEqual({ id: 123 });
      });

      it("should return new IRuleset if id is not provided", () => {
        // GIVEN
        service.find = jest.fn();
        mockActivatedRouteSnapshot.params = {};

        // WHEN
        routingResolveService
          .resolve(mockActivatedRouteSnapshot)
          .subscribe((result) => {
            resultRuleset = result;
          });

        // THEN
        expect(service.find).not.toBeCalled();
        expect(resultRuleset).toEqual(new Ruleset());
      });

      it("should route to 404 page if data not found in server", () => {
        // GIVEN
        jest
          .spyOn(service, "find")
          .mockReturnValue(
            of(new HttpResponse({ body: null as unknown as Ruleset }))
          );
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService
          .resolve(mockActivatedRouteSnapshot)
          .subscribe((result) => {
            resultRuleset = result;
          });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultRuleset).toEqual(undefined);
        expect(mockRouter.navigate).toHaveBeenCalledWith(["404"]);
      });
    });
  });
});
