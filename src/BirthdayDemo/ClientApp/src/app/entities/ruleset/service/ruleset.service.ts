import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { ApplicationConfigService } from "app/core/config/application-config.service";
import { createRequestOption } from 'app/core/request/request-util';
import { IStoredRuleset } from 'app/shared/model/ruleset.model';

type EntityResponseType = HttpResponse<IStoredRuleset>;
type EntityArrayResponseType = HttpResponse<IStoredRuleset[]>;

@Injectable({ providedIn: 'root' })
export class RulesetService {
  protected resourceUrl =
    this.applicationConfigService.getEndpointFor("api/rulesets");

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService
  ) {}

  create(ruleset: IStoredRuleset): Observable<EntityResponseType> {
    return this.http.post<IStoredRuleset>(this.resourceUrl, ruleset, { observe: 'response' });
  }

  update(ruleset: IStoredRuleset): Observable<EntityResponseType> {
    return this.http.put<IStoredRuleset>(this.resourceUrl, ruleset, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IStoredRuleset>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IStoredRuleset[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}
