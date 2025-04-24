# Kanban for LLM

A plugin for Obsidian that allows you to convert Kanban boards to YAML format and vice versa. This plugin helps you manage your Kanban boards more effectively by providing a structured way to store and version control your tasks.

## Features

- Convert Kanban boards to YAML format
- Sync YAML files back to Kanban boards
- Support for metadata (priority, assignee, type)
- Automatic file organization
- Command palette integration

## Installation

1. Download the latest release from the releases page
2. Extract the files to your Obsidian vault's plugins folder: `.obsidian/plugins/kanban-for-llm/`
3. Enable the plugin in Obsidian's Community Plugins settings
4. Restart Obsidian

## Usage

### Converting Kanban to YAML

1. Open a Kanban board
2. Use the command palette (Ctrl/Cmd + P)
3. Select "Kanban for LLM: Convert Kanban to YAML"

### Syncing YAML to Kanban

1. Open a YAML file containing Kanban data
2. Use the command palette
3. Select "Kanban for LLM: Sync YAML to Kanban"

### Metadata Support

The plugin supports the following metadata fields:
- Priority (high, medium, low)
- Assignee
- Type (bug, feature, task)

Example format in Kanban cards:
```
---
priority: high
assignee: John
type: bug
---
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository
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

MIT License - see LICENSE file for details

---

# Kanban for LLM (Deutsch)

Ein Obsidian-Plugin, das Kanban-Boards in YAML-Dateien konvertiert und umgekehrt.

## Funktionen

*   **Konvertierung von Kanban zu YAML:** Konvertiert Kanban-Karten in YAML-Dateien mit Metadaten.
*   **Konvertierung von YAML zu Kanban:** Konvertiert YAML-Dateien zurück in Kanban-Karten.
*   **Zwei-Wege-Synchronisation:** Synchronisiert Änderungen zwischen Kanban-Boards und YAML-Dateien.
*   **LLM-Integration:** Verarbeitet YAML-Dateien mit einem LLM (Claude, Ollama, GitHub Copilot).

## Verwendung

### Konvertierung von Kanban zu YAML

1.  Öffne dein Kanban-Board in Obsidian.
2.  Öffne die Befehlspalette (`Cmd+P` oder `Ctrl+P`).
3.  Tippe "Convert Kanban to YAML" und wähle den Befehl aus.
4.  Die YAML-Dateien werden im konfigurierten Ausgabeverzeichnis gespeichert (standardmäßig `.obsidian/.sprint-tickets/`).

### Konvertierung von YAML zu Kanban

1.  Stelle sicher, dass "Zwei-Wege-Synchronisation aktivieren" in den Einstellungen eingeschaltet ist.
2.  Öffne die Befehlspalette (`Cmd+P` oder `Ctrl+P`).
3.  Tippe "Sync YAML to Kanban" und wähle den Befehl aus.
4.  Die Änderungen aus den YAML-Dateien werden in dein Kanban-Board synchronisiert.

### Zwei-Wege-Synchronisation

1.  Stelle sicher, dass "Zwei-Wege-Synchronisation aktivieren" eingeschaltet ist.
2.  Öffne die Befehlspalette (`Cmd+P` oder `Ctrl+P`).
3.  Tippe "Perform Two-Way Sync" und wähle den Befehl aus.
4.  Änderungen werden in beide Richtungen synchronisiert.

### LLM-Integration

1.  Aktiviere "LLM-Integration aktivieren" in den Einstellungen.
2.  Wähle den LLM-Provider (Claude, Ollama, GitHub Copilot).
3.  Konfiguriere die notwendigen Einstellungen (API-Schlüssel, Endpunkt).
4.  Die YAML-Dateien werden automatisch vom LLM verarbeitet.

## Konfiguration

Gehe zu `Einstellungen` -> `Community Plugins` -> `Kanban for LLM` und klicke auf das Zahnrad-Symbol (oder den "Options"-Button).

*   **Allgemein:**
    *   **Ausgabeverzeichnis:** Verzeichnis, in dem die YAML-Tickets gespeichert werden.
    *   **Trigger-Tag:** Tag, der die YAML-Konvertierung auslöst.
*   **Synchronisierung:**
    *   **Zwei-Wege-Synchronisation aktivieren:** Änderungen von YAML zurück zu Kanban synchronisieren.
    *   **Automatische Synchronisierung:** Intervall in Minuten für automatische Synchronisierung (0 zum Deaktivieren).
*   **LLM-Integration:**
    *   **LLM-Integration aktivieren:** KI-Verarbeitung von Tickets aktivieren.
    *   **LLM-Provider:** Wählen Sie den LLM-Provider.
    *   **Claude API-Schlüssel:** Ihr Claude API-Schlüssel (nur für Claude).
    *   **Ollama-Endpunkt:** URL Ihrer Ollama-Instanz (nur für Ollama).

## Lizenz

MIT 