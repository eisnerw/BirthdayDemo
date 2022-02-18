import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { IRuleset } from "../ruleset.model";

@Component({
  selector: "jhi-ruleset-detail",
  templateUrl: "./ruleset-detail.component.html",
})
export class RulesetDetailComponent implements OnInit {
  ruleset: IRuleset | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ruleset }) => {
      this.ruleset = ruleset;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
