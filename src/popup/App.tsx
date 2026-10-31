import { createRoot } from 'react-dom/client';
import { ExternalLink, BookOpen, Youtube, MessageSquare, Download } from 'lucide-react';
import '../styles/global.css';

function App() {
  const openSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
        window.close();
      }
    });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-full bg-white">
      <div className="p-4 bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)]">
        <h1 className="text-lg font-bold text-white">SourceDrop</h1>
        <p className="text-xs text-white/90">Clip to Gemini Notebook</p>
      </div>

      <div className="p-4 space-y-3">
        <button
          onClick={openSidePanel}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
        >
          <BookOpen className="w-5 h-5 text-app-blue" />
          <div>
            <div className="font-medium text-sm">Open Side Panel</div>
            <div className="text-xs text-gray-500">Clip pages & manage notebooks</div>
          </div>
        </button>

        <div className="border-t pt-3">
          <div className="text-xs font-medium text-gray-500 mb-2 px-1">Features</div>
          <div className="space-y-1 text-xs text-gray-600 px-1">
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4 text-app-purple" />
              <span>YouTube videos, playlists & channels</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-app-purple" />
              <span>AI chats (ChatGPT, Claude, etc.)</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-app-purple" />
              <span>Export artifacts to 18+ formats</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <a
            href="https://www.driveio.io/?referrer=SourceDrop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-app-blue hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Check out Drive I/O - Copy Google Drive folders</span>
          </a>
        </div>

        <button
          onClick={openOptions}
          className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
        >
          Options
        </button>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
