describe('Searchkit block tests – search - monolingual', () => {
  beforeEach(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');
    // Wait a bit to previous teardown to complete correctly because Heisenbug in this point
    cy.wait(2000);
    // given a logged in editor and a page in edit mode
    cy.autologin();

    cy.createContent({
      contentType: 'Document',
      contentId: 'suche',
      contentTitle: 'Suche',
    });

    cy.createContent({
      contentType: 'News Item',
      contentId: 'brunch',
      contentTitle: 'Brunch - Viel gelacht und lecker gegessen',
    });
    cy.createContent({
      contentType: 'Event',
      contentId: 'ausflug',
      contentTitle: 'Ausflug Matterhorn',
    });

    // Publish News Item
    cy.setWorkflow({
      path: 'brunch',
      review_state: 'publish',
      effective: '2018-01-01T08:00:00',
    });

    // Add search block to /suche
    cy.visit('/suche/edit');
    cy.addNewBlock('searchkit');
    cy.get('#toolbar-save').click();
    cy.wait('@kitsearch');
    cy.wait('@content');
  });

  afterEach(() => {
    cy.removeContent({ path: 'brunch' });
    cy.removeContent({ path: 'ausflug' });
    cy.removeContent({ path: 'suche' });
    cy.wait(5000);
  });

  it('I see the publishing date', function () {
    cy.get('.searchbar-wrapper input').type('brunch{enter}');
    cy.get('.block.searchkitsearch').contains('2018');
  });

  it('I see the start date', function () {
    cy.get('.searchbar-wrapper input').type('matterhorn{enter}');
    // 29.10<b>.202</b>4
    cy.get('.block.searchkitsearch').contains('.202');
  });

  it('I can open a result', function () {
    cy.get('.searchbar-wrapper input').type('matterhorn{enter}');
    cy.get('.searchkitresultitem a').first().click();
    cy.get('.block').contains('Matterhorn');
  });
});
