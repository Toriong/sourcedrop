/**
 * Content script for NotebookLM integration
 * Adds export buttons to artifacts
 */

import { EXPORT_FORMATS } from '../types';

const EXPORT_BUTTON_CLASS = 'sourcedrop-export-button';

function init() {
  console.log('SourceDrop: NotebookLM export integration loaded');
  observeDOM();
  injectExportButtons();
}

function observeDOM() {
  const observer = new MutationObserver(() => {
    injectExportButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function injectExportButtons() {
  // Look for artifact containers
  const artifactContainers = document.querySelectorAll('[class*="artifact"], [class*="studio"]');
  
  artifactContainers.forEach((container) => {
    if (container.querySelector(`.${EXPORT_BUTTON_CLASS}`)) {
      return;
    }

    const artifactType = detectArtifactType(container);
    if (!artifactType) return;

    const exportButton = createExportButton(container, artifactType);
    
    // Try to find the artifact's menu/actions area
    const menuContainer = container.querySelector('[class*="menu"], [class*="actions"]');
    if (menuContainer) {
      menuContainer.appendChild(exportButton);
    } else {
      container.appendChild(exportButton);
    }
  });

  // Also inject chat export button
  injectChatExportButton();
  
  // And audio overview download button
  injectAudioDownloadButton();
}

function detectArtifactType(container: Element): string | null {
  const text = container.textContent?.toLowerCase() || '';
  const className = container.className.toLowerCase();
  
  if (text.includes('flashcard') || className.includes('flashcard')) {
    return 'flashcard';
  }
  if (text.includes('quiz') || className.includes('quiz')) {
    return 'quiz';
  }
  if (text.includes('mind map') || className.includes('mindmap')) {
    return 'mindmap';
  }
  if (text.includes('report') || className.includes('report')) {
    return 'report';
  }
  if (text.includes('note') || className.includes('note')) {
    return 'note';
  }
  if (text.includes('table') || className.includes('table')) {
    return 'table';
  }
  if (text.includes('slide') || className.includes('slide')) {
    return 'slides';
  }
  
  return null;
}

function createExportButton(container: Element, artifactType: string): HTMLElement {
  const button = document.createElement('button');
  button.className = EXPORT_BUTTON_CLASS;
  button.textContent = 'Export';
  button.style.cssText = `
    padding: 6px 12px;
    background: linear-gradient(to right, rgba(209,127,247,1), rgba(157,214,252,1));
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    margin: 4px;
  `;
  
  button.onclick = () => showExportMenu(container, artifactType, button);
  button.onmouseover = () => button.style.opacity = '0.9';
  button.onmouseout = () => button.style.opacity = '1';
  
  return button;
}

function showExportMenu(container: Element, artifactType: string, button: HTMLElement) {
  const formats = EXPORT_FORMATS[artifactType] || [];
  if (formats.length === 0) return;

  const menu = document.createElement('div');
  menu.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 8px 0;
    z-index: 10000;
    min-width: 150px;
  `;

  formats.forEach((format) => {
    const item = document.createElement('button');
    item.textContent = format.label;
    item.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 16px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    `;
    item.onmouseover = () => item.style.background = '#f5f5f5';
    item.onmouseout = () => item.style.background = 'none';
    item.onclick = () => {
      handleExport(container, artifactType, format.format);
      menu.remove();
    };
    menu.appendChild(item);
  });

  const rect = button.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = `${rect.bottom + 5}px`;
  menu.style.left = `${rect.left}px`;

  document.body.appendChild(menu);

  // Close menu on click outside
  setTimeout(() => {
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node) && e.target !== button) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 100);
}

function handleExport(container: Element, artifactType: string, format: string) {
  const artifactData = extractArtifactData(container);
  
  chrome.runtime.sendMessage({
    action: 'exportArtifact',
    data: {
      artifactType,
      format,
      content: artifactData
    }
  });

  showNotification(`Exporting as ${format}...`);
}

function extractArtifactData(container: Element): any {
  // This would need to parse the actual artifact DOM structure
  // For now, return basic text content
  return {
    text: container.textContent?.trim() || '',
    html: container.innerHTML
  };
}

function injectChatExportButton() {
  const chatContainer = document.querySelector('[class*="chat"], [class*="conversation"]');
  if (!chatContainer) return;

  if (chatContainer.querySelector('.sourcedrop-chat-export')) {
    return;
  }

  const button = document.createElement('button');
  button.className = 'sourcedrop-chat-export';
  button.textContent = '⬇ Export Chat';
  button.style.cssText = `
    padding: 8px 16px;
    background: linear-gradient(to right, rgba(209,127,247,1), rgba(157,214,252,1));
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    margin: 8px;
  `;
  
  button.onclick = () => exportChat();
  
  const headerContainer = chatContainer.querySelector('[class*="header"]');
  if (headerContainer) {
    headerContainer.appendChild(button);
  }
}

function exportChat() {
  const messages = document.querySelectorAll('[class*="message"]');
  const chatData: any[] = [];

  messages.forEach((msg) => {
    chatData.push({
      role: msg.className.includes('user') ? 'user' : 'assistant',
      content: msg.textContent?.trim() || ''
    });
  });

  chrome.runtime.sendMessage({
    action: 'exportChat',
    data: { messages: chatData }
  });

  showNotification('Exporting chat...');
}

function injectAudioDownloadButton() {
  const audioContainer = document.querySelector('[class*="audio-overview"], [class*="audio"]');
  if (!audioContainer) return;

  if (audioContainer.querySelector('.sourcedrop-audio-download')) {
    return;
  }

  const button = document.createElement('button');
  button.className = 'sourcedrop-audio-download';
  button.textContent = '⬇ Download Audio';
  button.style.cssText = `
    padding: 8px 16px;
    background: linear-gradient(to right, rgba(209,127,247,1), rgba(157,214,252,1));
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    margin: 8px;
  `;
  
  button.onclick = () => downloadAudio();
  audioContainer.appendChild(button);
}

function downloadAudio() {
  // Find the audio element
  const audio = document.querySelector('audio');
  if (audio && audio.src) {
    const link = document.createElement('a');
    link.href = audio.src;
    link.download = 'notebook-audio-overview.mp3';
    link.click();
    showNotification('Downloading audio...');
  } else {
    showNotification('No audio found to download');
  }
}

function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(209,127,247,1);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

init();
