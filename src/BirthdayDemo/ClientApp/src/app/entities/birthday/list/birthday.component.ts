import { Component, OnInit } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { IBirthday } from "../birthday.model";
import { BirthdayService } from "../service/birthday.service";
import { BirthdayDeleteDialogComponent } from "../delete/birthday-delete-dialog.component";

@Component({
  selector: "jhi-birthday",
  templateUrl: "./birthday.component.html",
})
export class BirthdayComponent implements OnInit {
  birthdays?: IBirthday[];
  isLoading = false;

  constructor(
    protected birthdayService: BirthdayService,
    protected modalService: NgbModal
  ) {}

  loadAll(): void {
    this.isLoading = true;

    this.birthdayService.query().subscribe(
      (res: HttpResponse<IBirthday[]>) => {
        this.isLoading = false;
        this.birthdays = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IBirthday): number {
    return item.id!;
  }

  delete(birthday: IBirthday): void {
    const modalRef = this.modalService.open(BirthdayDeleteDialogComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.birthday = birthday;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe((reason) => {
      if (reason === "deleted") {
        this.loadAll();
      }
    });
  }
}
