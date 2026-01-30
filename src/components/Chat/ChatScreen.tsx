import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { ChatInput } from "./ChatInput";
import type { Message } from "./Chat";

type ChatScreenProps = {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
  error: string | null;
};

export function ChatScreen({
  messages,
  onSend,
  isLoading,
  error,
}: ChatScreenProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  return (
    <div className="mx-auto w-full max-w-[700px] h-[70vh] max-h-[700px] flex flex-col">
      {/* HEADER */}
      <div className="flex justify-start">
        <div className="w-[40px] h-[40px] flex items-center justify-center bg-[#1c4d9a] rounded-xl">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 mt-2 overflow-y-auto no-scrollbar flex flex-col gap-3 pr-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-xl text-sm break-words ${
              m.role === "user"
                ? "ml-auto bg-[#1d4c9a] text-right"
                : "mr-auto bg-[#143d7f]"
            }`}
          >
            {m.content}
          </div>
        ))}

        {/* ERROR */}
        {error && (
          <div className="mr-auto bg-red-500/20 text-red-300 px-4 py-2 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="mt-auto">
        <ChatInput mode="textarea" onSubmit={onSend} disabled={isLoading} />
      </div>
    </div>
  );
}
