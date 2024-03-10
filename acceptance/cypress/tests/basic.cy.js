import {
  getSlateEditorAndType,
  getSelectedSlateEditor,
} from '../support/slate';

context('Basic Acceptance Tests', () => {
  describe('Text Block Tests', () => {
    beforeEach(() => {
      cy.intercept('GET', `/**/*?expand*`).as('content');
      cy.intercept('GET', '/**/Document').as('schema');

      // given a logged in editor and a page in edit mode
      cy.autologin();
      cy.createContent({
        contentType: 'Document',
        contentId: 'document',
        contentTitle: 'Document',
      });
      cy.visit('/');
      cy.wait('@content');
    });

    it('As editor I can add a page with a text block', function () {
      // when I add a page with a text block
      cy.get('#toolbar-add').click();
      cy.get('#toolbar-add-document').click();
      cy.get('.documentFirstHeading')
        .type('My Page')
        .get('.documentFirstHeading')
        .contains('My Page');

      getSlateEditorAndType(
        '.block .slate-editor [contenteditable=true]',
        'This is the text',
      );

      getSelectedSlateEditor().contains('This is the text');
      cy.get('#toolbar-save').click();
      cy.wait('@content');
      cy.url().should('eq', Cypress.config().baseUrl + '/my-page');
    });
  });
});
