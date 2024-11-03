describe('Searchkit block tests – search - multilingual - language', () => {
  beforeEach(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    // Wait a bit to previous teardown to complete correctly because Heisenbug in this point
    cy.wait(2000);
    cy.autologin();

    cy.createContent({
      contentType: 'Document',
      contentId: 'suche',
      contentTitle: 'Suche',
      path: 'de',
      bodyModifier(body) {
        body.language = 'de';
        return body;
      },
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'der-garten-im-februar',
      contentTitle: 'Der Garten im Februar',
      path: 'de',
      bodyModifier(body) {
        body.language = 'de';
        return body;
      },
    });

    cy.createContent({
      contentType: 'Document',
      contentId: 'garden-in-february',
      contentTitle: 'The garden in february',
      path: 'en',
      bodyModifier(body) {
        body.language = 'en';
        return body;
      },
    });

    // Add search block
    cy.visit('/de/suche/edit');
    cy.wait('@schema');

    cy.addNewBlock('searchkit');

    cy.get('#toolbar-save').click();
    cy.wait('@content');
    cy.wait('@kitsearch');
  });

  afterEach(() => {
    cy.removeContent({ path: 'de/suche' });
    cy.removeContent({ path: 'en/garden-in-february' });
    cy.removeContent({ path: 'de/der-garten-im-februar' });
    cy.wait(5000);
  });

  it('I can search within language', function () {
    cy.visit('/de/suche');
    cy.get('.searchbar-wrapper input')
      .type('februax{enter}')
      .wait('@kitsearch');
    cy.get('.block.searchkitsearch').should(
      'not.contain',
      'The garden in february',
    );
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });
});
