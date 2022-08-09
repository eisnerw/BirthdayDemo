import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { CategoryComponent } from "./list/category.component";
import { CategoryDetailComponent } from "./detail/category-detail.component";
import { CategoryUpdateComponent } from "./update/category-update.component";
import { CategoryDeleteDialogComponent } from "./delete/category-delete-dialog.component";
import { CategoryRoutingModule } from "./route/category-routing.module";
import { SuperTableModule } from '../../shared/super-table';
import { CalendarModule } from 'primeng/calendar';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MessagesModule } from 'primeng/messages';
import { ChipsModule } from 'primeng/chips';
import { ConfirmPopupModule } from "primeng/confirmpopup";
import {TooltipModule} from 'primeng/tooltip';
import {ScrollTopModule} from 'primeng/scrolltop';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { BirthdayTableModule } from '../birthday/list/birthday-table.module';
import { EditableMultiSelectModule } from '../../shared/editable-multi-select.module';
import { BirthdayQueryBuilderModule } from '../birthday/search/birthday-query-builder.module';
import { DropdownModule } from 'primeng/dropdown';
import { BirthdayQueryValidatorDirectiveModule } from '../birthday/search/birthday-query-validator.directive.module';
import { RulesetRenameValidatorDirective } from './list/category.component';

@NgModule({
    imports: [SharedModule, CategoryRoutingModule, SuperTableModule, CalendarModule, ContextMenuModule, MessagesModule, ChipsModule, ConfirmPopupModule, TooltipModule, ScrollTopModule, MenuModule, DialogModule, BirthdayTableModule, BirthdayQueryBuilderModule, EditableMultiSelectModule, DropdownModule, BirthdayQueryValidatorDirectiveModule],
    declarations: [
        CategoryComponent,
        CategoryDetailComponent,
        CategoryUpdateComponent,
        CategoryDeleteDialogComponent,
        RulesetRenameValidatorDirective
    ]
})
export class CategoryModule {}
