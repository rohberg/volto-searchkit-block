describe('Searchkit block tests – search - multilingual', () => {
  before(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');

    cy.autologin();

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
    cy.visit('/en/edit');

    cy.getSlate().clear().type('{enter}');
    cy.get('.button .block-add-button').click({ force: true });
    cy.get('.blocks-chooser .title').contains('Common').click();
    cy.get('.blocks-chooser .common')
      .contains('Searchkit')
      .click({ force: true });

    cy.get('#toolbar-save').click();
    cy.wait('@content');
  });

  beforeEach(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');

    cy.autologin();

    cy.visit('/en');
    cy.wait('@content');
  });

  after(() => {
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
