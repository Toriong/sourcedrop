/**
 * NotebookLM API wrapper
 * Interacts with NotebookLM through the user's existing signed-in session using Google's batchexecute RPC protocol
 * No OAuth or Google API scopes required
 * 
 * API Research Sources:
 * - teng-lin/notebooklm-py: https://github.com/teng-lin/notebooklm-py
 * - Robiton/notebooklm-mcp-cli: https://github.com/Robiton/notebooklm-mcp-cli
 * - jacob-bd/notebooklm-mcp: https://github.com/jacob-bd/notebooklm-mcp
 * 
 * Protocol Documentation:
 * - https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-reference.md
 * - https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-development.md
 */

import { Notebook, Source, ClipRequest } from '../types';

const NOTEBOOKLM_BASE_URL = 'https://notebooklm.google.com';
const BATCHEXECUTE_URL = 'https://notebooklm.google.com/_/LabsTailwindUi/data/batchexecute';

// RPC method identifiers from notebooklm-py
// Source: https://github.com/teng-lin/notebooklm-py/blob/main/src/notebooklm/rpc/_identifiers.py
const RPC_IDS = {
  LIST_NOTEBOOKS: 'wXbhsf',
  CREATE_NOTEBOOK: 'CCqFvf',
  GET_NOTEBOOK: 'rLM1Ne',
  ADD_SOURCE: 'izAoDd',  // Unified for URL, YouTube, and text sources
  DELETE_SOURCE: 'tGMBJ',
} as const;

export class NotebookLMError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'NotebookLMError';
  }
}

/**
 * Extract authentication tokens from NotebookLM page
 * Tokens are embedded in WIZ_global_data JavaScript object
 */
async function getAuthTokens(): Promise<{ csrfToken: string; sessionId: string } | null> {
  try {
    const response = await fetch(`${NOTEBOOKLM_BASE_URL}/`, {
      credentials: 'include',
      method: 'GET'
    });
    
    if (!response.ok || response.redirected) {
      return null;
    }
    
    const html = await response.text();
    
    // Extract CSRF token (SNlM0e from WIZ_global_data)
    const csrfMatch = html.match(/SNlM0e['"]\s*:\s*['"]([^'"]+)['"]/);
    const csrfToken = csrfMatch?.[1];
    
    // Extract session ID (FdrFJe from WIZ_global_data)
    const sessionMatch = html.match(/FdrFJe['"]\s*:\s*['"]([^'"]+)['"]/);
    const sessionId = sessionMatch?.[1];
    
    if (!csrfToken || !sessionId) {
      return null;
    }
    
    return { csrfToken, sessionId };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is signed in to NotebookLM
 */
export async function checkSignIn(): Promise<boolean> {
  const tokens = await getAuthTokens();
  return tokens !== null;
}

/**
 * Build a batchexecute request body
 * Protocol: [[[rpc_id, JSON.stringify(params), null, "generic"]]]
 * 
 * Reference: https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-development.md
 */
function buildBatchExecuteRequest(rpcId: string, params: any[], csrfToken: string): string {
  const innerArray = [rpcId, JSON.stringify(params), null, 'generic'];
  const freqValue = JSON.stringify([[innerArray]]);
  
  const formData = new URLSearchParams();
  formData.append('f.req', freqValue);
  formData.append('at', csrfToken);
  
  return formData.toString();
}

/**
 * Parse batchexecute response
 * Response format: )]}' prefix + chunked JSON with ["wrb.fr", rpc_id, result_json_string]
 * 
 * Reference: https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-development.md#protocol-flow
 */
function parseBatchExecuteResponse(responseText: string, expectedRpcId: string): any {
  // Strip anti-XSSI prefix
  let text = responseText;
  if (text.startsWith(")]}'\n")) {
    text = text.substring(5);
  } else if (text.startsWith(")]}'")){
    text = text.substring(4);
  }
  
  // Parse chunked response
  // Format: byte_count\n[json_array]\nbyte_count\n[json_array]...
  const chunks: any[] = [];
  let pos = 0;
  
  while (pos < text.length) {
    // Skip whitespace
    while (pos < text.length && /\s/.test(text[pos])) {
      pos++;
    }
    
    if (pos >= text.length) break;
    
    // Skip numeric byte count lines
    if (/\d/.test(text[pos])) {
      while (pos < text.length && text[pos] !== '\n') {
        pos++;
      }
      continue;
    }
    
    // Try to parse JSON array
    if (text[pos] === '[') {
      try {
        const decoder = JSON.parse;
        const remaining = text.substring(pos);
        const parsed = decoder(remaining);
        chunks.push(parsed);
        pos += JSON.stringify(parsed).length;
      } catch {
        pos++;
      }
    } else {
      pos++;
    }
  }
  
  // Find the result for our RPC ID
  for (const chunk of chunks) {
    if (!Array.isArray(chunk)) continue;
    
    for (const entry of chunk) {
      if (!Array.isArray(entry) || entry.length < 3) continue;
      
      // Check for error entry
      if (entry[0] === 'er') {
        const errorCode = entry[1];
        if (errorCode === 7 || errorCode === 9) {
          throw new NotebookLMError('Authentication required. Please sign in to NotebookLM.', 'NOT_SIGNED_IN');
        }
        throw new NotebookLMError(`RPC error code ${errorCode}`, 'RPC_ERROR');
      }
      
      // Check for result entry
      if (entry[0] === 'wrb.fr' && entry[1] === expectedRpcId) {
        const resultJson = entry[2];
        if (resultJson === null || resultJson === undefined) {
          return null;
        }
        // Result is JSON-stringified again, need to parse it
        return JSON.parse(resultJson);
      }
    }
  }
  
  throw new NotebookLMError(`RPC result for '${expectedRpcId}' not found in response`, 'PARSE_ERROR');
}

/**
 * Make a batchexecute RPC call
 */
async function batchExecuteCall(rpcId: string, params: any[]): Promise<any> {
  const tokens = await getAuthTokens();
  if (!tokens) {
    throw new NotebookLMError('Please sign in to NotebookLM first', 'NOT_SIGNED_IN');
  }
  
  const requestBody = buildBatchExecuteRequest(rpcId, params, tokens.csrfToken);
  
  // Build URL with query parameters
  const url = new URL(BATCHEXECUTE_URL);
  url.searchParams.append('rpcids', rpcId);
  url.searchParams.append('source-path', '/');
  url.searchParams.append('f.sid', tokens.sessionId);
  url.searchParams.append('hl', 'en');
  url.searchParams.append('rt', 'c');
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: requestBody
  });
  
  if (!response.ok) {
    throw new NotebookLMError(`HTTP ${response.status}: ${response.statusText}`, 'HTTP_ERROR');
  }
  
  const responseText = await response.text();
  return parseBatchExecuteResponse(responseText, rpcId);
}

/**
 * Get all notebooks
 * RPC: wXbhsf with params [null, 1, null, [2]]
 * 
 * Reference: https://github.com/Robiton/notebooklm-mcp-cli/blob/main/docs/API_REFERENCE.md
 */
export async function getNotebooks(): Promise<Notebook[]> {
  try {
    const params = [null, 1, null, [2]];
    const result = await batchExecuteCall(RPC_IDS.LIST_NOTEBOOKS, params);
    return parseNotebooks(result);
  } catch (error) {
    if (error instanceof NotebookLMError) throw error;
    throw new NotebookLMError('Failed to fetch notebooks. Please ensure you are signed in to NotebookLM.');
  }
}

/**
 * Create a new notebook
 * RPC: CCqFvf with params [title, null, null, [2], [1,null,null,null,null,null,null,null,null,null,[1]]]
 * 
 * Reference: https://github.com/Robiton/notebooklm-mcp-cli/blob/main/docs/API_REFERENCE.md
 */
export async function createNotebook(title: string): Promise<Notebook> {
  try {
    const params = [
      title,
      null,
      null,
      [2],
      [1, null, null, null, null, null, null, null, null, null, [1]]
    ];
    
    const result = await batchExecuteCall(RPC_IDS.CREATE_NOTEBOOK, params);
    return parseNotebook(result);
  } catch (error) {
    if (error instanceof NotebookLMError) throw error;
    throw new NotebookLMError('Failed to create notebook');
  }
}

/**
 * Add a source to a notebook
 * RPC: izAoDd with different params structure based on source type
 * 
 * URL: [[[null, null, [url], null, null, null, null, null, null, null, 1]], notebook_id, [2, null, null, [1, ...]]]
 * YouTube: [[[null, null, null, null, null, null, null, [url], null, null, 1]], notebook_id, [2, null, null, [1, ...]]]
 * Text: [[[null, [title, content], null, 2, null, null, null, null, null, null, 1]], notebook_id, [2, null, null, [1, ...]]]
 * 
 * References:
 * - https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-reference.md#rpc-add_source-izaodd---url
 * - https://github.com/Robiton/notebooklm-mcp-cli/blob/main/docs/API_REFERENCE.md#source-types-via-izaodd-rpc
 */
export async function addSource(notebookId: string, clipRequest: ClipRequest): Promise<Source> {
  try {
    const sourceSpec = buildSourceSpec(clipRequest);
    const sharedConfig = [2, null, null, [1, null, null, null, null, null, null, null, null, null, [1]]];
    
    const params = [
      [[sourceSpec]],
      notebookId,
      sharedConfig
    ];
    
    const result = await batchExecuteCall(RPC_IDS.ADD_SOURCE, params);
    return parseSource(result);
  } catch (error) {
    if (error instanceof NotebookLMError) throw error;
    throw new NotebookLMError('Failed to add source to notebook');
  }
}

/**
 * Build source specification for ADD_SOURCE RPC based on clip request type
 * The source spec is an 11-element array with different positions for different types
 */
function buildSourceSpec(clipRequest: ClipRequest): any[] {
  const { type, url, title, content, youtubeData } = clipRequest;
  
  // Base 11-element array structure: all positions are initially null
  const sourceSpec: any[] = [null, null, null, null, null, null, null, null, null, null, 1];
  
  if (type === 'youtube' || (youtubeData && url)) {
    // YouTube: URL at position 7
    // Reference: https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-reference.md#rpc-add_source-izaodd---youtube
    sourceSpec[7] = [url || ''];
  } else if (type === 'selected-text' || type === 'text' || content) {
    // Text source: [title, content] at position 1, type code 2 at position 3
    // Reference: https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-reference.md#rpc-add_source-izaodd---text
    sourceSpec[1] = [title || 'Untitled', content || ''];
    sourceSpec[3] = 2;
  } else if (type === 'webpage' || url) {
    // Regular URL: URL at position 2
    // Reference: https://github.com/teng-lin/notebooklm-py/blob/main/docs/rpc-reference.md#rpc-add_source-izaodd---url
    sourceSpec[2] = [url || ''];
  }
  
  return sourceSpec;
}

/**
 * Search notebooks by title
 */
export async function searchNotebooks(query: string): Promise<Notebook[]> {
  const notebooks = await getNotebooks();
  const lowerQuery = query.toLowerCase();
  return notebooks.filter(nb => nb.title.toLowerCase().includes(lowerQuery));
}

/**
 * Get sources for a notebook to check for duplicates
 * RPC: rLM1Ne with params [notebook_id, null, [2], null, 0]
 * 
 * Reference: https://github.com/Robiton/notebooklm-mcp-cli/blob/main/docs/API_REFERENCE.md
 */
export async function getNotebookSources(notebookId: string): Promise<Source[]> {
  try {
    const params = [notebookId, null, [2], null, 0];
    const result = await batchExecuteCall(RPC_IDS.GET_NOTEBOOK, params);
    
    // Parse sources from notebook details response
    if (result && result[1] && Array.isArray(result[1])) {
      return result[1].map(parseSourceFromNotebook);
    }
    
    return [];
  } catch (error) {
    // If we can't get sources, return empty array rather than failing
    console.warn('Failed to get notebook sources:', error);
    return [];
  }
}

// Helper functions to parse NotebookLM responses
function parseNotebooks(data: any): Notebook[] {
  // Response format: [[notebook_data, ...]]
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  const notebooksArray = data[0];
  if (!Array.isArray(notebooksArray)) {
    return [];
  }
  
  return notebooksArray.map(parseNotebook).filter(nb => nb.id);
}

function parseNotebook(data: any): Notebook {
  if (!data || !Array.isArray(data)) {
    return { id: '', title: 'Unknown', sourceCount: 0 };
  }
  
  // Typical structure: [id, title, ..., metadata]
  const id = data[0] || '';
  const title = data[1] || 'Untitled';
  
  // Try to find source count in metadata
  let sourceCount = 0;
  for (const item of data) {
    if (typeof item === 'number' && item > 0 && item < 10000) {
      sourceCount = item;
      break;
    }
  }
  
  return {
    id,
    title,
    sourceCount,
  };
}

function parseSource(data: any): Source {
  if (!data || !Array.isArray(data)) {
    return { id: '', title: 'Unknown', type: 'webpage' };
  }
  
  // Typical structure: [[id], url_or_title, metadata_array]
  const id = Array.isArray(data[0]) ? data[0][0] : data[0] || '';
  const titleOrUrl = data[1] || 'Untitled Source';
  
  // Determine type from metadata if available
  let type: Source['type'] = 'webpage';
  if (data[2] && Array.isArray(data[2])) {
    const typeCode = data[2][4]; // Type code at position 4 in metadata
    if (typeCode === 1) type = 'webpage';
    else if (typeCode === 2) type = 'text';
    else if (typeCode === 3) type = 'youtube';
    else if (typeCode === 4) type = 'pdf';
  }
  
  return {
    id,
    title: titleOrUrl,
    url: type !== 'text' ? titleOrUrl : undefined,
    type,
  };
}

function parseSourceFromNotebook(data: any): Source {
  // Sources in GET_NOTEBOOK response have slightly different structure
  return parseSource(data);
}
