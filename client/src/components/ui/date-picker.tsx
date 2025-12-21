import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  value: string | undefined
  onChange: (date: string) => void
  placeholder?: string
  maxDate?: Date
}

export function DatePicker({ value, onChange, placeholder = "DD-MM-YYYY", maxDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<number>(new Date().getMonth())
  const [year, setYear] = React.useState<number>(new Date().getFullYear())

  const selectedDate = value ? new Date(value) : undefined
  const currentMonth = selectedDate ? selectedDate.getMonth() : month
  const currentYear = selectedDate ? selectedDate.getFullYear() : year

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i)

  const handleMonthChange = (newMonth: string) => {
    setMonth(parseInt(newMonth))
  }

  const handleYearChange = (newYear: string) => {
    setYear(parseInt(newYear))
  }

  const displayDate = selectedDate
    ? format(selectedDate, 'dd-MM-yyyy')
    : ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={displayDate}
            readOnly
            className="input-styled rounded w-full cursor-pointer pr-10"
          />
          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3 border-b">
          <div className="flex gap-2">
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, idx) => (
                  <SelectItem key={m} value={idx.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onChange(date.toISOString().split('T')[0])
              setOpen(false)
            }
          }}
          disabled={(date) => maxDate ? date > maxDate : date > new Date()}
          month={new Date(currentYear, currentMonth)}
          onMonthChange={(newMonth) => {
            setMonth(newMonth.getMonth())
            setYear(newMonth.getFullYear())
          }}
          defaultMonth={new Date(currentYear, currentMonth)}
        />
        <div className="p-3 border-t flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onChange('')
            }}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date()
              onChange(today.toISOString().split('T')[0])
              setOpen(false)
            }}
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
