describe('Searchkit block tests – search - multilingual', () => {
  before(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');

    cy.autologin();

    cy.createContent({
      contentType: 'Document',
      contentId: 'searching',
      contentTitle: 'Searching and Finding',
      path: '/en',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-in-february',
      contentTitle: 'The garden in february',
      path: '/en',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'der-garten-im-februar',
      contentTitle: 'Der Garten im Februar',
      path: '/it',
    });


    // Add search block to /suche
    cy.visit('/en/searching');
    cy.get('a.edit').click();

    cy.getSlate().click();
    cy.get('.button .block-add-button').click({ force: true });
    cy.get('div[aria-label="Unfold Common blocks"]').click();
    cy.get('.blocks-chooser .common .button.searchkitblock').click({
      force: true,
    });

    cy.get('#toolbar-save').click();
    cy.wait('@content');
  });

  beforeEach(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    cy.intercept('GET', '/**/@kitsearch').as('kitsearch');

    cy.autologin();

    cy.visit('/en/searching');
    cy.wait(1000);
  });

  after(() => {
    cy.removeContent({ path: 'en/garden-in-february' });
    cy.removeContent({ path: 'en/searching' });
    cy.removeContent({ path: 'it/der-garten-im-februar' });
  });


  it('I can search within language', function () {
    cy.get('.searchbar-wrapper input').type('februax{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');
    cy.get('.block.searchkitsearch').should('not.contain', 'Der Garten im Februar');
  });

});
