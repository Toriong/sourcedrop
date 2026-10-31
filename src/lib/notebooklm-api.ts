/**
 * NotebookLM API wrapper
 * Interacts with NotebookLM through the user's existing signed-in session
 * No OAuth or Google API scopes required
 */

import { Notebook, Source, ClipRequest } from '../types';

const NOTEBOOKLM_BASE_URL = 'https://notebooklm.google.com';

export class NotebookLMError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'NotebookLMError';
  }
}

/**
 * Check if user is signed in to NotebookLM
 */
export async function checkSignIn(): Promise<boolean> {
  try {
    const response = await fetch(`${NOTEBOOKLM_BASE_URL}/notebooks`, {
      credentials: 'include',
      method: 'GET'
    });
    return response.ok && !response.redirected;
  } catch (error) {
    return false;
  }
}

/**
 * Get all notebooks
 */
export async function getNotebooks(): Promise<Notebook[]> {
  try {
    const isSignedIn = await checkSignIn();
    if (!isSignedIn) {
      throw new NotebookLMError('Please sign in to NotebookLM first', 'NOT_SIGNED_IN');
    }

    // This is a placeholder - actual implementation would need to reverse-engineer
    // NotebookLM's internal API endpoints
    const response = await fetch(`${NOTEBOOKLM_BASE_URL}/api/notebooks`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new NotebookLMError('Failed to fetch notebooks');
    }

    const data = await response.json();
    return parseNotebooks(data);
  } catch (error) {
    if (error instanceof NotebookLMError) throw error;
    throw new NotebookLMError('Failed to connect to NotebookLM. Please ensure you are signed in.');
  }
}

/**
 * Create a new notebook
 */
export async function createNotebook(title: string): Promise<Notebook> {
  try {
    const isSignedIn = await checkSignIn();
    if (!isSignedIn) {
      throw new NotebookLMError('Please sign in to NotebookLM first', 'NOT_SIGNED_IN');
    }

    const response = await fetch(`${NOTEBOOKLM_BASE_URL}/api/notebooks`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new NotebookLMError('Failed to create notebook');
    }

    const data = await response.json();
    return parseNotebook(data);
  } catch (error) {
    if (error instanceof NotebookLMError) throw error;
    throw new NotebookLMError('Failed to create notebook');
  }
}

/**
 * Add a source to a notebook
 */
export async function addSource(notebookId: string, clipRequest: ClipRequest): Promise<Source> {
  try {
    const isSignedIn = await checkSignIn();
    if (!isSignedIn) {
      throw new NotebookLMError('Please sign in to NotebookLM first', 'NOT_SIGNED_IN');
    }

    const sourceData = buildSourceData(clipRequest);

    const response = await fetch(
      `${NOTEBOOKLM_BASE_URL}/api/notebooks/${notebookId}/sources`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sourceData)
      }
    );

    if (!response.ok) {
      throw new NotebookLMError('Failed to add source');
    }

    const data = await response.json();
    return parseSource(data);
  } catch (error) {
    if (error instanceof NotebookLMError) throw error;
    throw new NotebookLMError('Failed to add source to notebook');
  }
}

/**
 * Search notebooks by title
 */
export async function searchNotebooks(query: string): Promise<Notebook[]> {
  const notebooks = await getNotebooks();
  const lowerQuery = query.toLowerCase();
  return notebooks.filter(nb => nb.title.toLowerCase().includes(lowerQuery));
}

// Helper functions to parse NotebookLM responses
function parseNotebooks(data: any): Notebook[] {
  // Placeholder parser - actual implementation depends on NotebookLM's response format
  if (Array.isArray(data)) {
    return data.map(parseNotebook);
  }
  if (data.notebooks && Array.isArray(data.notebooks)) {
    return data.notebooks.map(parseNotebook);
  }
  return [];
}

function parseNotebook(data: any): Notebook {
  return {
    id: data.id || data.notebookId || '',
    title: data.title || data.name || 'Untitled',
    sourceCount: data.sourceCount || data.sources?.length || 0,
    lastModified: data.lastModified ? new Date(data.lastModified) : undefined
  };
}

function parseSource(data: any): Source {
  return {
    id: data.id || data.sourceId || '',
    title: data.title || 'Untitled Source',
    url: data.url,
    type: data.type || 'webpage'
  };
}

function buildSourceData(clipRequest: ClipRequest): any {
  const baseData: any = {
    title: clipRequest.title || 'Untitled',
    type: clipRequest.type
  };

  if (clipRequest.url) {
    baseData.url = clipRequest.url;
  }

  if (clipRequest.content) {
    baseData.content = clipRequest.content;
  }

  if (clipRequest.youtubeData) {
    baseData.youtubeData = clipRequest.youtubeData;
  }

  if (clipRequest.chatData) {
    baseData.chatData = clipRequest.chatData;
  }

  return baseData;
}
