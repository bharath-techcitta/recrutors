import React from 'react';
import { ChatMessage as Message } from '@/types';

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs text-gray-500 mt-1 block text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
