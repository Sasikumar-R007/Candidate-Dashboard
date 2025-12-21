import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

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
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center h-8",
        caption_label: "text-sm font-semibold text-gray-900 dark:text-gray-100",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 rounded-md"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-0",
        head_row: "flex mb-1",
        head_cell:
          "text-gray-600 dark:text-gray-400 rounded-md w-8 h-8 font-semibold text-[0.75rem] flex items-center justify-center",
        row: "flex w-full gap-0 mb-1",
        cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/30 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal text-gray-900 dark:text-gray-100 rounded-md aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:bg-blue-600 focus:text-white",
        day_today: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200 font-bold",
        day_outside:
          "day-outside text-gray-400 dark:text-gray-600 opacity-40 pointer-events-none aria-selected:bg-accent/20 aria-selected:text-gray-400 dark:aria-selected:text-gray-600",
        day_disabled: "text-gray-400 dark:text-gray-600 opacity-40",
        day_range_middle:
          "aria-selected:bg-blue-100 dark:aria-selected:bg-blue-900/30 aria-selected:text-gray-900 dark:aria-selected:text-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
