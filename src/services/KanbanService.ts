import { KanbanCard, TicketPriority, TicketAssignee, TicketType } from '../models/types';

export class KanbanService {
  parseKanbanCards(content: string): KanbanCard[] {
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

  updateKanbanContent(content: string, ticketId: string, updates: Partial<KanbanCard>): string {
    const lines = content.split('\n');
    let inCard = false;
    let cardStartIndex = -1;
    let cardEndIndex = -1;
    
    const updateCard = (updatedLines: string[], startIndex: number) => {
      if (updates.content) {
        updatedLines[startIndex] = `- ${updates.content}`;
      }
      if (updates.tags) {
        updatedLines[startIndex + 1] = `  tags: ${updates.tags.join(', ')}`;
      }
      
      // Helper function to update metadata fields
      const updateMetadataField = (field: keyof KanbanCard['metadata'], value: string) => {
        // Find the line that matches the field name, ignoring whitespace after the colon
        const fieldIndex = updatedLines.findIndex((line, i) => {
          if (i <= startIndex) return false;
          const trimmed = line.trim();
          return trimmed.replace(/:\s*.*$/, ':') === `${field}:`;
        });
        
        if (fieldIndex !== -1) {
          updatedLines[fieldIndex] = `  ${field}: ${value}`;
        }
      };

      if (updates.metadata) {
        Object.entries(updates.metadata).forEach(([field, value]) => {
          if (value !== undefined) {
            updateMetadataField(field as keyof KanbanCard['metadata'], value);
          }
        });
      }

      return updatedLines.join('\n');
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('- ')) {
        if (inCard) {
          cardEndIndex = i - 1;
          // Check if this was the card we were looking for
          const cardContent = lines.slice(cardStartIndex, cardEndIndex + 1).join('\n');
          if (cardContent.replace(/:\s*/g, ':').includes(`ticketId:${ticketId}`)) {
            return updateCard([...lines], cardStartIndex);
          }
        }
        inCard = true;
        cardStartIndex = i;
      }
    }
    
    // Check the last card if it was the one we were looking for
    if (inCard && cardStartIndex >= 0) {
      const cardContent = lines.slice(cardStartIndex).join('\n');
      if (cardContent.replace(/:\s*/g, ':').includes(`ticketId:${ticketId}`)) {
        return updateCard([...lines], cardStartIndex);
      }
    }
    
    return content;
  }
} 