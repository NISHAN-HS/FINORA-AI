import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const QUICK_QUESTIONS = [
  "How can I save more money?",
  "Where am I overspending?",
  "How much can I spend this week?",
  "Give me budget tips",
  "Analyze my finances",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role:'assistant', message:'Hi! I\'m FinBot 🤖, your AI financial assistant. I can analyze your spending, suggest savings strategies, and answer any finance questions. How can I help you today?' }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await API.get('/ai/chat-history');
      if (data.length > 0) {
        setMessages(prev => [prev[0], ...data]);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role:'user', message: msg }]);
    setLoading(true);
    try {
      const { data } = await API.post('/ai/chat', { message: msg });
      setMessages(prev => [...prev, { role:'assistant', message: data.reply }]);
      if (data.fallback) toast('Using offline mode — connect OpenAI for full AI', { icon: '⚠️' });
    } catch {
      setMessages(prev => [...prev, { role:'assistant', message:"Sorry, I couldn't process that. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role:'assistant', message:'Chat cleared! How can I help you with your finances?' }]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="card p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">FinBot AI Assistant</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <p className="text-xs text-slate-400">Online · Powered by AI</p>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="btn-ghost text-sm text-red-400 hover:text-red-600">
          <Trash2 className="w-4 h-4"/> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 card overflow-y-auto scroll-y p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              m.role === 'assistant' ? 'gradient-bg' : 'bg-slate-200 dark:bg-slate-600'
            }`}>
              {m.role === 'assistant'
                ? <Bot className="w-4 h-4 text-white"/>
                : <User className="w-4 h-4 text-slate-600 dark:text-slate-300"/>}
            </div>

            {/* Bubble */}
            <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white"/>
            </div>
            <div className="chat-bubble-ai flex items-center gap-1.5 py-4">
              <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick questions */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => sendMessage(q)} disabled={loading}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 dark:hover:bg-primary-900/20 transition-colors">
            <Sparkles className="inline w-3 h-3 mr-1 text-primary-500"/>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about your finances... (Press Enter to send)"
          disabled={loading}
          className="input flex-1"
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary px-5">
          <Send className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
}