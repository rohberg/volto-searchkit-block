describe('Searchkit block tests- create search ', () => {
  beforeEach(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    // Wait a bit to previous teardown to complete correctly because Heisenbug in this point
    cy.wait(2000);
    // given a logged in editor and a page in edit mode
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

  afterEach(() => {
    cy.removeContent({ path: 'garden-blog/garden-february' });
    cy.removeContent({ path: 'garden-blog/garden-march' });
    cy.removeContent({ path: 'garden-blog' });
    cy.removeContent({ path: 'searching' });
    cy.wait(5000);
  });

  it('As manager I can add a searchkit-block and find a document', function () {
    cy.visit('/searching');
    cy.get('a.edit').click();

    // Add block
    cy.getSlate().click();
    cy.get('button.block-add-button').click();
    cy.get('.blocks-chooser .title').contains('Allgemein').click();
    cy.get('.blocks-chooser .button.searchkitblock').click({ force: true });

    cy.get('#toolbar-save').click();
    cy.visit('/searching');

    // Without query string all docs are shown
    cy.get('.block.searchkitsearch').should('not.contain', 'No results');
    cy.get('.block.searchkitsearch').contains('The garden in february');

    // searching for a query string
    cy.get('.searchbar-wrapper input').type('february{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');
  });
});
