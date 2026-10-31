import { describe, it, expect } from 'vitest';
import { exportFlashcardsToAnki, exportMindMapToMarkdown, exportTableToCSV } from '../src/lib/export-utils';

describe('Export Utils', () => {
  describe('exportFlashcardsToAnki', () => {
    it('should export flashcards to CSV format', () => {
      const flashcards = [
        { front: 'Question 1', back: 'Answer 1' },
        { front: 'Question 2', back: 'Answer 2' }
      ];

      const result = exportFlashcardsToAnki(flashcards, 'csv');
      
      expect(result).toContain('Front,Back');
      expect(result).toContain('Question 1,Answer 1');
      expect(result).toContain('Question 2,Answer 2');
    });

    it('should export flashcards to TSV format', () => {
      const flashcards = [
        { front: 'Question 1', back: 'Answer 1' }
      ];

      const result = exportFlashcardsToAnki(flashcards, 'tsv');
      
      expect(result).toContain('Front\tBack');
      expect(result).toContain('Question 1\tAnswer 1');
    });

    it('should escape special characters in CSV', () => {
      const flashcards = [
        { front: 'Question, with comma', back: 'Answer "with quotes"' }
      ];

      const result = exportFlashcardsToAnki(flashcards, 'csv');
      
      expect(result).toContain('"Question, with comma"');
      expect(result).toContain('"Answer ""with quotes"""');
    });
  });

  describe('exportMindMapToMarkdown', () => {
    it('should export mind map to markdown', () => {
      const mindmap = {
        title: 'Test Mind Map',
        nodes: [
          { label: 'Node 1', children: [] },
          { label: 'Node 2', children: [
            { label: 'Child 1', children: [] }
          ]}
        ]
      };

      const result = exportMindMapToMarkdown(mindmap);
      
      expect(result).toContain('# Test Mind Map');
      expect(result).toContain('- Node 1');
      expect(result).toContain('- Node 2');
      expect(result).toContain('  - Child 1');
    });
  });

  describe('exportTableToCSV', () => {
    it('should export table to CSV', () => {
      const table = {
        headers: ['Name', 'Age', 'City'],
        rows: [
          ['John', '30', 'NYC'],
          ['Jane', '25', 'LA']
        ]
      };

      const result = exportTableToCSV(table);
      
      expect(result).toContain('Name,Age,City');
      expect(result).toContain('John,30,NYC');
      expect(result).toContain('Jane,25,LA');
    });
  });
});
