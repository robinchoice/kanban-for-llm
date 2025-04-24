#!/bin/bash

# Check if a vault path was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-obsidian-vault>"
  echo "Make sure to enclose the path in quotes if it contains spaces."
  exit 1
fi

VAULT_PATH="$1"
# Ensure the plugin directory path is quoted to handle spaces
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/kanban-for-llm"

# Create plugin directory if it doesn't exist (use quotes)
echo "Creating directory: $PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR"

# Check if mkdir was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to create directory $PLUGIN_DIR"
  exit 1
fi

# Copy the necessary files (use quotes)
echo "Copying plugin files to $PLUGIN_DIR..."
cp main.js "$PLUGIN_DIR/"
cp manifest.json "$PLUGIN_DIR/"

# Check if styles.css exists and copy it if it does (use quotes)
if [ -f "styles.css" ]; then
  cp styles.css "$PLUGIN_DIR/"
fi

echo "Plugin installed successfully!"
echo "Please restart Obsidian and enable the Kanban for LLM plugin in Settings > Community Plugins." 