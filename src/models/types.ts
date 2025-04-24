export type TicketStatus = 'todo' | 'in-progress' | 'done';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketType = 'feature' | 'bug' | 'research' | 'chore';
export type TicketAssignee = 'human' | 'ai' | 'pair';

export interface TicketLink {
  file?: string;
  docs?: string;
}

export interface YAMLTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assignee: TicketAssignee;
  links?: TicketLink[];
  definition_of_done: string[];
  kanbanSource?: string;
  lastModified?: string;
}

export interface KanbanCard {
  content: string;
  tags: string[];
  metadata: {
    deadline?: string;
    priority?: TicketPriority;
    assignee?: TicketAssignee;
    type?: TicketType;
    ticketId?: string;
  };
}

export interface SyncResult {
  success: boolean;
  message: string;
  ticketsCreated?: number;
  ticketsUpdated?: number;
  ticketsDeleted?: number;
  cardsCreated?: number;
  cardsUpdated?: number;
  cardsDeleted?: number;
} 