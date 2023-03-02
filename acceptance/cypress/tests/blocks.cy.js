import { getSlateEditorAndType } from '../support/slate';

context('Blocks Acceptance Tests', () => {
  describe('Searchkit Block Tests', () => {
    beforeEach(() => {
      // given a logged in editor and a page in edit mode
      cy.visit('/');
      cy.autologin();
      cy.createContent({
        contentType: 'Document',
        contentId: 'document',
        contentTitle: 'Test document',
      });
      cy.createContent({
        contentType: 'Document',
        contentId: 'my-page',
        contentTitle: 'My Page',
        path: '/document',
      });
      // Adding Image for Grid Image
      cy.createContent({
        contentType: 'Image',
        contentId: 'my-image',
        contentTitle: 'My Image',
        path: '/document',
      });
      cy.visit('/document');
      cy.waitForResourceToLoad('@navigation');
      cy.waitForResourceToLoad('@breadcrumbs');
      cy.waitForResourceToLoad('@actions');
      cy.waitForResourceToLoad('@types');
      cy.waitForResourceToLoad('document');
      cy.navigate('/document/edit');
    });

    it('As editor I can add a Grid', function () {
      cy.intercept('PATCH', '/**/document').as('edit');
      cy.intercept('GET', '/**/document').as('content');
      cy.intercept('GET', '/**/Document').as('schema');

      cy.getSlate().click();
      cy.get('.button .block-add-button').click({ force: true });
      cy.get('.blocks-chooser .mostUsed .button.__grid').click({ force: true });
      cy.findByText('2 columns').click();

      cy.get('button[aria-label="Add grid block in position 0"]').click();
      cy.get('.blocks-chooser .mostUsed .button.image').click();
      cy.get('.block.image .toolbar-inner .buttons:first-child').click();
      cy.get('[aria-label="Select My Image"]').dblclick();
      cy.findByText('my-image');

      cy.get('button[aria-label="Add grid block in position 1"]').click();
      cy.get('.blocks-chooser [aria-label="Unfold Text blocks"]').click();
      cy.get('.blocks-chooser .text .button.text').click();
      cy.get('.block.inner.__grid .public-DraftEditor-content').type(
        'Colorless green ideas sleep furiously.',
      );

      cy.get('#toolbar-save').click();
      cy.wait('@edit');
      cy.wait('@content');

      cy.findByText('Colorless green ideas sleep furiously.');

      cy.navigate('/document/edit');
      cy.wait('@schema');
      cy.get('.block.inner.__grid').click();
      cy.get('.block.inner.__grid [aria-label="Reset grid element 1"]').click();
      cy.get(
        '.block.inner.__grid [aria-label="Remove grid element 1"]',
      ).click();
      cy.get(
        '.block.inner.__grid .toolbar [aria-label="Add grid element"]',
      ).click();
      cy.get('button[aria-label="Add grid block in position 1"]').click();
      cy.get('.blocks-chooser .mostUsed .button.teaser').click();
      cy.get(
        '.objectbrowser-field[aria-labelledby="fieldset-default-field-label-href"] button[aria-label="Open object browser"]',
      ).click();
      cy.get('[aria-label="Select My Page"]').dblclick();
      cy.get('#toolbar-save').click();
      cy.wait('@edit');
      cy.wait('@content');

      cy.get('.block.__grid').findByText('My Page');
    });

  });
});
