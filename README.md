# Kanban for LLM

A plugin for Obsidian that converts Kanban boards to YAML format and vice versa, designed to facilitate collaboration between Product Owners and LLM-powered developers.

## Purpose

This plugin serves as a bridge between human Product Owners and LLM-powered developers by:
- Converting Kanban boards into structured YAML format that LLMs can easily parse and understand
- Enabling LLMs to process and respond to project tasks in a standardized format
- Maintaining project context and metadata in a format that's both human-readable and machine-processable
- Facilitating seamless communication between human team members and AI assistants

## Features

- Convert Kanban boards to YAML format
- Sync YAML files back to Kanban boards
- Support for metadata (priority, assignee, type)
- Automatic file naming and organization
- Bidirectional sync capabilities

## Installation

1. Download the latest release from the releases page
2. Extract the files to your Obsidian plugins folder: `.obsidian/plugins/kanban-for-llm/`
3. Enable the plugin in Obsidian's Community Plugins settings
4. Restart Obsidian

## Usage

### Converting Kanban to YAML

1. Create a Kanban board in Obsidian
2. Add cards with metadata using the following format:
   ```
   - [ ] Task title
     priority: high
     assignee: human
     type: feature
   ```
3. Use the command palette (Ctrl/Cmd + P) and select "Kanban for LLM: Convert Kanban to YAML"
4. The plugin will create a YAML file in your specified output directory

### Syncing YAML to Kanban

1. Create or modify a YAML file with your tasks
2. Use the command palette and select "Kanban for LLM: Sync YAML to Kanban"
3. The plugin will update your Kanban board with the tasks from the YAML file

## Metadata Support

The plugin supports the following metadata fields:
- `priority`: high, medium, low
- `assignee`: human, llm
- `type`: feature, bug, task

Example Kanban card:
```
- [ ] Implement user authentication
  priority: high
  assignee: llm
  type: feature
```

## Development

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Obsidian

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```

### Testing

Run the test suite:
```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 