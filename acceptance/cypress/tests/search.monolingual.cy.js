describe('Searchkit block tests – search', () => {
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
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-lsb',
      contentTitle: 'Testseite Lehrstellenbörsen',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-s',
      contentTitle: 'Testseite Stelle',
    });

    // Add search block to /suche
    cy.visit('/suche');
    cy.get('a.edit').click();

    cy.getSlate().click();
    cy.get('.button .block-add-button').click({ force: true });
    cy.get('div[aria-label="Ausklappen Common blocks"]').click();
    cy.get('.blocks-chooser .common .button.searchkitblock').click({
      force: true,
    });

    cy.get('#toolbar-save').click();
    cy.wait('@kitsearch');
    cy.wait('@content');
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
    cy.removeContent({ path: 'garten-blog/februar' });
    cy.removeContent({ path: 'garten-blog/marz' });
    cy.removeContent({ path: 'garten-blog' });
    cy.removeContent({ path: 'suche' });
    cy.removeContent({ path: 'testseite-mann' });
    cy.removeContent({ path: 'testseite-manner' });
    cy.removeContent({ path: 'testseite-lsb' });
    cy.removeContent({ path: 'testseite-s' });
  });

  it('I see all if no filter selected', function () {
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });

  it('I can search fuzzy', function () {
    cy.get('.searchbar-wrapper input').type('februax{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
    cy.get('.block.searchkitsearch').should('not.contain', 'März');
  });

  it('I can search with inflection', function () {
    cy.get('.searchbar-wrapper input').clear().type('Männer{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Testseite Mann');

    cy.get('.searchbar-wrapper input').clear().type('Mann{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Testseite Männer');
  });

  it('I can search with decompounding', function () {
    cy.get('.searchbar-wrapper input').type('Garten{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Garten-Blog');

    cy.get('.searchbar-wrapper input').clear().type('Garten-Blog{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Februar');
  });

  it('I can search with wildcard', function () {
    cy.get('.searchbar-wrapper input').type('Feb*{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });

  it('I can search for an exact match', function () {
    cy.get('.searchbar-wrapper input').type('"Mann"{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Testseite Mann');

    cy.get('.searchbar-wrapper input').clear().type('"Mann"{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').should('not.contain', 'Männer');
  });

  it('I can search for a compounded word', function () {
    cy.get('.searchbar-wrapper input').type('stelle{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Testseite Lehrstellenbörsen');

    cy.get('.searchbar-wrapper input').clear().type('Lehre{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Testseite Lehrstellenbörsen');

    cy.get('.searchbar-wrapper input').clear().type('Börse{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Testseite Lehrstellenbörsen');

    cy.get('.searchbar-wrapper input').clear().type('Lehrstellenbörse{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Testseite Stelle');
  });

  // Blocks text
  it('I can search in blocks', function () {
    cy.visit('/garten-blog/februar');
    cy.get('a.edit').click();

    cy.getSlate().click();
    cy.log('when I add a text block');
    cy.getSlateEditorAndType('Montags gehen wir in den Zoo.').contains(
      'Montags gehen wir in den Zoo.',
    );
    // cy.toolbarSave();
    cy.get('#toolbar-save').click();
    cy.wait('@content');

    cy.log('I added a text block');

    // Searching
    cy.visit('/suche');
    cy.wait('@kitsearch');
    cy.get('.searchbar-wrapper input').type('Montag{enter}');
    cy.wait('@kitsearch');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });
});
