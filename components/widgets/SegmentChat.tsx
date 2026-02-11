
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, Segment } from '../../types';
import { askAboutSegment } from '../../services/geminiService';

interface Props {
  segment: Segment;
  // We need to inject the image base64 from the parent app context,
  // but since we are deep in the widget tree, we might need to pass it down 
  // or use a context. For this iteration, we'll assume the parent (WidgetEngine)
  // finds a way to pass it, or we rely on the parent having access.
  // Actually, WidgetEngine doesn't have the image by default. 
  // We need to update WidgetEngine signature or assume we can get it.
  // To keep it simple without refactoring the whole app state, 
  // we will grab the image from the DOM or expect it passed.
  // Let's rely on a prop, and update WidgetEngine to receive it.
  imageBase64?: string;
}

export const SegmentChat: React.FC<Props> = ({ segment, imageBase64 }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !imageBase64) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await askAboutSegment(
        userMsg.text,
        imageBase64,
        { label: segment.label, description: segment.description },
        history
      );

      setHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'model', text: "Sorry, I couldn't connect to the knowledge base right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!imageBase64) return null;

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <div className="flex items-center gap-2 mb-3 text-cyan-200 text-xs uppercase font-bold tracking-widest opacity-80">
        <Sparkles size={12} />
        <span>Ask about this</span>
      </div>

      <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden flex flex-col h-48 md:h-56">
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
        >
          {history.length === 0 && (
            <div className="h-full flex items-center justify-center text-center p-4">
              <p className="text-gray-500 text-xs italic">
                What would you like to know about {segment.label}?
              </p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {history.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-xs md:text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-500/20 rounded-br-none' 
                      : 'bg-zinc-800/60 text-gray-200 border border-white/5 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-zinc-800/60 px-3 py-2 rounded-lg rounded-bl-none border border-white/5 flex gap-1 items-center">
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms'}} />
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms'}} />
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms'}} />
               </div>
             </motion.div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-2 bg-white/5 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a question..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 px-2"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
