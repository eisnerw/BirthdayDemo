import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

import { IRuleset, Ruleset } from "../ruleset.model";

import { RulesetService } from "./ruleset.service";

describe("Service Tests", () => {
  describe("Ruleset Service", () => {
    let service: RulesetService;
    let httpMock: HttpTestingController;
    let elemDefault: IRuleset;
    let expectedResult: IRuleset | IRuleset[] | boolean | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
      expectedResult = null;
      service = TestBed.inject(RulesetService);
      httpMock = TestBed.inject(HttpTestingController);

      elemDefault = {
        id: 0,
        name: "AAAAAAA",
        jsonString: "AAAAAAA",
      };
    });

    describe("Service methods", () => {
      it("should find an element", () => {
        const returnedFromService = Object.assign({}, elemDefault);

        service.find(123).subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "GET" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it("should create a Ruleset", () => {
        const returnedFromService = Object.assign(
          {
            id: 0,
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service
          .create(new Ruleset())
          .subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "POST" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it("should update a Ruleset", () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            name: "BBBBBB",
            jsonString: "BBBBBB",
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service
          .update(expected)
          .subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "PUT" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it("should partial update a Ruleset", () => {
        const patchObject = Object.assign(
          {
            name: "BBBBBB",
            jsonString: "BBBBBB",
          },
          new Ruleset()
        );

        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = Object.assign({}, returnedFromService);

        service
          .partialUpdate(patchObject)
          .subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "PATCH" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it("should return a list of Ruleset", () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            name: "BBBBBB",
            jsonString: "BBBBBB",
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.query().subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "GET" });
        req.flush([returnedFromService]);
        httpMock.verify();
        expect(expectedResult).toContainEqual(expected);
      });

      it("should delete a Ruleset", () => {
        service.delete(123).subscribe((resp) => (expectedResult = resp.ok));

        const req = httpMock.expectOne({ method: "DELETE" });
        req.flush({ status: 200 });
        expect(expectedResult);
      });

      describe("addRulesetToCollectionIfMissing", () => {
        it("should add a Ruleset to an empty array", () => {
          const ruleset: IRuleset = { id: 123 };
          expectedResult = service.addRulesetToCollectionIfMissing([], ruleset);
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(ruleset);
        });

        it("should not add a Ruleset to an array that contains it", () => {
          const ruleset: IRuleset = { id: 123 };
          const rulesetCollection: IRuleset[] = [
            {
              ...ruleset,
            },
            { id: 456 },
          ];
          expectedResult = service.addRulesetToCollectionIfMissing(
            rulesetCollection,
            ruleset
          );
          expect(expectedResult).toHaveLength(2);
        });

        it("should add a Ruleset to an array that doesn't contain it", () => {
          const ruleset: IRuleset = { id: 123 };
          const rulesetCollection: IRuleset[] = [{ id: 456 }];
          expectedResult = service.addRulesetToCollectionIfMissing(
            rulesetCollection,
            ruleset
          );
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(ruleset);
        });

        it("should add only unique Ruleset to an array", () => {
          const rulesetArray: IRuleset[] = [
            { id: 123 },
            { id: 456 },
            { id: 44607 },
          ];
          const rulesetCollection: IRuleset[] = [{ id: 123 }];
          expectedResult = service.addRulesetToCollectionIfMissing(
            rulesetCollection,
            ...rulesetArray
          );
          expect(expectedResult).toHaveLength(3);
        });

        it("should accept varargs", () => {
          const ruleset: IRuleset = { id: 123 };
          const ruleset2: IRuleset = { id: 456 };
          expectedResult = service.addRulesetToCollectionIfMissing(
            [],
            ruleset,
            ruleset2
          );
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(ruleset);
          expect(expectedResult).toContain(ruleset2);
        });

        it("should accept null and undefined values", () => {
          const ruleset: IRuleset = { id: 123 };
          expectedResult = service.addRulesetToCollectionIfMissing(
            [],
            null,
            ruleset,
            undefined
          );
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(ruleset);
        });

        it("should return initial array if no Ruleset is added", () => {
          const rulesetCollection: IRuleset[] = [{ id: 123 }];
          expectedResult = service.addRulesetToCollectionIfMissing(
            rulesetCollection,
            undefined,
            null
          );
          expect(expectedResult).toEqual(rulesetCollection);
        });
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
