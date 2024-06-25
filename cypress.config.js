const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 1280,
  retries: {
    runMode: 3,
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    specPattern: 'cypress/tests/**/*.cy.{js,jsx,ts,tsx}',
  },
});
