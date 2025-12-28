import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-0 sm:space-x-0 sm:space-y-0",
        month: "space-y-0",
        caption: "hidden",
        caption_label: "hidden",
        nav: "hidden",
        nav_button: "hidden",
        nav_button_previous: "hidden",
        nav_button_next: "hidden",
        table: "w-full border-collapse",
        head_row: "flex mb-0",
        head_cell:
          "text-gray-700 w-9 h-7 text-xs font-normal flex items-center justify-center",
        row: "flex w-full gap-0 mb-0",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: cn(
          "h-9 w-9 p-0 font-normal text-gray-900 rounded hover:bg-gray-100 focus:outline-none"
        ),
        day_range_end: "",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600",
        day_today: "border border-gray-400",
        day_outside:
          "text-gray-400 opacity-50",
        day_disabled: "text-gray-300 opacity-40 cursor-not-allowed",
        day_range_middle: "",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
