import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.'
        },
        {
          src: 'public/*',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        onboarding: resolve(__dirname, 'src/onboarding/index.html'),
        'content-chatgpt': resolve(__dirname, 'src/content/chatgpt.ts'),
        'content-claude': resolve(__dirname, 'src/content/claude.ts'),
        'content-gemini': resolve(__dirname, 'src/content/gemini.ts'),
        'content-perplexity': resolve(__dirname, 'src/content/perplexity.ts'),
        'content-deepseek': resolve(__dirname, 'src/content/deepseek.ts'),
        'content-grok': resolve(__dirname, 'src/content/grok.ts'),
        'content-youtube': resolve(__dirname, 'src/content/youtube.ts'),
        'content-notebooklm': resolve(__dirname, 'src/content/notebooklm.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          if (name.startsWith('content-')) {
            return `${name}.js`;
          }
          if (name === 'background') {
            return 'background.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'content.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
