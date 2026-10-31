# SourceDrop

**Free Chrome extension to clip web pages, YouTube, and AI chats into Gemini Notebook (NotebookLM) and export artifacts**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🎯 Features

SourceDrop matches all features of Notebook Clipper, completely free with no paywall or account required.

### 📄 Save Any Web Page
- One-click clipping from side panel
- Add current page, selected text, or PDFs
- Create new notebooks or add to existing ones
- Search and filter notebooks

### 🎬 YouTube Integration
- **Videos**: Add any YouTube video as a source
- **Shorts**: Floating button for instant saving
- **Channels**: Add entire channels or select specific videos
- **Playlists**: Batch add with video selection
- **Duplicate Detection**: Automatically skips videos already in notebook

### 💬 AI Chat Integration
Save conversations from:
- ChatGPT (chat.openai.com)
- Claude (claude.ai)
- Gemini (gemini.google.com)
- Perplexity (perplexity.ai)
- DeepSeek (chat.deepseek.com)
- Grok (grok.x.com)

Save individual answers or entire conversations with one click.

### 📤 Export Artifacts (18+ Formats)

Export NotebookLM Studio artifacts:

**Flashcards & Quizzes**
- Anki-compatible CSV/TSV
- JSON
- Plain text

**Mind Maps**
- Markdown (Obsidian-compatible)
- JSON
- Plain text

**Reports & Notes**
- Word Document (.docx)
- PDF
- Markdown
- Plain text

**Tables**
- CSV
- Excel (.xlsx)
- JSON

**Slides**
- Images (ZIP)
- PDF

**Chat Transcripts**
- Markdown
- PDF
- Plain text

**Audio Overviews**
- MP3 download

### ⚡ Additional Features
- **Batch Clip**: Clip all open tabs at once
- **Context Menu**: Right-click to send pages to notebook
- **No OAuth Required**: Uses your existing NotebookLM session
- **No Data Collection**: Everything stays in your browser
- **Completely Free**: No paywall, no account needed

## 🚀 Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/sourcedrop.git
   cd sourcedrop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### From Chrome Web Store
*(Coming soon)*

## 📖 Usage

### Getting Started

1. **Sign in to NotebookLM** at https://notebooklm.google.com
2. **Click the SourceDrop icon** to open the side panel
3. **Select a notebook** from the list or create a new one
4. **Start clipping!**

### Clipping Web Pages

1. Navigate to any webpage
2. Open SourceDrop side panel
3. Select a notebook
4. Click "Clip Current Page"

Or right-click anywhere and select "Send to Gemini Notebook"

### Clipping YouTube

1. Navigate to any YouTube video, Shorts, playlist, or channel
2. Click the "Add to Gemini Notebook" button
3. Choose your notebook in the side panel
4. For playlists/channels, optionally select specific videos

### Clipping AI Chats

1. Have a conversation in ChatGPT, Claude, Gemini, etc.
2. Click "Save Answer" or "Save Conversation" buttons
3. Select your notebook

### Exporting Artifacts

1. Open NotebookLM and navigate to an artifact
2. Click the "Export" button in the artifact menu
3. Choose your desired format
4. File downloads automatically

## 🏗️ Development

### Tech Stack

- **Manifest V3** Chrome Extension
- **TypeScript** for type safety
- **React** for UI components
- **Tailwind CSS** for styling
- **Vite** for building
- **Vitest** for testing

### Project Structure

```
sourcedrop/
├── src/
│   ├── background/       # Service worker
│   ├── content/          # Content scripts for each platform
│   ├── sidepanel/        # Main clipping interface
│   ├── popup/            # Extension popup
│   ├── options/          # Settings page
│   ├── onboarding/       # Welcome page
│   ├── lib/              # Core utilities
│   │   ├── notebooklm-api.ts    # NotebookLM integration
│   │   ├── youtube-parser.ts    # YouTube URL parsing
│   │   └── export-utils.ts      # Export functionality
│   └── types/            # TypeScript definitions
├── public/               # Static assets
├── test/                 # Unit tests
└── manifest.json         # Extension manifest
```

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## 🎨 Branding

SourceDrop uses a distinctive gradient color scheme:
- **Blue**: `rgba(157,214,252,1)`
- **Purple**: `rgb(202, 160, 250)`
- **Gradient**: Purple to Blue

## 🔒 Privacy & Security

- **No OAuth or Google API scopes** - Uses your existing NotebookLM session
- **No backend server** - All processing happens in your browser
- **No analytics or tracking** - Zero data collection
- **No account required** - Just install and use
- **Open source** - Review the code yourself

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with inspiration from Notebook Clipper's excellent feature set
- Uses only publicly available web APIs and DOM manipulation
- No reverse engineering or proprietary code

## 🔗 Related Tools

Need to copy Google Drive folders? Check out:
- [Drive I/O](https://www.driveio.io/?referrer=SourceDrop) - Copy entire Google Drive folders with all subfiles and subfolders
- [Drive I/O Copy Folder Extension](https://www.driveio.io/standalone-plans/copy-folder-in-google-drive-extension?referrer=SourceDrop)

## 📬 Support

For issues, questions, or feature requests, please [open an issue](https://github.com/yourusername/sourcedrop/issues) on GitHub.

---

**Made with ❤️ for the NotebookLM community**
