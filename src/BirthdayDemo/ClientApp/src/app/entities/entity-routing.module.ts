import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "category",
        data: { pageTitle: "Categories" },
        loadChildren: () =>
          import("./category/category.module").then((m) => m.CategoryModule),
      },
      {
        path: "birthday",
        data: { pageTitle: "Birthdays", defaultSort: "id,asc" },
        loadChildren: () =>
          import("./birthday/birthday.module").then((m) => m.BirthdayModule),
      },
      {
        path: "ruleset",
        data: { pageTitle: "Rulesets" },
        loadChildren: () =>
          import("./ruleset/ruleset.module").then((m) => m.RulesetModule),
      },
      {
        path: "category",
        data: { pageTitle: "Categories" },
        loadChildren: () =>
          import("./category/category.module").then((m) => m.CategoryModule),
      },
      {
        path: "birthday",
        data: { pageTitle: "Birthdays", defaultSort: "id,asc" },
        loadChildren: () =>
          import("./birthday/birthday.module").then((m) => m.BirthdayModule),
      },
      {
        path: "ruleset",
        data: { pageTitle: "Rulesets" },
        loadChildren: () =>
          import("./ruleset/ruleset.module").then((m) => m.RulesetModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
