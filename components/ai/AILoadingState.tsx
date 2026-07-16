import React from 'react';
import { motion } from 'framer-motion';

interface AILoadingStateProps {
  title?: string;
  description?: string;
}

export function AILoadingState({ 
  title = "Analyzing...", 
  description = "Gemini is processing your request." 
}: AILoadingStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-24 px-6 h-full">
      <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
      <h2 className="text-xl font-black text-white mb-2">{title}</h2>
      <p className="text-white/40 text-sm max-w-sm">{description}</p>
    </div>
  );
}
