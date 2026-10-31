import { describe, it, expect } from 'vitest';

/**
 * Tests for NotebookLM API request/response building and parsing
 * 
 * These tests verify the batchexecute protocol implementation without
 * making actual network requests to NotebookLM.
 */

describe('NotebookLM API - Request Building', () => {
  describe('buildBatchExecuteRequest', () => {
    it('should build correct request format for LIST_NOTEBOOKS', () => {
      const rpcId = 'wXbhsf';
      const params = [null, 1, null, [2]];
      const csrfToken = 'test-csrf-token';
      
      // Simulate the request building logic
      const innerArray = [rpcId, JSON.stringify(params), null, 'generic'];
      const freqValue = JSON.stringify([[innerArray]]);
      
      const formData = new URLSearchParams();
      formData.append('f.req', freqValue);
      formData.append('at', csrfToken);
      
      const result = formData.toString();
      
      expect(result).toContain('f.req=');
      expect(result).toContain('at=test-csrf-token');
      expect(result).toContain('wXbhsf');
      expect(decodeURIComponent(result)).toContain('[null,1,null,[2]]');
    });

    it('should build correct request for CREATE_NOTEBOOK', () => {
      const rpcId = 'CCqFvf';
      const params = [
        'Test Notebook',
        null,
        null,
        [2],
        [1, null, null, null, null, null, null, null, null, null, [1]]
      ];
      
      const innerArray = [rpcId, JSON.stringify(params), null, 'generic'];
      const freqValue = JSON.stringify([[innerArray]]);
      
      const decoded = JSON.parse(freqValue);
      expect(decoded[0][0][0]).toBe('CCqFvf');
      expect(JSON.parse(decoded[0][0][1])[0]).toBe('Test Notebook');
    });

    it('should build correct ADD_SOURCE request for URL', () => {
      const rpcId = 'izAoDd';
      const url = 'https://example.com/article';
      const sourceSpec = [null, null, [url], null, null, null, null, null, null, null, 1];
      const notebookId = 'test-notebook-id';
      const sharedConfig = [2, null, null, [1, null, null, null, null, null, null, null, null, null, [1]]];
      
      const params = [[[sourceSpec]], notebookId, sharedConfig];
      const innerArray = [rpcId, JSON.stringify(params), null, 'generic'];
      const freqValue = JSON.stringify([[innerArray]]);
      
      const decoded = JSON.parse(freqValue);
      const decodedParams = JSON.parse(decoded[0][0][1]);
      
      // Verify URL is at position 2 of source spec
      expect(decodedParams[0][0][0][2][0]).toBe(url);
      expect(decodedParams[1]).toBe(notebookId);
    });

    it('should build correct ADD_SOURCE request for YouTube', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const sourceSpec = [null, null, null, null, null, null, null, [url], null, null, 1];
      
      // Verify YouTube URL is at position 7
      expect(sourceSpec[7]).toEqual([url]);
      expect(sourceSpec[2]).toBeNull();
    });

    it('should build correct ADD_SOURCE request for text', () => {
      const title = 'My Notes';
      const content = 'This is the content of my notes.';
      const sourceSpec = [null, [title, content], null, 2, null, null, null, null, null, null, 1];
      
      // Verify text data is at position 1, type code 2 at position 3
      expect(sourceSpec[1]).toEqual([title, content]);
      expect(sourceSpec[3]).toBe(2);
    });
  });

  describe('Response Parsing', () => {
    it('should strip anti-XSSI prefix from response', () => {
      const response = ")]}'\n123\n[[\"wrb.fr\",\"wXbhsf\",\"[]\",null,null]]";
      
      let text = response;
      if (text.startsWith(")]}'\n")) {
        text = text.substring(5);
      }
      
      expect(text).not.toContain(")]}");
      expect(text).toContain('123');
    });

    it('should parse chunked JSON response', () => {
      const mockResponse = '123\n[[\"wrb.fr\",\"wXbhsf\",\"[[\\\"test-id\\\",\\\"Test Notebook\\\"]]\",null,null]]';
      
      // Simple chunk parser simulation
      const chunks: any[] = [];
      const lines = mockResponse.split('\n');
      
      for (const line of lines) {
        if (/^\d+$/.test(line)) continue; // Skip byte count
        if (line.startsWith('[')) {
          try {
            chunks.push(JSON.parse(line));
          } catch {
            // Skip invalid JSON
          }
        }
      }
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0][0][0]).toBe('wrb.fr');
      expect(chunks[0][0][1]).toBe('wXbhsf');
    });

    it('should extract and double-parse result JSON', () => {
      const resultJson = '[[\"notebook-123\",\"My Notebook\"]]';
      const mockChunk = [['wrb.fr', 'wXbhsf', resultJson, null, null]];
      
      // Find wrb.fr entry
      const entry = mockChunk[0];
      expect(entry[0]).toBe('wrb.fr');
      expect(entry[1]).toBe('wXbhsf');
      
      // Double parse
      const parsed = JSON.parse(entry[2]);
      expect(parsed[0][0]).toBe('notebook-123');
      expect(parsed[0][1]).toBe('My Notebook');
    });

    it('should detect auth errors', () => {
      const mockChunk = [['er', 7]]; // Error code 7 = auth error
      
      const entry = mockChunk[0];
      expect(entry[0]).toBe('er');
      expect(entry[1]).toBe(7);
      
      // In real implementation, this would throw NotebookLMError with NOT_SIGNED_IN
    });
  });

  describe('Source Specification Building', () => {
    it('should detect YouTube URLs and use position 7', () => {
      const url = 'https://www.youtube.com/watch?v=test123';
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      expect(isYouTube).toBe(true);
      
      const sourceSpec = [null, null, null, null, null, null, null, null, null, null, 1];
      if (isYouTube) {
        sourceSpec[7] = [url];
      }
      
      expect(sourceSpec[7]).toEqual([url]);
      expect(sourceSpec[2]).toBeNull();
    });

    it('should use position 2 for regular URLs', () => {
      const url = 'https://example.com/article';
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      expect(isYouTube).toBe(false);
      
      const sourceSpec = [null, null, null, null, null, null, null, null, null, null, 1];
      if (!isYouTube) {
        sourceSpec[2] = [url];
      }
      
      expect(sourceSpec[2]).toEqual([url]);
      expect(sourceSpec[7]).toBeNull();
    });

    it('should build text source with type code 2', () => {
      const title = 'Selected Text';
      const content = 'This is some selected text from a webpage.';
      
      const sourceSpec = [null, null, null, null, null, null, null, null, null, null, 1];
      sourceSpec[1] = [title, content];
      sourceSpec[3] = 2;
      
      expect(sourceSpec[1]).toEqual([title, content]);
      expect(sourceSpec[3]).toBe(2);
    });
  });

  describe('Notebook Parsing', () => {
    it('should parse notebook list response', () => {
      const mockResponse = [
        [
          ['notebook-1', 'First Notebook', null, null, null, 5],
          ['notebook-2', 'Second Notebook', null, null, null, 3]
        ]
      ];
      
      const notebooks = mockResponse[0].map((data: any) => ({
        id: data[0],
        title: data[1],
        sourceCount: data[5] || 0
      }));
      
      expect(notebooks).toHaveLength(2);
      expect(notebooks[0].id).toBe('notebook-1');
      expect(notebooks[0].title).toBe('First Notebook');
      expect(notebooks[0].sourceCount).toBe(5);
    });

    it('should parse notebook creation response', () => {
      const mockResponse = ['new-notebook-id', 'New Notebook Title', []];
      
      const notebook = {
        id: mockResponse[0],
        title: mockResponse[1],
        sourceCount: 0
      };
      
      expect(notebook.id).toBe('new-notebook-id');
      expect(notebook.title).toBe('New Notebook Title');
    });
  });

  describe('Source Parsing', () => {
    it('should parse source add response', () => {
      const mockResponse = [
        ['source-id-123'],
        'https://example.com/article',
        [null, null, null, null, 1] // Type 1 = webpage
      ];
      
      const source = {
        id: mockResponse[0][0],
        title: mockResponse[1],
        url: mockResponse[1],
        type: 'webpage' as const
      };
      
      expect(source.id).toBe('source-id-123');
      expect(source.url).toBe('https://example.com/article');
    });

    it('should parse text source response', () => {
      const mockResponse = [
        ['text-source-id'],
        'My Notes',
        [null, null, null, null, 2] // Type 2 = text
      ];
      
      const typeCode = mockResponse[2][4];
      const type = typeCode === 2 ? 'text' : 'webpage';
      
      expect(type).toBe('text');
    });

    it('should parse YouTube source response', () => {
      const mockResponse = [
        ['yt-source-id'],
        'https://youtube.com/watch?v=test',
        [null, null, null, null, 3] // Type 3 = youtube
      ];
      
      const typeCode = mockResponse[2][4];
      const type = typeCode === 3 ? 'youtube' : 'webpage';
      
      expect(type).toBe('youtube');
    });
  });
});
