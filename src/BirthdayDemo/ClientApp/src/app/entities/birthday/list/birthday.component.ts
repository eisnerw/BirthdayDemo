import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router, Data } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IBirthday } from "../birthday.model";

import { ITEMS_PER_PAGE } from "app/config/pagination.constants";
import { BirthdayService } from "../service/birthday.service";
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { DomSanitizer } from "@angular/platform-browser";
import { ConfirmationService, PrimeNGConfig} from "primeng/api";
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: "jhi-birthday",
  templateUrl: "./birthday.component.html",
  providers: [MessageService, ConfirmationService]
})

export class BirthdayComponent implements OnInit {
  birthdays?: IBirthday[];
  isLoading = false;
  birthdaysMap : {} = {};
  eventSubscriber?: Subscription;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;
  expandedRows = {};
  loading = true;
  faCheck = faCheck;
  
  columnDefs = [
    { field: 'lname', sortable: true, filter: true },
    { field: 'fname', sortable: true, filter: true },
    { field: 'dob', sortable: true, filter: true/* , valueFormatter: (data: any) => this.formatMediumPipe.transform(dayjs(data.value)) */},
    { field: 'sign', headerName: 'sign', sortable: true, filter: true },
    { field: 'isAlive', sortable: true, filter: true },
  ];

  rowData = new Observable<any[]>();

  menuItems: MenuItem[] = [];

  contextSelectedRow: IBirthday | null = null;

  checkboxSelectedRows : IBirthday[] = [];

  bDisplaySearchDialog = false;

  bDisplayBirthday = false;

  bDisplayCategories = false;

  birthdayDialogTitle  = "";

  birthdayDialogId : any = "";

  databaseQuery = "";

  initialSelectedCategories = "";

  constructor(
    protected birthdayService: BirthdayService,
    protected modalService: NgbModal,
    protected messageService: MessageService,
    public sanitizer:DomSanitizer,
    private confirmationService: ConfirmationService,
    private primeNGConfig : PrimeNGConfig,
  ) {}

  loadAll(): void {
    this.isLoading = true;

    this.birthdayService.query().subscribe(
      (res: HttpResponse<IBirthday[]>) => {
        this.birthdays = res.body ?? [];
        this.rowData = of(this.birthdays);
        this.loading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  refreshData(): void {
    this.birthdays =[];
    this.rowData = of(this.birthdays);
    this.loadAll();
  }
  

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IBirthday): number {
    return item.id!;
  }
}
