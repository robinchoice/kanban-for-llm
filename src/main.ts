import { App, Plugin, PluginSettingTab, Setting, Notice, TFile } from 'obsidian';
import { YAMLTicket, KanbanCard, TicketPriority, TicketType, TicketAssignee } from './types';
import { LLMProcessor, LLMConfig } from './llm';
import * as yaml from 'js-yaml';
import * as path from 'path';
import 'tslib';

interface Kanban2YAMLSettings {
  outputDirectory: string;
  triggerTag: string;
  enableTwoWaySync: boolean;
  autoSyncInterval: number;
  llmIntegration: LLMConfig;
}

const DEFAULT_SETTINGS: Kanban2YAMLSettings = {
  outputDirectory: '.sprint-tickets',
  triggerTag: 'llm',
  enableTwoWaySync: false,
  autoSyncInterval: 0,
  llmIntegration: {
    provider: 'claude',
    enabled: false
  }
};

export default class Kanban2YAMLPlugin extends Plugin {
  settings: Kanban2YAMLSettings = DEFAULT_SETTINGS;
  private llmProcessor: LLMProcessor = new LLMProcessor(DEFAULT_SETTINGS.llmIntegration);

  async onload() {
    await this.loadSettings();
    this.llmProcessor = new LLMProcessor(this.settings.llmIntegration);

    // Add commands
    this.addCommand({
      id: 'convert-kanban-to-yaml',
      name: 'Convert Kanban to YAML',
      callback: () => this.convertKanbanToYAML()
    });

    this.addCommand({
      id: 'sync-yaml-to-kanban',
      name: 'Sync YAML to Kanban',
      callback: () => this.syncYAMLToKanban()
    });

    this.addCommand({
      id: 'two-way-sync',
      name: 'Perform Two-Way Sync',
      callback: () => this.syncAll()
    });

    // Add settings tab
    this.addSettingTab(new Kanban2YAMLSettingTab(this.app, this));

    // Set up auto-sync if enabled
    if (this.settings.autoSyncInterval > 0) {
      this.registerInterval(
        window.setInterval(() => {
          this.syncAll();
        }, this.settings.autoSyncInterval * 60 * 1000)
      );
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async convertKanbanToYAML() {
    new Notice('Konvertiere Kanban-Board zu YAML...');
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active file');
      return;
    }

    const content = await this.app.vault.read(activeFile);
    const cards = this.parseKanbanCards(content);
    const tickets = this.convertCardsToTickets(cards);
    await this.saveTicketsToYAML(tickets);
    new Notice(`Kanban-Board erfolgreich zu YAML konvertiert. ${tickets.length} YAML-Dateien erstellt.`);
  }

  async syncYAMLToKanban() {
    new Notice('Synchronisiere YAML-Dateien mit Kanban-Board...');
    if (!this.settings.enableTwoWaySync) {
      new Notice('Two-way sync is disabled. Please enable it in settings.');
      return;
    }

    const result = await this.performYAMLToKanbanSync();
    new Notice('YAML-Dateien erfolgreich mit Kanban-Board synchronisiert.');
    new Notice(`Sync complete: ${result.cardsUpdated} cards updated`);
  }

  async syncAll() {
    // First convert Kanban to YAML
    await this.convertKanbanToYAML();
    
    // Then sync YAML back to Kanban
    await this.syncYAMLToKanban();
  }

  private parseKanbanCards(content: string): KanbanCard[] {
    const cards: KanbanCard[] = [];
    const lines = content.split('\n');
    let currentCard: KanbanCard | null = null;

    for (const line of lines) {
      if (line.startsWith('- ')) {
        if (currentCard) {
          cards.push(currentCard);
        }
        currentCard = {
          content: line.substring(2),
          tags: [],
          metadata: {}
        };
      } else if (currentCard && line.trim().startsWith('tags:')) {
        const tags = line.split('tags:')[1].trim().split(',');
        currentCard.tags = tags.map(tag => tag.trim());
      } else if (currentCard && line.trim().startsWith('deadline:')) {
        currentCard.metadata.deadline = line.split('deadline:')[1].trim();
      } else if (currentCard && line.trim().startsWith('priority:')) {
        const priority = line.split('priority:')[1].trim() as TicketPriority;
        if (['low', 'medium', 'high'].includes(priority)) {
          currentCard.metadata.priority = priority;
        }
      } else if (currentCard && line.trim().startsWith('assignee:')) {
        const assignee = line.split('assignee:')[1].trim() as TicketAssignee;
        if (['human', 'ai', 'pair'].includes(assignee)) {
          currentCard.metadata.assignee = assignee;
        }
      } else if (currentCard && line.trim().startsWith('type:')) {
        const type = line.split('type:')[1].trim() as TicketType;
        if (['feature', 'bug', 'research', 'chore'].includes(type)) {
          currentCard.metadata.type = type;
        }
      } else if (currentCard && line.trim().startsWith('ticketId:')) {
        currentCard.metadata.ticketId = line.split('ticketId:')[1].trim();
      }
    }

    if (currentCard) {
      cards.push(currentCard);
    }

    return cards;
  }

  private convertCardsToTickets(cards: KanbanCard[]): YAMLTicket[] {
    return cards.map(card => ({
      id: card.metadata.ticketId || `TASK-${Math.random().toString(36).substr(2, 9)}`,
      title: card.content,
      description: '',
      status: 'todo',
      priority: card.metadata.priority || 'medium',
      type: card.metadata.type || 'feature',
      assignee: card.metadata.assignee || 'human',
      links: [],
      definition_of_done: [],
      kanbanSource: card.content,
      lastModified: new Date().toISOString()
    }));
  }

  private async saveTicketsToYAML(tickets: YAMLTicket[]) {
    const outputDir = this.settings.outputDirectory;
    const outputPath = path.join(this.app.vault.configDir, outputDir);

    // Create output directory if it doesn't exist
    try {
      await this.app.vault.createFolder(outputPath);
    } catch (error) {
      // Directory might already exist
    }

    // Process tickets with LLM if enabled
    if (this.settings.llmIntegration.enabled) {
      const llmResult = await this.llmProcessor.processTickets(tickets);
      if (llmResult.success && llmResult.updatedTickets) {
        tickets = llmResult.updatedTickets;
        
        // Apply code changes if any
        if (llmResult.codeChanges) {
          for (const change of llmResult.codeChanges) {
            // TODO: Implement code change application
            console.log(`Code change for ${change.file}:`, change.diff);
          }
        }
      }
    }

    // Save each ticket as a separate YAML file
    for (const ticket of tickets) {
      const fileName = `${ticket.id}.yaml`;
      const filePath = path.join(outputPath, fileName);
      const yamlContent = yaml.dump(ticket);
      
      try {
        await this.app.vault.create(filePath, yamlContent);
      } catch (error) {
        const existingFile = await this.app.vault.getAbstractFileByPath(filePath);
        if (existingFile instanceof TFile) {
          await this.app.vault.modify(existingFile, yamlContent);
        }
      }
    }
  }

  private async performYAMLToKanbanSync() {
    new Notice('Starte Zwei-Wege-Synchronisation...');
    const outputDir = this.settings.outputDirectory;
    const outputPath = path.join(this.app.vault.configDir, outputDir);
    
    const files = this.app.vault.getFiles()
      .filter(file => file.path.startsWith(outputPath) && file.extension === 'yaml');
    
    let cardsUpdated = 0;
    
    for (const file of files) {
      const content = await this.app.vault.read(file);
      const ticket = yaml.load(content) as YAMLTicket;
      
      // Find the corresponding Kanban card and update it
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile) {
        const kanbanContent = await this.app.vault.read(activeFile);
        const updatedContent = this.updateKanbanFromYAML(kanbanContent, ticket);
        
        if (updatedContent !== kanbanContent) {
          await this.app.vault.modify(activeFile, updatedContent);
          cardsUpdated++;
        }
      }
    }
    
    new Notice('Zwei-Wege-Synchronisation erfolgreich abgeschlossen.');
    return { cardsUpdated };
  }

  private updateKanbanFromYAML(kanbanContent: string, ticket: YAMLTicket): string {
    const lines = kanbanContent.split('\n');
    let inCard = false;
    let cardStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('- ')) {
        if (inCard) {
          // We've reached the next card, update the previous one
          if (cardStartIndex >= 0) {
            const cardContent = lines.slice(cardStartIndex, i).join('\n');
            if (cardContent.includes(`ticketId: ${ticket.id}`)) {
              // Update the card with new ticket data
              lines[cardStartIndex] = `- ${ticket.title}`;
              lines[cardStartIndex + 1] = `  tags: ${ticket.type}`;
              lines[cardStartIndex + 2] = `  priority: ${ticket.priority}`;
              lines[cardStartIndex + 3] = `  assignee: ${ticket.assignee}`;
              lines[cardStartIndex + 4] = `  type: ${ticket.type}`;
              lines[cardStartIndex + 5] = `  ticketId: ${ticket.id}`;
              return lines.join('\n');
            }
          }
        }
        inCard = true;
        cardStartIndex = i;
      }
    }
    
    return kanbanContent;
  }
}

class Kanban2YAMLSettingTab extends PluginSettingTab {
  plugin: Kanban2YAMLPlugin;

  constructor(app: App, plugin: Kanban2YAMLPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Kanban2YAML Settings' });

    // Allgemeine Einstellungen
    containerEl.createEl('h3', { text: 'Allgemein' });

    new Setting(containerEl)
      .setName('Ausgabeverzeichnis')
      .setDesc('Verzeichnis, in dem die YAML-Tickets gespeichert werden')
      .addText(text => text
        .setPlaceholder('.sprint-tickets')
        .setValue(this.plugin.settings.outputDirectory)
        .onChange(async (value) => {
          this.plugin.settings.outputDirectory = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Trigger-Tag')
      .setDesc('Tag, der die YAML-Konvertierung auslöst')
      .addText(text => text
        .setPlaceholder('llm')
        .setValue(this.plugin.settings.triggerTag)
        .onChange(async (value) => {
          this.plugin.settings.triggerTag = value;
          await this.plugin.saveSettings();
        }));

    // Synchronisierungseinstellungen
    containerEl.createEl('h3', { text: 'Synchronisierung' });

    new Setting(containerEl)
      .setName('Zwei-Wege-Synchronisation aktivieren')
      .setDesc('Änderungen von YAML zurück zu Kanban synchronisieren')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableTwoWaySync)
        .onChange(async (value) => {
          this.plugin.settings.enableTwoWaySync = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Automatische Synchronisierung')
      .setDesc('Intervall in Minuten für automatische Synchronisierung (0 zum Deaktivieren)')
      .addText(text => text
        .setPlaceholder('0')
        .setValue(this.plugin.settings.autoSyncInterval.toString())
        .onChange(async (value) => {
          const interval = parseInt(value);
          if (isNaN(interval)) {
            new Notice('Bitte geben Sie eine gültige Zahl ein.');
            return;
          }
          if (interval < 0) {
            new Notice('Das Intervall darf nicht negativ sein.');
            return;
          }
          this.plugin.settings.autoSyncInterval = interval;
          await this.plugin.saveSettings();
        }));

    // LLM-Integrationseinstellungen
    containerEl.createEl('h3', { text: 'LLM-Integration' });

    new Setting(containerEl)
      .setName('LLM-Integration aktivieren')
      .setDesc('KI-Verarbeitung von Tickets aktivieren')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.llmIntegration.enabled)
        .onChange(async (value) => {
          this.plugin.settings.llmIntegration.enabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('LLM-Provider')
      .setDesc('Wählen Sie den LLM-Provider')
      .addDropdown(dropdown => dropdown
        .addOption('claude', 'Claude')
        .addOption('ollama', 'Ollama')
        .addOption('copilot', 'GitHub Copilot')
        .setValue(this.plugin.settings.llmIntegration.provider)
        .onChange(async (value) => {
          this.plugin.settings.llmIntegration.provider = value as 'claude' | 'ollama' | 'copilot';
          await this.plugin.saveSettings();
        }));

    if (this.plugin.settings.llmIntegration.provider === 'claude') {
      new Setting(containerEl)
        .setName('Claude API-Schlüssel')
        .setDesc('Ihr Claude API-Schlüssel')
        .addText(text => text
          .setPlaceholder('Geben Sie Ihren API-Schlüssel ein')
          .setValue(this.plugin.settings.llmIntegration.apiKey || '')
          .onChange(async (value) => {
            if (!value) {
              new Notice('Bitte geben Sie einen API-Schlüssel ein.');
              return;
            }
            this.plugin.settings.llmIntegration.apiKey = value;
            await this.plugin.saveSettings();
          }));
    }

    if (this.plugin.settings.llmIntegration.provider === 'ollama') {
      new Setting(containerEl)
        .setName('Ollama-Endpunkt')
        .setDesc('URL Ihrer Ollama-Instanz')
        .addText(text => text
          .setPlaceholder('http://localhost:11434')
          .setValue(this.plugin.settings.llmIntegration.endpoint || '')
          .onChange(async (value) => {
            if (!value) {
              new Notice('Bitte geben Sie einen Endpunkt ein.');
              return;
            }
            this.plugin.settings.llmIntegration.endpoint = value;
            await this.plugin.saveSettings();
          }));
    }
  }
} 