export interface Notebook {
  id: string;
  title: string;
  sourceCount?: number;
  lastModified?: Date;
}

export interface Source {
  id: string;
  title: string;
  url?: string;
  type: 'webpage' | 'pdf' | 'youtube' | 'text' | 'chat';
  content?: string;
}

export interface ClipRequest {
  type: 'webpage' | 'pdf' | 'youtube' | 'text' | 'chat' | 'selected-text';
  url?: string;
  title?: string;
  content?: string;
  notebookId?: string;
  youtubeData?: YouTubeData;
  chatData?: ChatData;
}

export interface YouTubeData {
  videoId?: string;
  videoIds?: string[];
  channelId?: string;
  playlistId?: string;
  type: 'video' | 'shorts' | 'playlist' | 'channel';
}

export interface ChatData {
  platform: 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'deepseek' | 'grok';
  messages: ChatMessage[];
  conversationId?: string;
  fullConversation: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface Artifact {
  id: string;
  type: 'flashcard' | 'quiz' | 'mindmap' | 'report' | 'note' | 'table' | 'slides';
  title: string;
  content: any;
}

export interface ExportFormat {
  format: string;
  label: string;
  extension: string;
  mimeType: string;
}

export const EXPORT_FORMATS: Record<string, ExportFormat[]> = {
  flashcard: [
    { format: 'anki-csv', label: 'Anki (CSV)', extension: 'csv', mimeType: 'text/csv' },
    { format: 'anki-tsv', label: 'Anki (TSV)', extension: 'tsv', mimeType: 'text/tab-separated-values' },
    { format: 'json', label: 'JSON', extension: 'json', mimeType: 'application/json' },
    { format: 'txt', label: 'Plain Text', extension: 'txt', mimeType: 'text/plain' }
  ],
  quiz: [
    { format: 'json', label: 'JSON', extension: 'json', mimeType: 'application/json' },
    { format: 'csv', label: 'CSV', extension: 'csv', mimeType: 'text/csv' },
    { format: 'txt', label: 'Plain Text', extension: 'txt', mimeType: 'text/plain' }
  ],
  mindmap: [
    { format: 'markdown', label: 'Markdown (Obsidian)', extension: 'md', mimeType: 'text/markdown' },
    { format: 'json', label: 'JSON', extension: 'json', mimeType: 'application/json' },
    { format: 'txt', label: 'Plain Text', extension: 'txt', mimeType: 'text/plain' }
  ],
  report: [
    { format: 'docx', label: 'Word Document', extension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { format: 'markdown', label: 'Markdown', extension: 'md', mimeType: 'text/markdown' },
    { format: 'pdf', label: 'PDF', extension: 'pdf', mimeType: 'application/pdf' },
    { format: 'txt', label: 'Plain Text', extension: 'txt', mimeType: 'text/plain' }
  ],
  note: [
    { format: 'markdown', label: 'Markdown', extension: 'md', mimeType: 'text/markdown' },
    { format: 'txt', label: 'Plain Text', extension: 'txt', mimeType: 'text/plain' },
    { format: 'pdf', label: 'PDF', extension: 'pdf', mimeType: 'application/pdf' }
  ],
  table: [
    { format: 'csv', label: 'CSV', extension: 'csv', mimeType: 'text/csv' },
    { format: 'json', label: 'JSON', extension: 'json', mimeType: 'application/json' },
    { format: 'xlsx', label: 'Excel', extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  ],
  slides: [
    { format: 'images', label: 'Images (ZIP)', extension: 'zip', mimeType: 'application/zip' },
    { format: 'pdf', label: 'PDF', extension: 'pdf', mimeType: 'application/pdf' }
  ],
  chat: [
    { format: 'markdown', label: 'Markdown', extension: 'md', mimeType: 'text/markdown' },
    { format: 'pdf', label: 'PDF', extension: 'pdf', mimeType: 'application/pdf' },
    { format: 'txt', label: 'Plain Text', extension: 'txt', mimeType: 'text/plain' }
  ],
  audio: [
    { format: 'mp3', label: 'Audio Overview (MP3)', extension: 'mp3', mimeType: 'audio/mpeg' }
  ]
};
