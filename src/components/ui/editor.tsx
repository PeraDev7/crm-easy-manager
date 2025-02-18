
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Editor({ value, onChange, className }: EditorProps) {
  return (
    <TextareaAutosize
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Scrivi qui le tue note..."
      className={cn(
        "w-full resize-none appearance-none overflow-hidden bg-transparent focus:outline-none p-4 text-base",
        className
      )}
    />
  );
}
