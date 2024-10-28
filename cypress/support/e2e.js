import 'cypress-axe';
import 'cypress-file-upload';
import './commands';
import 'cypress-axe';
import { setup, teardown } from '@plone/volto/cypress/support/reset-fixture';

// // 1. Disable Cypress uncaught exception failures from React hydration errors
// Cypress.on('uncaught:exception', (err) => {
//   // Cypress and React Hydrating the document don't get along
//   // for some unknown reason. Hopefully, we figure out why eventually
//   // so we can remove this.
//   if (
//     /ResizeObserver loop/.test(err.message) ||
//     /hydrat/i.test(err.message) ||
//     /Minified React error #418/.test(err.message) ||
//     /Minified React error #423/.test(err.message)
//   ) {
//     return false;
//   }
// });

beforeEach(function () {
  cy.log('Setting up API fixture');
  setup();
});

afterEach(function () {
  cy.log('Tearing down API fixture');
  teardown();
});
