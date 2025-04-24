import { KanbanService } from '../services/KanbanService';
import { KanbanCard } from '../models/types';

describe('KanbanService', () => {
  let service: KanbanService;

  beforeEach(() => {
    service = new KanbanService();
  });

  describe('parseKanbanCards', () => {
    it('should parse a simple Kanban card', () => {
      const content = `- Test card
  tags: feature, important
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const expected: KanbanCard[] = [{
        content: 'Test card',
        tags: ['feature', 'important'],
        metadata: {
          priority: 'high',
          assignee: 'human',
          type: 'feature',
          ticketId: 'TASK-123'
        }
      }];

      const result = service.parseKanbanCards(content);
      expect(result).toEqual(expected);
    });

    it('should handle multiple cards', () => {
      const content = `- First card
  tags: feature
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-1

- Second card
  tags: bug
  priority: medium
  assignee: ai
  type: bug
  ticketId: TASK-2`;

      const result = service.parseKanbanCards(content);
      expect(result).toHaveLength(2);
      expect(result[0].metadata.ticketId).toBe('TASK-1');
      expect(result[1].metadata.ticketId).toBe('TASK-2');
    });

    it('should handle invalid priority/type/assignee values', () => {
      const content = `- Test card
  tags: feature
  priority: invalid
  assignee: invalid
  type: invalid
  ticketId: TASK-123`;

      const result = service.parseKanbanCards(content);
      expect(result[0].metadata.priority).toBeUndefined();
      expect(result[0].metadata.assignee).toBeUndefined();
      expect(result[0].metadata.type).toBeUndefined();
    });

    it('should handle empty content', () => {
      const result = service.parseKanbanCards('');
      expect(result).toEqual([]);
    });

    it('should handle content with only whitespace', () => {
      const result = service.parseKanbanCards('   \n  \t  \n  ');
      expect(result).toEqual([]);
    });

    it('should handle cards with missing metadata fields', () => {
      const content = `- Test card
  tags: feature`;

      const result = service.parseKanbanCards(content);
      expect(result[0]).toEqual({
        content: 'Test card',
        tags: ['feature'],
        metadata: {}
      });
    });

    it('should handle malformed card content', () => {
      const content = `- Test card
  tags: feature, important
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123
  invalid: field`;

      const result = service.parseKanbanCards(content);
      expect(result[0].metadata).toEqual({
        priority: 'high',
        assignee: 'human',
        type: 'feature',
        ticketId: 'TASK-123'
      });
    });

    it('should handle deadline metadata', () => {
      const content = `- Test card
  tags: feature
  deadline: 2024-03-20
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const result = service.parseKanbanCards(content);
      expect(result[0].metadata.deadline).toBe('2024-03-20');
    });
  });

  describe('updateKanbanContent', () => {
    it('should update an existing card', () => {
      const content = `- Original card
  tags: feature
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const updates: Partial<KanbanCard> = {
        content: 'Updated card',
        tags: ['bug'],
        metadata: {
          priority: 'low',
          assignee: 'ai',
          type: 'bug'
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('Updated card');
      expect(result).toContain('tags: bug');
      expect(result).toContain('priority: low');
      expect(result).toContain('assignee: ai');
      expect(result).toContain('type: bug');
    });

    it('should not update non-existent card', () => {
      const content = `- Test card
  tags: feature
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const updates: Partial<KanbanCard> = {
        content: 'Updated card'
      };

      const result = service.updateKanbanContent(content, 'TASK-456', updates);
      expect(result).toBe(content);
    });

    it('should handle partial updates', () => {
      const content = `- Original card
  tags: feature
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const updates: Partial<KanbanCard> = {
        content: 'Updated card',
        metadata: {
          priority: 'low'
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('Updated card');
      expect(result).toContain('priority: low');
      expect(result).toContain('assignee: human');
      expect(result).toContain('type: feature');
    });

    it('should handle empty updates', () => {
      const content = `- Test card
  tags: feature
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const updates: Partial<KanbanCard> = {};
      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toBe(content);
    });

    it('should handle updates with any metadata values', () => {
      const content = `- Test card
  tags: feature
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const updates: Partial<KanbanCard> = {
        metadata: {
          priority: 'invalid' as any,
          assignee: 'invalid' as any,
          type: 'invalid' as any
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('priority: invalid');
      expect(result).toContain('assignee: invalid');
      expect(result).toContain('type: invalid');
    });

    it('should handle updating the last card in content', () => {
      const content = `- First card
  tags: feature
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-1

- Last card
  tags: bug
  priority: medium
  assignee: ai
  type: bug
  ticketId: TASK-2`;

      const updates: Partial<KanbanCard> = {
        content: 'Updated last card',
        metadata: {
          priority: 'low'
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-2', updates);
      expect(result).toContain('Updated last card');
      expect(result).toContain('priority: low');
      expect(result).toContain('TASK-1'); // First card should remain unchanged
    });

    it('should handle updating deadline metadata', () => {
      const content = `- Test card
  tags: feature
  deadline: 2024-03-20
  priority: high
  assignee: human
  type: feature
  ticketId: TASK-123`;

      const updates: Partial<KanbanCard> = {
        metadata: {
          deadline: '2024-03-21'
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('deadline: 2024-03-21');
    });

    it('should handle updating non-existent metadata fields', () => {
      const content = `- Test card
  tags: feature
  priority: high
  type: feature
  ticketId: TASK-123`;  // Note: no assignee field

      const updates: Partial<KanbanCard> = {
        metadata: {
          assignee: 'human',  // Try to update a field that doesn't exist in the original content
          deadline: '2024-03-21'  // Another non-existent field
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      // The update should not modify the content since the fields don't exist
      expect(result).toBe(content);
    });

    it('should handle updating metadata fields in different orders', () => {
      const content = `- Test card
  tags: feature
  type: feature
  assignee: ai
  priority: high
  ticketId: TASK-123`;  // Note: fields in different order

      const updates: Partial<KanbanCard> = {
        metadata: {
          priority: 'low',
          type: 'bug',
          assignee: undefined  // Should be ignored
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('priority: low');
      expect(result).toContain('type: bug');
      expect(result).toContain('assignee: ai');  // Should remain unchanged
    });

    it('should handle metadata fields with similar prefixes', () => {
      const content = `- Test card
  tags: feature
  priority: high
  type: feature
  ticketId: TASK-123
  typealias: something`;  // Note: similar prefix to 'type'

      const updates: Partial<KanbanCard> = {
        metadata: {
          type: 'bug'  // Should only update the exact field match
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('type: bug');
      expect(result).toContain('typealias: something');  // Should remain unchanged
    });

    it('should handle metadata fields with special characters', () => {
      const content = `- Test card
  tags: feature
  priority: high
  type: feature
  ticketId: TASK-123
  special:field: value`;  // Note: field name contains a colon

      const updates: Partial<KanbanCard> = {
        metadata: {
          priority: 'low'
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('priority: low');
      expect(result).toContain('special:field: value');  // Should remain unchanged
    });

    it('should handle metadata fields with exact matches only', () => {
      const content = `- Test card
  tags: feature
  priority: high
  priorityOverride: low  // Similar field name
  type: feature
  ticketId: TASK-123`;

      const updates: Partial<KanbanCard> = {
        metadata: {
          priority: 'medium'
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('priority: medium');
      expect(result).toContain('priorityOverride: low');  // Should remain unchanged
      expect(result.match(/priority/g)?.length).toBe(2);  // Only two occurrences of 'priority'
    });

    it('should handle metadata fields with various whitespace patterns', () => {
      const content = `- Test card
  tags: feature
  priority:high
  type:    feature
  assignee:     ai
  ticketId:  TASK-123`;  // Various whitespace patterns after colons

      const updates: Partial<KanbanCard> = {
        metadata: {
          priority: 'low',
          type: 'bug',
          assignee: 'human'
        }
      };

      const result = service.updateKanbanContent(content, 'TASK-123', updates);
      expect(result).toContain('priority: low');
      expect(result).toContain('type: bug');
      expect(result).toContain('assignee: human');
    });
  });
}); 