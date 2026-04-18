import * as React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
  className?: string;
  label?: string;
}

export const DatePicker = ({ date, onChange, className, label }: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Internal state for calendar view navigation
  const [viewDate, setViewDate] = React.useState(date ? new Date(date) : new Date());
  
  const selectedDate = date ? new Date(date) : null;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [viewDate]);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-start text-left font-normal h-10",
          !date && "text-muted-foreground",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
        {date ? format(new Date(date), "PPP") : <span>{label || "Pick a date"}</span>}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-auto border bg-popover text-popover-foreground shadow-md rounded-md p-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewDate(subMonths(viewDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {format(viewDate, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewDate(addMonths(viewDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                <div key={day} className="h-8 w-8 flex items-center justify-center font-normal">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, viewDate);
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(format(day, "yyyy-MM-dd"));
                      setIsOpen(false);
                    }}
                    className={cn(
                      "h-8 w-8 rounded-md text-sm transition-colors flex items-center justify-center",
                      isSelected 
                        ? "bg-primary text-primary-foreground hover:bg-primary opacity-100" 
                        : "hover:bg-accent hover:text-accent-foreground",
                      !isCurrentMonth && "text-muted-foreground opacity-30"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
