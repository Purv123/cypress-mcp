describe('Contact Form Test', () => {
  beforeEach(() => {
    // Set a larger viewport for better visibility
    cy.viewport(1280, 720);
  });

  it('should submit contact form successfully', () => {
    // Visit the contact form page
    cy.visit('https://contact-form.com');

    // Fill in the form fields
    cy.get('[name="name"], input[placeholder="Name"], #name')
      .type('John Doe');
    
    cy.get('[name="email"], input[placeholder="Email"], #email')
      .type('john@example.com');
    
    cy.get('[name="message"], textarea[placeholder="Message"], #message')
      .type('Hello World');

    // Submit the form
    cy.get('button[type="submit"], input[type="submit"], #submit')
      .click();

    // Verify success message appears
    cy.contains('success', { matchCase: false })
      .should('be.visible');

    // Alternative success message checks
    cy.get('.success-message, .alert-success, #success-message')
      .should('exist')
      .and('be.visible');
  });
});
