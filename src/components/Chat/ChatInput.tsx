import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { ChatButton } from "./ChatButton";

type ChatInputProps = {
  mode?: "input" | "textarea";
  onSubmit?: (text: string) => void;
  disabled?: boolean;
};

export function ChatInput({
  mode = "input",
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU"; // можно поменять на en-US
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");

      setValue(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    if (disabled) return;
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const send = () => {
    if (disabled) return;
    if (!value.trim()) return;
    onSubmit?.(value);
    setValue("");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (disabled) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative w-full lg:max-w-[500px]">
      {/* MIC */}
      <button
        type="button"
        onClick={toggleRecording}
        className="absolute left-3 bottom-2.5 z-10"
      >
        <Mic
          className={`w-5 h-5 ${
            isRecording ? "text-red-400 animate-pulse" : "text-white/60"
          }`}
        />
      </button>

      {mode === "textarea" ? (
        <textarea
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 160) + "px";
          }}
          placeholder="Ask whatever you want!"
          className="
            w-full
            min-h-10
            max-h-40
            border-2 border-[#143d7f]
            rounded-[10px]
            pl-10 pr-11
            py-2
            outline-none
            bg-transparent
            text-white
            resize-none
            overflow-hidden
            disabled:opacity-50
          "
        />
      ) : (
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask whatever you want"
          className="
            w-full
            h-10
            border-2 border-[#143d7f]
            rounded-[10px]
            pl-10 pr-11
            py-2
            outline-none
            bg-transparent
            text-white
            disabled:opacity-50
          "
        />
      )}

      <button
        onClick={send}
        disabled={disabled}
        className="
          absolute
          right-1
          bottom-1
          w-9 h-9
          flex items-center justify-center
          rounded-lg
          bg-[#1d4c9a]
          cursor-pointer
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        <ChatButton />
      </button>
    </div>
  );
}
