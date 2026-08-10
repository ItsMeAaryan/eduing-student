// hooks/useAIChat.ts
import { useState, useCallback } from 'react';

/** Converts any raw error (API JSON, exception message, etc.) into a friendly string. */
function toFriendlyError(raw: unknown): string {
  if (!raw) return 'Something went wrong. Please try again later.';
  const str = raw instanceof Error ? raw.message : String(raw);
  // If it looks like JSON or an API error object, don't show it
  if (str.startsWith('{') || str.startsWith('[') || str.includes('API key') || str.includes('quota')) {
    return 'Something went wrong. Please try again later.';
  }
  // Truncate extremely long technical messages
  if (str.length > 120) return 'Something went wrong. Please try again later.';
  return str || 'Something went wrong. Please try again later.';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useAIChat(initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    text: string,
    apiCall: (text: string) => Promise<{ success: boolean; text?: string; error?: string }>
  ) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    try {
      const res = await apiCall(text);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.success
          ? (res.text || 'No response provided.')
          : 'Something went wrong. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: unknown) {
      const friendly = toFriendlyError(e);
      setError(friendly);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Something went wrong. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, setMessages, isTyping, error, sendMessage, clearMessages };
}