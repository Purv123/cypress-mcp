/// <reference types="cypress" />

// Extend Cypress namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to retry an action multiple times
     * @param action - The action to retry
     * @param options - Retry options
     */
    retryAction(
      action: () => void,
      options?: { maxAttempts?: number; delay?: number }
    ): Chainable;

    /**
     * Custom command to wait for an element and verify it's visible
     * @param selector - Element selector
     * @param options - Wait options
     */
    waitAndGet(
      selector: string,
      options?: { timeout?: number }
    ): Chainable;
  }
}

// Implementation of custom commands
Cypress.Commands.add('retryAction', { prevSubject: false }, (action, options = { maxAttempts: 3, delay: 1000 }) => {
  let attempts = 0;
  const attempt = () => {
    attempts++;
    try {
      return action();
    } catch (error) {
      if (attempts === options.maxAttempts) {
        throw error;
      }
      // Ensure delay is a number for cy.wait
      cy.wait(options.delay || 1000);
      return attempt();
    }
  };
  return attempt();
});

Cypress.Commands.add('waitAndGet', { prevSubject: false }, (selector, options = { timeout: 10000 }) => {
  return cy.get(selector, { timeout: options.timeout })
    .should('exist')
    .and('be.visible');
});

// Custom command to execute MCP commands
Cypress.Commands.add('executeCommand', (command: string) => {
  // Log the command for debugging
  cy.task('log', `Executing command: ${command}`);
  
  // Parse and execute the command
  const [action, ...args] = command.split(' ');
  
  switch (action.toLowerCase()) {
    case 'visit':
      cy.visit(args.join(' '));
      break;
      
    case 'click':
      cy.get(args.join(' ')).click();
      break;
      
    case 'type':
      const selector = args[0];
      const text = args.slice(1).join(' ');
      cy.get(selector).type(text);
      break;
      
    case 'contains':
      cy.contains(args.join(' '));
      break;
      
    default:
      throw new Error(`Unknown command: ${action}`);
  }
});
