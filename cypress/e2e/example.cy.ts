describe('Example Test', () => {
  it('should perform a basic search', () => {
    cy.visit('https://www.google.com');
    cy.get('[name="q"]').type('cypress testing{enter}');
    cy.contains('Search results').should('be.visible');
  });
});
