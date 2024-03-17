describe('Searchkit block tests- create search ', () => {
  before(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');

    cy.autologin();

    cy.createContent({
      contentType: 'Document',
      contentId: 'searching',
      contentTitle: 'Search',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-blog',
      contentTitle: 'Garden blog',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-february',
      contentTitle: 'The garden in february',
      path: '/garden-blog',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-march',
      contentTitle: 'The garden in march',
      path: '/garden-blog',
    });

    cy.visit('/');
    cy.wait('@content');
  });

  beforeEach(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');

    cy.autologin();

    cy.visit('/');
    cy.wait('@content');
  });

  after(() => {
    cy.removeContent({ path: 'garden-blog/garden-february' });
    cy.removeContent({ path: 'garden-blog/garden-march' });
    cy.removeContent({ path: 'garden-blog' });
    cy.removeContent({ path: 'searching' });
  });

  it('As manager I can add a searchkit-block and find a documunt', function () {
    cy.navigate('/searching/edit');
    cy.wait('@schema');

    cy.getSlate().click();
    cy.get('.button .block-add-button').click({ force: true });
    cy.get('div[aria-label="Unfold Common blocks"]').click();
    cy.get('.blocks-chooser .common .button.searchkitblock').click({
      force: true,
    });

    cy.get('#toolbar-save').click();
    cy.visit('/searching');

    cy.get('.block.searchkitsearch').should('not.contain', 'No results');
    cy.get('.block.searchkitsearch').contains('The garden in february');

    cy.get('.searchbar-wrapper input').type('Februar{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');
  });
});
