describe('Todo App E2E Tests', () => {
  const validUser = {
    username: 'testuser',
    password: 'password123'
  };

  const invalidUser = {
    username: 'wronguser',
    password: 'wrongpass'
  };

  beforeEach(() => {
    // Clear localStorage and visit the app
    cy.clearLocalStorage();
    cy.visit('/');
    
    // Ensure we start from login page
    cy.get('[data-testid="login-form"]').should('be.visible');
  });

  describe('Authentication Flow', () => {
    it('should display login form on initial visit', () => {
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="username-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
      cy.contains('Demo Credentials').should('be.visible');
    });

    it('should login with valid credentials', () => {
      // Enter valid credentials
      cy.get('[data-testid="username-input"]')
        .type(validUser.username)
        .should('have.value', validUser.username);

      cy.get('[data-testid="password-input"]')
        .type(validUser.password)
        .should('have.value', validUser.password);

      // Submit form
      cy.get('[data-testid="login-button"]').click();

      // Should redirect to main app
      cy.get('[data-testid="welcome-message"]')
        .should('contain', `Welcome, ${validUser.username}!`);
      
      cy.get('[data-testid="add-todo-form"]').should('be.visible');
      cy.get('[data-testid="logout-button"]').should('be.visible');

      // Verify localStorage contains auth data
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.exist;
        expect(win.localStorage.getItem('user')).to.contain(validUser.username);
      });
    });

    it('should reject invalid credentials', () => {
      // Enter invalid credentials
      cy.get('[data-testid="username-input"]').type(invalidUser.username);
      cy.get('[data-testid="password-input"]').type(invalidUser.password);
      cy.get('[data-testid="login-button"]').click();

      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid credentials');

      // Should stay on login page
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should require both username and password', () => {
      // Try to submit empty form
      cy.get('[data-testid="login-button"]').click();
      
      // HTML5 validation should prevent submission
      cy.get('[data-testid="username-input"]').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });

    it('should logout successfully', () => {
      // Login first
      cy.login(validUser.username, validUser.password);

      // Click logout
      cy.get('[data-testid="logout-button"]').click();

      // Should return to login page
      cy.get('[data-testid="login-form"]').should('be.visible');

      // Verify localStorage is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });

  describe('Todo Management', () => {
    beforeEach(() => {
      // Login before each test
      cy.login(validUser.username, validUser.password);
    });

    it('should display existing todos after login', () => {
      // Should show todos list
      cy.get('[data-testid="todos-list"]').should('be.visible');
      
      // Should have some pre-existing todos
      cy.get('[data-testid^="todo-item-"]').should('have.length.at.least', 1);
      
      // Should show filter buttons
      cy.get('[data-testid="filter-buttons"]').should('be.visible');
      cy.get('[data-testid="filter-all"]').should('contain', 'All');
      cy.get('[data-testid="filter-active"]').should('contain', 'Active');
      cy.get('[data-testid="filter-completed"]').should('contain', 'Completed');
    });

    it('should create a new todo', () => {
      const newTodoTitle = 'New E2E Test Todo';

      // Get initial todo count
      cy.get('[data-testid^="todo-item-"]').then($todos => {
        const initialCount = $todos.length;

        // Add new todo
        cy.get('[data-testid="new-todo-input"]')
          .type(newTodoTitle)
          .should('have.value', newTodoTitle);

        cy.get('[data-testid="add-todo-button"]').click();

        // Verify todo was added
        cy.get('[data-testid^="todo-item-"]').should('have.length', initialCount + 1);
        cy.contains(newTodoTitle).should('be.visible');

        // Input should be cleared
        cy.get('[data-testid="new-todo-input"]').should('have.value', '');
      });
    });

    it('should not create todo with empty title', () => {
      // Try to add empty todo
      cy.get('[data-testid="add-todo-button"]').should('be.disabled');

      // Try with whitespace only
      cy.get('[data-testid="new-todo-input"]').type('   ');
      cy.get('[data-testid="add-todo-button"]').should('be.disabled');
    });

    it('should edit an existing todo', () => {
      const updatedTitle = 'Updated Todo Title';

      // Find first todo and edit it
      cy.get('[data-testid^="todo-item-"]').first().within(() => {
        // Click edit button
        cy.get('[data-testid^="edit-button-"]').click();

        // Edit input should appear
        cy.get('[data-testid^="edit-input-"]')
          .should('be.visible')
          .clear()
          .type(updatedTitle);

        // Save changes
        cy.get('[data-testid^="save-edit-"]').click();
      });

      // Verify the todo was updated
      cy.contains(updatedTitle).should('be.visible');
    });

    it('should cancel editing a todo', () => {
      // Find first todo and start editing
      cy.get('[data-testid^="todo-item-"]').first().within(() => {
        // Get original title
        cy.get('[data-testid^="todo-title-"]').invoke('text').then((originalTitle) => {
          // Click edit button
          cy.get('[data-testid^="edit-button-"]').click();

          // Change the text
          cy.get('[data-testid^="edit-input-"]')
            .clear()
            .type('Changed but will cancel');

          // Cancel editing
          cy.get('[data-testid^="cancel-edit-"]').click();

          // Should revert to original title
          cy.get('[data-testid^="todo-title-"]').should('contain', originalTitle);
        });
      });
    });

    it('should toggle todo completion status', () => {
      // Find first active todo
      cy.get('[data-testid^="todo-item-"]').first().within(() => {
        // Check if it's completed or not
        cy.get('[data-testid^="todo-checkbox-"]').then($checkbox => {
          const wasChecked = $checkbox.prop('checked');

          // Toggle the checkbox
          cy.get('[data-testid^="todo-checkbox-"]').click();

          // Verify status changed
          cy.get('[data-testid^="todo-checkbox-"]').should(wasChecked ? 'not.be.checked' : 'be.checked');
        });
      });
    });

    it('should delete a todo', () => {
      const todoToDelete = 'Todo to Delete';

      // Create a todo to delete
      cy.get('[data-testid="new-todo-input"]').type(todoToDelete);
      cy.get('[data-testid="add-todo-button"]').click();

      // Verify it was created
      cy.contains(todoToDelete).should('be.visible');

      // Delete the todo
      cy.contains(todoToDelete).parent().parent().within(() => {
        cy.get('[data-testid^="delete-button-"]').click();
      });

      // Confirm deletion in the alert
      cy.on('window:confirm', () => true);

      // Verify todo was deleted
      cy.contains(todoToDelete).should('not.exist');
    });

    it('should filter todos correctly', () => {
      // Ensure we have both completed and active todos
      cy.get('[data-testid^="todo-checkbox-"]').first().check();
      
      // Test "All" filter (default)
      cy.get('[data-testid="filter-all"]').click();
      cy.get('[data-testid^="todo-item-"]').should('have.length.at.least', 1);

      // Test "Active" filter
      cy.get('[data-testid="filter-active"]').click();
      cy.get('[data-testid^="todo-item-"]').each($todo => {
        cy.wrap($todo).within(() => {
          cy.get('[data-testid^="todo-checkbox-"]').should('not.be.checked');
        });
      });

      // Test "Completed" filter
      cy.get('[data-testid="filter-completed"]').click();
      cy.get('[data-testid^="todo-item-"]').each($todo => {
        cy.wrap($todo).within(() => {
          cy.get('[data-testid^="todo-checkbox-"]').should('be.checked');
        });
      });
    });

    it('should display correct statistics', () => {
      // Check if stats are visible
      cy.get('[data-testid="todo-stats"]').should('be.visible');
      
      // Stats should contain Total, Active, and Completed counts
      cy.get('[data-testid="todo-stats"]').should('contain', 'Total:');
      cy.get('[data-testid="todo-stats"]').should('contain', 'Active:');
      cy.get('[data-testid="todo-stats"]').should('contain', 'Completed:');
    });

    it('should show empty state when no todos match filter', () => {
      // Clear all todos first (delete existing ones)
      cy.get('[data-testid^="todo-item-"]').each(() => {
        cy.get('[data-testid^="delete-button-"]').first().click();
        cy.on('window:confirm', () => true);
      });

      // Should show empty state
      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain', 'No todos yet');
    });

    it('should persist todos after page reload', () => {
      const persistentTodo = 'Persistent Todo';

      // Add a todo
      cy.get('[data-testid="new-todo-input"]').type(persistentTodo);
      cy.get('[data-testid="add-todo-button"]').click();

      // Verify it exists
      cy.contains(persistentTodo).should('be.visible');

      // Reload page
      cy.reload();

      // Should still be logged in and todo should exist
      cy.get('[data-testid="welcome-message"]').should('be.visible');
      cy.contains(persistentTodo).should('be.visible');
    });
  });

  describe('Keyboard Interactions', () => {
    beforeEach(() => {
      cy.login(validUser.username, validUser.password);
    });

    it('should submit new todo on Enter key', () => {
      const keyboardTodo = 'Keyboard Todo';

      cy.get('[data-testid="new-todo-input"]')
        .type(keyboardTodo)
        .type('{enter}');

      cy.contains(keyboardTodo).should('be.visible');
    });

    it('should save edit on Enter key', () => {
      const editedTitle = 'Edited with Enter';

      cy.get('[data-testid^="todo-item-"]').first().within(() => {
        cy.get('[data-testid^="edit-button-"]').click();
        cy.get('[data-testid^="edit-input-"]')
          .clear()
          .type(editedTitle)
          .type('{enter}');
      });

      cy.contains(editedTitle).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.login(validUser.username, validUser.password);
    });

    it('should handle network errors gracefully', () => {
      // Intercept API calls and return errors
      cy.intercept('POST', '/api/todos', { statusCode: 500, body: { error: 'Server error' } });

      cy.get('[data-testid="new-todo-input"]').type('Network Error Todo');
      cy.get('[data-testid="add-todo-button"]').click();

      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Failed to add todo');
    });

    it('should handle unauthorized errors by redirecting to login', () => {
      // Intercept API calls and return 401
      cy.intercept('GET', '/api/todos', { statusCode: 401, body: { error: 'Unauthorized' } });

      cy.reload();

      // Should redirect to login page
      cy.get('[data-testid="login-form"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.login(validUser.username, validUser.password);
    });

    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');

      // All main elements should be visible
      cy.get('[data-testid="welcome-message"]').should('be.visible');
      cy.get('[data-testid="new-todo-input"]').should('be.visible');
      cy.get('[data-testid="add-todo-button"]').should('be.visible');
      cy.get('[data-testid="filter-buttons"]').should('be.visible');

      // Should be able to add todo on mobile
      cy.get('[data-testid="new-todo-input"]').type('Mobile Todo');
      cy.get('[data-testid="add-todo-button"]').click();
      cy.contains('Mobile Todo').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');

      // All functionality should work on tablet
      cy.get('[data-testid="new-todo-input"]').type('Tablet Todo');
      cy.get('[data-testid="add-todo-button"]').click();
      cy.contains('Tablet Todo').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.login(validUser.username, validUser.password);
    });

    it('should have proper form labels and inputs', () => {
      // Check that inputs have proper attributes
      cy.get('[data-testid="new-todo-input"]')
        .should('have.attr', 'placeholder', 'What needs to be done?');

      // Check that buttons have meaningful text
      cy.get('[data-testid="add-todo-button"]').should('contain', 'Add Todo');
      cy.get('[data-testid="logout-button"]').should('contain', 'Logout');
    });

    it('should support keyboard navigation', () => {
      // Should be able to tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'new-todo-input');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'add-todo-button');
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      cy.login(validUser.username, validUser.password);
    });

    it('should trim whitespace from todo titles', () => {
      const todoWithSpaces = '   Spaced Todo   ';
      const trimmedTitle = 'Spaced Todo';

      cy.get('[data-testid="new-todo-input"]').type(todoWithSpaces);
      cy.get('[data-testid="add-todo-button"]').click();

      // Should display trimmed version
      cy.contains(trimmedTitle).should('be.visible');
      cy.contains(todoWithSpaces).should('not.exist');
    });

    it('should handle long todo titles', () => {
      const longTitle = 'A'.repeat(200);

      cy.get('[data-testid="new-todo-input"]').type(longTitle);
      cy.get('[data-testid="add-todo-button"]').click();

      // Should create todo with long title
      cy.contains(longTitle).should('be.visible');
    });

    it('should handle special characters in todo titles', () => {
      const specialTitle = 'Todo with émojis 🚀 & special chars <>"\'';

      cy.get('[data-testid="new-todo-input"]').type(specialTitle);
      cy.get('[data-testid="add-todo-button"]').click();

      cy.contains(specialTitle).should('be.visible');
    });
  });
});