import { YAMLService } from '../services/YAMLService';
import { KanbanCard, YAMLTicket } from '../models/types';

describe('YAMLService', () => {
  let service: YAMLService;

  beforeEach(() => {
    service = new YAMLService();
  });

  describe('convertCardsToTickets', () => {
    it('should convert a Kanban card to a YAML ticket', () => {
      const card: KanbanCard = {
        content: 'Test card',
        tags: ['feature'],
        metadata: {
          priority: 'high',
          assignee: 'human',
          type: 'feature',
          ticketId: 'TASK-123'
        }
      };

      const result = service.convertCardsToTickets([card]);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'TASK-123',
        title: 'Test card',
        priority: 'high',
        assignee: 'human',
        type: 'feature'
      });
    });

    it('should generate ticket ID if not provided', () => {
      const card: KanbanCard = {
        content: 'Test card',
        tags: [],
        metadata: {}
      };

      const result = service.convertCardsToTickets([card]);
      expect(result[0].id).toMatch(/^TASK-/);
    });

    it('should use default values for missing metadata', () => {
      const card: KanbanCard = {
        content: 'Test card',
        tags: [],
        metadata: {}
      };

      const result = service.convertCardsToTickets([card]);
      expect(result[0]).toMatchObject({
        priority: 'medium',
        type: 'feature',
        assignee: 'human'
      });
    });
  });

  describe('validateTicket', () => {
    it('should validate a valid ticket', () => {
      const ticket: YAMLTicket = {
        id: 'TASK-123',
        title: 'Test ticket',
        description: 'Test description',
        status: 'todo',
        priority: 'high',
        type: 'feature',
        assignee: 'human',
        definition_of_done: []
      };

      expect(service.validateTicket(ticket)).toBe(true);
    });

    it('should invalidate ticket with wrong status', () => {
      const ticket: YAMLTicket = {
        id: 'TASK-123',
        title: 'Test ticket',
        description: 'Test description',
        status: 'invalid' as any,
        priority: 'high',
        type: 'feature',
        assignee: 'human',
        definition_of_done: []
      };

      expect(service.validateTicket(ticket)).toBe(false);
    });

    it('should invalidate ticket with wrong priority', () => {
      const ticket: YAMLTicket = {
        id: 'TASK-123',
        title: 'Test ticket',
        description: 'Test description',
        status: 'todo',
        priority: 'invalid' as any,
        type: 'feature',
        assignee: 'human',
        definition_of_done: []
      };

      expect(service.validateTicket(ticket)).toBe(false);
    });
  });

  describe('YAML conversion', () => {
    it('should convert ticket to YAML and back', () => {
      const ticket: YAMLTicket = {
        id: 'TASK-123',
        title: 'Test ticket',
        description: 'Test description',
        status: 'todo',
        priority: 'high',
        type: 'feature',
        assignee: 'human',
        definition_of_done: ['Test done']
      };

      const yaml = service.convertTicketToYAML(ticket);
      const parsed = service.parseYAML(yaml);
      expect(parsed).toEqual(ticket);
    });
  });
}); 