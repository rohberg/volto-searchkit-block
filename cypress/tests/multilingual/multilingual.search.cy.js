describe('Searchkit block tests – search -multilingual - fuzzy etc', () => {
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
      contentId: 'suche',
      contentTitle: 'Suche',
      path: '/de',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'garten-blog',
      contentTitle: 'Garten-Blog',
      path: '/de',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'februar',
      contentTitle: 'Der Garten im Februar',
      path: '/de/garten-blog',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'marz',
      contentTitle: 'Der Garten im März',
      path: '/de/garten-blog',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-mann',
      contentTitle: 'Testseite Mann',
      path: '/de',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-manner',
      contentTitle: 'Testseite Männer',
      path: '/de',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-lsb',
      contentTitle: 'Testseite Lehrstellenbörsen',
      path: '/de',
    });
    cy.createContent({
      contentType: 'Document',
      contentId: 'testseite-s',
      contentTitle: 'Testseite Stelle',
      path: '/de',
    });
    // Wait after creating content for ingest and OpenSearch to index
    cy.wait(2000);

    // Add search block
    cy.visit('/de/suche/edit');
    cy.wait('@schema');

    cy.addNewBlock('searchkit');

    cy.get('#toolbar-save').click();
    cy.wait('@content');
    cy.wait('@kitsearch');
  });

  afterEach(() => {
    // cy.removeContent({ path: 'de/garten-blog/februar' });
    // cy.removeContent({ path: 'de/garten-blog/marz' });
    cy.removeContent({ path: 'de/garten-blog' });
    cy.removeContent({ path: 'de/testseite-mann' });
    cy.removeContent({ path: 'de/testseite-manner' });
    cy.removeContent({ path: 'de/testseite-lsb' });
    cy.removeContent({ path: 'de/testseite-s' });
    cy.removeContent({ path: 'de/suche' });
    cy.wait(2000);
  });

  it('I see all if no filter selected', function () {
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
    cy.screenshot();
  });

  it('I can search fuzzy', function () {
    cy.get('.searchbar-wrapper input').type('februax{enter}');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
    cy.get('.block.searchkitsearch').should('not.contain', 'März');
  });

  it('I can search with inflection', function () {
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

  it('I can search for a compounded word', function () {
    cy.get('.searchbar-wrapper input').type('stelle{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Lehrstellenbörsen');
    cy.get('.searchbar-wrapper input').clear().type('Lehre{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Lehrstellenbörsen');
    cy.get('.searchbar-wrapper input').clear().type('Börse{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Lehrstellenbörsen');
    cy.get('.searchbar-wrapper input').clear().type('Lehrstellenbörse{enter}');
    cy.get('.block.searchkitsearch').contains('Testseite Stelle');
  });

  // Blocks text
  it('I can search in blocks', function () {
    cy.intercept('POST', '/**/@kitsearch').as('kitsearch');
    cy.visit('/de/garten-blog/februar');
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
    // Wait after creating content for ingest and OpenSearch to index
    cy.wait(1000);

    // Searching
    cy.visit('de/suche');
    cy.wait('@kitsearch');
    cy.get('.searchbar-wrapper input').type('Montag{enter}');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });
});
