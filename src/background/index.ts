/**
 * Background service worker for SourceDrop
 */

import { ClipRequest } from '../types';

// Open onboarding page on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'onboarding.html' });
  }
});

// Context menu for "Send to Notebook"
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'send-to-notebook',
    title: 'Send to Gemini Notebook',
    contexts: ['page', 'selection', 'link']
  });

  chrome.contextMenus.create({
    id: 'clip-all-tabs',
    title: 'Clip All Open Tabs to Gemini Notebook',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'send-to-notebook') {
    if (info.selectionText) {
      // Send selected text
      await handleClipRequest({
        type: 'selected-text',
        content: info.selectionText,
        title: 'Selected Text'
      }, tab.id);
    } else if (info.linkUrl) {
      // Send linked page
      await handleClipRequest({
        type: 'webpage',
        url: info.linkUrl,
        title: info.linkUrl
      }, tab.id);
    } else if (info.pageUrl) {
      // Send current page
      await handleClipRequest({
        type: 'webpage',
        url: info.pageUrl,
        title: tab.title || info.pageUrl
      }, tab.id);
    }
  } else if (info.menuItemId === 'clip-all-tabs') {
    await handleBatchClip();
  }
});

// Handle messages from content scripts and UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidePanel') {
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  } else if (message.action === 'clipRequest') {
    handleClipRequest(message.data, sender.tab?.id).then(result => {
      sendResponse({ success: true, result });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  } else if (message.action === 'getNotebooks') {
    // Forward to NotebookLM API
    sendResponse({ notebooks: [] }); // Placeholder
  } else if (message.action === 'showNotification') {
    showNotification(message.title, message.message);
  }
});

// Handle clip requests
async function handleClipRequest(clipRequest: ClipRequest, tabId?: number): Promise<void> {
  try {
    // Store clip request for side panel to process
    await chrome.storage.local.set({ pendingClip: clipRequest });
    
    // Open side panel
    if (tabId) {
      await chrome.sidePanel.open({ tabId });
    }
    
    showNotification('SourceDrop', 'Opening side panel to complete clip...');
  } catch (error) {
    console.error('Failed to handle clip request:', error);
    showNotification('SourceDrop Error', 'Failed to open side panel');
  }
}

// Batch clip all tabs
async function handleBatchClip(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const clipRequests: ClipRequest[] = tabs
      .filter(tab => tab.url && !tab.url.startsWith('chrome://'))
      .map(tab => ({
        type: 'webpage' as const,
        url: tab.url,
        title: tab.title || tab.url
      }));

    await chrome.storage.local.set({ batchClip: clipRequests });
    
    // Open side panel in current tab
    const currentTab = tabs.find(tab => tab.active);
    if (currentTab?.id) {
      await chrome.sidePanel.open({ tabId: currentTab.id });
    }
    
    showNotification('SourceDrop', `Clipping ${clipRequests.length} tabs...`);
  } catch (error) {
    console.error('Failed to batch clip:', error);
    showNotification('SourceDrop Error', 'Failed to clip tabs');
  }
}

// Show notification
function showNotification(title: string, message: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 1
  });
}

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

console.log('SourceDrop background service worker loaded');
