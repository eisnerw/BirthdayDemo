import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { BirthdayComponent } from "./list/birthday.component";
import { BirthdayDetailComponent } from "./detail/birthday-detail.component";
import { BirthdayUpdateComponent } from "./update/birthday-update.component";
import { BirthdayDeleteDialogComponent } from "./delete/birthday-delete-dialog.component";
import { BirthdayRoutingModule } from "./route/birthday-routing.module";

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

@NgModule({
    imports: [SharedModule, BirthdayRoutingModule, SuperTableModule, CalendarModule, ContextMenuModule, MessagesModule, ChipsModule, ConfirmPopupModule, TooltipModule, ScrollTopModule, MenuModule, DialogModule],
    declarations: [
        BirthdayComponent,
        BirthdayDetailComponent,
        BirthdayUpdateComponent,
        BirthdayDeleteDialogComponent,
    ]
})
export class BirthdayModule {}
