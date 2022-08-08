import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";

import { isPresent } from "app/core/util/operators";
import { ApplicationConfigService } from "app/core/config/application-config.service";
import { createRequestOption } from "app/core/request/request-util";
import { IRuleset, getRulesetIdentifier } from "../ruleset.model";

export type EntityResponseType = HttpResponse<IRuleset>;
export type EntityArrayResponseType = HttpResponse<IRuleset[]>;

@Injectable({ providedIn: "root" })
export class RulesetService {
  protected resourceUrl =
    this.applicationConfigService.getEndpointFor("api/rulesets");

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService
  ) {}

  create(ruleset: IRuleset): Observable<EntityResponseType> {
    return this.http.post<IRuleset>(this.resourceUrl, ruleset, {
      observe: "response",
    });
  }

  update(ruleset: IRuleset): Observable<EntityResponseType> {
    return this.http.put<IRuleset>(
      `${this.resourceUrl}/${getRulesetIdentifier(ruleset) as number}`,
      ruleset,
      { observe: "response" }
    );
  }

  partialUpdate(ruleset: IRuleset): Observable<EntityResponseType> {
    return this.http.patch<IRuleset>(
      `${this.resourceUrl}/${getRulesetIdentifier(ruleset) as number}`,
      ruleset,
      { observe: "response" }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IRuleset>(`${this.resourceUrl}/${id}`, {
      observe: "response",
    });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IRuleset[]>(this.resourceUrl, {
      params: options,
      observe: "response",
    });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, {
      observe: "response",
    });
  }

  addRulesetToCollectionIfMissing(
    rulesetCollection: IRuleset[],
    ...rulesetsToCheck: (IRuleset | null | undefined)[]
  ): IRuleset[] {
    const rulesets: IRuleset[] = rulesetsToCheck.filter(isPresent);
    if (rulesets.length > 0) {
      const rulesetCollectionIdentifiers = rulesetCollection.map(
        (rulesetItem) => getRulesetIdentifier(rulesetItem)!
      );
      const rulesetsToAdd = rulesets.filter((rulesetItem) => {
        const rulesetIdentifier = getRulesetIdentifier(rulesetItem);
        if (
          rulesetIdentifier == null ||
          rulesetCollectionIdentifiers.includes(rulesetIdentifier)
        ) {
          return false;
        }
        rulesetCollectionIdentifiers.push(rulesetIdentifier);
        return true;
      });
      return [...rulesetsToAdd, ...rulesetCollection];
    }
    return rulesetCollection;
  }
}
