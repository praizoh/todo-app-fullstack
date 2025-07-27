// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (username, password) => {
  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  
  // Wait for successful login
  cy.get('[data-testid="welcome-message"]').should('contain', `Welcome, ${username}!`);
});

// Custom command for creating a todo
Cypress.Commands.add('createTodo', (title) => {
  cy.get('[data-testid="new-todo-input"]').type(title);
  cy.get('[data-testid="add-todo-button"]').click();
  cy.contains(title).should('be.visible');
});

// Custom command for deleting all todos
Cypress.Commands.add('clearAllTodos', () => {
  cy.get('body').then($body => {
    if ($body.find('[data-testid^="todo-item-"]').length > 0) {
      cy.get('[data-testid^="todo-item-"]').each(() => {
        cy.get('[data-testid^="delete-button-"]').first().click();
        cy.on('window:confirm', () => true);
      });
    }
  });
});

// Custom command for keyboard navigation testing
Cypress.Commands.add('tab', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).trigger('keydown', { key: 'Tab' });
});

// Custom command to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  cy.window().then((window) => {
    const rect = subject[0].getBoundingClientRect();
    expect(rect.top).to.be.at.least(0);
    expect(rect.left).to.be.at.least(0);
    expect(rect.bottom).to.be.at.most(window.innerHeight);
    expect(rect.right).to.be.at.most(window.innerWidth);
  });
});

// Custom command to wait for API response
Cypress.Commands.add('waitForApiResponse', (alias, expectedStatus = 200) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.eq(expectedStatus);
  });
});

// Custom command to mock API responses
Cypress.Commands.add('mockApiError', (endpoint, statusCode = 500, errorMessage = 'Server error') => {
  cy.intercept('POST', endpoint, {
    statusCode: statusCode,
    body: { error: errorMessage }
  }).as('apiError');
});

// Custom command to check localStorage
Cypress.Commands.add('checkLocalStorage', (key, expectedValue = null) => {
  cy.window().then((win) => {
    if (expectedValue === null) {
      expect(win.localStorage.getItem(key)).to.be.null;
    } else {
      expect(win.localStorage.getItem(key)).to.exist;
      if (typeof expectedValue === 'string') {
        expect(win.localStorage.getItem(key)).to.contain(expectedValue);
      }
    }
  });
});

// Custom command for accessibility testing
Cypress.Commands.add('checkA11y', () => {
  // Basic accessibility checks
  cy.get('button').should('have.attr', 'type').or('have.text');
  cy.get('input').should('have.attr', 'placeholder').or('have.attr', 'aria-label');
});

// Add command to handle confirm dialogs consistently
Cypress.Commands.add('confirmDialog', (accept = true) => {
  cy.window().then((win) => {
    cy.stub(win, 'confirm').returns(accept);
  });
});

// Command to seed test data
Cypress.Commands.add('seedTestData', () => {
  // This would typically make API calls to seed the database
  // For our in-memory backend, we'll just ensure we're logged in
  cy.login('testuser', 'password123');
  
  // Create some test todos
  const testTodos = [
    'Test Todo 1',
    'Test Todo 2',
    'Test Todo 3 (Completed)'
  ];
  
  testTodos.forEach((todo, index) => {
    cy.createTodo(todo);
    if (index === 2) {
      // Mark the last one as completed
      cy.get('[data-testid^="todo-checkbox-"]').last().check();
    }
  });
});

// Command to check responsive design
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { device: 'iphone-x', width: 375, height: 812 },
    { device: 'ipad-2', width: 768, height: 1024 },
    { device: 'macbook-13', width: 1280, height: 800 }
  ];

  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height);
    
    // Check that main elements are visible and functional
    cy.get('[data-testid="welcome-message"]').should('be.visible');
    cy.get('[data-testid="new-todo-input"]').should('be.visible');
    cy.get('[data-testid="add-todo-button"]').should('be.visible');
    
    // Test basic functionality
    const testTodo = `Responsive test ${viewport.device}`;
    cy.get('[data-testid="new-todo-input"]').clear().type(testTodo);
    cy.get('[data-testid="add-todo-button"]').click();
    cy.contains(testTodo).should('be.visible');
  });
});

// Command to test API integration
Cypress.Commands.add('testApiIntegration', () => {
  // Set up API intercepts to verify correct API calls
  cy.intercept('GET', '/api/todos').as('getTodos');
  cy.intercept('POST', '/api/todos').as('createTodo');
  cy.intercept('PUT', '/api/todos/*').as('updateTodo');
  cy.intercept('DELETE', '/api/todos/*').as('deleteTodo');

  // Test create
  cy.createTodo('API Test Todo');
  cy.wait('@createTodo').then((interception) => {
    expect(interception.response.statusCode).to.eq(201);
    expect(interception.response.body).to.have.property('title', 'API Test Todo');
  });

  // Test update (toggle completion)
  cy.get('[data-testid^="todo-checkbox-"]').first().click();
  cy.wait('@updateTodo').then((interception) => {
    expect(interception.response.statusCode).to.eq(200);
  });

  // Test delete
  cy.confirmDialog(true);
  cy.get('[data-testid^="delete-button-"]').first().click();
  cy.wait('@deleteTodo').then((interception) => {
    expect(interception.response.statusCode).to.eq(200);
  });
});