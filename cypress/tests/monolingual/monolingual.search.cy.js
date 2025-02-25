describe('Searchkit block tests – search - monolingual', () => {
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
    // Wait after creating content for ingest and OpenSearch to index
    cy.wait(3000);

    // Add search block to /suche
    cy.visit('/suche/edit');
    cy.addNewBlock('searchkit');
    cy.get('#toolbar-save').click();
    cy.wait('@kitsearch');
    cy.wait('@content');
  });

  afterEach(() => {
    cy.removeContent({ path: 'garten-blog' });
    cy.removeContent({ path: 'testseite-mann' });
    cy.removeContent({ path: 'testseite-manner' });
    cy.removeContent({ path: 'testseite-lsb' });
    cy.removeContent({ path: 'testseite-s' });
    cy.removeContent({ path: 'suche' });
    cy.wait(5000);
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
    cy.get('.searchbar-wrapper input').type('Männer{enter}');
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
    // Wait after creating content for ingest and OpenSearch to index
    cy.wait(3000);

    // Searching
    // WARNING Do not use cy.navigate TODO understand difference between cy.visit and cy.navigate
    cy.visit('/suche');
    cy.get('.searchbar-wrapper input').type('Montag{enter}');
    cy.get('.block.searchkitsearch').contains('Der Garten im Februar');
  });
});
