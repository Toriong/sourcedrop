/**
 * Export utilities for NotebookLM artifacts
 */

import { saveAs } from 'file-saver';
import JSZip from 'jszip';
// @ts-ignore - pdfmake types not available
import pdfMake from 'pdfmake/build/pdfmake';
import { Artifact, ExportFormat } from '../types';

/**
 * Export flashcards to Anki-compatible format
 */
export function exportFlashcardsToAnki(flashcards: any[], format: 'csv' | 'tsv'): string {
  const separator = format === 'csv' ? ',' : '\t';
  const lines = ['Front' + separator + 'Back'];
  
  for (const card of flashcards) {
    const front = escapeForCSV(card.front || card.question || '');
    const back = escapeForCSV(card.back || card.answer || '');
    lines.push(front + separator + back);
  }
  
  return lines.join('\n');
}

/**
 * Export mind map to Markdown (Obsidian-compatible)
 */
export function exportMindMapToMarkdown(mindmap: any): string {
  let markdown = `# ${mindmap.title || 'Mind Map'}\n\n`;
  
  if (mindmap.nodes && Array.isArray(mindmap.nodes)) {
    markdown += renderMindMapNodes(mindmap.nodes, 0);
  }
  
  return markdown;
}

function renderMindMapNodes(nodes: any[], level: number): string {
  let markdown = '';
  const indent = '  '.repeat(level);
  
  for (const node of nodes) {
    markdown += `${indent}- ${node.label || node.text || 'Node'}\n`;
    if (node.children && Array.isArray(node.children)) {
      markdown += renderMindMapNodes(node.children, level + 1);
    }
  }
  
  return markdown;
}

/**
 * Export report to Word document (DOCX)
 */
export async function exportReportToDocx(report: any, filename: string): Promise<void> {
  // Using a simple approach - for full DOCX support, would use docx library
  const content = report.content || report.text || '';
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  saveAs(blob, filename);
}

/**
 * Export to PDF
 */
export async function exportToPDF(content: string, filename: string): Promise<void> {
  const docDefinition = {
    content: [
      { text: content, fontSize: 12 }
    ],
    defaultStyle: {
      font: 'Roboto'
    }
  };
  
  const pdfDocGenerator = pdfMake.createPdf(docDefinition as any);
  pdfDocGenerator.download(filename);
}

/**
 * Export chat conversation to Markdown
 */
export function exportChatToMarkdown(messages: any[]): string {
  let markdown = `# Chat Conversation\n\n`;
  
  for (const message of messages) {
    const role = message.role === 'user' ? 'You' : 'Gemini Notebook';
    markdown += `## ${role}\n\n${message.content}\n\n`;
    
    if (message.citations && message.citations.length > 0) {
      markdown += `### Citations\n\n`;
      for (const citation of message.citations) {
        markdown += `- [${citation.title}](${citation.url})\n`;
      }
      markdown += '\n';
    }
  }
  
  return markdown;
}

/**
 * Export slides as images in a ZIP file
 */
export async function exportSlidesToZip(slides: any[], filename: string): Promise<void> {
  const zip = new JSZip();
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (slide.image) {
      const imageData = slide.image.split(',')[1]; // Remove data:image/png;base64,
      zip.file(`slide-${i + 1}.png`, imageData, { base64: true });
    }
  }
  
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, filename);
}

/**
 * Export table to CSV
 */
export function exportTableToCSV(table: any): string {
  const lines: string[] = [];
  
  // Header row
  if (table.headers && Array.isArray(table.headers)) {
    lines.push(table.headers.map(escapeForCSV).join(','));
  }
  
  // Data rows
  if (table.rows && Array.isArray(table.rows)) {
    for (const row of table.rows) {
      if (Array.isArray(row)) {
        lines.push(row.map(escapeForCSV).join(','));
      }
    }
  }
  
  return lines.join('\n');
}

/**
 * Export quiz to JSON
 */
export function exportQuizToJSON(quiz: any): string {
  return JSON.stringify(quiz, null, 2);
}

/**
 * Generic export dispatcher
 */
export async function exportArtifact(
  artifact: Artifact,
  format: ExportFormat
): Promise<void> {
  const filename = `${sanitizeFilename(artifact.title)}.${format.extension}`;
  
  let content: string | Blob;
  
  switch (artifact.type) {
    case 'flashcard':
      if (format.format === 'anki-csv' || format.format === 'anki-tsv') {
        content = exportFlashcardsToAnki(
          artifact.content,
          format.format === 'anki-csv' ? 'csv' : 'tsv'
        );
      } else {
        content = JSON.stringify(artifact.content, null, 2);
      }
      break;
      
    case 'mindmap':
      if (format.format === 'markdown') {
        content = exportMindMapToMarkdown(artifact.content);
      } else {
        content = JSON.stringify(artifact.content, null, 2);
      }
      break;
      
    case 'report':
      if (format.format === 'docx') {
        await exportReportToDocx(artifact.content, filename);
        return;
      } else if (format.format === 'pdf') {
        await exportToPDF(artifact.content.text || artifact.content, filename);
        return;
      } else if (format.format === 'markdown') {
        content = artifact.content.text || artifact.content;
      } else {
        content = artifact.content.text || artifact.content;
      }
      break;
      
    case 'table':
      if (format.format === 'csv') {
        content = exportTableToCSV(artifact.content);
      } else {
        content = JSON.stringify(artifact.content, null, 2);
      }
      break;
      
    case 'slides':
      if (format.format === 'images') {
        await exportSlidesToZip(artifact.content, filename);
        return;
      } else if (format.format === 'pdf') {
        await exportToPDF('Slides content', filename);
        return;
      } else {
        content = JSON.stringify(artifact.content, null, 2);
      }
      break;
      
    default:
      content = JSON.stringify(artifact.content, null, 2);
  }
  
  const blob = new Blob([content], { type: format.mimeType });
  saveAs(blob, filename);
}

// Helper functions
function escapeForCSV(text: string): string {
  if (!text) return '';
  const stringText = String(text);
  if (stringText.includes(',') || stringText.includes('"') || stringText.includes('\n')) {
    return `"${stringText.replace(/"/g, '""')}"`;
  }
  return stringText;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
}
