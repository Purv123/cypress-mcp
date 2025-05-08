import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        // Custom tasks can be added here
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
