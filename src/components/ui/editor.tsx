
import { cn } from "@/lib/utils";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Editor({ value, onChange, className }: EditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Scrivi qui le tue note..."
      className={cn(
        "w-full h-[200px] resize-none appearance-none overflow-hidden bg-transparent focus:outline-none p-4 text-base border rounded-md",
        className
      )}
    />
  );
}
