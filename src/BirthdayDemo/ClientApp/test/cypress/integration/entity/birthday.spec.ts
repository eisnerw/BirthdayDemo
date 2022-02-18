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

describe("Birthday e2e test", () => {
  const birthdayPageUrl = "/birthday";
  const birthdayPageUrlPattern = new RegExp("/birthday(\\?.*)?$");
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
    cy.intercept("GET", "/api/birthdays+(?*|)").as("entitiesRequest");
    cy.intercept("POST", "/api/birthdays").as("postEntityRequest");
    cy.intercept("DELETE", "/api/birthdays/*").as("deleteEntityRequest");
  });

  it("should load Birthdays", () => {
    cy.visit("/");
    cy.clickOnEntityMenuItem("birthday");
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length === 0) {
        cy.get(entityTableSelector).should("not.exist");
      } else {
        cy.get(entityTableSelector).should("exist");
      }
    });
    cy.getEntityHeading("Birthday").should("exist");
    cy.url().should("match", birthdayPageUrlPattern);
  });

  it("should load details Birthday page", function () {
    cy.visit(birthdayPageUrl);
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length === 0) {
        this.skip();
      }
    });
    cy.get(entityDetailsButtonSelector).first().click({ force: true });
    cy.getEntityDetailsHeading("birthday");
    cy.get(entityDetailsBackButtonSelector).click({ force: true });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", birthdayPageUrlPattern);
  });

  it("should load create Birthday page", () => {
    cy.visit(birthdayPageUrl);
    cy.wait("@entitiesRequest");
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading("Birthday");
    cy.get(entityCreateSaveButtonSelector).should("exist");
    cy.get(entityCreateCancelButtonSelector).click({ force: true });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", birthdayPageUrlPattern);
  });

  it("should load edit Birthday page", function () {
    cy.visit(birthdayPageUrl);
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length === 0) {
        this.skip();
      }
    });
    cy.get(entityEditButtonSelector).first().click({ force: true });
    cy.getEntityCreateUpdateHeading("Birthday");
    cy.get(entityCreateSaveButtonSelector).should("exist");
    cy.get(entityCreateCancelButtonSelector).click({ force: true });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", birthdayPageUrlPattern);
  });

  it("should create an instance of Birthday", () => {
    cy.visit(birthdayPageUrl);
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading("Birthday");

    cy.get(`[data-cy="lname"]`)
      .type("PCI Moldovan virtual")
      .should("have.value", "PCI Moldovan virtual");

    cy.get(`[data-cy="fname"]`)
      .type("experiences Shirt parse")
      .should("have.value", "experiences Shirt parse");

    cy.get(`[data-cy="sign"]`)
      .type("Regional magnetic")
      .should("have.value", "Regional magnetic");

    cy.get(`[data-cy="dob"]`)
      .type("2022-02-18T07:33")
      .should("have.value", "2022-02-18T07:33");

    cy.get(`[data-cy="isAlive"]`).should("not.be.checked");
    cy.get(`[data-cy="isAlive"]`).click().should("be.checked");

    cy.setFieldSelectToLastOfEntity("categories");

    cy.get(entityCreateSaveButtonSelector).click({ force: true });
    cy.scrollTo("top", { ensureScrollable: false });
    cy.get(entityCreateSaveButtonSelector).should("not.exist");
    cy.wait("@postEntityRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(201);
    });
    cy.wait("@entitiesRequest").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
    });
    cy.url().should("match", birthdayPageUrlPattern);
  });

  it("should delete last instance of Birthday", function () {
    cy.visit(birthdayPageUrl);
    cy.wait("@entitiesRequest").then(({ response }) => {
      if (response.body.length > 0) {
        cy.get(entityTableSelector).should(
          "have.lengthOf",
          response.body.length
        );
        cy.get(entityDeleteButtonSelector).last().click({ force: true });
        cy.getEntityDeleteDialogHeading("birthday").should("exist");
        cy.get(entityConfirmDeleteButtonSelector).click({ force: true });
        cy.wait("@deleteEntityRequest").then(({ response }) => {
          expect(response.statusCode).to.equal(204);
        });
        cy.wait("@entitiesRequest").then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should("match", birthdayPageUrlPattern);
      } else {
        this.skip();
      }
    });
  });
});
