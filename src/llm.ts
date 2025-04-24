import { YAMLTicket } from './types';
import 'tslib';

export interface LLMResponse {
  success: boolean;
  message: string;
  updatedTickets?: YAMLTicket[];
  codeChanges?: {
    file: string;
    diff: string;
  }[];
}

export interface LLMConfig {
  provider: 'claude' | 'ollama' | 'copilot';
  apiKey?: string;
  endpoint?: string;
  enabled: boolean;
}

export class LLMProcessor {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async processTickets(tickets: YAMLTicket[]): Promise<LLMResponse> {
    if (!this.config.enabled) {
      return {
        success: false,
        message: 'LLM integration is not enabled'
      };
    }

    try {
      switch (this.config.provider) {
        case 'claude':
          return await this.processWithClaude(tickets);
        case 'ollama':
          return await this.processWithOllama(tickets);
        case 'copilot':
          return await this.processWithCopilot(tickets);
        default:
          return {
            success: false,
            message: `Unsupported LLM provider: ${this.config.provider}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error processing tickets with LLM: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async processWithClaude(tickets: YAMLTicket[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      return {
        success: false,
        message: 'Claude API key is required'
      };
    }

    // Filter tickets assigned to AI
    const aiTickets = tickets.filter(ticket => ticket.assignee === 'ai');
    
    if (aiTickets.length === 0) {
      return {
        success: true,
        message: 'No AI-assigned tickets found'
      };
    }

    // Prepare the prompt for Claude
    const prompt = this.preparePromptForClaude(aiTickets);
    
    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: `Claude API error: ${errorData.error?.message || response.statusText}`
      };
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse the response
    return this.parseClaudeResponse(content, aiTickets);
  }

  private async processWithOllama(tickets: YAMLTicket[]): Promise<LLMResponse> {
    if (!this.config.endpoint) {
      return {
        success: false,
        message: 'Ollama endpoint is required'
      };
    }

    // Filter tickets assigned to AI
    const aiTickets = tickets.filter(ticket => ticket.assignee === 'ai');
    
    if (aiTickets.length === 0) {
      return {
        success: true,
        message: 'No AI-assigned tickets found'
      };
    }

    // Prepare the prompt for Ollama
    const prompt = this.preparePromptForOllama(aiTickets);
    
    // Call Ollama API
    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Ollama API error: ${response.statusText}`
      };
    }

    const data = await response.json();
    const content = data.response;
    
    // Parse the response
    return this.parseOllamaResponse(content, aiTickets);
  }

  private async processWithCopilot(tickets: YAMLTicket[]): Promise<LLMResponse> {
    // GitHub Copilot integration would go here
    // This is a placeholder as Copilot doesn't have a direct API
    return {
      success: false,
      message: 'GitHub Copilot integration is not implemented yet'
    };
  }

  private preparePromptForClaude(tickets: YAMLTicket[]): string {
    return `You are an AI assistant helping with software development tasks.
    
I have the following YAML tickets that need to be processed:

${JSON.stringify(tickets, null, 2)}

Please analyze these tickets and provide:
1. Updated ticket statuses based on your analysis
2. Code changes or implementations for each ticket
3. Any additional information or suggestions

Format your response as a JSON object with the following structure:
{
  "updatedTickets": [
    {
      "id": "TASK-001",
      "status": "in-progress",
      "notes": "Implementation started"
    }
  ],
  "codeChanges": [
    {
      "file": "src/components/Feature.ts",
      "diff": "--- a/src/components/Feature.ts\n+++ b/src/components/Feature.ts\n@@ -10,6 +10,7 @@ export class Feature {\n   constructor() {\n     this.init();\n+    this.setupEventListeners();\n   }\n"
    }
  ]
}`;
  }

  private preparePromptForOllama(tickets: YAMLTicket[]): string {
    return `You are an AI assistant helping with software development tasks.
    
I have the following YAML tickets that need to be processed:

${JSON.stringify(tickets, null, 2)}

Please analyze these tickets and provide:
1. Updated ticket statuses based on your analysis
2. Code changes or implementations for each ticket
3. Any additional information or suggestions

Format your response as a JSON object with the following structure:
{
  "updatedTickets": [
    {
      "id": "TASK-001",
      "status": "in-progress",
      "notes": "Implementation started"
    }
  ],
  "codeChanges": [
    {
      "file": "src/components/Feature.ts",
      "diff": "--- a/src/components/Feature.ts\n+++ b/src/components/Feature.ts\n@@ -10,6 +10,7 @@ export class Feature {\n   constructor() {\n     this.init();\n+    this.setupEventListeners();\n   }\n"
    }
  ]
}`;
  }

  private parseClaudeResponse(content: string, originalTickets: YAMLTicket[]): LLMResponse {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        return {
          success: false,
          message: 'Could not parse JSON from Claude response'
        };
      }
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Update the original tickets with the new statuses
      const updatedTickets = originalTickets.map(ticket => {
        const update = parsed.updatedTickets?.find((t: any) => t.id === ticket.id);
        if (update) {
          return {
            ...ticket,
            status: update.status || ticket.status,
            notes: update.notes
          };
        }
        return ticket;
      });
      
      return {
        success: true,
        message: 'Successfully processed tickets with Claude',
        updatedTickets,
        codeChanges: parsed.codeChanges
      };
    } catch (error) {
      return {
        success: false,
        message: `Error parsing Claude response: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private parseOllamaResponse(content: string, originalTickets: YAMLTicket[]): LLMResponse {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        return {
          success: false,
          message: 'Could not parse JSON from Ollama response'
        };
      }
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Update the original tickets with the new statuses
      const updatedTickets = originalTickets.map(ticket => {
        const update = parsed.updatedTickets?.find((t: any) => t.id === ticket.id);
        if (update) {
          return {
            ...ticket,
            status: update.status || ticket.status,
            notes: update.notes
          };
        }
        return ticket;
      });
      
      return {
        success: true,
        message: 'Successfully processed tickets with Ollama',
        updatedTickets,
        codeChanges: parsed.codeChanges
      };
    } catch (error) {
      return {
        success: false,
        message: `Error parsing Ollama response: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
} 