describe('Searchkit Block Tests', () => {
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
    // cy.removeContent({ path: 'garden-february' });
    // cy.removeContent({ path: 'garden-march' });
    // cy.removeContent({ path: 'garden-blog' });
    // cy.removeContent({ path: 'searching' });
    // TODO Update index server
    // @@update-elasticsearch
    
  });

  it('As manager I can add a searchkit-block', function () {
    cy.navigate('/searching/edit');
    cy.wait('@schema');

    cy.getSlate().click();
    cy.get('.button .block-add-button').click({ force: true });
    cy.get('div[aria-label="Unfold Common blocks"]').click();
    cy.get('.blocks-chooser .common .button.searchkitblock').click({
      force: true,
    });
    
    // block configuration index server
    cy.get('input#field-backend_url').type('http://localhost:55001/plone')
    cy.get('input#field-frontend_url').type('http://localhost:3000')
    // block configuration allowed types and states
    cy.get("#field-allowed_content_types").click();
    cy.get("#field-allowed_content_types .react-select__option")
      .contains('Page')
      .click();
    cy.get("#field-allowed_review_states").click();
    cy.get("#field-allowed_review_states .react-select__option")
      .contains('Private')
      .click();

    cy.get('#toolbar-save').click();
    cy.visit('/searching');

    cy.get('.block.searchkitsearch')
      .should('not.contain', 'No results')
    cy.get('.block.searchkitsearch')
      .contains('The garden in february');

    
    // cy.visit('/garden-blog/contents');
  });
});
