# Tickban

[English](README.md) | [日本語](README.ja.md)

Automatically collect tasks from across your entire Obsidian Vault and visualize/manage them in a Kanban board.

## Motivation

I created Tickban because I wanted to manage tasks using a Kanban board even when using Obsidian in a messy, unstructured way.

You don't need to consolidate tasks into a single file. Whether it's in a daily log, a project note, or a random scratchpad, this plugin automatically finds `[ ]` task items scattered throughout your vault and aggregates them into a single, organized board.

## Key Features

- **Vault-wide Task Extraction**: Automatically extracts checkbox list items from specified folders and files (supports Glob patterns).
- **Automatic Status Mapping**: Categorizes tasks into "TODO", "DOING", and "DONE" columns based on the following syntax:
  - `[ ]` -> **TODO**
  - `[/]` -> **DOING**
  - `[x]` -> **DONE**
- **Drag & Drop & Menu Operations**: Update the status of checkboxes directly within your notes by dragging and dropping cards or using the card menu.
- **Tag Extraction & Display**: Automatically recognizes `#tag` within task lines and displays them as badges on cards.
- **Card Menu**: Click on a card to open a menu where you can:
  - Jump to the exact line in the note where the task is written.
  - Change the task status (TODO, DOING, DONE).
- **Flexible Filtering**:
  - Narrow down extraction targets using Glob patterns (e.g., excluding specific folders).
  - Exclude tasks by tags (e.g., #exclude).
  - Automatically hide completed tasks based on the file's last modified date.

## Usage

1. Enable the plugin.
2. Open the board by clicking the ribbon icon (Kanban icon) in the sidebar, or by running `Tickban: Open kanban` from the command palette.
3. If necessary, adjust `Include glob`, `Exclude glob`, and `Exclude tags` in the settings to define the scope of task collection.

## Settings

- **Include glob**: Pattern for files to include for task extraction (e.g., `**/*.md`).
- **Exclude glob**: Pattern for files to exclude from extraction (e.g., `Templates/**`).
- **Exclude tags**: Tasks with these tags will be excluded. Support multiple tags (one per line, e.g. #exclude).
- **Show file path**: Whether to display the file path on task cards.
- **Hide done tasks (days)**: Number of days after which completed tasks are hidden (set to 0 to always show).

## Installation

### Manual Installation
1. Download the latest `main.js`, `manifest.json`, and `styles.css` from the releases page.
2. Place them in the `.obsidian/plugins/obsidian-tickban` folder of your vault.
3. Enable the plugin in the Obsidian settings.
