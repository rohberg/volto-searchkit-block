describe('Searchkit block tests – search - monolingual', () => {
  before(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');

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
    cy.visit('/suche');
    cy.get('a.edit').click();

    cy.addNewBlock('searchkit');

    cy.get('#toolbar-save').click();
    cy.wait('@kitsearch');
    cy.wait('@content');
    // TODO Replace this desperate wait per seconds
    cy.wait(3000);
  });

  beforeEach(() => {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.autologin();

    cy.visit('/suche');
    cy.wait('@kitsearch');
    cy.wait('@content');
  });

  after(() => {
    cy.removeContent({ path: 'brunch' });
    cy.removeContent({ path: 'ausflug' });
    cy.removeContent({ path: 'suche' });
  });

  it('I see the publishing date', function () {
    cy.get('.searchbar-wrapper input').type('brunch{enter}');
    cy.get('.block.searchkitsearch').contains('2018');
  });

  it('I see the start date', function () {
    cy.get('.searchbar-wrapper input').type('matterhorn{enter}');
    // 01.01<b>.202</b>5
    cy.get('.block.searchkitsearch').contains('.202');
  });

  it('I can open a result', function () {
    cy.get('.searchbar-wrapper input').type('matterhorn{enter}');
    cy.get('.searchkitresultitem a').first().click();
    cy.get('.block').contains('Matterhorn');
  });
});
