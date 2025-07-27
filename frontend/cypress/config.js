const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Test configuration
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video and screenshot settings
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:5000/api'
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Task for seeding data (if needed)
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Clear localStorage task
        clearLocalStorage() {
          // This would be handled by the browser, but can be useful for debugging
          return null;
        }
      });

      // Coverage report configuration (if using code coverage)
      // require('@cypress/code-coverage/task')(on, config);
      
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  },
});