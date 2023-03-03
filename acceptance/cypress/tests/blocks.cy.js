context('Blocks Acceptance Tests', () => {
  describe('Searchkit Block Tests', () => {
    beforeEach(() => {
      // given a logged in editor and a page in edit mode
      cy.visit('/');
      cy.autologin();
      cy.navigate('/');

      cy.createContent({
        contentType: 'Document',
        contentId: 'searching',
        contentTitle: 'Searching',
      });
      cy.createContent({
        contentType: 'Document',
        contentId: 'garden',
        contentTitle: 'Garden block',
      });
      cy.createContent({
        contentType: 'Document',
        contentId: 'garden-february',
        contentTitle: 'The garden in february',
        path: '/garden',
      });
      cy.createContent({
        contentType: 'Document',
        contentId: 'garden-march',
        contentTitle: 'The garden in march',
        path: '/garden',
      });
    });

    it('As editor I can add a searchkit-block', function () {
      cy.visit('/searching');
      cy.waitForResourceToLoad('@navigation');
      cy.waitForResourceToLoad('@breadcrumbs');
      cy.waitForResourceToLoad('@actions');
      cy.waitForResourceToLoad('@types');
      cy.waitForResourceToLoad('searching');
      cy.navigate('/searching/edit');

      cy.intercept('PATCH', '/**/document').as('edit');
      cy.intercept('GET', '/**/searching').as('content');
      cy.intercept('GET', '/**/Searching').as('schema');

      cy.getSlate().click();
      cy.get('.button .block-add-button').click({ force: true });
      cy.get('div[aria-label="Unfold Common blocks"]').click();
      cy.get('.blocks-chooser .common .button.searchkitblock').click({
        force: true,
      });

      cy.get('#field-elastic_search_api_url').type(
        'http://127.0.0.1:55001/api',
      );

      // TODO Continue tests
      // See volto grid block tests or similar

      cy.get('#toolbar-save').click();
      // cy.get('#navigation').contains('Home').click();

      cy.visit('/searching');
    });
  });
});
