"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  X, 
  RotateCcw, 
  ChevronLeft, 
  Send, 
  Mail, 
  Phone 
} from "lucide-react";
import { supportFlow, Option } from "@/data/supportFlow";
import { ChatMessage } from "./ChatMessage";
import { OptionButtons } from "./OptionButtons";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
  options?: Option[];
}

export const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNodeKey, setCurrentNodeKey] = useState("start");
  const [history, setHistory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    const savedState = localStorage.getItem("rentalpay_chat_open");
    const savedHistory = localStorage.getItem("rentalpay_chat_messages");
    const savedCurrentNode = localStorage.getItem("rentalpay_chat_node");
    const savedPath = localStorage.getItem("rentalpay_chat_path");

    if (savedState === "true") setIsOpen(true);
    if (savedHistory) setMessages(JSON.parse(savedHistory));
    if (savedCurrentNode) setCurrentNodeKey(savedCurrentNode);
    if (savedPath) setHistory(JSON.parse(savedPath));

    // If no messages, start with the first node
    if (!savedHistory || JSON.parse(savedHistory).length === 0) {
      addBotMessage("start");
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("rentalpay_chat_open", isOpen.toString());
    localStorage.setItem("rentalpay_chat_messages", JSON.stringify(messages));
    localStorage.setItem("rentalpay_chat_node", currentNodeKey);
    localStorage.setItem("rentalpay_chat_path", JSON.stringify(history));
  }, [isOpen, messages, currentNodeKey, history]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (nodeKey: string) => {
    setIsTyping(true);
    const node = supportFlow[nodeKey];
    
    if (!node) {
      console.warn(`Support node not found: ${nodeKey}. Falling back to start.`);
      if (nodeKey !== "start") {
        addBotMessage("start");
      } else {
        setIsTyping(false);
      }
      return;
    }
    
    // Simulate typing delay
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: node.message,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: node.options,
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleOptionSelect = (option: Option) => {
    // Add user message
    const userMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: option.label,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, userMessage]);

    if (option.next) {
      setHistory((prev) => [...prev, currentNodeKey]);
      setCurrentNodeKey(option.next);
      addBotMessage(option.next);
    } else if (option.answer) {
      setIsTyping(true);
      setTimeout(() => {
        const answerMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: option.answer!,
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: [{ label: "Back", next: currentNodeKey }, { label: "Main Menu", next: "start" }]
        };
        setMessages((prev) => [...prev, answerMessage]);
        setIsTyping(false);
      }, 600);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevNode = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentNodeKey(prevNode);
      addBotMessage(prevNode);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setHistory([]);
    setCurrentNodeKey("start");
    addBotMessage("start");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${
          isOpen 
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rotate-90" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-48px)] h-[550px] max-h-[calc(100vh-120px)] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-blue-600 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">RentalPay Support</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online | Typically replies in seconds
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleRestart}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Restart Chat"
              >
                <RotateCcw size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth bg-zinc-50 dark:bg-zinc-950/50"
          >
            {messages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                <ChatMessage 
                  message={msg.text} 
                  isBot={msg.isBot} 
                  timestamp={msg.timestamp} 
                />
                {msg.isBot && msg.options && index === messages.length - 1 && !isTyping && (
                  <OptionButtons 
                    options={msg.options} 
                    onSelect={handleOptionSelect} 
                  />
                )}
              </React.Fragment>
            ))}
            {isTyping && (
              <ChatMessage 
                message="" 
                isBot={true} 
                timestamp="" 
                isTyping={true} 
              />
            )}
          </div>

          {/* Footer / Quick Actions */}
          <div className="p-5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">Still need help?</span>
                {history.length > 0 && (
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href="mailto:rentalpay.in@gmail.com"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all duration-200 active:scale-95"
                >
                  <Mail size={16} className="text-blue-500" />
                  Email
                </a>
                <a 
                  href="https://wa.me/917559269282"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all duration-200 active:scale-95"
                >
                  <Phone size={16} className="text-green-500" />
                  WhatsApp
                </a>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                  RentalPay Support Center
                </p>
                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
