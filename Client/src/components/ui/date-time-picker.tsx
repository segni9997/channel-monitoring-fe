import * as React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, setHours, setMinutes, getHours, getMinutes } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DateTimePickerProps {
  date: string; // ISO String
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
}

export const DateTimePicker = ({ date, onChange, className, placeholder }: DateTimePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const currentDate = date ? new Date(date) : new Date();
  const [viewDate, setViewDate] = React.useState(currentDate);

  const hours = getHours(currentDate);
  const minutes = getMinutes(currentDate);

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

  const handleDateSelect = (day: Date) => {
    const newDate = setHours(setMinutes(day, minutes), hours);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type: "h" | "m", val: number) => {
    let newDate = new Date(currentDate);
    if (type === "h") newDate = setHours(newDate, val);
    else newDate = setMinutes(newDate, val);
    onChange(newDate.toISOString());
  };

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
        {date ? format(new Date(date), "PPP p") : <span>{placeholder || "Pick date & time"}</span>}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-auto border bg-popover text-popover-foreground shadow-md rounded-md p-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Calendar Part */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewDate(subMonths(viewDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">{format(viewDate, "MMMM yyyy")}</div>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewDate(addMonths(viewDate, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground font-medium">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day} className="h-8 w-8 flex items-center justify-center">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "h-8 w-8 rounded-md text-sm transition-colors flex items-center justify-center",
                      isSameDay(day, currentDate) ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                      !isSameMonth(day, viewDate) && "text-muted-foreground opacity-30"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Part */}
            <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" /> Time
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-center uppercase text-muted-foreground">Hour</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => handleTimeChange("h", parseInt(e.target.value) || 0)}
                    className="w-12 h-10 border rounded px-1 text-center bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-center uppercase text-muted-foreground">Min</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => handleTimeChange("m", parseInt(e.target.value) || 0)}
                    className="w-12 h-10 border rounded px-1 text-center bg-background"
                  />
                </div>
              </div>
              <Button className="mt-6 w-full h-8 text-xs" onClick={() => setIsOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
