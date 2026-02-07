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
    <section
      className="
    h-screen w-full overflow-hidden flex flex-col mx-auto    px-2 pt-3 pb-3
    sm:px-4 sm:pt-4 sm:pb-4 sm:max-w-120
    md:px-6 md:pt-6 md:pb-6 md:max-w-160
    lg:px-6 lg:pt-8 lg:pb-8 lg:max-w-225
    xl:px-6 xl:pt-10 xl:pb-10 xl:max-w-280
  "
    >
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
