// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import additional libraries
// import 'cypress-axe'; // For accessibility testing
// import '@cypress/code-coverage/support'; // For code coverage

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // Return false to prevent the error from failing this test
  console.error('Uncaught exception:', err.message);
  return false;
});

// Global before hook
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Set up common intercepts
  cy.intercept('GET', '/api/health', { fixture: 'health.json' }).as('healthCheck');
  
  // Add common viewport for consistency
  cy.viewport(1280, 720);
});

// Global after hook
afterEach(() => {
  // Take screenshot on failure
  cy.screenshot({ capture: 'runner', onlyOnFailure: true });
});

// Add global custom commands for common patterns
Cypress.Commands.add('waitForApp', () => {
  // Wait for the app to fully load
  cy.get('body').should('be.visible');
  cy.get('[data-testid="login-form"], [data-testid="welcome-message"]').should('be.visible');
});

Cypress.Commands.add('loginAndWait', (username = 'testuser', password = 'password123') => {
  cy.visit('/');
  cy.waitForApp();
  
  // Only login if not already logged in
  cy.get('body').then($body => {
    if ($body.find('[data-testid="login-form"]').length > 0) {
      cy.login(username, password);
    }
  });
});

// Performance monitoring
Cypress.Commands.add('measurePerformance', (name) => {
  cy.window().then((win) => {
    win.performance.mark(`${name}-start`);
  });
});

Cypress.Commands.add('endPerformanceMeasure', (name) => {
  cy.window().then((win) => {
    win.performance.mark(`${name}-end`);
    win.performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = win.performance.getEntriesByName(name)[0];
    cy.log(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
  });
});

// Network condition simulation
Cypress.Commands.add('simulateSlowNetwork', () => {
  cy.intercept('**', (req) => {
    // Add artificial delay
    req.reply((res) => {
      res.delay(1000);
    });
  });
});

// Dark mode testing support
Cypress.Commands.add('toggleDarkMode', () => {
  cy.get('body').invoke('addClass', 'dark-mode');
});

// Accessibility testing helpers
Cypress.Commands.add('checkBasicA11y', () => {
  // Check for basic accessibility requirements
  cy.get('img').should('have.attr', 'alt');
  cy.get('button').should('not.be.empty');
  cy.get('input').should('have.attr', 'placeholder').or('have.attr', 'aria-label');
});

// API response validation
Cypress.Commands.add('validateApiResponse', (alias, expectedSchema) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    
    if (expectedSchema) {
      const response = interception.response.body;
      Object.keys(expectedSchema).forEach(key => {
        expect(response).to.have.property(key);
        if (expectedSchema[key] !== null) {
          expect(typeof response[key]).to.equal(expectedSchema[key]);
        }
      });
    }
  });
});

// Console log monitoring
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then((win) => {
    const consoleLogs = [];
    const originalConsoleError = win.console.error;
    
    win.console.error = (...args) => {
      consoleLogs.push(args);
      originalConsoleError.apply(win.console, args);
    };
    
    // Check for console errors after test
    cy.then(() => {
      if (consoleLogs.length > 0) {
        cy.log('Console errors found:', consoleLogs);
        throw new Error(`Console errors detected: ${consoleLogs.join(', ')}`);
      }
    });
  });
});

// Browser storage utilities
Cypress.Commands.add('getLocalStorageItem', (key) => {
  cy.window().then((win) => {
    return win.localStorage.getItem(key);
  });
});

Cypress.Commands.add('setLocalStorageItem', (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

// Custom assertion for todo item structure
Cypress.Commands.add('validateTodoStructure', { prevSubject: true }, (subject) => {
  cy.wrap(subject).within(() => {
    cy.get('[data-testid^="todo-checkbox-"]').should('exist');
    cy.get('[data-testid^="todo-title-"]').should('exist').and('not.be.empty');
    cy.get('[data-testid^="edit-button-"], [data-testid^="save-edit-"]').should('exist');
    cy.get('[data-testid^="delete-button-"], [data-testid^="cancel-edit-"]').should('exist');
  });
});