describe('Login Test', () => {
  beforeEach(() => {
    // Set a larger viewport for better visibility
    cy.viewport(1280, 720);
  });

  it('should login successfully and access dashboard', () => {
    // Visit the login page
    cy.visit('https://example.com/login');

    // Fill in login credentials
    cy.get('[name="email"], input[placeholder="Email"], input[type="email"], #email')
      .type('testuser@example.com');
    
    cy.get('[name="password"], input[placeholder="Password"], input[type="password"], #password')
      .type('password123');

    // Click login button
    cy.get('button:contains("Login"), input[type="submit"], #login-button, .login-button')
      .click();

    // Verify dashboard appears
    // Looking for common dashboard indicators
    cy.get('.dashboard, #dashboard, [data-testid="dashboard"]')
      .should('be.visible');

    // Additional dashboard verifications
    cy.url()
      .should('include', '/dashboard');
    
    // Verify typical dashboard elements
    cy.get('.user-profile, .welcome-message, .dashboard-header')
      .should('exist');
  });

  // Add a negative test case
  it('should show error with invalid credentials', () => {
    cy.visit('https://example.com/login');

    cy.get('[name="email"], input[placeholder="Email"], input[type="email"], #email')
      .type('invalid@example.com');
    
    cy.get('[name="password"], input[placeholder="Password"], input[type="password"], #password')
      .type('wrongpassword');

    cy.get('button:contains("Login"), input[type="submit"], #login-button, .login-button')
      .click();

    // Check for error message
    cy.get('.error-message, .alert-error, #error-message')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });
});
