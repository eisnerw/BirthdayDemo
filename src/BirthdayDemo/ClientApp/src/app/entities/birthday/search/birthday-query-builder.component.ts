/* eslint-disable */ 
import { Component, OnInit, ChangeDetectorRef, Renderer2, Input } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { QueryBuilderConfig, QueryBuilderComponent, RuleSet, Option } from "angular2-query-builder";
import { Directive } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, AsyncValidator } from '@angular/forms';
import { RulesetService } from '../../ruleset/service/ruleset.service';
import { HttpResponse } from '@angular/common/http';
import { IStoredRuleset, StoredRuleset } from '../../../shared/model/ruleset.model';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators'
import { catchError, map } from 'rxjs/operators';
import { BirthdayQueryParserService, IQuery, IQueryRule } from '../search/birthday-query-parser.service';

export interface ExtendedRuleSet extends RuleSet {
  not?: boolean;
  name?: string;
  initialQueryAsString?: string;
  usedBy?: Array<string>;
  dirty?: boolean;
}

@Component({
  selector: 'jhi-birthday-query-builder',
  templateUrl: './birthday-query-builder.component.html',
  styleUrls: ['./birthday-query-builder-component.scss']
})
export class BirthdayQueryBuilderComponent extends QueryBuilderComponent implements OnInit {
  
  public static firstTimeDiv : any = null;

  public static topLevelRuleset: RuleSet;

  public queryCtrl: FormControl;
  
  public allowCollapse = true;

  public hoveringOverButton = false;

  public editingRulesetName = false;

  public query: RuleSet = {condition:"", rules:[]};

  public updatingNamedQuery = false;

  public namedQuery = "";

  public updatingNamedQueryError = "";

  public updatingNamedQueryInPopup = false;

  public namedQueryAsString = "";

  data: any | null = null;

  public myobj: any | null = null;

  public myq: any | null = null;

  public config: QueryBuilderConfig = {
    fields: {
      document: { name: 'Document', type: 'string', operators: ["contains"]},
      // lname: { name: 'Last Name', type: 'string', operators: ['=', '!=', 'contains', 'like', 'exists'] },
      lname: {
        name: 'Last Name',
        type: 'category'
      },
      fname: { name: 'First Name', type: 'string', operators: ['=', '!=', 'contains', 'like', 'exists'] },
      isAlive: { name: 'Alive?', type: 'boolean' },
      categories: { name: 'Category', type: 'string', operators: ["contains", "exists"]},
      dob: {
        name: 'Birthday', type: 'date', operators: ['=', '<=', '>', '<', '>='],
        defaultValue: (() => new Date())
      },
      sign: {
        name: 'Astrological Sign',
        type: 'category',
        options: [
          { name: 'Aries', value: 'aries' },
          { name: 'Taurus', value: 'taurus' },
          { name: 'Gemini', value: 'gemini' },
          { name: 'Cancer', value: 'cancer' },
          { name: 'Leo', value: 'leo' },
          { name: 'Virgo', value: 'virgo' },
          { name: 'Libra', value: 'libra' },
          { name: 'Scorpio', value: 'scorpio' },
          { name: 'Sagittarius', value: 'sagittarius' },
          { name: 'Capricorn', value: 'capricorn' },
          { name: 'Aquarius', value: 'aquarius' },
          { name: 'Pisces    ', value: 'pisces' }      
        ]
      }
    }
  };

  public storedRulesets : IStoredRuleset[] = [];

  public selectingRuleset = false;

  public selectedRuleset: StoredRuleset | null = null;

  public namedQueryUsedIn : string[] = [];

  @Input() public sublevel = false;

  @Input() public rulesetMap : Map<string, IQuery | IQueryRule> = new Map<string, IQuery | IQueryRule>();

  @Input() public optionsMap : Map<string, Option[]> = new Map<string,  Option[]>();

  private oldRulesetName : string | undefined;

  constructor(private formBuilder: FormBuilder, private localChangeDetectorRef:ChangeDetectorRef, private renderer : Renderer2, private rulesetService: RulesetService, private birthdayQueryParserService : BirthdayQueryParserService) {
    super(localChangeDetectorRef);
    this.queryCtrl = this.formBuilder.control(this.query); 
    this.initialize(JSON.stringify(this.query));
  }

  public static containsNamedRule(query: IQuery, key: string):boolean{
    let ret = false;
    query.rules.forEach((r)=>{
      const testQuery: IQuery = r as any as IQuery;
      if (testQuery.rules){
        if (testQuery.name === key){
          ret = ret || true;
        }
        if (BirthdayQueryBuilderComponent.containsNamedRule(testQuery, key)){
          ret = ret || true;
        }
      }
    });
    return ret;
  }

  public initialize(query: string): void{
    this.editingRulesetName = false; // in case it was cancelled while editing
    this.query = this.birthdayQueryParserService.normalize(JSON.parse(query), this.rulesetMap as Map<string,IQuery>);
    this.queryCtrl = this.formBuilder.control(this.query);
    this.data = this.query;
    BirthdayQueryBuilderComponent.topLevelRuleset = BirthdayQueryBuilderComponent.topLevelRuleset || this.data;
    this.queryCtrl.valueChanges.subscribe();
    setTimeout(()=>{                           // <<<---using ()=> syntax
      if (!this.sublevel){
        BirthdayQueryBuilderComponent.topLevelRuleset = this.data as RuleSet;
      }
    }, 0);
    this.getOptions = (field: string)=>{
      if (this.optionsMap.has(field)){
        return this.optionsMap.get(field) as Option[];
      } else {
        return this.config.fields[field].options || [];
      }
    }
  }

  ngOnInit() : any{
    // super.ngOnInit();
    this.ngOnChanges(null as any);  // needed to initialize fields
  }

  changeInput(): void {
    super.changeInput();
  }

  toggleNot(el : any) : void{
    el.checked = el.checked ? false : true;
    const ruleset = this.data as ExtendedRuleSet;
    ruleset.not = el.checked;
    this.localChangeDetectorRef.markForCheck();
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
    if (this.parentChangeCallback) {
      this.parentChangeCallback();
    }
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    }
  }

  calcButtonDisplay(el : HTMLElement) : boolean {
    this.renderer.setStyle(el.children[0], 'display', (this.hoveringOverButton || (el.children[0].children[0] as any).checked) ? "block" : "none");
    const multipleChildren = this.data && this.data.rules.length > 1;
    this.renderer.setStyle(el.children[1], 'display', (this.hoveringOverButton || ((el.children[1].children[0] as any).checked && multipleChildren)) ? "block" : "none");
    this.renderer.setStyle(el.children[2], 'display', (this.hoveringOverButton || ((el.children[2].children[0] as any).checked && multipleChildren)) ? "block" : "none");
    this.renderer.setStyle(el.children[3], 'display', (this.hoveringOverButton || (el.children[0].children[0] as any).checked || multipleChildren) ? "none" : "block");
    return true;
  }

  FirstInstance(el : HTMLElement) : boolean{
    if (!BirthdayQueryBuilderComponent.firstTimeDiv){
      BirthdayQueryBuilderComponent.firstTimeDiv = el;
    }
    return el.isSameNode(BirthdayQueryBuilderComponent.firstTimeDiv);
  }

  public editRulesetName() : void {
    if (!this.queryIsValid() || this.data?.name){
      return;
    }
    const ruleset = this.data as ExtendedRuleSet;
    this.oldRulesetName = ruleset.name;
    ruleset.name = ruleset.name || "";
    this.editingRulesetName = true;
  }

  public cancelEditRulesetName() : void {
    const ruleset = this.data as ExtendedRuleSet;
    ruleset.name = this.oldRulesetName;
    this.editingRulesetName = false;
  }

  public acceptRulesetName() : void {
    const storedRuleset :StoredRuleset = new StoredRuleset();
    storedRuleset.name = this.data.name;
    storedRuleset.jsonString = JSON.stringify(this.data);
    this.subscribeToSaveRulesetResponse(this.rulesetService.create(storedRuleset));
    this.rulesetMap.set(this.data.name as string, this.birthdayQueryParserService.normalize(this.data as IQuery, this.rulesetMap as Map<string, IQuery>));
  }

  public undoQueryMods(event: Event) : void {
    event.stopPropagation();
    const obj : ExtendedRuleSet = this.birthdayQueryParserService.parse(this.data?.initialQueryAsString as string, this.rulesetMap, this.optionsMap);
    const query = this.data as ExtendedRuleSet;
    query.condition = obj.condition;
    query.dirty = false;
    query.not = obj.not;
    query.rules = obj.rules;
  }

  public onUpdateNamedQuery(event: Event): void{
    event.stopPropagation();
    this.namedQuery = (this.data as ExtendedRuleSet).name as string;
    this.namedQueryUsedIn = [];
    this.rulesetMap.forEach((value: any, key: string) => {
      if (key !== this.namedQuery){ 
        const namedQuery = value as IQuery;
        if (BirthdayQueryBuilderComponent.containsNamedRule(namedQuery, this.namedQuery) && !this.namedQueryUsedIn.includes(namedQuery.name as string)){
          this.namedQueryUsedIn.push(namedQuery.name as string);
        }
      }
    });
    this.updatingNamedQuery = true;
  }

  public onUpdateNamedQueryInPopup(): void {
    this.namedQuery = (this.data as ExtendedRuleSet).name as string;
    this.namedQueryUsedIn = [];
    this.rulesetMap.forEach((value: any, key: string) => {
      if (key !== this.namedQuery){
        const namedQuery = value as IQuery;
        if (BirthdayQueryBuilderComponent.containsNamedRule(namedQuery, this.namedQuery) && !this.namedQueryUsedIn.includes(namedQuery.name as string)){
          this.namedQueryUsedIn.push(namedQuery.name as string);
        }
      }
    });
    this.namedQueryAsString = this.birthdayQueryParserService.queryAsString(this.data as IQuery);
    this.updatingNamedQueryInPopup = true;
  }

  public onCancelUpdatingNamedQueryInPopup(): void {
    this.updatingNamedQueryInPopup = false;
  }

  public onConfirmUpdatingNamedQueryInPopup(event: Event): void {
    event.stopPropagation();
    const data = this.data as ExtendedRuleSet;
    // convert updated query to ExtendedRuleset and normalize;
    const updated : ExtendedRuleSet = this.birthdayQueryParserService.parse(this.namedQueryAsString, this.rulesetMap, this.optionsMap);
    updated.name = data.name;
    for (let i = 0; i < updated.rules.length; i++) {
      if ((updated.rules[i] as IQuery).rules) {
        updated.rules[i] = this.birthdayQueryParserService.normalize(updated.rules[i] as IQuery, this.rulesetMap as Map<string, IQuery>);
      }
    }

    // if original query does not match the new query set the dirty to true and update the original
    data.dirty = data.initialQueryAsString !== this.namedQueryAsString;
    data.condition = updated.condition;
    data.not = updated.not;
    data.rules = updated.rules;
    this.updatingNamedQueryInPopup = false;
  }

  private containsNamedRule(query: IQuery, key: string):boolean{
    let ret = false;
    query.rules.forEach((r)=>{
      const testQuery: IQuery = r as any as IQuery;
      if (testQuery.rules){
          if (testQuery.name === key){
            ret = ret || true;
          }
          if (this.containsNamedRule(testQuery, key)){
            ret = ret || true;
          }
      }
    });
    return ret;
  }

  public onCancelSavingNamedQuery(): void{
    this.updatingNamedQuery = false;
  }

  public onRemoveNameFromQuery(): void{
    let jsonString = JSON.stringify(this.data as ExtendedRuleSet);
    let updated: ExtendedRuleSet = JSON.parse(jsonString); // clone
    delete updated.dirty;
    delete updated.collapsed;
    delete updated.name;
    delete updated.initialQueryAsString;
    jsonString = JSON.stringify(updated);
    updated = JSON.parse(jsonString) as ExtendedRuleSet;
    for (let i = 0; i < updated.rules.length; i++){
      if ((updated.rules[i] as IQuery).rules){
        updated.rules[i] = this.birthdayQueryParserService.normalize(updated.rules[i] as IQuery, this.rulesetMap as Map<string, IQuery>);
      }
    }
    if (this.parentValue && this.parentValue.rules){
      for (let i = 0; i < this.parentValue.rules.length; i++){
        if (this.parentValue.rules[i] === this.data){
          this.parentValue.rules[i] = updated;
        }
      }
    } else {
      this.query = updated; // at the top level
    }
    this.data = updated;
    this.updatingNamedQuery = false;
  }

  public onConfirmUpdatingNamedQuery(): void{
    const queryAsString = this.birthdayQueryParserService.queryAsString(this.data as IQuery); 
    let jsonString = JSON.stringify(this.data as ExtendedRuleSet);
    let updated : ExtendedRuleSet = JSON.parse(jsonString); // clone
    updated.initialQueryAsString = queryAsString;
    delete updated.dirty;
    delete updated.collapsed;
    jsonString = JSON.stringify(updated);
    updated = JSON.parse(jsonString) as ExtendedRuleSet;
    for (let i = 0; i < updated.rules.length; i++){
      if ((updated.rules[i] as IQuery).rules){
        updated.rules[i] = this.birthdayQueryParserService.normalize(updated.rules[i] as IQuery, this.rulesetMap as Map<string, IQuery>);
      }
    }
    const original: IQuery  = this.rulesetMap.get(updated.name as string) as IQuery;
    original.condition = updated.condition;
    original.not = updated.not as boolean;
    original.rules = updated.rules as IQueryRule[];
    let storedRuleset = new StoredRuleset(undefined, original.name, jsonString);
    this.updatingNamedQueryError = "";
    const updateSuccess = ()  => {
      if (this.namedQueryUsedIn.length > 0){
        const namedQueryToBeUpdated = this.rulesetMap.get(this.namedQueryUsedIn.pop() as string) as IQuery;
        jsonString = JSON.stringify(namedQueryToBeUpdated);
        storedRuleset = new StoredRuleset(undefined, namedQueryToBeUpdated.name, jsonString);
        this.rulesetService.update(storedRuleset).pipe(take(1), map(updateSuccess),catchError(updateError)).subscribe();
      } else {
        (this.data as ExtendedRuleSet).initialQueryAsString = queryAsString;
        this.updatingNamedQuery = false;
      }
    };
    const updateError = (error: any) => {
      // server error from the update
      this.updatingNamedQueryError = error.error?.detail;
      return of([]);
    };
    this.rulesetService.update(storedRuleset).pipe(take(1), map(updateSuccess), catchError(updateError)).subscribe();
  }

  public containsDirtyNamedQueries(): boolean{
    return this.containsDirtyNamedQuery(this.data);
  }

  public containsDirtyNamedQueriesBelow(): boolean{
    const fakeRuleset = {rules: (this.data as ExtendedRuleSet).rules}
    return this.containsDirtyNamedQuery(fakeRuleset);
  }

  public queryIsValid() : boolean {
    const parserService = this.birthdayQueryParserService;
    const query = parserService.queryAsString(this.data as IQuery);
    const queryObject = this.data as ExtendedRuleSet;
    if (this.editingRulesetName){
      return false; // prevents saving when editing name
    }
    if (queryObject.name && !queryObject.initialQueryAsString){
      queryObject.initialQueryAsString = query;
    }
    queryObject.dirty = queryObject.initialQueryAsString !== query;
    if (query === ""){
      return false;
    }
    const obj : IQuery = parserService.parse(query, this.rulesetMap, this.optionsMap);
    return !obj.Invalid;
  }

  public containsDirtyNamedQuery(rule : any): boolean{
    if (!rule.rules){
      return false; // not a ruleset
    }
    const query : ExtendedRuleSet = rule as ExtendedRuleSet;
    if (query.name && query.dirty){
      return true;
    }
    let bDirty = false;
    query.rules.forEach(r=>{
      if (this.containsDirtyNamedQuery(r)){
        bDirty = true;
      }
    });
    return bDirty;
  }

  protected subscribeToSaveRulesetResponse(result: Observable<HttpResponse<IStoredRuleset>>): void {
    result.subscribe(
      () => this.onSaveRulesetSuccess(),
      () => this.onSaveRulesetError()
    );
  }
  
  protected onSaveRulesetSuccess(): void {
    this.editingRulesetName = false;
  }

  protected onSaveRulesetError(): void {
    this.editingRulesetName = false;
  }

  StringFormat= function (arg1 : string, arg2 : string, arg3 : string, arg4 : string) : any  {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    let theString = arg1;
    const args = [arg1, arg2, arg3, arg4];
    // start with the second argument (i = 1)
    for (let i = 1; i < args.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        const regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, args[i]);
    }
    return theString;
  }

  convertToRuleset(rule: any, data: RuleSet): void {
    if (this.disabled) {
      return;
    }
    const rules = data.rules;
    data.rules = [];
    rules.forEach(r =>{
      if (r === rule){
        data.rules.push({ condition: 'and', rules: [rule] })
      } else {
        data.rules.push(r);
      }
    });
    this.localChangeDetectorRef.markForCheck();
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    } 
  }

  addNamedRuleSet(): void {
    if (this.disabled) {
      return;
    }
    this.selectedRuleset = null;
    this.storedRulesets = [];
    const pathNames = this.getPathNames();
    this.rulesetService.query().pipe(take(1), map(res  => {
      this.storedRulesets = [];
      const returnedRulesets = res.body || [];
      returnedRulesets.forEach(r=>{
        if (!pathNames.includes(r.name as string)){
          this.storedRulesets.push(r);
        }
      });
      this.selectingRuleset = true;
    })).subscribe();
  }

  getPathNames() : string[]{
    // this routine iterates up the tree
    const pathNames : string[] = [];
    let pathData : ExtendedRuleSet | null = this.data;
    let looping = true;
    while (looping){
      if (pathData?.name){
        pathNames.push(pathData.name);
      }
      if (pathData === BirthdayQueryBuilderComponent.topLevelRuleset){
         looping = false;
      } else {
        pathData = this.getParentData(pathData as RuleSet, BirthdayQueryBuilderComponent.topLevelRuleset);
      }
    }
    return pathNames;
  }

  getParentData(data : RuleSet, level : RuleSet) : RuleSet | null{
    // this routine goes down the tree to find the parent of data
    let ret : RuleSet | null = null;
    level.rules.forEach(r=>{
      if (r === data){
        ret = level;
      } else if ((r as any).rules){
        const levelParent = this.getParentData(data, r as RuleSet);
        if (levelParent){
          ret = levelParent;
        }
      }
    });
    return ret;
  }

  onClearSelectingRuleset():void{
    this.selectingRuleset = false;
  }

  onRulesetSelected():void{
    this.selectingRuleset = false;
    const parent = this.data;
    let addedRuleset = this.rulesetMap.has(this.selectedRuleset?.name as string) ? this.rulesetMap.get(this.selectedRuleset?.name as string) : JSON.parse(this.selectedRuleset?.jsonString as string);
    addedRuleset = this.birthdayQueryParserService.normalize(addedRuleset, this.rulesetMap as Map<string, IQuery>);
    (parent as RuleSet).rules = (parent as RuleSet).rules.concat([addedRuleset]);
    this.localChangeDetectorRef.markForCheck();
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
    if (this.parentChangeCallback) {
      this.parentChangeCallback();
    }
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    }    
  }
}

@Directive({
  selector: '[jhiValidateRulesetName]',
  providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: RulesetNameValidatorDirective, multi: true}]
})

export class RulesetNameValidatorDirective implements AsyncValidator {
  storedRulesets : IStoredRuleset[] = [];
  constructor(private rulesetService: RulesetService ) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (control.value && control.value.length > 0){
      return of(1).pipe(map(()=>{
        let bFound = false;
        this.storedRulesets.forEach(r =>{
          if (r.name === control.value){
            bFound = true;
          }
        });
        if (bFound){
          return {
            error: "Name already used"
          }
        }
        if (/^[A-Z][A-Z_\d]*$/.test(control.value)){
          return null;
        }
        return {
          error: "Invalid name"
        };
      }));
    } else {
      const obs = this.rulesetService.query().pipe(take(1), map(res  => {
        (this.storedRulesets = res.body || []);
        if (/^[A-Z][A-Z_\d]*$/.test(control.value)){
          return null;
        }
        return {
          error: "Empty name"
        };
      }));
      return obs;
    }
  }
}
