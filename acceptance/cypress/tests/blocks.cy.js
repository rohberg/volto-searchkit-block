context('Blocks Acceptance Tests', () => {
  describe('Searchkit Block Tests', () => {
    beforeEach(() => {
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
        contentId: 'garden',
        contentTitle: 'Garden blog',
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
      cy.navigate('/searching/edit');
      cy.wait('@schema');

      cy.getSlate().click();
      cy.get('.button .block-add-button').click({ force: true });
      cy.get('div[aria-label="Unfold Common blocks"]').click();
      cy.get('.blocks-chooser .common .button.searchkitblock').click({
        force: true,
      });

      // TODO Continue tests
      // See volto grid block tests or similar

      cy.get('#toolbar-save').click();
      // cy.get('#navigation').contains('Home').click();

      cy.visit('/searching');
    });
  });
});
