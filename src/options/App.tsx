import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ExternalLink, Save } from 'lucide-react';
import '../styles/global.css';

interface Settings {
  autoOpenSidePanel: boolean;
  showNotifications: boolean;
  defaultExportFormat: string;
}

function App() {
  const [settings, setSettings] = useState<Settings>({
    autoOpenSidePanel: true,
    showNotifications: true,
    defaultExportFormat: 'markdown'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await chrome.storage.sync.get(['settings']);
    if (result.settings) {
      setSettings(result.settings);
    }
  };

  const saveSettings = async () => {
    await chrome.storage.sync.set({ settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)] bg-clip-text text-transparent">
              SourceDrop Options
            </h1>
            <p className="text-gray-600 mt-2">Configure your clipping preferences</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Auto-open Side Panel</div>
                <div className="text-sm text-gray-500">
                  Automatically open side panel when clipping
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoOpenSidePanel}
                onChange={(e) => setSettings({ ...settings, autoOpenSidePanel: e.target.checked })}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Show Notifications</div>
                <div className="text-sm text-gray-500">
                  Display success/error notifications
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showNotifications}
                onChange={(e) => setSettings({ ...settings, showNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Default Export Format</div>
              <select
                value={settings.defaultExportFormat}
                onChange={(e) => setSettings({ ...settings, defaultExportFormat: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-app-blue"
              >
                <option value="markdown">Markdown</option>
                <option value="pdf">PDF</option>
                <option value="txt">Plain Text</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <button
              onClick={saveSettings}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Save className="w-5 h-5" />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-bold mb-4">About SourceDrop</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                SourceDrop is a free Chrome extension that helps you clip web pages, YouTube videos,
                and AI chats into Gemini Notebook (NotebookLM), and export artifacts to 18+ formats.
              </p>
              <p>
                No account required, no data collection, completely free.
              </p>
              <div className="flex flex-col gap-2 mt-6">
                <a
                  href="https://www.driveio.io/?referrer=SourceDrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-app-blue hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Drive I/O - Copy Google Drive folders
                </a>
                <a
                  href="https://www.driveio.io/standalone-plans/copy-folder-in-google-drive-extension?referrer=SourceDrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-app-blue hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Drive I/O Copy Folder Extension
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
