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
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="w-[40px] h-[40px] flex items-center justify-center bg-[#1c4d9a] rounded-xl">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 mt-2 pr-2">
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

        {error && (
          <div className="mr-auto bg-red-500/20 text-red-300 px-4 py-2 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 pt-2">
        <ChatInput mode="textarea" onSubmit={onSend} disabled={isLoading} />
      </div>
    </div>
  );
}
