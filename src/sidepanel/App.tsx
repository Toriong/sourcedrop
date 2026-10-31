import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Plus, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Notebook, ClipRequest } from '../types';
import { getNotebooks, createNotebook, addSource, NotebookLMError } from '../lib/notebooklm-api';
import '../styles/global.css';

function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [filteredNotebooks, setFilteredNotebooks] = useState<Notebook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [clipping, setClipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingClip, setPendingClip] = useState<ClipRequest | null>(null);
  const [currentTab, setCurrentTab] = useState<{ url?: string; title?: string }>({});

  useEffect(() => {
    loadNotebooks();
    loadPendingClip();
    getCurrentTab();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = notebooks.filter(nb =>
        nb.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotebooks(filtered);
    } else {
      setFilteredNotebooks(notebooks);
    }
  }, [searchQuery, notebooks]);

  const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    setCurrentTab({ url: tab.url, title: tab.title });
  };

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const nbs = await getNotebooks();
      setNotebooks(nbs);
      setFilteredNotebooks(nbs);
    } catch (err) {
      if (err instanceof NotebookLMError && err.code === 'NOT_SIGNED_IN') {
        setError('Please sign in to NotebookLM first');
      } else {
        setError('Failed to load notebooks. Please ensure you are signed in to NotebookLM.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPendingClip = async () => {
    const result = await chrome.storage.local.get(['pendingClip']);
    if (result.pendingClip) {
      setPendingClip(result.pendingClip);
      await chrome.storage.local.remove(['pendingClip']);
    }
  };

  const handleCreateNotebook = async () => {
    const title = prompt('Enter notebook title:');
    if (!title) return;

    try {
      setLoading(true);
      const newNotebook = await createNotebook(title);
      setNotebooks([newNotebook, ...notebooks]);
      setSuccess('Notebook created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create notebook');
    } finally {
      setLoading(false);
    }
  };

  const handleClipCurrentPage = async () => {
    if (!selectedNotebook) {
      setError('Please select a notebook first');
      return;
    }

    if (!currentTab.url) {
      setError('No active tab found');
      return;
    }

    const clipRequest: ClipRequest = {
      type: 'webpage',
      url: currentTab.url,
      title: currentTab.title || currentTab.url
    };

    await performClip(selectedNotebook, clipRequest);
  };

  const handleClipPending = async () => {
    if (!selectedNotebook || !pendingClip) return;
    await performClip(selectedNotebook, pendingClip);
    setPendingClip(null);
  };

  const performClip = async (notebookId: string, clipRequest: ClipRequest) => {
    try {
      setClipping(true);
      setError(null);
      await addSource(notebookId, clipRequest);
      setSuccess(`Successfully added to notebook! 📚`);
      setTimeout(() => setSuccess(null), 8000);
    } catch (err) {
      if (err instanceof NotebookLMError && err.code === 'NOT_SIGNED_IN') {
        setError('Please sign in to NotebookLM first');
      } else {
        setError('Failed to clip. Please try again.');
      }
    } finally {
      setClipping(false);
    }
  };

  const handleClipSelectedText = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() || ''
    });

    const selectedText = result[0]?.result;
    if (!selectedText) {
      setError('No text selected');
      return;
    }

    if (!selectedNotebook) {
      setError('Please select a notebook first');
      return;
    }

    await performClip(selectedNotebook, {
      type: 'selected-text',
      content: selectedText,
      title: 'Selected Text from ' + (currentTab.title || 'page')
    });
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)]">
        <h1 className="text-xl font-bold text-white mb-2">SourceDrop</h1>
        <p className="text-sm text-white/90">Clip to Gemini Notebook</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border-b border-green-200">
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
          <a
            href="https://www.driveio.io/?referrer=SourceDrop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            <span>Need to copy Google Drive folders?</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Current page info */}
      {currentTab.url && (
        <div className="p-3 border-b bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">Current page:</div>
          <div className="text-sm font-medium truncate">{currentTab.title}</div>
          <div className="text-xs text-gray-500 truncate">{currentTab.url}</div>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-3 border-b space-y-2">
        <button
          onClick={handleClipCurrentPage}
          disabled={!selectedNotebook || clipping}
          className="w-full px-4 py-2 bg-app-blue hover:bg-app-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {clipping ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Clip Current Page
        </button>
        
        <button
          onClick={handleClipSelectedText}
          disabled={!selectedNotebook || clipping}
          className="w-full px-4 py-2 bg-app-purple hover:bg-app-purple/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Clip Selected Text
        </button>
      </div>

      {/* Pending clip notification */}
      {pendingClip && (
        <div className="p-3 border-b bg-blue-50">
          <div className="text-sm mb-2">
            Ready to clip: <strong>{pendingClip.title || 'Item'}</strong>
          </div>
          <button
            onClick={handleClipPending}
            disabled={!selectedNotebook || clipping}
            className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded text-sm"
          >
            Clip to Selected Notebook
          </button>
        </div>
      )}

      {/* Notebook search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue"
          />
        </div>
        <button
          onClick={handleCreateNotebook}
          className="mt-2 w-full px-3 py-2 border-2 border-dashed border-gray-300 hover:border-app-blue rounded-lg text-sm text-gray-600 hover:text-app-blue transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Notebook
        </button>
      </div>

      {/* Notebooks list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-app-blue" />
          </div>
        ) : filteredNotebooks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No notebooks found' : 'No notebooks yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredNotebooks.map((notebook) => (
              <button
                key={notebook.id}
                onClick={() => setSelectedNotebook(notebook.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedNotebook === notebook.id
                    ? 'bg-app-blue/20 border-2 border-app-blue'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="font-medium">{notebook.title}</div>
                {notebook.sourceCount !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">
                    {notebook.sourceCount} sources
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Drive I/O promotion */}
      <div className="p-3 border-t bg-gray-50">
        <a
          href="https://www.driveio.io/?referrer=SourceDrop"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-app-blue transition-colors"
        >
          <span>Check out Drive I/O - Copy Google Drive folders</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
