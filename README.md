# Cypress MCP Test Generator

This project provides a Model Context Protocol (MCP) server that generates Cypress tests from natural language prompts. Simply describe your test scenario in plain English, and the server will generate a fully functional Cypress test.

## Table of Contents
- [Setup](#setup)
- [Installation](#installation)
- [Usage](#usage)
- [Example Prompts](#example-prompts)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)
- VS Code
- TypeScript

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd your-project-directory
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Create VS Code MCP configuration:
```bash
mkdir -p .vscode
```

5. Create `.vscode/mcp.json` with the following content (update the path to match your system):
```json
{
  "servers": {
    "cypress-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/your/project/build/index.js"]
    }
  }
}
```

## Usage

1. Open your project in VS Code
2. The MCP server will start automatically
3. Open VS Code's command palette and type your test description
4. The server will generate a Cypress test based on your description

### How it Works

1. Your natural language prompt is processed by the MCP server
2. The server generates appropriate Cypress commands and assertions
3. A new test file is created in the cypress/e2e directory
4. The test is ready to run using Cypress

## Example Prompts

Here are some example prompts you can use:

1. Basic Navigation and Search:
```
"Go to google.com and search for 'cypress testing'"
```
Generated test will:
- Navigate to Google
- Handle cookie consent if present
- Type search term
- Verify search results

2. Login Flow:
```
"Visit login page, enter username 'test@example.com', type password 'password123', click login button, and verify dashboard appears"
```
Generated test will:
- Navigate to login page
- Fill in credentials
- Submit form
- Verify successful login

3. Form Submission:
```
"Navigate to contact-form.com, fill in name 'John Doe', enter email 'john@example.com', type message 'Hello World', click submit button, and verify success message appears"
```

## Configuration

### Project Structure
```
project-root/
├── src/
│   ├── index.ts          # MCP server implementation
│   └── cypress/
│       └── commands.ts   # Custom Cypress commands
├── cypress/
│   ├── e2e/             # Generated test files
│   └── support/         # Support files
└── .vscode/
    └── mcp.json         # MCP server configuration
```

### Customizing the Server

You can customize test generation by modifying:
- Test templates in src/index.ts
- Custom commands in src/cypress/commands.ts
- Error handling and retry mechanisms

## Troubleshooting

### Common Issues

1. **Server Not Starting**
   - Verify paths in mcp.json are correct
   - Check build/index.js exists
   - Ensure Node.js version is compatible

2. **Test Generation Fails**
   - Check prompt format
   - Verify server logs for errors
   - Ensure all dependencies are installed

3. **VS Code Integration Issues**
   - Reload VS Code window
   - Check VS Code's output panel for errors
   - Verify .vscode/mcp.json configuration

### Error Messages

1. "Server exited before responding"
   - Check file paths in mcp.json
   - Rebuild the project
   - Restart VS Code

2. "Cannot find module"
   - Run npm install
   - Check build folder exists
   - Rebuild the project

### Logs Location

- Server logs: VS Code's Output panel (Cypress MCP Server)
- Generated test files: cypress/e2e directory
- Build output: build directory

## Script Commands

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js",
    "dev": "tsc --watch",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

## Best Practices for Prompts

1. **Be Specific**
   - Include URLs when applicable
   - Specify exact text for inputs
   - Mention expected verifications

2. **Use Clear Actions**
   - "visit" or "go to" for navigation
   - "type" or "enter" for input
   - "click" for button interactions
   - "verify" or "check" for assertions

3. **Include Verification Steps**
   - Mention what should appear after actions
   - Include expected text or elements
   - Specify timeouts if needed

## Support

For issues and questions:
1. Check the troubleshooting guide
2. Review server logs
3. Check VS Code's output panel
4. Verify file paths and configurations

## Notes

- The server automatically handles common scenarios like cookie consent dialogs
- Generated tests include retry mechanisms for reliability
- Custom commands are available for complex interactions
- Tests are generated with TypeScript support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details
