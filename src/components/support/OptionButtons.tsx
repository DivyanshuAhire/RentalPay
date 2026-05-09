"use client";

import React from "react";
import { Option } from "@/data/supportFlow";

interface OptionButtonsProps {
  options: Option[];
  onSelect: (option: Option) => void;
  disabled?: boolean;
}

export const OptionButtons: React.FC<OptionButtonsProps> = ({
  options,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
