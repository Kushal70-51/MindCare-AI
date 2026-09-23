'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MentalHealthReport } from '../../types/mindcare';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface ReportChatbotProps {
  report: MentalHealthReport;
}

const SUGGESTED_PROMPTS = [
  'What should I focus on most?',
  'Summarize my recommendations',
  "What's driving my risk level?",
];

export const ReportChatbot: React.FC<ReportChatbotProps> = ({ report }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text:
        "Hi, I'm your report assistant. Ask me anything about this screening — what to focus on, what a score means, or a summary of the recommendations.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    const question = text.trim();
    if (!question || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: question }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      let savedContext = null;
      try {
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem('mindcare_latest_assessment_context');
          if (raw) savedContext = JSON.parse(raw);
        }
      } catch (e) {}

      const res = await fetch('/api/report-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          question,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          context: savedContext,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || "Sorry, I couldn't respond to that." }]);
    } catch (err) {
      console.warn('Report chatbot request failed:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I ran into a connection problem. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[min(92vw,380px)] h-[520px] max-h-[70vh] bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-teal-600">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-none">Report Assistant</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Ask about your results</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-teal-600 text-white font-medium rounded-br-md'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-bl-md'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-teal-700">
                        <Bot className="w-3 h-3" />
                        <span>MindCare AI</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                    <span className="text-xs text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}

              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-teal-400 hover:text-teal-700 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 p-3 border-t border-slate-200 bg-slate-50"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your report..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-teal-600 text-white disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-teal-600 shadow-lg flex items-center justify-center text-white hover:scale-105 transition-all"
        title="Ask about your report"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
