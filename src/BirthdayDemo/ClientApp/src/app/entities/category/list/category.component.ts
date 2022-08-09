import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Directive } from '@angular/core';
import { ICategory } from "../category.model";
import { CategoryService } from "../service/category.service";
import { CategoryDeleteDialogComponent } from "../delete/category-delete-dialog.component";
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, AsyncValidator } from '@angular/forms';
import { Observable } from 'rxjs';
import { IStoredRuleset } from '../../../shared/model/ruleset.model';
import { RulesetService } from '../../ruleset/service/ruleset.service';
import { map } from "rxjs/operators";

@Component({
  selector: "jhi-category",
  templateUrl: "./category.component.html",
})
export class CategoryComponent implements OnInit {
  categories?: ICategory[];
  isLoading = false;

  constructor(
    protected categoryService: CategoryService,
    protected modalService: NgbModal
  ) {}

  loadAll(): void {
    this.isLoading = true;

    this.categoryService.query().subscribe(
      (res: HttpResponse<ICategory[]>) => {
        this.isLoading = false;
        this.categories = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: ICategory): number {
    return item.id!;
  }

  delete(category: ICategory): void {
    const modalRef = this.modalService.open(CategoryDeleteDialogComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.category = category;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe((reason) => {
      if (reason === "deleted") {
        this.loadAll();
      }
    });
  }
}

@Directive({
  selector: '[jhiValidateRulesetRename]',
  providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: RulesetRenameValidatorDirective, multi: true}]
})

export class RulesetRenameValidatorDirective implements AsyncValidator {
  storedRulesets : IStoredRuleset[] = [];
  constructor(private rulesetService: RulesetService ) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
      const obs = this.rulesetService.query().pipe(map(res  => {
        (this.storedRulesets = res.body || []);
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
      return obs;
  }
}
