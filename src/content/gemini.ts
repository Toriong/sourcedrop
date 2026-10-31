/**
 * Content script for Gemini integration
 */

import { ChatMessage } from '../types';

const BUTTON_CONTAINER_CLASS = 'sourcedrop-gemini-buttons';

function init() {
  console.log('SourceDrop: Gemini integration loaded');
  observeDOM();
  injectButtons();
}

function observeDOM() {
  const observer = new MutationObserver(() => {
    injectButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function injectButtons() {
  const messageContainers = document.querySelectorAll('message-content, .model-response-text');
  
  messageContainers.forEach((container) => {
    if (container.querySelector(`.${BUTTON_CONTAINER_CLASS}`)) {
      return;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = BUTTON_CONTAINER_CLASS;
    buttonContainer.style.cssText = `
      margin-top: 8px;
      display: flex;
      gap: 8px;
    `;

    const saveAnswerBtn = createButton('Save Answer', () => {
      const messageText = extractMessageText(container);
      if (messageText) {
        saveToNotebook([messageText], false);
      }
    });

    const saveConversationBtn = createButton('Save Conversation', () => {
      const messages = extractAllMessages();
      saveToNotebook(messages, true);
    });

    buttonContainer.appendChild(saveAnswerBtn);
    buttonContainer.appendChild(saveConversationBtn);
    container.appendChild(buttonContainer);
  });
}

function createButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.cssText = `
    padding: 4px 12px;
    background: linear-gradient(to right, rgba(209,127,247,1), rgba(157,214,252,1));
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  `;
  button.onmouseover = () => button.style.opacity = '0.9';
  button.onmouseout = () => button.style.opacity = '1';
  button.onclick = onClick;
  return button;
}

function extractMessageText(container: Element): ChatMessage | null {
  const textContent = container.textContent?.trim();
  if (!textContent) return null;

  return {
    role: 'assistant',
    content: textContent
  };
}

function extractAllMessages(): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const userMessages = document.querySelectorAll('.user-query, [class*="user-message"]');
  const assistantMessages = document.querySelectorAll('message-content, .model-response-text');

  userMessages.forEach((msg) => {
    const content = msg.textContent?.trim();
    if (content) {
      messages.push({ role: 'user', content });
    }
  });

  assistantMessages.forEach((msg) => {
    const content = msg.textContent?.trim();
    if (content && !content.includes('Save Answer')) {
      messages.push({ role: 'assistant', content });
    }
  });

  return messages;
}

function saveToNotebook(messages: ChatMessage[], fullConversation: boolean) {
  chrome.runtime.sendMessage({
    action: 'clipRequest',
    data: {
      type: 'chat',
      title: fullConversation ? 'Gemini Conversation' : 'Gemini Answer',
      chatData: {
        platform: 'gemini',
        messages,
        fullConversation
      }
    }
  });

  showNotification('Saved to NotebookLM!');
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
    z-index: 10000;
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
