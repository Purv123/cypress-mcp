describe('Google Search', () => {
  beforeEach(() => {
    // Set larger viewport for better visibility
    cy.viewport(1280, 720);
    
    // Visit Google with retry mechanism
    cy.retryAction(() => {
      cy.visit('https://www.google.com', {
        failOnStatusCode: false,
        retryOnNetworkFailure: true,
        timeout: 30000
      });
    });
  });

  it('should search for amazon on Google', () => {
    // Accept cookies if the dialog appears
    cy.get('body').then($body => {
      if ($body.find('button[id="L2AGLb"]').length > 0) {
        cy.get('button[id="L2AGLb"]').click();
      }
    });

    // Type search query into Google search box
    cy.waitAndGet('input[name="q"], textarea[name="q"]', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true })
      .clear()
      .type('amazon{enter}');

    // Verify search results
    cy.waitAndGet('#search', { timeout: 10000 })
      .should('be.visible')
      .should('contain', 'amazon');
    
    // Verify we're on the results page
    cy.url()
      .should('include', 'google.com/search')
      .should('include', 'amazon');
  });
});
