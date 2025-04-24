# Kanban for LLM

Ein Obsidian-Plugin, das Kanban-Boards in YAML-Dateien konvertiert und umgekehrt.

## Funktionen

*   **Konvertierung von Kanban zu YAML:** Konvertiert Kanban-Karten in YAML-Dateien mit Metadaten.
*   **Konvertierung von YAML zu Kanban:** Konvertiert YAML-Dateien zurück in Kanban-Karten.
*   **Zwei-Wege-Synchronisation:** Synchronisiert Änderungen zwischen Kanban-Boards und YAML-Dateien.
*   **LLM-Integration:** Verarbeitet YAML-Dateien mit einem LLM (Claude, Ollama, GitHub Copilot).

## Installation

1.  Gehe zu `Einstellungen` -> `Community Plugins` -> `Browse` in Obsidian.
2.  Suche nach "Kanban for LLM" und klicke auf "Install".
3.  Aktiviere das Plugin in der Community-Plugin-Liste.

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