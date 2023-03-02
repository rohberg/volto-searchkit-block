context('Content Acceptance Tests', () => {
  beforeEach(() => {
    cy.autologin();
    cy.visit('/');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('');
  });

  it('As editor I can add a page', function () {
    // when I add a page
    cy.get('#toolbar-add').click();
    cy.get('#toolbar-add-document').click();
    cy.getSlateTitle().focus().click().type('My Page').contains('My Page');

    // then I a new page has been created
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/my-page');

    cy.get('.navigation .item.active').should('have.text', 'My Page');
  });

  it('As editor I can add a page with a text block', function () {
    // when I add a page with a text block
    cy.get('#toolbar-add').click();
    cy.get('#toolbar-add-document').click();
    cy.getSlateTitle().focus().click().type('My Page').contains('My Page');
    cy.getSlateEditorAndType('This is the text.').contains('This is the text');
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/my-page');

    // then a new page with a text block has been added

    cy.get('.navigation .item.active').should('have.text', 'My Page');
  });
});
