import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as dayjs from "dayjs";

import { isPresent } from "app/core/util/operators";
import { ApplicationConfigService } from "app/core/config/application-config.service";
import { createRequestOption } from "app/core/request/request-util";
import { IBirthday, getBirthdayIdentifier } from "../birthday.model";

export type EntityResponseType = HttpResponse<IBirthday>;
export type EntityArrayResponseType = HttpResponse<IBirthday[]>;

@Injectable({ providedIn: "root" })
export class BirthdayService {
  protected resourceUrl =
    this.applicationConfigService.getEndpointFor("api/birthdays");

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService
  ) {}

  create(birthday: IBirthday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(birthday);
    return this.http
      .post<IBirthday>(this.resourceUrl, copy, { observe: "response" })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(birthday: IBirthday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(birthday);

    return this.http
      .put<IBirthday>(
        `${this.resourceUrl}/${birthday.elasticId!}`,
        copy,
        { observe: "response" }
      )
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(birthday: IBirthday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(birthday);
    return this.http
      .patch<IBirthday>(
        `${this.resourceUrl}/${getBirthdayIdentifier(birthday) as number}`,
        copy,
        { observe: "response" }
      )
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IBirthday>(`${this.resourceUrl}/${id}`, { observe: "response" })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IBirthday[]>(this.resourceUrl, {
        params: options,
        observe: "response",
      })
      .pipe(
        map((res: EntityArrayResponseType) =>
          this.convertDateArrayFromServer(res)
        )
      );
  }

  postQuery(req?: any): Observable<HttpResponse<{}>> {
    return this.http
      .post<IBirthday[]>(this.resourceUrl + '/birthdayQuery', req, { observe: 'response'})
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }  

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, {
      observe: "response",
    });
  }

  addBirthdayToCollectionIfMissing(
    birthdayCollection: IBirthday[],
    ...birthdaysToCheck: (IBirthday | null | undefined)[]
  ): IBirthday[] {
    const birthdays: IBirthday[] = birthdaysToCheck.filter(isPresent);
    if (birthdays.length > 0) {
      const birthdayCollectionIdentifiers = birthdayCollection.map(
        (birthdayItem) => getBirthdayIdentifier(birthdayItem)!
      );
      const birthdaysToAdd = birthdays.filter((birthdayItem) => {
        const birthdayIdentifier = getBirthdayIdentifier(birthdayItem);
        if (
          birthdayIdentifier == null ||
          birthdayCollectionIdentifiers.includes(birthdayIdentifier)
        ) {
          return false;
        }
        birthdayCollectionIdentifiers.push(birthdayIdentifier);
        return true;
      });
      return [...birthdaysToAdd, ...birthdayCollection];
    }
    return birthdayCollection;
  }

  protected convertDateFromClient(birthday: IBirthday): IBirthday {
    return Object.assign({}, birthday, {
      dob: birthday.dob?.isValid() ? birthday.dob.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dob = res.body.dob ? dayjs(res.body.dob) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(
    res: EntityArrayResponseType
  ): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((birthday: IBirthday) => {
        birthday.dob = birthday.dob ? dayjs(birthday.dob) : undefined;
      });
    }
    return res;
  }
}
