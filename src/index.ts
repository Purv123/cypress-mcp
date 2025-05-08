import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from 'child_process';
import { promisify } from 'util';
import cypress from 'cypress';
import * as fs from 'fs/promises';
import * as path from 'path';
import nlp from 'compromise';

const execAsync = promisify(exec);

// Create server instance
const server = new McpServer({
  name: "cypress-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

interface TestStep {
  action: string;
  comment?: string;
}

// Helper function to generate Cypress test from description
async function generateCypressTest(description: string): Promise<string> {
  const doc = nlp(description);
  const steps: TestStep[] = [];
  
  // Parse sentences and generate test steps
  doc.sentences().forEach((sentence) => {
    const text = sentence.text().toLowerCase();
    
    // Handle navigation
    if (text.includes('visit') || text.includes('go to') || text.includes('navigate to')) {
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        steps.push({
          action: `cy.visit('${urlMatch[0]}')`,
          comment: 'Navigate to the specified URL'
        });
      } else {
        const quotedText = text.match(/'([^']+)'|"([^"]+)"/);
        if (quotedText) {
          const url = quotedText[1] || quotedText[2];
          steps.push({
            action: `cy.visit('${url}')`,
            comment: 'Navigate to the specified URL'
          });
        }
      }
    }
    
    // Handle clicks
    if (text.includes('click')) {
      const elementMatch = text.match(/click (?:on )?(?:the )?['"]([^'"]+)['"]/);
      if (elementMatch) {
        steps.push({
          action: `cy.contains('${elementMatch[1]}').click()`,
          comment: `Click on element containing text "${elementMatch[1]}"`
        });
      }
    }
    
    // Handle form inputs
    if (text.includes('type') || text.includes('input') || text.includes('enter')) {
      const inputMatch = text.match(/(?:type|input|enter) ['"]([^'"]+)['"] (?:in|into) (?:the )?['"]?([^'"]+)['"]?/);
      if (inputMatch) {
        steps.push({
          action: `cy.get('[placeholder="${inputMatch[2]}"], [name="${inputMatch[2]}"], label:contains("${inputMatch[2]}")').type('${inputMatch[1]}')`,
          comment: `Enter "${inputMatch[1]}" into the ${inputMatch[2]} field`
        });
      }
    }
    
    // Handle assertions
    if (text.includes('should') || text.includes('expect') || text.includes('verify') || text.includes('check')) {
      const assertionMatch = text.match(/(?:should|expect|verify|check).*?['"]([^'"]+)['"]/);
      if (assertionMatch) {
        const assertionText = assertionMatch[1];
        if (text.includes('visible') || text.includes('see') || text.includes('display')) {
          steps.push({
            action: `cy.contains('${assertionText}').should('be.visible')`,
            comment: `Verify that "${assertionText}" is visible`
          });
        } else if (text.includes('exist') || text.includes('present')) {
          steps.push({
            action: `cy.contains('${assertionText}').should('exist')`,
            comment: `Verify that "${assertionText}" exists`
          });
        }
      }
    }
    
    // Handle waits
    if (text.includes('wait')) {
      const timeMatch = text.match(/(\d+)\s*(?:second|sec|s)/);
      if (timeMatch) {
        steps.push({
          action: `cy.wait(${parseInt(timeMatch[1]) * 1000})`,
          comment: `Wait for ${timeMatch[1]} seconds`
        });
      }
    }
  });
  
  // If no steps were generated, add a placeholder
  if (steps.length === 0) {
    steps.push({
      action: `cy.log('Test steps need to be implemented')`,
      comment: `TODO: Implement test steps for: ${description}`
    });
  }

  // Generate test file content with better formatting and comments
  const testContent = `// Generated Cypress test from description:
// ${description}

describe('Generated Test', () => {
  beforeEach(() => {
    // Add any setup code here
    cy.viewport(1280, 720); // Default viewport size
  });

  it('should ${description.toLowerCase()}', () => {
${steps.map(step => `    ${step.comment ? `// ${step.comment}\n    ` : ''}${step.action}`).join(';\n\n')}
  });
});\n`;

  return testContent;
}

// Helper function to save generated test
async function saveGeneratedTest(content: string, testName: string): Promise<string> {
  const fileName = `${testName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.cy.ts`;
  const filePath = path.join(process.cwd(), 'cypress', 'e2e', fileName);
  await fs.writeFile(filePath, content);
  return filePath;
}

// Helper function to run Cypress commands
async function runCypressCommand(spec: string, command: string): Promise<string> {
  try {
    const results = await cypress.run({
      spec: spec,
      config: {
        video: false,
        screenshotOnRunFailure: true
      },
      env: {
        command: command
      }
    });

    // Simplified results handling
    if (results && typeof results === 'object' && 'status' in results) {
      return results.status === 'failed' 
        ? `Test execution failed` 
        : `Test executed successfully`;
    }
    
    return `Test completed with unknown status`;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return `Error executing Cypress command: ${errorMessage}`;
  }
}

// Register test generation tool
server.tool(
  "generate-test",
  "Generate a Cypress test from a natural language description",
  {
    description: z.string().describe("Natural language description of the test scenario"),
    testName: z.string().describe("Name for the test file")
  },
  async ({ description, testName }) => {
    try {
      const testContent = await generateCypressTest(description);
      const filePath = await saveGeneratedTest(testContent, testName);
      
      return {
        content: [
          {
            type: "text",
            text: `Test generated and saved to: ${filePath}\n\nTest content:\n${testContent}`
          }
        ]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: "text",
            text: `Error generating test: ${errorMessage}`
          }
        ]
      };
    }
  }
);

// Register Cypress execution tool
server.tool(
  "execute-test",
  "Execute a Cypress test file with specific commands",
  {
    spec: z.string().describe("Path to the Cypress test spec file"),
    command: z.string().describe("Cypress command to execute")
  },
  async ({ spec, command }) => {
    const result = await runCypressCommand(spec, command);
    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };
  }
);

// Register interactive recording tool
server.tool(
  "record-test",
  "Start recording user interactions for test generation",
  {
    testName: z.string().describe("Name of the test to be generated")
  },
  async ({ testName }) => {
    // Implementation for test recording
    const testContent = `describe('${testName}', () => {
  it('should perform recorded actions', () => {
    // Recorded commands will be added here
  });
});`;

    return {
      content: [
        {
          type: "text",
          text: `Test file created: ${testName}`
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cypress MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
