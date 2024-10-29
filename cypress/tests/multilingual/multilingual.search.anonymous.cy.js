describe('Searchkit block tests – search - multilingual - anonymous', () => {
  before(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');

    cy.autologin();

    cy.createContent({
      contentType: 'Document',
      contentId: 'searching',
      contentTitle: 'Searching',
      path: 'en',
    });

    cy.setWorkflow({
      path: 'en/searching',
      review_state: 'publish',
      effective: '2018-01-01T08:00:00',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-in-february',
      contentTitle: 'The garden in february',
      path: 'en',
    });

    cy.setWorkflow({
      path: 'en/garden-in-february',
      review_state: 'publish',
      effective: '2018-01-01T08:00:00',
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-in-march',
      contentTitle: 'The garden in march',
      path: 'en',
    });

    // Add search block
    cy.visit('/en/searching/edit');
    cy.wait('@schema');

    cy.addNewBlock('searchkit');

    cy.get('#toolbar-save').click();
    cy.wait('@content');
    cy.wait('@kitsearch');
  });

  beforeEach(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');

    cy.autologin();

    cy.visit('/en/searching');
    cy.wait('@kitsearch');
  });

  after(() => {
    cy.removeContent({ path: 'en/searching' });
    cy.removeContent({ path: 'en/garden-in-february' });
    cy.removeContent({ path: 'en/garden-in-march' });
  });

  it('I can search', function () {
    cy.settings().then((settings) => {
      settings.defaultLanguage = 'en';
      settings.isMultilingual = true;
      settings.supportedLanguages = ['de', 'en'];
    });
    cy.get('.searchbar-wrapper input').type('february{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');
    cy.get('.searchbar-wrapper input').clear().type('march{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in march');
  });

  it('As anonymous I see only published content', function () {
    cy.settings().then((settings) => {
      settings.defaultLanguage = 'en';
      settings.isMultilingual = true;
      settings.supportedLanguages = ['de', 'en'];
    });
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('/**/@logout').as('logout');

    cy.visit('/logout');
    cy.wait('@logout');

    cy.visit('/en/searching');
    cy.wait('@kitsearch');

    cy.get('.searchbar-wrapper input').type('february{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');

    cy.get('.searchbar-wrapper input').clear().type('march{enter}');
    cy.get('.block.searchkitsearch').should(
      'not.contain',
      'The garden in march',
    );
  });
});
