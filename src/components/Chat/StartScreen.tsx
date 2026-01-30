import { MessageCircle } from "lucide-react";
import { ChatInput } from "./ChatInput";

type StartScreenProps = {
  onStart: (text: string) => void;
  isLoading: boolean;
};

export function StartScreen({ onStart, isLoading }: StartScreenProps) {
  return (
    <>
      <div>
        <div className="w-[70px] h-[70px] flex items-center justify-center bg-[#1c4d9a] rounded-xl lg:mt-10">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>

        <div className="mt-6">
          <h3 className="text-[40px] font-semibold">Hi there!</h3>
          <h1 className="text-[40px] font-bold">What would you like today?</h1>
          <p className="mt-4 text-lg text-white/70 leading-[1.6]">
            Use one of the most common prompts below or ask your own question
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <ChatInput mode="input" onSubmit={onStart} disabled={isLoading} />
      </div>
    </>
  );
}
