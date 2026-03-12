"use client";

import Navbar from "@/components/Navbar";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Trash2, MessageSquare } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '你好！我是你的个人 AI 助手 HubAI。我可以帮你管理游戏库、提供生活建议、或者只是陪你聊天。有什么我能帮你的吗？' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "哎呀，连接失败了。请检查你的 API 配置。" }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("确定要清空聊天记录吗？")) {
      setMessages([{ role: 'assistant', content: '好的，我已经准备好迎接新的对话了。有什么我能帮你的吗？' }]);
    }
  };

  return (
    <main className="min-h-screen pt-20 flex flex-col bg-[#0a0a0a]">
      <Navbar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MessageSquare className="text-purple-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HubAI 助手</h1>
              <p className="text-xs text-gray-500">连接大模型，开启智能对话</p>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={20} />
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/20 text-blue-50 border border-blue-500/30' 
                      : 'bg-white/5 text-gray-100 border border-white/10'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <input 
            type="text" 
            placeholder="问我任何问题..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-lg shadow-xl"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:bg-gray-600"
          >
            <Send size={20} />
          </button>
        </form>

        <footer className="text-center text-xs text-gray-600 pb-4">
          由 AI 驱动，回复可能存在偏差。
        </footer>
      </div>
    </main>
  );
}