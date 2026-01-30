"use client";

import { useState } from "react";
import { StartScreen } from "./StartScreen";
import { ChatScreen } from "./ChatScreen";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export function Chat() {
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setIsStarted(true);

    const baseMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages([...baseMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: baseMessages }),
      });

      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assistantText += decoder.decode(value);

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: assistantText,
          };
          return copy;
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col w-full mx-auto px-2 pt-8 pb-10 sm:px-4 sm:pt-12 sm:pb-14 md:px-6 lg:pt-20 lg:pb-25 sm:max-w-120 md:max-w-160 lg:max-w-225 xl:max-w-280">
      {!isStarted ? (
        <StartScreen onStart={sendMessage} isLoading={isLoading} />
      ) : (
        <ChatScreen
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          error={error}
        />
      )}
    </section>
  );
}
