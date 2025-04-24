import * as yaml from 'js-yaml';
import { YAMLTicket, KanbanCard } from '../models/types';

export class YAMLService {
  convertCardsToTickets(cards: KanbanCard[]): YAMLTicket[] {
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

  convertTicketToYAML(ticket: YAMLTicket): string {
    return yaml.dump(ticket);
  }

  parseYAML(content: string): YAMLTicket {
    return yaml.load(content) as YAMLTicket;
  }

  validateTicket(ticket: YAMLTicket): boolean {
    return (
      typeof ticket.id === 'string' &&
      typeof ticket.title === 'string' &&
      typeof ticket.description === 'string' &&
      ['todo', 'in-progress', 'done'].includes(ticket.status) &&
      ['low', 'medium', 'high'].includes(ticket.priority) &&
      ['feature', 'bug', 'research', 'chore'].includes(ticket.type) &&
      ['human', 'ai', 'pair'].includes(ticket.assignee) &&
      Array.isArray(ticket.definition_of_done)
    );
  }
} 