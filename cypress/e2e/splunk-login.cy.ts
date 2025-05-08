describe('Splunk Observability Cloud Login', () => {
  beforeEach(() => {
    // Ignore uncaught exceptions and application errors
    Cypress.on('uncaught:exception', (err) => {
      cy.log(`Ignoring application error: ${err.message}`);
      return false;
    });

    // Set larger viewport for better visibility
    cy.viewport(1280, 720);

    // Visit page with retries
    cy.retryAction(() => {
      cy.visit('https://mon.signalfx.com/#/signin', {
        failOnStatusCode: false,
        retryOnNetworkFailure: true,
        timeout: 30000
      });
    }, { maxAttempts: 3, delay: 2000 });
  });

  it('should login successfully to Splunk Observability Cloud', () => {
    // Handle initial screen with retry
    cy.retryAction(() => {
      cy.get('body').then($body => {
        const buttonText = 'Sign in with your Splunk Observability Cloud username & password';
        if ($body.text().includes(buttonText)) {
          cy.log('Found alternative login button, clicking it...');
          cy.contains(buttonText).click({ force: true });
          cy.wait(2000);
        }
      });
    });

    // Input email using custom wait command
    cy.waitAndGet('input[placeholder*="mail"], input[type="email"]', { timeout: 10000 })
      .click({ force: true })
      .clear()
      .type('mihirgan@cisco.com', { delay: 100 });

    // Input password using custom wait command
    cy.waitAndGet('input[placeholder*="assword"], input[type="password"]', { timeout: 10000 })
      .click({ force: true })
      .clear()
      .type('P@ssword1234', { delay: 100, log: false });

    // Click sign in with retry
    cy.retryAction(() => {
      cy.waitAndGet('button[type="submit"], button:contains("Sign in")', { timeout: 10000 })
        .click({ force: true });
    });

    // Verify login with retry
    cy.retryAction(() => {
      cy.waitAndGet('div[title="Full Name"]', { timeout: 30000 })
        .should('contain', 'Mihir');
    });

    // Additional URL verification
    cy.url().should('include', 'mon.signalfx.com')
      .and('not.include', 'signin');
  });
});
