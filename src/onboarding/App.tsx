import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Youtube, MessageSquare, Download, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import '../styles/global.css';

function App() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to SourceDrop!',
      description: 'Your free companion for Gemini Notebook (NotebookLM)',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-6">📚</div>
          <p className="text-lg text-gray-700">
            SourceDrop helps you clip web pages, YouTube videos, and AI chats into Gemini Notebook,
            and export artifacts to 18+ formats.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✨ Completely Free</p>
            <p className="text-sm text-green-700 mt-1">
              No account required, no paywall, no data collection
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Clip Anything',
      description: 'Add sources to your notebooks in one click',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-app-blue flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Web Pages & PDFs</h3>
              <p className="text-sm text-gray-600">
                Open the side panel and clip the current page or selected text
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Youtube className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">YouTube Content</h3>
              <p className="text-sm text-gray-600">
                Add videos, Shorts, playlists, or entire channels with duplicate detection
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <MessageSquare className="w-8 h-8 text-app-purple flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">AI Chats</h3>
              <p className="text-sm text-gray-600">
                Save conversations from ChatGPT, Claude, Gemini, Perplexity, DeepSeek, and Grok
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Export Everything',
      description: 'Get your artifacts in the format you need',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Download className="w-8 h-8 text-app-blue flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">18+ Export Formats</h3>
              <ul className="text-sm text-gray-600 space-y-1 mt-2">
                <li>• Flashcards → Anki (CSV/TSV)</li>
                <li>• Mind Maps → Obsidian/Markdown</li>
                <li>• Reports → Word (.docx) or PDF</li>
                <li>• Tables → CSV or Excel</li>
                <li>• Chat transcripts → Markdown/PDF</li>
                <li>• Audio Overviews → MP3 download</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Get Started',
      description: 'You\'re all set!',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-6">🚀</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-left">Sign in to NotebookLM (notebooklm.google.com)</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p className="text-left">Click the SourceDrop icon to open the side panel</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <p className="text-left">Start clipping pages, videos, and chats!</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-4">
              Need to copy Google Drive folders?
            </p>
            <div className="space-y-2">
              <a
                href="https://www.driveio.io/?referrer=SourceDrop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-app-blue hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Check out Drive I/O</span>
              </a>
              <a
                href="https://www.driveio.io/standalone-plans/copy-folder-in-google-drive-extension?referrer=SourceDrop"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-app-blue hover:underline text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Drive I/O Copy Folder Extension</span>
              </a>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)] p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{currentStep.title}</h1>
            <p className="text-white/90">{currentStep.description}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {currentStep.content}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 flex items-center justify-between">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === step
                      ? 'w-8 bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)]'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => window.close()}
                  className="px-6 py-2 bg-gradient-to-r from-[rgba(209,127,247,1)] to-[rgba(157,214,252,1)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              )}
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
