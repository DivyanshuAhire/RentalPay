"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: string;
  isTyping?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isBot,
  timestamp,
  isTyping = false,
}) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
          isBot
            ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-100 dark:border-zinc-700"
            : "bg-blue-600 text-white rounded-br-none"
        )}
      >
        {isTyping ? (
          <div className="flex gap-1 py-1 px-2">
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
            <span
              className={cn(
                "text-[10px] mt-1 block opacity-70",
                isBot ? "text-zinc-500 dark:text-zinc-400" : "text-blue-100"
              )}
            >
              {timestamp}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
