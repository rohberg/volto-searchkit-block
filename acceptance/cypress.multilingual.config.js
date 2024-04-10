const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1280,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/tests/*.multilingual.cy.{js,jsx}',
  },
});
