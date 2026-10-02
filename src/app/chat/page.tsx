"use client";

import { useState, useEffect, FormEvent } from "react";
import ChatMessageComponent from "@/components/ChatMessage";
import { ChatMessage } from "@/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: `Acknowledged requirement: "${userMsg.content.slice(0, 100)}". Please use the main TalentGPT workspace on the home page for candidate matching.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">TalentMatch AI – Assistant</h1>
      <div className="border border-[#333] rounded-lg bg-[#1e1e1e] p-4 h-[500px] overflow-y-auto flex flex-col space-y-3">
        {messages.map((msg, idx) => (
          <ChatMessageComponent key={idx} message={msg} />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <textarea
          className="flex-1 border border-[#3d3d3d] bg-[#2a2a2a] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
          rows={2}
          placeholder="Enter JD, requirement text, or ask a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#10a37f] text-white rounded-md hover:bg-[#1a7f64] transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
