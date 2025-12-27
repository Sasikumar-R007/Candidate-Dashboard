import * as React from "react";
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import { format, getYear, getMonth } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface StandardDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
  className?: string;
}

export function StandardDatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  maxDate,
  minDate,
  disabled = false,
  className = ""
}: StandardDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [displayYear, setDisplayYear] = React.useState<number>(value ? getYear(value) : new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = React.useState<number>(value ? getMonth(value) : new Date().getMonth());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Update display month/year when value changes
  React.useEffect(() => {
    if (value) {
      setDisplayYear(getYear(value));
      setDisplayMonth(getMonth(value));
    }
  }, [value]);

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const displayDate = value
    ? format(value, 'dd-MM-yyyy')
    : '';

  const handleDateSelect = (date: Date | undefined) => {
    onChange(date);
    if (date) {
      setOpen(false);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <Input
            type="text"
            placeholder={placeholder}
            value={displayDate}
            readOnly
            disabled={disabled}
            className="w-full cursor-pointer pr-10"
          />
          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-3">
          {/* Header with Month/Year selector */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-1">
              <span className="text-sm font-medium">{monthNames[displayMonth]}, </span>
              <Select 
                value={displayYear.toString()} 
                onValueChange={(val) => setDisplayYear(parseInt(val))}
              >
                <SelectTrigger className="h-auto p-0 border-0 shadow-none focus:ring-0 w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8" 
                onClick={handlePrevMonth}
                type="button"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8" 
                onClick={handleNextMonth}
                type="button"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar */}
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (maxDate && date > maxDate) return true;
              if (minDate && date < minDate) return true;
              return false;
            }}
            month={new Date(displayYear, displayMonth)}
            onMonthChange={(date) => {
              setDisplayYear(getYear(date));
              setDisplayMonth(getMonth(date));
            }}
            className="w-full"
          />

          {/* Footer with Clear and Today buttons */}
          <div className="flex justify-between border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-blue-600 hover:text-blue-700 hover:bg-transparent p-0 h-auto"
              type="button"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="text-blue-600 hover:text-blue-700 hover:bg-transparent p-0 h-auto"
              type="button"
            >
              Today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

