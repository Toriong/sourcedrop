/**
 * Content script for YouTube integration
 * Adds buttons to save videos, channels, and playlists to NotebookLM
 */

import { YouTubeData } from '../types';
import { getCurrentYouTubeData } from '../lib/youtube-parser';

const BUTTON_ID = 'sourcedrop-youtube-button';
const SHORTS_BUTTON_ID = 'sourcedrop-shorts-button';

function init() {
  console.log('SourceDrop: YouTube integration loaded');
  
  // Watch for navigation changes (YouTube is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onNavigate();
    }
  }).observe(document.body, { subtree: true, childList: true });

  onNavigate();
}

function onNavigate() {
  setTimeout(() => {
    const youtubeData = getCurrentYouTubeData();
    
    if (youtubeData?.type === 'video') {
      injectVideoButton();
    } else if (youtubeData?.type === 'shorts') {
      injectShortsButton();
    } else if (youtubeData?.type === 'channel') {
      injectChannelButton();
    } else if (youtubeData?.type === 'playlist') {
      injectPlaylistButton();
    }
  }, 1000);
}

function injectVideoButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const targetContainer = document.querySelector('#above-the-fold #top-level-buttons-computed');
  if (!targetContainer) return;

  const button = createButton('Add to Gemini Notebook', () => {
    const youtubeData = getCurrentYouTubeData();
    if (youtubeData) {
      saveYouTubeToNotebook(youtubeData);
    }
  });

  button.id = BUTTON_ID;
  targetContainer.appendChild(button);
}

function injectShortsButton() {
  if (document.getElementById(SHORTS_BUTTON_ID)) return;

  const button = createFloatingButton('Add to Gemini Notebook', () => {
    const youtubeData = getCurrentYouTubeData();
    if (youtubeData) {
      saveYouTubeToNotebook(youtubeData);
    }
  });

  button.id = SHORTS_BUTTON_ID;
  document.body.appendChild(button);
}

function injectChannelButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const targetContainer = document.querySelector('#inner-header-container #buttons');
  if (!targetContainer) return;

  const button = createButton('Add Channel to Gemini Notebook', () => {
    const youtubeData = getCurrentYouTubeData();
    if (youtubeData) {
      saveYouTubeToNotebook(youtubeData);
    }
  });

  button.id = BUTTON_ID;
  targetContainer.appendChild(button);
}

function injectPlaylistButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const targetContainer = document.querySelector('#playlist-actions');
  if (!targetContainer) return;

  const button = createButton('Add Playlist to Gemini Notebook', () => {
    const youtubeData = getCurrentYouTubeData();
    if (youtubeData) {
      saveYouTubeToNotebook(youtubeData);
    }
  });

  button.id = BUTTON_ID;
  targetContainer.appendChild(button);
}

function createButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = 'sourcedrop-yt-btn';
  button.style.cssText = `
    padding: 10px 16px;
    background: linear-gradient(to right, rgba(209,127,247,1), rgba(157,214,252,1));
    color: white;
    border: none;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    margin-left: 8px;
  `;
  button.onmouseover = () => button.style.opacity = '0.9';
  button.onmouseout = () => button.style.opacity = '1';
  button.onclick = onClick;
  return button;
}

function createFloatingButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = 'sourcedrop-yt-floating-btn';
  button.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    padding: 12px 20px;
    background: linear-gradient(to right, rgba(209,127,247,1), rgba(157,214,252,1));
    color: white;
    border: none;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: opacity 0.2s, transform 0.2s;
  `;
  button.onmouseover = () => {
    button.style.opacity = '0.9';
    button.style.transform = 'scale(1.05)';
  };
  button.onmouseout = () => {
    button.style.opacity = '1';
    button.style.transform = 'scale(1)';
  };
  button.onclick = onClick;
  return button;
}

function saveYouTubeToNotebook(youtubeData: YouTubeData) {
  const title = getPageTitle(youtubeData);
  
  chrome.runtime.sendMessage({
    action: 'clipRequest',
    data: {
      type: 'youtube',
      url: window.location.href,
      title,
      youtubeData
    }
  });

  showNotification(`Saving ${youtubeData.type} to NotebookLM...`);
}

function getPageTitle(youtubeData: YouTubeData): string {
  const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer') ||
                       document.querySelector('h1.ytd-watch-metadata') ||
                       document.querySelector('h1');
  
  if (titleElement) {
    return titleElement.textContent?.trim() || `YouTube ${youtubeData.type}`;
  }
  
  return `YouTube ${youtubeData.type}`;
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
