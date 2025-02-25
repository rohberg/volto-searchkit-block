describe('Searchkit block tests – search - multilingual - anonymous', () => {
  beforeEach(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    // Wait a bit to previous teardown to complete correctly because Heisenbug in this point
    cy.wait(2000);
    // given a logged in editor and a page in edit mode
    cy.autologin();

    cy.visit('/en/');

    cy.createContent({
      contentType: 'Document',
      contentId: 'searching',
      contentTitle: 'Searching',
      path: 'en',
      bodyModifier(body) {
        body.language = 'de';
        return body;
      },
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
      bodyModifier(body) {
        body.language = 'de';
        return body;
      },
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
      bodyModifier(body) {
        body.language = 'de';
        return body;
      },
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
    cy.removeContent({ path: 'en/garden-in-march' });
    cy.wait(5000);
  });

  it('I can search', function () {
    cy.visit('/en/searching');
    cy.wait('@kitsearch');
    cy.get('.searchbar-wrapper input').type('february{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in february');
    cy.get('.block.searchkitsearch').should(
      'not.contain',
      'The garden in march',
    );
    cy.get('.searchbar-wrapper input').clear().type('march{enter}');
    cy.get('.block.searchkitsearch').contains('The garden in march');
  });

  it('As anonymous I see only published content', function () {
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
