'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender_type: 'doctor' | 'patient';
  sender_name: string;
  message_text: string;
  created_at: string;
}

interface MessageThreadProps {
  sharedReportId: string;
  currentSenderType: 'doctor' | 'patient';
  patientName?: string;
}

const POLL_INTERVAL_MS = 4000;

export const MessageThread: React.FC<MessageThreadProps> = ({ sharedReportId, currentSenderType, patientName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?sharedReportId=${encodeURIComponent(sharedReportId)}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.warn('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedReportId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedReportId, messageText: text, patientName }),
      });
      await fetchMessages();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 px-1 py-2 min-h-0">
        {loading ? (
          <p className="text-xs text-slate-500 text-center py-6">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_type === currentSenderType ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.sender_type === currentSenderType
                    ? 'bg-blue-600 text-white font-medium rounded-br-md'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-bl-md'
                }`}
              >
                <span className="block text-[10px] font-bold opacity-70 mb-0.5">{m.sender_name}</span>
                <span className="whitespace-pre-wrap">{m.message_text}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-1 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-40 transition-all"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
