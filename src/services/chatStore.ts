import { ChatMessage as Message } from '@/types';

/**
 * Simple in‑file store for chat histories.
 * In a real product this would be a database (e.g. Prisma) but for the prototype we
 * persist to a JSON file under `src/data/chatHistory.json`.
 */
const DATA_PATH = 'src/data/chatHistory.json';
const fs = require('fs');
const path = require('path');

function ensureFile() {
  const fullPath = path.resolve(DATA_PATH);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify({}), 'utf8');
  }
}

export async function getChatHistory(sessionId: string): Promise<Message[]> {
  ensureFile();
  const raw = fs.readFileSync(path.resolve(DATA_PATH), 'utf8');
  const all = JSON.parse(raw) as Record<string, Message[]>;
  return all[sessionId] || [];
}

export async function addChatMessage(sessionId: string, userMsg: Message): Promise<Message> {
  ensureFile();
  const raw = fs.readFileSync(path.resolve(DATA_PATH), 'utf8');
  const all = JSON.parse(raw) as Record<string, Message[]>;
  const history = all[sessionId] || [];
  // Simulated assistant response – echo back a short acknowledgement.
  const assistantMsg: Message = {
    role: 'assistant',
    content: `Received: ${userMsg.content.slice(0, 80)}…`,
    timestamp: new Date().toISOString(),
  };
  all[sessionId] = [...history, userMsg, assistantMsg];
  fs.writeFileSync(path.resolve(DATA_PATH), JSON.stringify(all, null, 2), 'utf8');
  return assistantMsg;
}
