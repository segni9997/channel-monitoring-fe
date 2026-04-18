import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, X } from "lucide-react";
import { Badge } from "./badge";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect = ({ options, selected, onChange, placeholder = "Select...", className }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length > 0 ? (
            <>
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selected.length} selected
              </Badge>
              {selected.length <= 2 && options.filter(o => selected.includes(o.value)).map(o => (
                 <Badge key={o.value} variant="outline" className="rounded-sm px-1 font-normal text-[10px] bg-muted/50">
                    {o.label}
                 </Badge>
              ))}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <X
              className="h-3 w-3 opacity-50 hover:opacity-100 transition-opacity"
              onClick={clearSelection}
            />
          )}
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                  selected.includes(option.value) && "bg-accent/50"
                )}
                onClick={() => toggleOption(option.value)}
              >
                <div className={cn(
                  "absolute left-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                  selected.includes(option.value) ? "bg-primary text-primary-foreground" : "opacity-50"
                )}>
                  {selected.includes(option.value) && <Check className="h-3 w-3" />}
                </div>
                <span className="truncate">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
