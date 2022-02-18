import { entityItemSelector } from "../../support/commands";
import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from "../../support/entity";

describe("Ruleset e2e test", () => {
  const rulesetPageUrl = "/ruleset";
  const rulesetPageUrlPattern = new RegExp("/ruleset(\\?.*)?$");
  const username = Cypress.env("E2E_USERNAME") ?? "admin";
  const password = Cypress.env("E2E_PASSWORD") ?? "admin";

  before(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.visit("");
    cy.login(username, password);
    cy.get(entityItemSelector).should("exist");
  });

  beforeEach(() => {
    cy.intercept("GET", "/api/rulesets+(?*|)").as("entitiesRequest");
    cy.intercept("POST", "/api/rulesets").as("postEntityRequest");
    cy.intercept("DELETE", "/api/rulesets/*").as("deleteEntityRequest");
  });

  it("should load Rulesets", () => {
    cy.visit("/");
    cy.clickOnEntityMenuItem("ruleset");
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length === 0) {
        cy.get(entityTableSelector).should("not.exist");
      } else {
        cy.get(entityTableSelector).should("exist");
      }
    });
    cy.getEntityHeading("Ruleset").should("exist");
    cy.url().should("match", rulesetPageUrlPattern);
  });

  it("should load details Ruleset page", function () {
    cy.visit(rulesetPageUrl);
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length === 0) {
        this.skip();
      }
    });
    cy.get(entityDetailsButtonSelector).first().click({ force: true });
    cy.getEntityDetailsHeading("ruleset");
    cy.get(entityDetailsBackButtonSelector).click({ force: true });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", rulesetPageUrlPattern);
  });

  it("should load create Ruleset page", () => {
    cy.visit(rulesetPageUrl);
    cy.wait("@entitiesRequest");
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading("Ruleset");
    cy.get(entityCreateSaveButtonSelector).should("exist");
    cy.get(entityCreateCancelButtonSelector).click({ force: true });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", rulesetPageUrlPattern);
  });

  it("should load edit Ruleset page", function () {
    cy.visit(rulesetPageUrl);
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length === 0) {
        this.skip();
      }
    });
    cy.get(entityEditButtonSelector).first().click({ force: true });
    cy.getEntityCreateUpdateHeading("Ruleset");
    cy.get(entityCreateSaveButtonSelector).should("exist");
    cy.get(entityCreateCancelButtonSelector).click({ force: true });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", rulesetPageUrlPattern);
  });

  it("should create an instance of Ruleset", () => {
    cy.visit(rulesetPageUrl);
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading("Ruleset");

    cy.get(`[data-cy="name"]`)
      .type("platforms transmitting")
      .should("have.value", "platforms transmitting");

    cy.get(`[data-cy="jsonString"]`).type("Mall").should("have.value", "Mall");

    cy.get(entityCreateSaveButtonSelector).click({ force: true });
    cy.scrollTo("top", { ensureScrollable: false });
    cy.get(entityCreateSaveButtonSelector).should("not.exist");
    cy.wait("@postEntityRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(201);
    });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", rulesetPageUrlPattern);
  });

  it("should delete last instance of Ruleset", function () {
    cy.visit(rulesetPageUrl);
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length > 0) {
        cy.get(entityTableSelector).should(
          "have.lengthOf",
          response.body.length
        );
        cy.get(entityDeleteButtonSelector).last().click({ force: true });
        cy.getEntityDeleteDialogHeading("ruleset").should("exist");
        cy.get(entityConfirmDeleteButtonSelector).click({ force: true });
        cy.wait("@deleteEntityRequest").then(({ response }) => {
          expect(response.statusCode).to.equal(204);
        });
        cy.wait("@entitiesRequest").then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should("match", rulesetPageUrlPattern);
      } else {
        this.skip();
      }
    });
  });
});
