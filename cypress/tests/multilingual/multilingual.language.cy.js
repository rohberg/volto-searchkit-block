describe('Searchkit block tests – search - multilingual - language', () => {
  beforeEach(() => {

    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    // Wait a bit to previous teardown to complete correctly because Heisenbug in this point
    cy.wait(2000);
    // given a logged in editor and a page in edit mode
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
      language: 'de',
    });

    // Add search block
    cy.visit('/en/searching/edit');
    cy.wait('@schema');

    cy.addNewBlock('searchkit');

    cy.get('#toolbar-save').click();
    cy.wait('@content');
    cy.wait('@kitsearch');
  });

  afterEach(() => {
    cy.removeContent({ path: 'en/searching' });
    cy.removeContent({ path: 'en/garden-in-february' });
    cy.removeContent({ path: 'de/der-garten-im-februar' });
    cy.wait(5000);
  });

  it('I can search within language', function () {
    cy.settings().then((settings) => {
      settings.defaultLanguage = 'en';
      settings.isMultilingual = true;
      settings.supportedLanguages = ['de', 'en'];
    });
    
    cy.get('.searchbar-wrapper input')
      .type('februax{enter}')
      .wait('@kitsearch')
      .get('.block.searchkitsearch')
      .should('not.contain', 'Der Garten im Februar')
      .get('.block.searchkitsearch')
      .contains('The garden in february');
  });
});
