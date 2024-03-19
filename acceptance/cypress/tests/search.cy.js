describe('Searchkit block tests – search', () => {
  before(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');

    cy.autologin();

    cy.createContent({
      contentType: 'Document',
      contentId: 'suche',
      contentTitle: 'Suche',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'garten-blog',
      contentTitle: 'Garten-Blog',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'februar',
      contentTitle: 'Der Garten im Februar',
      path: '/garten-blog',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'marz',
      contentTitle: 'Der Garten im März',
      path: '/garten-blog',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-mann',
      contentTitle: 'Testseite Mann',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-manner',
      contentTitle: 'Testseite Männer',
    });

    cy.visit('/suche/edit');
    cy.wait('@schema');

    cy.getSlate().click();
    cy.get('.button .block-add-button').click({ force: true });
    cy.get('div[aria-label="Unfold Common blocks"]').click();
    cy.get('.blocks-chooser .common .button.searchkitblock').click({
      force: true,
    });

    cy.get('#toolbar-save').click();
    cy.wait('@content');
  });

  beforeEach(() => {
    cy.intercept('GET', `/**/*?expand*`).as('content');
    cy.intercept('GET', '/**/Document').as('schema');
    cy.intercept('GET', '/**/@kitsearch').as('kitsearch');

    cy.autologin();

    cy.visit('/suche');
    cy.wait(5000);
    // cy.wait('@kitsearch');
  });

  after(() => {
    cy.removeContent({ path: 'garten-blog/februar' });
    cy.removeContent({ path: 'garten-blog/marz' });
    cy.removeContent({ path: 'garten-blog' });
    cy.removeContent({ path: 'suche' });
    cy.removeContent({ path: 'testseite-mann' });
    cy.removeContent({ path: 'testseite-manner' });
  });

  it('I see all if no filter selected', function () {
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });

  it('I can search fuzzy', function () {
    cy.get('.searchbar-wrapper input').type('februax{enter}');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
    cy.get('.block.searchkitsearch').should('not.contain', 'März');
  });

  it('I can search with inflection', function () {
    cy.get('.searchbar-wrapper input').type('Schnelltestkit{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Mann');

    cy.get('.searchbar-wrapper input').clear().type('Männer{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Mann');

    cy.get('.searchbar-wrapper input').clear().type('Mann{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Männer');
  });

  it('I can search with decompounding', function () {
    cy.get('.searchbar-wrapper input').type('Garten{enter}');
    cy.get('.block.searchkitsearch').contains('Garten-Blog');

    cy.get('.searchbar-wrapper input').clear().type('Garten-Blog{enter}');
    cy.get('.block.searchkitsearch').contains('Februar');
  });

  it('I can search with wildcard', function () {
    cy.get('.searchbar-wrapper input').type('Feb*{enter}');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });

  it('I can search for an exact match', function () {
    cy.get('.searchbar-wrapper input').type('"Mann"{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Mann');
    cy.get('.searchbar-wrapper input').clear().type('"Mann"{enter}');
    cy.get('.block.searchkitsearch').should('not.contain', 'Männer');
  });
});