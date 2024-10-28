describe('Searchkit block tests – search - multilingual - language', () => {
  before(() => {
    // 1. Disable Cypress uncaught exception failures from React hydration errors
    Cypress.on('uncaught:exception', (err) => {
      // Cypress and React Hydrating the document don't get along
      // for some unknown reason. Hopefully, we figure out why eventually
      // so we can remove this.
      if (
        /hydrat/i.test(err.message) ||
        /Minified React error #418/.test(err.message) ||
        /Minified React error #423/.test(err.message)
      ) {
        return false;
      }
    });

    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');

    cy.autologin();

    cy.createContent({
      contentType: 'Document',
      contentId: 'searching',
      contentTitle: 'Searching',
      path: 'en',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-in-february',
      contentTitle: 'The garden in february',
      path: 'en',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'der-garten-im-februar',
      contentTitle: 'Der Garten im Februar',
      path: 'de',
    });

    // Add search block
    cy.visit('/en/searching/edit');
    cy.wait('@schema');

    cy.addNewBlock('searchkit');

    cy.get('#toolbar-save').click();
    cy.wait('@content');
    cy.wait('@kitsearch');
  });

  beforeEach(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.autologin();

    cy.visit('/en/searching');
    cy.wait('@kitsearch');
  });

  after(() => {
    // 2. Re-enable Cypress uncaught exception failures from React hydration errors
    Cypress.on('uncaught:exception', () => {});

    cy.removeContent({ path: 'en/searching' });
    cy.removeContent({ path: 'en/garden-in-february' });
    cy.removeContent({ path: 'de/der-garten-im-februar' });
  });

  it('I can search', function () {
    cy.get('.searchbar-wrapper input').type('february{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');
  });

  it('I can search within language', function () {
    cy.get('.searchbar-wrapper input').type('februax{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');
    cy.get('.block.searchkitsearch').should(
      'not.contain',
      'Der Garten im Februar',
    );
  });
});
