import { ChevronRight } from "lucide-react";

type ChatButtonProps = {
  className?: string;
};

export function ChatButton({ className = "" }: ChatButtonProps) {
  return <ChevronRight className={`w-7 h-7 text-white ${className}`} />;
}
