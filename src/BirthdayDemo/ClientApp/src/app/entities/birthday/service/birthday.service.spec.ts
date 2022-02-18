import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import * as dayjs from "dayjs";

import { DATE_TIME_FORMAT } from "app/config/input.constants";
import { IBirthday, Birthday } from "../birthday.model";

import { BirthdayService } from "./birthday.service";

describe("Service Tests", () => {
  describe("Birthday Service", () => {
    let service: BirthdayService;
    let httpMock: HttpTestingController;
    let elemDefault: IBirthday;
    let expectedResult: IBirthday | IBirthday[] | boolean | null;
    let currentDate: dayjs.Dayjs;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
      expectedResult = null;
      service = TestBed.inject(BirthdayService);
      httpMock = TestBed.inject(HttpTestingController);
      currentDate = dayjs();

      elemDefault = {
        id: 0,
        lname: "AAAAAAA",
        fname: "AAAAAAA",
        sign: "AAAAAAA",
        dob: currentDate,
        isAlive: false,
      };
    });

    describe("Service methods", () => {
      it("should find an element", () => {
        const returnedFromService = Object.assign(
          {
            dob: currentDate.format(DATE_TIME_FORMAT),
          },
          elemDefault
        );

        service.find(123).subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "GET" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it("should create a Birthday", () => {
        const returnedFromService = Object.assign(
          {
            id: 0,
            dob: currentDate.format(DATE_TIME_FORMAT),
          },
          elemDefault
        );

        const expected = Object.assign(
          {
            dob: currentDate,
          },
          returnedFromService
        );

        service
          .create(new Birthday())
          .subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "POST" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it("should update a Birthday", () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            lname: "BBBBBB",
            fname: "BBBBBB",
            sign: "BBBBBB",
            dob: currentDate.format(DATE_TIME_FORMAT),
            isAlive: true,
          },
          elemDefault
        );

        const expected = Object.assign(
          {
            dob: currentDate,
          },
          returnedFromService
        );

        service
          .update(expected)
          .subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "PUT" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it("should partial update a Birthday", () => {
        const patchObject = Object.assign(
          {
            fname: "BBBBBB",
            isAlive: true,
          },
          new Birthday()
        );

        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = Object.assign(
          {
            dob: currentDate,
          },
          returnedFromService
        );

        service
          .partialUpdate(patchObject)
          .subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "PATCH" });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it("should return a list of Birthday", () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            lname: "BBBBBB",
            fname: "BBBBBB",
            sign: "BBBBBB",
            dob: currentDate.format(DATE_TIME_FORMAT),
            isAlive: true,
          },
          elemDefault
        );

        const expected = Object.assign(
          {
            dob: currentDate,
          },
          returnedFromService
        );

        service.query().subscribe((resp) => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: "GET" });
        req.flush([returnedFromService]);
        httpMock.verify();
        expect(expectedResult).toContainEqual(expected);
      });

      it("should delete a Birthday", () => {
        service.delete(123).subscribe((resp) => (expectedResult = resp.ok));

        const req = httpMock.expectOne({ method: "DELETE" });
        req.flush({ status: 200 });
        expect(expectedResult);
      });

      describe("addBirthdayToCollectionIfMissing", () => {
        it("should add a Birthday to an empty array", () => {
          const birthday: IBirthday = { id: 123 };
          expectedResult = service.addBirthdayToCollectionIfMissing(
            [],
            birthday
          );
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(birthday);
        });

        it("should not add a Birthday to an array that contains it", () => {
          const birthday: IBirthday = { id: 123 };
          const birthdayCollection: IBirthday[] = [
            {
              ...birthday,
            },
            { id: 456 },
          ];
          expectedResult = service.addBirthdayToCollectionIfMissing(
            birthdayCollection,
            birthday
          );
          expect(expectedResult).toHaveLength(2);
        });

        it("should add a Birthday to an array that doesn't contain it", () => {
          const birthday: IBirthday = { id: 123 };
          const birthdayCollection: IBirthday[] = [{ id: 456 }];
          expectedResult = service.addBirthdayToCollectionIfMissing(
            birthdayCollection,
            birthday
          );
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(birthday);
        });

        it("should add only unique Birthday to an array", () => {
          const birthdayArray: IBirthday[] = [
            { id: 123 },
            { id: 456 },
            { id: 18166 },
          ];
          const birthdayCollection: IBirthday[] = [{ id: 123 }];
          expectedResult = service.addBirthdayToCollectionIfMissing(
            birthdayCollection,
            ...birthdayArray
          );
          expect(expectedResult).toHaveLength(3);
        });

        it("should accept varargs", () => {
          const birthday: IBirthday = { id: 123 };
          const birthday2: IBirthday = { id: 456 };
          expectedResult = service.addBirthdayToCollectionIfMissing(
            [],
            birthday,
            birthday2
          );
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(birthday);
          expect(expectedResult).toContain(birthday2);
        });

        it("should accept null and undefined values", () => {
          const birthday: IBirthday = { id: 123 };
          expectedResult = service.addBirthdayToCollectionIfMissing(
            [],
            null,
            birthday,
            undefined
          );
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(birthday);
        });

        it("should return initial array if no Birthday is added", () => {
          const birthdayCollection: IBirthday[] = [{ id: 123 }];
          expectedResult = service.addBirthdayToCollectionIfMissing(
            birthdayCollection,
            undefined,
            null
          );
          expect(expectedResult).toEqual(birthdayCollection);
        });
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
