# SourceDrop Deployment Guide

This guide covers testing, finalizing assets, and publishing SourceDrop to the Chrome Web Store.

## Prerequisites

1. **NotebookLM Account**: Active Google account with access to NotebookLM (notebooklm.google.com)
2. **Chrome Browser**: Latest version for testing
3. **Chrome Web Store Developer Account**: $5 one-time registration fee
4. **Screen Recording Software**: For demo videos

## Step 1: Local Testing

### Install the Extension Locally

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. Verify installation:
   - Extension icon should appear in toolbar
   - Click icon to open popup
   - Onboarding page should open in new tab

### Test Core Features

#### Test 1: Side Panel Clipping
1. Navigate to any article (e.g., Wikipedia, blog post)
2. Click SourceDrop icon
3. Side panel should open on the right
4. Verify:
   - [ ] Notebooks list loads
   - [ ] Can select a notebook
   - [ ] "Clip Current Page" button works
   - [ ] Success message appears
   - [ ] Page added to NotebookLM (verify in NotebookLM)

#### Test 2: Selected Text Clipping
1. On any webpage, select some text
2. Open side panel
3. Click "Clip Selected Text"
4. Verify text appears as source in NotebookLM

#### Test 3: YouTube Integration
1. Navigate to a YouTube video
2. Verify "Add to Gemini Notebook" button appears
3. Click button and select notebook
4. Verify video added to NotebookLM

5. Test YouTube Shorts:
   - Navigate to a Shorts video
   - Verify floating button appears

6. Test playlist (optional):
   - Navigate to a playlist
   - Verify button appears for playlist

#### Test 4: AI Chat Integration
Test at least one AI chat platform:

**ChatGPT** (recommended):
1. Go to chat.openai.com
2. Have a conversation
3. Verify "Save Answer" and "Save Conversation" buttons appear
4. Click one and verify chat saved to NotebookLM

Repeat for other platforms if available: Claude, Gemini, Perplexity, DeepSeek, Grok

#### Test 5: Artifact Export
1. Open NotebookLM
2. Navigate to a notebook with artifacts (flashcards, mind maps, etc.)
3. Verify "Export" button appears in artifact menu
4. Click and select a format
5. Verify file downloads

Test multiple artifact types:
- [ ] Flashcards → Anki CSV
- [ ] Mind map → Markdown
- [ ] Report → DOCX or PDF
- [ ] Table → CSV

#### Test 6: Batch Features
1. Open multiple tabs with different articles
2. Right-click → "Clip All Open Tabs to Gemini Notebook"
3. Verify all tabs being clipped

4. Right-click on a page → "Send to Gemini Notebook"
5. Verify page clipped

### Known Issues to Check

If any feature doesn't work:

1. **"Please sign in to NotebookLM" error**:
   - Sign in to notebooklm.google.com first
   - Refresh the page
   - Try again

2. **Buttons don't appear**:
   - Check browser console for errors (F12 → Console)
   - NotebookLM may have changed their DOM structure
   - Update selectors in relevant content script

3. **Export doesn't work**:
   - Check if artifact data is being extracted correctly
   - May need to update `content/notebooklm.ts` selectors

## Step 2: Create Store Assets

### Create Screenshots (1280x800 pixels)

Required screenshots (see `store-assets/README.md` for details):

1. **screenshot-1-side-panel.png**: Side panel with notebook list
2. **screenshot-2-youtube.png**: YouTube integration
3. **screenshot-3-ai-chats.png**: AI chat buttons
4. **screenshot-4-export.png**: Export menu
5. **screenshot-5-onboarding.png**: Onboarding page

Tools:
- Chrome built-in screenshot (Cmd/Ctrl + Shift + I → ... menu → Capture screenshot)
- macOS: Cmd + Shift + 4
- Windows: Snipping Tool
- Linux: Screenshot tool

### Record Demo Videos (30-60 seconds each)

Required videos (see `store-assets/README.md` for details):

1. **recording_demo-clipping-page.mp4**: Show clipping a web page
2. **recording_demo-youtube-to-notebook.mp4**: Show adding YouTube video
3. **recording_demo-export-artifact.mp4**: Show exporting an artifact

Tools:
- macOS: QuickTime Player (File → New Screen Recording)
- Windows: Xbox Game Bar (Win + G)
- Chrome: Record tab feature
- OBS Studio (cross-platform, free)

Save videos as MP4, H.264 codec, 1280x800 resolution.

### Create Better Icons (Optional)

The current icons are minimal placeholders. For production:

1. Use design tool (Figma, Canva, etc.)
2. Create gradient background (purple to blue)
3. Add stylized "SD" or custom logo
4. Export as PNG: 16x16, 32x32, 48x48, 128x128
5. Replace files in `public/icons/`
6. Rebuild: `npm run build`

## Step 3: Chrome Web Store Submission

### Prepare Store Listing

1. **Developer Dashboard**:
   - Go to https://chrome.google.com/webstore/devconsole
   - Sign in (or create developer account)
   - Click "New Item"

2. **Upload Package**:
   - Create ZIP of `dist` folder:
     ```bash
     cd dist && zip -r ../sourcedrop.zip * && cd ..
     ```
   - Upload `sourcedrop.zip`

3. **Store Listing Details**:

   **Name**: SourceDrop

   **Summary** (132 chars max):
   ```
   Free tool to clip web pages, YouTube, and AI chats into Gemini Notebook (NotebookLM) and export artifacts to 18+ formats
   ```

   **Description**:
   ```
   SourceDrop is a free Chrome extension that helps you clip web pages, YouTube videos, and AI chat conversations into Gemini Notebook (NotebookLM), and export artifacts to 18+ formats.

   🎯 KEY FEATURES

   📄 Save Any Web Page
   • One-click clipping from side panel
   • Add current page, selected text, or PDFs
   • Create new notebooks or add to existing ones

   🎬 YouTube Integration
   • Videos, Shorts, playlists, and entire channels
   • Duplicate detection skips already-added videos
   • No tab switching required

   💬 AI Chat Integration
   Save conversations from:
   • ChatGPT
   • Claude
   • Gemini
   • Perplexity
   • DeepSeek
   • Grok

   📤 Export Artifacts (18+ Formats)
   • Flashcards → Anki (CSV/TSV)
   • Mind Maps → Obsidian/Markdown
   • Reports → Word (.docx) or PDF
   • Tables → CSV or Excel
   • Chat Transcripts → Markdown/PDF
   • Audio Overviews → MP3 download
   • And more!

   ⚡ Additional Features
   • Batch clip all open tabs
   • Context menu integration
   • No account required
   • No data collection
   • Completely FREE

   🔒 Privacy & Security
   • No Google OAuth or API scopes
   • No backend server
   • No analytics or tracking
   • Everything stays in your browser

   Need to copy Google Drive folders? Check out Drive I/O: https://www.driveio.io/?referrer=SourceDrop
   ```

   **Category**: Productivity

   **Language**: English

4. **Upload Assets**:
   - Upload all 5 screenshots from `store-assets/screenshots/`
   - Upload all 3 demo videos from `store-assets/videos/`
   - Upload 128x128 icon as store icon

5. **Privacy**:
   - **Single purpose**: "Clip web content to NotebookLM and export artifacts"
   - **Permissions justification**:
     - `storage`: Save user preferences
     - `tabs`: Get current page info for clipping
     - `contextMenus`: Add right-click menu options
     - `sidePanel`: Display side panel interface
     - `scripting`: Inject content scripts for clipping
     - `host_permissions`: Access NotebookLM and AI chat sites
   - **Data usage**: None (no remote server, no collection)

6. **Pricing**: Free

7. **Distribution**: Public

### Review Process

- Submit for review
- Typical review time: 1-5 business days
- May receive rejection for:
  - Misleading functionality
  - Permission issues
  - Policy violations

If rejected, address issues and resubmit.

## Step 4: Post-Launch

### Monitor & Maintain

1. **User Feedback**:
   - Monitor Chrome Web Store reviews
   - Set up GitHub issues for bug reports

2. **NotebookLM Changes**:
   - Google may update NotebookLM UI
   - May break DOM selectors
   - Monitor for breakage
   - Update selectors in `src/content/` and `src/lib/notebooklm-api.ts`

3. **Updates**:
   - Fix bugs
   - Add features
   - Increment version in `manifest.json` and `package.json`
   - Rebuild and upload new ZIP to Chrome Web Store

### Marketing

1. Share on:
   - Reddit (r/NotebookLM, r/chrome_extensions)
   - Twitter/X
   - Hacker News
   - Product Hunt

2. Create landing page (optional)

3. Promote Drive I/O integration

## Troubleshooting

### Build Issues

```bash
# Clean install
rm -rf node_modules dist
npm install
npm run build
```

### Extension Not Loading

- Check for console errors
- Verify manifest.json is in dist/
- Reload extension in chrome://extensions/

### NotebookLM Integration Issues

- Sign in to NotebookLM first
- Check if NotebookLM UI changed
- Update DOM selectors in relevant files:
  - `src/lib/notebooklm-api.ts`: API calls
  - `src/content/notebooklm.ts`: Export buttons
  - `src/sidepanel/App.tsx`: Notebook list

### Content Scripts Not Injecting

- Check host permissions in manifest.json
- Verify URLs match in manifest
- Reload page after installing extension

## Support

For issues:
1. Check browser console (F12)
2. Review code in relevant content script
3. Open GitHub issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors
   - Chrome version

## Success Criteria

Extension is ready for launch when:
- [x] Build passes (`npm run build`)
- [x] Tests pass (`npm test`)
- [ ] All manual tests pass (see Step 1)
- [ ] Store assets created (screenshots & videos)
- [ ] Chrome Web Store listing complete
- [ ] Extension approved and published

---

**Next Steps**: Complete manual testing, create assets, submit to Chrome Web Store!
