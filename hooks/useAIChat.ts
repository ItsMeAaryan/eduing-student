import { useState, useCallback } from 'react';

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
        content: res.success ? (res.text || 'No response provided.') : (res.error || res.text || 'I encountered an error while processing your request.'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error connecting to the AI service. Please try again.',
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
