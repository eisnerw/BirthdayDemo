import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxAngularQueryBuilderModule } from "ngx-angular-query-builder";
import { CommonModule } from '@angular/common';
import { BirthdayQueryBuilderComponent } from './birthday-query-builder.component';
import { InputTextModule } from 'primeng/inputtext';
import { RulesetNameValidatorDirective } from './birthday-query-builder.component';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BirthdayQueryValidatorDirectiveModule } from './birthday-query-validator.directive.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxAngularQueryBuilderModule , InputTextModule, DialogModule, DropdownModule, ButtonModule, FontAwesomeModule, BirthdayQueryValidatorDirectiveModule],
  declarations: [BirthdayQueryBuilderComponent, RulesetNameValidatorDirective],
  bootstrap: [BirthdayQueryBuilderComponent],
  exports: [BirthdayQueryBuilderComponent]
})
export class BirthdayQueryBuilderModule { }
